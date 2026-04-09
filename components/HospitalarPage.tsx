
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { HospitalProtocol } from '../types';

const CATEGORIES = ['Todos', 'Dietas', 'Antibióticos', 'Sedação', 'Drogas Vasoativas', 'Sintomáticos', 'Outros'];

const HospitalarPage: React.FC = () => {
    const [protocols, setProtocols] = useState<HospitalProtocol[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const getDatabaseTerm = (uiCategory: string): string => {
        const mapping: Record<string, string> = {
            'Dietas': 'Dieta',
            'Sedação': 'Sedação',
            'Antibióticos': 'Antibiótico',
            'Drogas Vasoativas': 'Vasoativa',
            'Sintomáticos': 'Sintomático'
        };
        return mapping[uiCategory] || uiCategory;
    };

    useEffect(() => {
        let mounted = true;
        const fetchProtocols = async () => {
            setLoading(true);
            
            while (mounted) {
                let query = supabase
                    .from('hospital_protocols')
                    .select('*')
                    .order('title', { ascending: true });

                if (selectedCategory !== 'Todos') {
                    const dbTerm = getDatabaseTerm(selectedCategory);
                    query = query.ilike('category', `%${dbTerm}%`);
                }

                const { data, error } = await query;

                if (!error) {
                    if (mounted) {
                        setProtocols(data || []);
                        setLoading(false);
                    }
                    break;
                }
                console.warn("Retry Hospitalar protocols...");
                await wait(3000);
            }
        };

        fetchProtocols();
        return () => { mounted = false; };
    }, [selectedCategory]);

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            setCopyFeedback('Copiado!');
            setTimeout(() => setCopyFeedback(null), 2000);
        });
    };

    const filteredProtocols = protocols.filter(p => {
        const matchesSearch = 
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="container mx-auto max-w-7xl pb-10">
            <div className="mb-8 space-y-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Protocolos de Internação</h1>
                <p className="text-slate-500 dark:text-slate-400">Acesse rapidamente protocolos de enfermaria, UTI e prescrições hospitalares.</p>
                <div className="relative max-w-2xl">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por medicamento, dieta ou protocolo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3.5 pl-12 pr-4 text-slate-900 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition-all"
                    />
                </div>
            </div>

            <div className="mb-8 overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                setSearchTerm('');
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                                selectedCategory === category
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredProtocols.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum protocolo encontrado</h3>
                    <p className="text-slate-500 dark:text-slate-400">Tente buscar por outro termo ou categoria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProtocols.map(protocol => (
                        <div key={protocol.id} onClick={() => handleCopy(protocol.content)} className="group relative bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all cursor-pointer hover:-translate-y-1 active:translate-y-0">
                            <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            </div>
                            <div className="pr-8">
                                <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{protocol.category}</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 leading-tight">{protocol.title}</h3>
                            </div>
                            <div className="relative">
                                <p className="text-sm font-mono text-slate-600 dark:text-slate-300 line-clamp-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-700/50">{protocol.content}</p>
                                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-50 dark:from-slate-900/50 to-transparent rounded-b"></div>
                            </div>
                            <div className="mt-4 text-xs font-semibold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Clique para copiar</div>
                        </div>
                    ))}
                </div>
            )}
            {copyFeedback && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{copyFeedback}
                </div>
            )}
        </div>
    );
};

export default HospitalarPage;
