
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { MinhaPrescricao } from '../types';
import { usePrint } from '../contexts/PrintContext';

const MinhasReceitas: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<MinhaPrescricao[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToQueue } = usePrint();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<MinhaPrescricao>>({ titulo: '', condicao: '', texto: '' });
    const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchPrescriptions = useCallback(async (mounted: { current: boolean }) => {
        setLoading(true);
        while (mounted.current) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) break;

            const { data, error } = await supabase
                .from('minhas_prescricoes')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) {
                if (mounted.current) {
                    setPrescriptions(data || []);
                    setLoading(false);
                }
                break;
            }
            console.warn("Retry fetching my prescriptions...");
            await wait(3000);
        }
    }, []);

    useEffect(() => {
        const mounted = { current: true };
        fetchPrescriptions(mounted);
        return () => { mounted.current = false; };
    }, [fetchPrescriptions]);

    const handleOpenModal = (prescricao?: MinhaPrescricao) => {
        if (prescricao) setFormData(prescricao);
        else setFormData({ titulo: '', condicao: '', texto: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ titulo: '', condicao: '', texto: '' });
    };

    const showNotification = (msg: string, type: 'success' | 'error') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSaving(false); return; }
        const payload = { user_id: user.id, titulo: formData.titulo, condicao: formData.condicao, texto: formData.texto };
        let error;
        if (formData.id) {
            const { error: updateError } = await supabase.from('minhas_prescricoes').update(payload).eq('id', formData.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('minhas_prescricoes').insert(payload);
            error = insertError;
        }
        if (error) showNotification('Erro ao salvar: ' + error.message, 'error');
        else {
            showNotification('Prescrição salva com sucesso!', 'success');
            handleCloseModal();
            fetchPrescriptions({ current: true });
        }
        setSaving(false);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Tem certeza que deseja excluir esta prescrição permanentemente?')) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await supabase.from('user_favoritos').delete().eq('minha_prescricao_id', id).eq('user_id', user.id); 
            const { error } = await supabase.from('minhas_prescricoes').delete().eq('id', id);
            if (error) throw error;
            showNotification('Prescrição excluída.', 'success');
            setPrescriptions(prev => prev.filter(p => p.id !== id));
        } catch (error: any) {
            showNotification('Erro ao excluir: ' + (error.message || 'Erro desconhecido'), 'error');
        }
    };

    const handlePrint = (e: React.MouseEvent, p: MinhaPrescricao) => {
        e.stopPropagation();
        const formattedText = p.texto.replace(/\r\n|\r|\n/g, '<br>');
        addToQueue({ id: p.id + Date.now(), titulo: p.titulo, texto: formattedText, tipo: 'prescricao' });
        showNotification('Adicionado à fila de impressão!', 'success');
    };

    const filteredPrescriptions = prescriptions.filter(p => {
        const term = searchTerm.toLowerCase();
        const titulo = p.titulo ? String(p.titulo).toLowerCase() : '';
        const condicao = p.condicao ? String(p.condicao).toLowerCase() : '';
        const texto = p.texto ? String(p.texto).toLowerCase() : '';
        return titulo.includes(term) || condicao.includes(term) || texto.includes(term);
    });

    return (
        <div className="container mx-auto max-w-6xl pb-20">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-1">Minhas Receitas</h1>
                    <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400">Gerencie seus textos e protocolos pessoais.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-slate-900 dark:bg-slate-800 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 border border-slate-700"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Nova Prescrição</button>
            </div>
            {notification && (<div className={`fixed top-24 right-5 z-50 px-6 py-3 rounded-lg shadow-lg text-white animate-fade-in ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.msg}</div>)}
            
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome da receita ou condição..."
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-premium-teal transition-all shadow-sm"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (<div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>))}
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Nenhuma receita pessoal</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece criando sua primeira prescrição personalizada.</p>
                </div>
            ) : filteredPrescriptions.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Nenhuma receita encontrada</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tente ajustar os termos da sua busca.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrescriptions.map((p) => (
                        <div key={p.id} className="relative group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-slate-200/50 dark:border-slate-800 p-6 flex flex-col transition-all duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{p.titulo}</h3>
                                    {p.condicao && <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{p.condicao}</span>}
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-4 whitespace-pre-wrap font-mono mb-6 flex-grow">{p.texto}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button type="button" onClick={(e) => handlePrint(e, p)} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-premium-teal flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>Imprimir</button>
                                <div className="flex gap-3">
                                    <button type="button" onClick={(e) => handleOpenModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    <button type="button" onClick={(e) => handleDelete(e, p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{formData.id ? 'Editar Receita' : 'Nova Receita Pessoal'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                                    <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" placeholder="Ex: Analgesia Padrão" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condição (Opcional)</label>
                                    <input type="text" value={formData.condicao || ''} onChange={(e) => setFormData({...formData, condicao: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" placeholder="Ex: Dor Crônica" />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conteúdo da Prescrição</label>
                                <textarea required value={formData.texto} onChange={(e) => setFormData({...formData, texto: e.target.value})} className="w-full flex-1 min-h-[300px] p-4 font-mono text-sm border rounded-lg dark:bg-slate-700 dark:text-white resize-y" placeholder="Digite o conteúdo da receita aqui..." />
                            </div>
                        </form>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                            <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 font-medium text-slate-700 dark:text-slate-200">Cancelar</button>
                            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 font-bold text-white bg-premium-teal rounded-lg disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar Receita'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinhasReceitas;
