import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext'; 
// IMPORTANTE: Ajuste este caminho para o seu ficheiro de configuração do Supabase
import { supabase } from "../services/supabase";

interface RichTextEditorProps {
    initialHtml: string;
    editorRef: React.RefObject<HTMLDivElement>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialHtml, editorRef }) => {
    const isInitialized = useRef(false);

    useEffect(() => {
        if (editorRef.current && !isInitialized.current) {
            editorRef.current.innerHTML = initialHtml;
            isInitialized.current = true;
        }
    }, [initialHtml, editorRef]);

    return (
        <div
            ref={editorRef}
            contentEditable
            className="w-full p-8 font-mono text-base text-slate-800 dark:text-slate-200 focus:outline-none min-h-[400px] overflow-y-auto whitespace-pre-wrap leading-relaxed"
            suppressContentEditableWarning={true}
        />
    );
};

// ==========================================
// 1. ESTRUTURA DE DADOS (Espelho do Supabase)
// ==========================================
interface Medication {
    id: number;
    nome: string;
    apresentacao: string;
    via: string;
    regra_calculo: string; // Ex: 'Peso * 0.2', 'Fixo: 1'
    unidade: string;
    posologia_padrao: string;
    quantidade: string;
    dose_maxima?: number;
}

interface Protocol {
    id: number;
    nome_condicao: string;
    ids_medicamentos: number[];
    orientacoes_gerais: string;
}

const PediatriaPage: React.FC = () => {
    const { addToQueue } = usePrint();
    
    // Estados da Interface
    const [weight, setWeight] = useState<string>('');
    const [mode, setMode] = useState<'prontas' | 'livre'>('livre');
    const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
    const [selectedMeds, setSelectedMeds] = useState<number[]>([]);
    
    // Estados de Controlo e Dados Dinâmicos
    const [medications, setMedications] = useState<Medication[]>([]);
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [isFetchingDB, setIsFetchingDB] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPrescription, setGeneratedPrescription] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const editorRef = useRef<HTMLDivElement>(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [addedToQueue, setAddedToQueue] = useState(false);
    const [orientacoes, setOrientacoes] = useState<string>('');

    // ==========================================
    // 2. BUSCAR DADOS NO SUPABASE AO CARREGAR
    // ==========================================
    useEffect(() => {
        async function fetchSupabaseData() {
            try {
                setIsFetchingDB(true);
                
                // 1. Vai buscar os medicamentos
                const { data: medsData, error: medsError } = await supabase
                    .from('pediatria_medicamentos')
                    .select('*')
                    .order('nome', { ascending: true });

                if (medsError) throw medsError;

                // 2. Vai buscar os protocolos
                const { data: protosData, error: protosError } = await supabase
                    .from('pediatria_protocolos')
                    .select('*')
                    .order('nome_condicao', { ascending: true });

                if (protosError) throw protosError;

                setMedications(medsData || []);
                setProtocols(protosData || []);
            } catch (err) {
                console.error("Erro ao carregar dados do Supabase:", err);
                setError("Não foi possível carregar a base de dados de medicamentos. Verifique a sua ligação.");
            } finally {
                setIsFetchingDB(false);
            }
        }
        
        fetchSupabaseData();
    }, []);

    // ==========================================
    // 3. MOTOR DE CÁLCULO NATIVO (Interpretador de Regras)
    // ==========================================
    const calculateDose = (weightVal: number, med: Medication) => {
        const regra = med.regra_calculo.toUpperCase();
        let doseCalculada = 0;
        let atingiuMaximo = false;

        // A. Se for dose fixa que não depende do peso (Ex: "Fixo: 1")
        if (regra.includes('FIXO')) {
            const valorFixo = regra.split(':')[1]?.trim() || '1';
            return { valor: valorFixo, atingiuMaximo: false };
        }

        // B. Lógica de Multiplicação ou Divisão (Ex: "Peso * 0.2")
        if (regra.includes('*')) {
            const fator = parseFloat(regra.split('*')[1].trim());
            doseCalculada = weightVal * fator;
        } else if (regra.includes('/')) {
            const divisor = parseFloat(regra.split('/')[1].trim());
            doseCalculada = weightVal / divisor;
        }

        // C. Trava de Segurança (Dose Máxima)
        if (med.dose_maxima && doseCalculada > med.dose_maxima) {
            doseCalculada = med.dose_maxima;
            atingiuMaximo = true;
        }
        
        // D. Arredondamentos e Formatação
        let doseFormatada = '';
        if (med.unidade.toLowerCase() === 'gotas') {
            doseFormatada = Math.round(doseCalculada).toString();
        } else if (med.unidade.toLowerCase() === 'ml') {
            doseFormatada = doseCalculada.toFixed(1).replace('.', ',');
        } else {
            doseFormatada = doseCalculada.toString();
        }

        return { valor: doseFormatada, atingiuMaximo };
    };

    const generateHtmlPrescription = (meds: Medication[], weightVal: number, obsGerais: string) => {
        const grouped = meds.reduce((acc, med) => {
            if (!acc[med.via]) acc[med.via] = [];
            acc[med.via].push(med);
            return acc;
        }, {} as Record<string, Medication[]>);

        let html = '';
        let counter = 1;
        const caracteresMaximosLinha = 68; 

        Object.keys(grouped).forEach(via => {
            html += `<div style="text-align: center; margin-top: 10px; margin-bottom: 10px; font-weight: bold;">${via.toUpperCase()}</div>`;
            
            grouped[via].forEach(med => {
                const resultadoDose = calculateDose(weightVal, med);
                
                const inicioLinha = `${counter}- ${med.nome.toUpperCase()} ${med.apresentacao.toUpperCase()}`;
                const fimLinha = med.quantidade.toUpperCase();
                
                const espacoOcupado = inicioLinha.length + fimLinha.length;
                const quantidadeTracinhos = espacoOcupado < caracteresMaximosLinha ? caracteresMaximosLinha - espacoOcupado : 4; 
                const tracinhos = '-'.repeat(quantidadeTracinhos);
                
                html += `<div><strong>${inicioLinha}</strong> <span style="color: #64748b; font-weight: normal;">${tracinhos}</span> <strong>${fimLinha}</strong></div>`;
                
                let instrucao = `Dar ${resultadoDose.valor} ${med.unidade}, ${med.posologia_padrao}.`;
                if (resultadoDose.atingiuMaximo) {
                    instrucao += ` <span style="font-size: 0.9em; font-weight: bold; color: #334155;">(Dose ajustada para o limite máximo)</span>`;
                }
                
                html += `<div style="margin-bottom: 18px;">${instrucao}</div>`;
                counter++;
            });
        });

        if (obsGerais && obsGerais.trim() !== '') {
            html += `<br/><div style="margin-top: 10px; font-weight: bold;">Orientações gerais:</div>`;
            html += `<div>${obsGerais.replace(/\n/g, '<br/>')}</div>`;
        }

        return html;
    };

    // ==========================================
    // 4. AÇÕES DA INTERFACE
    // ==========================================
    const handleCalculate = async () => {
        setError(null);
        if (!weight || isNaN(parseFloat(weight))) {
            setError("Obrigatório informar o peso da criança.");
            return;
        }
        
        if (mode === 'prontas' && !selectedProtocol) {
            setError("Selecione um protocolo.");
            return;
        }

        if (mode === 'livre' && selectedMeds.length === 0) {
            setError("Selecione pelo menos um medicamento.");
            return;
        }

        setIsLoading(true);
        const w = parseFloat(weight);
        let selectedMedsData: Medication[] = [];
        let orientacoesFinais = orientacoes;

        if (mode === 'livre') {
            selectedMedsData = medications.filter(m => selectedMeds.includes(m.id));
        } else {
            const protocoloSelecionado = protocols.find(p => p.id === selectedProtocol);
            if (protocoloSelecionado) {
                // Aqui cruzamos os IDs do protocolo com a lista completa do Supabase
                selectedMedsData = medications.filter(m => protocoloSelecionado.ids_medicamentos.includes(m.id));
                if (protocoloSelecionado.orientacoes_gerais) {
                    orientacoesFinais = orientacoesFinais 
                        ? `${protocoloSelecionado.orientacoes_gerais}\n\n${orientacoesFinais}`
                        : protocoloSelecionado.orientacoes_gerais;
                }
            }
        }

        setTimeout(() => {
            const htmlOutput = generateHtmlPrescription(selectedMedsData, w, orientacoesFinais);
            setGeneratedPrescription(htmlOutput);
            setIsLoading(false);
            
            setTimeout(() => {
                document.getElementById('prescription-preview')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }, 300); 
    };

    const toggleMed = (id: number) => {
        setSelectedMeds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const copyToClipboard = useCallback(() => {
        if (!editorRef.current) return;
        const textToCopy = editorRef.current.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess('Copiado!');
            setTimeout(() => setCopySuccess(''), 3000);
        }, () => {
            setCopySuccess('Falha ao copiar.');
        });
    }, []);

    const handleAddToQueue = () => {
        if (editorRef.current) {
            addToQueue({
                id: 'pediatria-' + Date.now(), 
                titulo: `Prescrição Pediátrica (${weight}kg)`,
                texto: editorRef.current.innerHTML,
                tipo: 'prescricao'
            });
            setAddedToQueue(true);
            setTimeout(() => setAddedToQueue(false), 2000);
        }
    };

    const handleFormat = (command: string) => {
        document.execCommand(command, false);
        if (editorRef.current) editorRef.current.focus();
    };

    const ToolbarButton = ({ command, icon, title }: { command: string, icon: React.ReactNode, title: string }) => (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat(command); }} className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title={title}>
            {icon}
        </button>
    );

    // ==========================================
    // ECRÃ DE CARREGAMENTO INICIAL
    // ==========================================
    if (isFetchingDB) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-premium-teal border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300">A carregar base de dados de medicamentos...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl space-y-8 animate-fade-in pb-20">
            {/* Cabeçalho */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm mb-2">
                    <Link to="/dashboard" className="hover:text-premium-teal transition-colors">Dashboard</Link>
                    <span>/</span>
                    <span>Pediatria</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                    Prescrição Pediátrica
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                    Cálculo automático de doses baseado no peso (Integrado com Supabase).
                </p>
            </div>

            {addedToQueue && (
                <div className="fixed top-20 right-5 z-50 animate-bounce">
                    <div className="bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Adicionado à fila de impressão!
                    </div>
                </div>
            )}

            {/* Cartão Principal */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6 md:p-8 space-y-8">
                {/* Input de Peso */}
                <div className="w-full md:w-1/3 space-y-4">
                    <label htmlFor="weight" className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                        Peso da Criança (kg)
                    </label>
                    <div className="relative">
                        <input
                            id="weight"
                            type="number"
                            step="0.1"
                            placeholder="00.0"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full text-4xl font-black text-premium-teal bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-4 focus:outline-none focus:border-premium-teal focus:ring-4 focus:ring-premium-teal/10 transition-all placeholder-slate-300 dark:placeholder-slate-700"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">kg</span>
                    </div>
                </div>

                {/* Seleção de Modo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => setMode('prontas')} className={`p-6 rounded-2xl border-2 text-left transition-all ${mode === 'prontas' ? 'border-premium-teal bg-premium-teal/5 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-premium-teal/50'}`}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Prescrições Prontas</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Condutas clínicas completas e baseadas em diretrizes.</p>
                    </button>
                    <button onClick={() => setMode('livre')} className={`p-6 rounded-2xl border-2 text-left transition-all ${mode === 'livre' ? 'border-premium-teal bg-premium-teal/5 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-premium-teal/50'}`}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Prescrição Livre</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Monte a receita selecionando os medicamentos manualmente.</p>
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 font-bold">
                        {error}
                    </div>
                )}

                {/* Renderização Condicional */}
                {mode === 'prontas' ? (
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                            Selecione a Condição Clínica
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {protocols.map((protocol) => (
                                <button
                                    key={protocol.id}
                                    onClick={() => setSelectedProtocol(protocol.id)}
                                    className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${selectedProtocol === protocol.id ? 'bg-premium-teal text-white border-premium-teal' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-premium-teal'}`}
                                >
                                    {protocol.nome_condicao}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                            Selecione os Medicamentos
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {medications.map((med) => (
                                <div 
                                    key={med.id}
                                    onClick={() => toggleMed(med.id)}
                                    className={`group flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedMeds.includes(med.id) ? 'bg-premium-teal/5 border-premium-teal' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'}`}
                                >
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{med.nome} <span className="text-xs text-slate-500 font-normal block">{med.apresentacao}</span></span>
                                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${selectedMeds.includes(med.id) ? 'bg-premium-teal border-premium-teal' : 'border-slate-300'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <label htmlFor="orientacoes" className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-2">
                        Orientações Gerais Extras (Opcional)
                    </label>
                    <textarea
                        id="orientacoes"
                        rows={3}
                        value={orientacoes}
                        onChange={(e) => setOrientacoes(e.target.value)}
                        placeholder="Ex: Manter hidratação rigorosa, retornar ao PS se houver piora..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl p-4 focus:outline-none focus:border-premium-teal focus:ring-2 focus:ring-premium-teal/10 transition-all placeholder-slate-400 dark:placeholder-slate-600 resize-none"
                    />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                        onClick={handleCalculate}
                        disabled={!weight || (mode === 'prontas' ? !selectedProtocol : selectedMeds.length === 0) || isLoading}
                        className="bg-premium-teal hover:bg-premium-teal-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center gap-3 text-lg disabled:opacity-50 transition-all"
                    >
                        {isLoading ? 'A Calcular...' : 'Calcular e Gerar Prescrição'}
                    </button>
                </div>
            </div>

            {/* Visualização da Prescrição */}
            {generatedPrescription && (
                <div id="prescription-preview" className="p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl transition-colors animate-fade-in-up">
                    <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
                        <div>
                            <h2 className="mb-2 text-3xl font-bold text-slate-800 dark:text-white">Prescrição Gerada</h2>
                            <p className="text-slate-500 dark:text-slate-400">Peso considerado: {weight}kg</p>
                        </div>
                    </div>

                    <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Texto da Prescrição (Editável):</label>
                    
                    <div className="mb-8 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-premium-teal focus-within:border-transparent transition-all shadow-sm">
                        <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 select-none">
                            <ToolbarButton command="bold" title="Negrito" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>} />
                            <ToolbarButton command="underline" title="Sublinhado" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>} />
                            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            <ToolbarButton command="justifyLeft" title="Alinhar à Esquerda" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>} />
                            <ToolbarButton command="justifyCenter" title="Centralizar" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>} />
                        </div>
                        
                        <RichTextEditor key={generatedPrescription} editorRef={editorRef} initialHtml={generatedPrescription} />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <button onClick={handleAddToQueue} className={`flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition-all duration-200 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${addedToQueue ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'}`}>
                            {addedToQueue ? (
                                <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Adicionado</>
                            ) : (
                                <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Adicionar à Impressão</>
                            )}
                        </button>

                        <button onClick={copyToClipboard} className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition-colors duration-200 rounded-lg shadow-md bg-premium-teal hover:bg-premium-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-teal">
                            {copySuccess ? (
                                <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Copiado!</>
                            ) : (
                                <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Copiar Texto</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PediatriaPage;