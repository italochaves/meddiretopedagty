
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { parsePrescriptionsFromTxt } from '../services/geminiService';
import { Category } from '../types';

interface TxtImporterProps {
    onImportSuccess: () => void;
}

interface ParsedPrescription {
    categoria: string;
    condicao: string;
    titulo: string;
    texto: string;
    tags: string[];
}

const TxtImporter: React.FC<TxtImporterProps> = ({ onImportSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError('Por favor, selecione um arquivo TXT.');
            return;
        }

        setLoading(true);
        setError('');
        setStatusMessage('Lendo o arquivo...');

        try {
            const fileContent = await file.text();
            setStatusMessage('Analisando prescrições com IA... Isso pode levar um momento.');

            const parsedData: ParsedPrescription[] = await parsePrescriptionsFromTxt(fileContent);
            
            if (!parsedData || parsedData.length === 0) {
                throw new Error("A IA não conseguiu extrair nenhuma prescrição do arquivo.");
            }

            setStatusMessage(`Foram encontradas ${parsedData.length} prescrições. Importando para o banco de dados...`);

            const { data: existingCategoriesData, error: catError } = await supabase.from('categorias').select('id, nome');
            if(catError) throw catError;
            const existingCategories: Map<string, string> = new Map(existingCategoriesData.map(c => [c.nome.toLowerCase(), c.id]));

            const newCategoryNames = [...new Set(parsedData.map(p => p.categoria))]
                .filter(name => !existingCategories.has(name.toLowerCase()));
            
            if(newCategoryNames.length > 0) {
                setStatusMessage(`Criando ${newCategoryNames.length} novas categorias...`);
                const newCategoriesToInsert = newCategoryNames.map(name => ({ nome: name, icone: '📝' }));
                const { data: insertedCategories, error: insertCatError } = await supabase.from('categorias').insert(newCategoriesToInsert).select();
                if (insertCatError) throw insertCatError;
                
                insertedCategories.forEach(c => existingCategories.set(c.nome.toLowerCase(), c.id));
            }
            
            const prescriptionsToInsert = parsedData.map(p => {
                const categoryId = existingCategories.get(p.categoria.toLowerCase());
                if (!categoryId) {
                    console.warn(`Categoria "${p.categoria}" não encontrada para a prescrição "${p.titulo}". Pulando.`);
                    return null;
                }
                return {
                    categoria_id: categoryId,
                    condicao: p.condicao,
                    titulo: p.titulo,
                    texto: p.texto,
                    tags: p.tags,
                };
            }).filter(p => p !== null);

            setStatusMessage(`Inserindo ${prescriptionsToInsert.length} prescrições...`);

            if (prescriptionsToInsert.length > 0) {
                 const { error: presError } = await supabase.from('prescricoes').insert(prescriptionsToInsert as any);
                 if (presError) throw presError;
            }

            setStatusMessage('Importação concluída com sucesso!');
            localStorage.removeItem('meddireto_categories'); // Clear cache after import
            onImportSuccess();

        } catch (e: any) {
            console.error('Import failed:', e);
            setError(`Falha na importação: ${e.message}`);
            setStatusMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 mb-8 bg-slate-50 border-2 border-dashed rounded-2xl border-slate-300">
            <h3 className="text-xl font-semibold text-slate-800">Importar Prescrições de Arquivo TXT</h3>
            <p className="mt-1 text-sm text-slate-600">Selecione um arquivo .txt contendo as prescrições. A IA irá automaticamente categorizar e importar os dados.</p>
            
            <div className="mt-6">
                <input type="file" accept=".txt" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-premium-teal-50 file:text-premium-teal-700 hover:file:bg-premium-teal-100"/>
            </div>

            <button onClick={handleImport} disabled={loading || !file} className="w-full px-4 py-3 mt-6 font-bold text-white transition-colors rounded-lg bg-premium-teal-600 hover:bg-premium-teal-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Importando...' : 'Iniciar Importação'}
            </button>

            {statusMessage && <div className="mt-4 text-sm text-center text-green-700">{statusMessage}</div>}
            {error && <div className="p-3 mt-4 text-sm text-center text-red-700 bg-red-100 rounded-lg">{error}</div>}
        </div>
    );
};

export default TxtImporter;
