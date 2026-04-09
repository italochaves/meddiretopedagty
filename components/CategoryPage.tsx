
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

    return (
        <div className="container mx-auto max-w-6xl">
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-semibold transition-all duration-200 transform bg-white dark:bg-slate-800 border rounded-lg shadow-subtle text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-px active:translate-y-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Voltar
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">
                {loading ? (
                    <div className="w-1/3 h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ) : (
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">{category?.nome}</h1>
                )}

                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm self-start md:self-auto">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-premium-teal text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'}`} title="Lista"><ListIcon /></button>
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-premium-teal text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'}`} title="Grade"><GridIcon /></button>
                </div>
            </div>

            {loading ? (
                 <div className="space-y-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm animate-pulse p-6">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                        </div>
                    ))}
                 </div>
            ) : prescriptions.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl shadow-subtle dark:border dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">Nenhuma condição encontrada para esta categoria.</p>
                </div>
            ) : (
                <div className={viewMode === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
                    {prescriptions.map((prescription) => (
                         <Link key={prescription.id} to={`/prescricao/${prescription.id}`} className={`block transition-all duration-200 bg-white dark:bg-slate-800 rounded-xl shadow-subtle hover:shadow-lg hover:border-premium-teal dark:hover:border-premium-teal border border-transparent dark:border-slate-700 ${viewMode === 'list' ? 'p-6' : 'p-6 flex flex-col h-full justify-center text-center'}`}>
                            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{prescription.condicao}</h2>
                            {viewMode === 'grid' && prescription.titulo !== prescription.condicao && (<p className="text-xs text-slate-500 mt-2 line-clamp-2">{prescription.titulo}</p>)}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
