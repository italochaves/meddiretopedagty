
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Prescription, Category } from '../types';
import TxtImporter from './TxtImporter';

const Admin: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Filters
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [searchTag, setSearchTag] = useState<string>('');

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('prescricoes').select(`*, categorias(nome)`);

        if (filterCategory) {
            query = query.eq('categoria_id', filterCategory);
        }
        if (searchTag) {
            query = query.contains('tags', [searchTag]);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            setError('Falha ao carregar prescrições.');
            console.error(error);
        } else {
            setPrescriptions((data as any) || []);
        }
        setLoading(false);
    }, [filterCategory, searchTag]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: catData, error: catError } = await supabase.from('categorias').select('*');
            if (!catError) setCategories(catData || []);
            fetchPrescriptions();
        };
        fetchInitialData();
    }, [fetchPrescriptions]);

    const handleEdit = (prescription: Prescription) => {
        setEditingPrescription({ ...prescription });
        setIsCreating(false);
    };
    
    const handleCreate = () => {
        setEditingPrescription({
            id: '',
            categoria_id: categories[0]?.id || '',
            condicao: '',
            titulo: '',
            texto: '',
            tags: [],
            created_at: '',
            updated_at: '',
        });
        setIsCreating(true);
    };

    const handleCancel = () => {
        setEditingPrescription(null);
        setIsCreating(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta prescrição?')) {
            const { error } = await supabase.from('prescricoes').delete().eq('id', id);
            if (error) {
                alert('Erro ao excluir: ' + error.message);
            } else {
                fetchPrescriptions();
            }
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!editingPrescription) return;
        const { name, value } = e.target;
        if (name === 'tags') {
            setEditingPrescription({ ...editingPrescription, tags: value.split(',').map(tag => tag.trim()) });
        } else {
            setEditingPrescription({ ...editingPrescription, [name]: value });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPrescription) return;

        const { id, categoria_id, condicao, titulo, texto, tags } = editingPrescription;
        const payload = { categoria_id, condicao, titulo, texto, tags, updated_at: new Date().toISOString() };

        if (isCreating) {
            const { error } = await supabase.from('prescricoes').insert(payload);
            if (error) alert('Erro ao criar: ' + error.message);
        } else {
            const { error } = await supabase.from('prescricoes').update(payload).eq('id', id);
            if (error) alert('Erro ao atualizar: ' + error.message);
        }
        
        handleCancel();
        fetchPrescriptions();
    };

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <h1 className="mb-8 text-3xl font-bold text-slate-800">Painel Administrativo</h1>
            
            {/* Import Section */}
            <div className="mb-12">
                <TxtImporter onImportSuccess={fetchPrescriptions} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <button onClick={handleCreate} className="px-5 py-2 font-semibold text-white transition-colors rounded-lg bg-premium-teal hover:bg-premium-teal/90">Criar Nova Prescrição</button>
                
                <div className="flex gap-4">
                    <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="p-2 border rounded-lg border-slate-300 bg-white"
                    >
                        <option value="">Todas as Categorias</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <input 
                        type="text" 
                        placeholder="Filtrar por tag..." 
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                        className="p-2 border rounded-lg border-slate-300"
                    />
                </div>
            </div>

            {/* Modal for Editing/Creating */}
            {editingPrescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="w-full max-w-3xl p-8 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="mb-6 text-2xl font-bold text-slate-800">{isCreating ? 'Criar Nova' : 'Editar'} Prescrição</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Título</label>
                                    <input name="titulo" value={editingPrescription.titulo} onChange={handleFormChange} required className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-premium-teal focus:border-premium-teal outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Condição</label>
                                    <input name="condicao" value={editingPrescription.condicao} onChange={handleFormChange} required className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-premium-teal focus:border-premium-teal outline-none" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                                    <select name="categoria_id" value={editingPrescription.categoria_id} onChange={handleFormChange} required className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-premium-teal focus:border-premium-teal outline-none bg-white">
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Tags (separadas por vírgula)</label>
                                    <input name="tags" value={editingPrescription.tags.join(', ')} onChange={handleFormChange} className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-premium-teal focus:border-premium-teal outline-none" placeholder="ex: dor, pediatria" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Texto da Prescrição (HTML suportado)</label>
                                <textarea name="texto" value={editingPrescription.texto} onChange={handleFormChange} required rows={12} className="w-full p-3 font-mono text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-premium-teal focus:border-premium-teal outline-none" />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium">Cancelar</button>
                                <button type="submit" className="px-5 py-2.5 text-white bg-premium-teal rounded-lg hover:bg-premium-teal-600 font-medium shadow-lg shadow-premium-teal/20">{isCreating ? 'Criar' : 'Salvar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="p-4">Título / Condição</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Tags</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Carregando...</td></tr>
                            ) : prescriptions.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhuma prescrição encontrada.</td></tr>
                            ) : (
                                prescriptions.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-800">{p.titulo}</div>
                                            <div className="text-sm text-slate-500">{p.condicao}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm">{p.categorias?.nome || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {p.tags?.map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full border border-slate-200">{tag}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right space-x-3">
                                            <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline">Editar</button>
                                            <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold hover:underline">Excluir</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
