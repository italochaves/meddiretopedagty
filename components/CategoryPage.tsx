
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Prescription, Category } from '../types';

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>
    </svg>
);

const GridIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
);

const CategoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
        return (localStorage.getItem('meddireto_viewMode_prescriptions') as 'list' | 'grid') || 'list';
    });

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        localStorage.setItem('meddireto_viewMode_prescriptions', viewMode);
    }, [viewMode]);

    useEffect(() => {
        let mounted = true;
        const fetchCategoryData = async () => {
            if (!id) return;
            setLoading(true);
            
            while (mounted) {
                const categoryPromise = supabase.from('categorias').select('*').eq('id', id).single();
                const prescriptionsPromise = supabase.from('prescricoes').select('*').eq('categoria_id', id).order('condicao', { ascending: true });
                
                const [categoryResult, prescriptionsResult] = await Promise.all([categoryPromise, prescriptionsPromise]);

                if (!categoryResult.error && !prescriptionsResult.error) {
                    if (mounted) {
                        setCategory(categoryResult.data);
                        setPrescriptions(prescriptionsResult.data || []);
                        setLoading(false);
                    }
                    break; // Sucesso, sai do loop
                }
                console.warn("Retry CategoryPage fetch...");
                await wait(3000);
            }
        };

        fetchCategoryData();
        return () => { mounted = false; };
    }, [id]);

    const handleGoBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/porta');
        }
    };

    return (
        <div className="container mx-auto max-w-6xl">
            <button onClick={handleGoBack} className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-semibold transition-all duration-200 transform bg-white dark:bg-slate-800 border rounded-lg shadow-subtle text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-px active:translate-y-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Voltar
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4">
                {loading ? (
                    <div className="w-1/3 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                ) : (
                    <div>
                        <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">{category?.nome}</h1>
                        <p className="text-[14px] text-slate-500 font-medium mt-1">Conferência e protocolos da especialidade</p>
                    </div>
                )}

                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm self-start md:self-auto">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-premium-teal text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'}`} title="Lista"><ListIcon /></button>
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-premium-teal text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'}`} title="Grade"><GridIcon /></button>
                </div>
            </div>

            {loading ? (
                 <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-[88px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.25rem] shadow-sm animate-pulse p-6">
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
                        </div>
                    ))}
                 </div>
            ) : prescriptions.length === 0 ? (
                <div className="w-full p-10 bg-slate-50/80 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-[1.5rem] flex flex-col items-center text-center">
                     <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400">Nenhuma condição encontrada para esta categoria.</p>
                </div>
            ) : (
                <div className={viewMode === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
                    {prescriptions.map((prescription) => (
                         <Link key={prescription.id} to={`/prescricao/${prescription.id}`} className={`block transition-all duration-300 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-5px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-premium-teal/50 dark:hover:border-premium-teal/50 border-[1.5px] border-slate-100 dark:border-slate-800/80 ${viewMode === 'list' ? 'p-5 flex items-center justify-between' : 'p-6 flex flex-col h-full justify-center text-center'}`}>
                            <div className="flex-1 min-w-0 pr-4">
                                <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug line-clamp-2">{prescription.condicao}</h2>
                                {viewMode === 'grid' && prescription.titulo !== prescription.condicao && (<p className="text-[13px] font-medium text-slate-500 mt-2 line-clamp-2">{prescription.titulo}</p>)}
                            </div>
                            {viewMode === 'list' && (
                                <div className="text-slate-300 group-hover:text-premium-teal transition-colors shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
