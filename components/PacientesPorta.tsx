import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Category, Prescription } from '../types';

// ============================================================================
// DICIONÁRIO VISUAL FRONT-END (Sem Alterar Banco de Dados)
// Assegura que todas as categorias tenham aparência premium idêntica.
// ============================================================================
const CATEGORY_MAP: Record<string, { desc: string, icon: React.ReactNode, colorBase: string, bgBase: string, hoverTarget: string }> = {
    'atenção básica': {
        desc: 'Consultas de rotina e clínica geral',
        colorBase: 'text-emerald-600',
        bgBase: 'bg-emerald-50 dark:bg-emerald-900/20',
        hoverTarget: 'group-hover:bg-emerald-600 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
    },
    'dermatologia': {
        desc: 'Alergias, lesões cutâneas e picadas',
        colorBase: 'text-rose-500',
        bgBase: 'bg-rose-50 dark:bg-rose-900/20',
        hoverTarget: 'group-hover:bg-rose-500 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/><path d="M12 17v-4"/></svg>
    },
    'documentos': {
        desc: 'Atestados, encaminhamentos e guias',
        colorBase: 'text-slate-600',
        bgBase: 'bg-slate-50 dark:bg-slate-900/20',
        hoverTarget: 'group-hover:bg-slate-600 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
    },
    'dor, trauma': {
        desc: 'Analgésicos, ortopedia e contusões',
        colorBase: 'text-orange-500',
        bgBase: 'bg-orange-50 dark:bg-orange-900/20',
        hoverTarget: 'group-hover:bg-orange-500 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-4.6 4.6c-.7.7-1.69 0-2.5 0a2.5 2.5 0 1 0 0 5 .5.5 0 0 1 .5.5 2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/></svg>
    },
    'gastroenterologia': {
        desc: 'Diarreia, refluxo, dores abdominais',
        colorBase: 'text-amber-500',
        bgBase: 'bg-amber-50 dark:bg-amber-900/20',
        hoverTarget: 'group-hover:bg-amber-500 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2v4a3 3 0 0 1-1.5 2.5c-2.5 1.5-4.5 3.5-4.5 6.5C5 18 7 20 12 20c4.5 0 7-3.5 7-6.5 0-2.5-2-4.5-4-5a2 2 0 0 1-1-1.5V2" /></svg>
    },
    'ginecologia': {
        desc: 'Saúde feminina e vulvovaginites',
        colorBase: 'text-fuchsia-500',
        bgBase: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
        hoverTarget: 'group-hover:bg-fuchsia-500 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="5"/><path d="M12 15v7"/><path d="M9 19h6"/></svg>
    },
    'infectologia': {
        desc: 'Dengue, viroses e infecções gerais',
        colorBase: 'text-lime-600',
        bgBase: 'bg-lime-50 dark:bg-lime-900/20',
        hoverTarget: 'group-hover:bg-lime-600 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 2V4" /><path d="M12 20V22" /><path d="M4.9 4.9l1.4 1.4" /><path d="M17.7 17.7l1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M4.9 19.1l1.4-1.4" /><path d="M17.7 4.9l1.4 1.4" /></svg>
    },
    'neurologia': {
        desc: 'Cefaleia, vertigem e saúde mental',
        colorBase: 'text-purple-600',
        bgBase: 'bg-purple-50 dark:bg-purple-900/20',
        hoverTarget: 'group-hover:bg-purple-600 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5h.5" /><path d="M14.5 2c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5h-.5" /><path d="M12 2v2" /><path d="M7.7 5.5A3.5 3.5 0 0 0 4 9c0 1.67 1.16 3.08 2.72 3.42" /><path d="M16.3 5.5A3.5 3.5 0 0 1 20 9c0 1.67-1.16 3.08-2.72 3.42" /><path d="M6.2 11.5A3.5 3.5 0 0 0 7 18.2V20a2 2 0 0 0 4 0v-2h2v2a2 2 0 0 0 4 0v-1.8a3.5 3.5 0 0 0 .8-6.7" /><path d="M12 9v11" /></svg>
    },
    'oftalmologia': {
        desc: 'Conjuntivite, olho vermelho, traumas',
        colorBase: 'text-cyan-600',
        bgBase: 'bg-cyan-50 dark:bg-cyan-900/20',
        hoverTarget: 'group-hover:bg-cyan-600 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
    },
    'respiratório': {
        desc: 'IVAS, sinusite, asma, rinite e tosse',
        colorBase: 'text-sky-600',
        bgBase: 'bg-sky-50 dark:bg-sky-900/20',
        hoverTarget: 'group-hover:bg-sky-600 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v9" /><path d="M12 12c-1.5 1-2.5 2.5-2.5 4S11 19 12 19s2.5-1.5 2.5-3-1-3-2.5-4" /><path d="M8 5C5 5 3 7 3 11c0 5 3 10 5 10 2 0 3.5-2 3.5-4" /><path d="M16 5c3 0 5 2 5 6 0 5-3 10-5 10-2 0-3.5-2-3.5-4" /></svg>
    },
    'saúde infantil': {
        desc: 'Dosagens pediátricas e puericultura',
        colorBase: 'text-sky-600',
        bgBase: 'bg-sky-50 dark:bg-sky-900/20',
        hoverTarget: 'group-hover:bg-sky-600 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M9 15c.5.5 1.5 1 3 1s2.5-.5 3-1" /><path d="M5 8c-.5-1-1.5-1-2-.5S2.5 9 3 10" /><path d="M19 8c.5-1 1.5-1 2-.5s.5 1.5 0 2.5" /></svg>
    },
    'urologia': {
        desc: 'ITU, cólica nefrética e afecções renais',
        colorBase: 'text-amber-500',
        bgBase: 'bg-amber-50 dark:bg-amber-900/20',
        hoverTarget: 'group-hover:bg-amber-500 group-hover:text-white',
        icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 13a4 4 0 0 1 4 4c0 3-3 4-5 4-3 0-5-3-2-6 1.5-1.5 3-2 3-2z"/><path d="M9 13a4 4 0 0 0-4 4c0 3 3 4 5 4 3 0 5-3 2-6-1.5-1.5-3-2-3-2z"/><path d="M12 3v6"/></svg>
    }
};

const PacientesPorta: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [favorites, setFavorites] = useState<Prescription[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Prescription[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !mounted) return;

            // Load all categories exactly as in Dashboard
            const { data: catData } = await supabase.from('categorias').select('*').order('nome', { ascending: true });
            if (catData && mounted) {
                setCategories(catData);
                setLoadingCategories(false);
            }

            // Load Favorites exactly as in Dashboard
            const { data: favData } = await supabase.from('user_favoritos').select('prescricoes(*)').eq('user_id', user.id);
            if (favData && mounted) {
                const favs = favData.map((f: any) => f.prescricoes).filter(Boolean);
                setFavorites(favs);
                setLoadingFavorites(false);
            }
        };

        loadData();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (searchTerm.trim().length < 3) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const delay = setTimeout(async () => {
            const term = searchTerm.trim();
            const { data } = await supabase
                .from('prescricoes')
                .select('*')
                .or(`titulo.ilike.%${term}%,condicao.ilike.%${term}%,texto.ilike.%${term}%,tags.cs.{${term}}`)
                .limit(10);
            setSearchResults(data || []);
            setIsSearching(false);
        }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    // Lógica para mapear as categorias do banco com os Ícones Premium do Front
    const getMappedCategory = (cat: Category) => {
        const lowerName = cat.nome.toLowerCase();
        
        let match = null;
        if (lowerName.includes('básica') || lowerName.includes('geral')) match = CATEGORY_MAP['atenção básica'];
        else if (lowerName.includes('derma')) match = CATEGORY_MAP['dermatologia'];
        else if (lowerName.includes('doc')) match = CATEGORY_MAP['documentos'];
        else if (lowerName.includes('dor') || lowerName.includes('trauma') || lowerName.includes('ortop')) match = CATEGORY_MAP['dor, trauma'];
        else if (lowerName.includes('gastro')) match = CATEGORY_MAP['gastroenterologia'];
        else if (lowerName.includes('ginec') || lowerName.includes('mulher')) match = CATEGORY_MAP['ginecologia'];
        else if (lowerName.includes('infect') || lowerName.includes('parasit')) match = CATEGORY_MAP['infectologia'];
        else if (lowerName.includes('neuro') || lowerName.includes('mental')) match = CATEGORY_MAP['neurologia'];
        else if (lowerName.includes('oftal')) match = CATEGORY_MAP['oftalmologia'];
        else if (lowerName.includes('respir') || lowerName.includes('otorrino')) match = CATEGORY_MAP['respiratório'];
        else if (lowerName.includes('infantil') || lowerName.includes('pedia')) match = CATEGORY_MAP['saúde infantil'];
        else if (lowerName.includes('uro') || lowerName.includes('nefro')) match = CATEGORY_MAP['urologia'];
        else {
            // FALLBACK UNIVERSAL (Garante que TODA categoria fique bonita na mesma grade)
            match = {
                 desc: 'Protocolos e condutas clínicas',
                 colorBase: 'text-indigo-500',
                 bgBase: 'bg-indigo-50 dark:bg-indigo-900/20',
                 hoverTarget: 'group-hover:bg-indigo-500 group-hover:text-white',
                 icon: <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
            };
        }

        return {
            ...cat,
            desc: match.desc,
            icon: match.icon,
            colorBase: match.colorBase,
            bgBase: match.bgBase,
            hoverTarget: match.hoverTarget
        };
    };

    const richCategories = categories
        .slice()
        .sort((a, b) => {
            const aIsDoc = a.nome.toLowerCase().includes('doc') ? 1 : 0;
            const bIsDoc = b.nome.toLowerCase().includes('doc') ? 1 : 0;
            return aIsDoc - bIsDoc;
        })
        .map(getMappedCategory);

    const getCategoryName = (id?: string) => {
        if (!id) return 'Acesso Clínico';
        return categories.find(c => c.id === id)?.nome || 'Acesso Clínico';
    };

    // Navegação histórica nativa do react-router-dom
    const handleGoBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 max-w-[1240px] mt-6 sm:mt-10 mb-24">
            
            {/* BOTÃO VOLTAR NATIVO (Histórico real) */}
            <button 
                onClick={handleGoBack}
                className="mb-8 flex items-center gap-2 text-[14px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors uppercase tracking-widest"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
            </button>

            {/* CABEÇALHO */}
            <div className="mb-8 sm:mb-10">
                <h1 className="text-4xl sm:text-[42px] font-extrabold tracking-tight text-slate-800 dark:text-white mb-2">Ambulatório</h1>
                <p className="text-[16px] sm:text-[18px] text-slate-500 font-medium max-w-2xl">Acesso rápido a prescrições ambulatoriais, receitas de alta e condutas frequentes.</p>
            </div>

            {/* BARRA DE BUSCA PREMIUM */}
            <div className="w-full relative group mb-12 sm:mb-16">
                <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                    <svg className="w-[22px] h-[22px] text-slate-400 group-focus-within:text-premium-teal transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por diagnóstico, medicamento, sintoma ou protocolo..."
                    className="w-full h-[64px] sm:h-[72px] pl-[60px] pr-20 text-[16px] text-slate-800 bg-white border border-transparent rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:outline-none focus:ring-[4px] focus:ring-premium-teal/20 focus:border-premium-teal transition-all font-bold placeholder-slate-400"
                />

                {/* Dropdown de Busca */}
                {searchTerm.trim().length >= 3 && (
                    <div className="absolute top-[88px] left-0 right-0 bg-white dark:bg-slate-900 rounded-[1.25rem] shadow-2xl border border-slate-100 dark:border-slate-800 z-50 text-left max-h-[420px] overflow-y-auto custom-scrollbar overflow-hidden">
                        {isSearching ? (
                            <div className="p-10 text-center text-slate-500 text-[15px] font-medium animate-pulse">Consultando base médica rápida...</div>
                        ) : searchResults.length > 0 ? (
                            <div className="p-2 space-y-1">
                                {searchResults.map((result) => (
                                    <Link key={result.id} to={`/prescricao/${result.id}`} className="block p-5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-extrabold text-[16px] text-slate-800 dark:text-slate-200 tracking-tight">{result.titulo}</p>
                                            {result.condicao && <span className="text-[11px] font-bold text-premium-teal bg-premium-teal/10 px-2 py-0.5 rounded uppercase tracking-wider">{result.condicao}</span>}
                                        </div>
                                        {result.texto && <p className="text-[14px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">{result.texto.replace(/<[^>]*>?/gm, ' ')}</p>}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <p className="text-[16px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">Nenhum protocolo encontrado</p>
                                <p className="text-[14px] text-slate-500 font-medium">Você pode tentar buscar o princípio ativo ou sintoma principal.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SEÇÃO FAVORITOS REDESENHADA (PREMIUM) */}
            <div className="mb-14">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            Favoritos
                        </h2>
                        <p className="text-[14px] text-slate-500 font-medium mt-0.5">Acesse rapidamente suas prescrições mais usadas.</p>
                    </div>
                </div>

                {loadingFavorites ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1,2,3].map(i => <div key={i} className="h-[88px] bg-slate-100 dark:bg-slate-800 rounded-[1.25rem] animate-pulse"></div>)}
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {favorites.map((fav) => (
                            <Link key={fav.id} to={`/prescricao/${fav.id}`} className="group relative flex items-start bg-white dark:bg-slate-900 border-[1.5px] border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-5px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-amber-200 dark:hover:border-amber-500/50 transition-all duration-300">
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2 mb-1.5">
                                        <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white truncate transition-colors pr-5">{fav.titulo}</h3>
                                    </div>
                                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium truncate mb-2">
                                        {getCategoryName(fav.categoria_id)} • Protocolo
                                    </p>
                                    {fav.condicao && <span className="inline-block text-[10px] font-black text-premium-teal bg-premium-teal/10 px-2 py-0.5 rounded uppercase tracking-wide truncate max-w-full">{fav.condicao}</span>}
                                </div>
                                
                                <div className="text-slate-300 group-hover:text-amber-500 transition-colors shrink-0 -mt-1 -mr-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="w-full p-8 sm:p-10 bg-slate-50/80 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-[1.5rem] flex flex-col justify-center items-center text-center">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                        </div>
                        <h3 className="text-[16px] font-extrabold text-slate-800 dark:text-white mb-1 tracking-tight">Crie seus atalhos</h3>
                        <p className="text-[14px] text-slate-500 font-medium max-w-sm">Marque protocolos com a estrela para criar uma biblioteca focada na sua rotina.</p>
                    </div>
                )}
            </div>

            {/* PRESCRIÇÃO LIVRE — Card de entrada principal */}
            <div className="mb-10">
                <Link
                    to="/prescricao-livre"
                    className="group relative flex items-center gap-6 p-6 sm:p-7 bg-[#0d1f35] dark:bg-[#0a1c32] rounded-2xl shadow-[0_8px_30px_rgba(10,28,50,0.25)] hover:shadow-[0_16px_45px_rgba(10,28,50,0.35)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                    {/* Glow de fundo */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-teal-400/5 blur-[80px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

                    <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-white/10 border border-white/15 rounded-xl text-white group-hover:bg-white/15 transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="8" y="2" width="8" height="4" rx="1.5"/>
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                            <path d="M9 13h6"/>
                            <path d="M9 17h4"/>
                        </svg>
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-white tracking-tight">Prescrição Livre</h2>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-teal-300 bg-teal-400/15 border border-teal-400/20 rounded-full">Principal</span>
                        </div>
                        <p className="text-[14px] text-slate-300/80 font-medium">Crie uma prescrição personalizada para o atendimento</p>
                    </div>

                    <svg className="w-5 h-5 text-white/40 group-hover:text-white/80 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* GRADE Única DE CATEGORIAS */}
            <div className="mb-14">
                <div className="mb-6">
                    <h2 className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight">Categorias Clínicas</h2>
                    <p className="text-[14px] text-slate-500 font-medium mt-1">Todas as especialidades e frentes de conduta padronizadas.</p>
                </div>
                
                {loadingCategories ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                       {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-[120px] bg-slate-100 dark:bg-slate-800 rounded-[1.25rem] animate-pulse"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {richCategories.map((cat) => (
                            <Link key={cat.id} to={`/categoria/${cat.id}`} className="group relative flex items-start p-5 bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 min-h-[96px]">
                                <div className={`flex-shrink-0 w-[48px] h-[48px] flex items-center justify-center rounded-xl mr-4 transition-colors duration-300 ${cat.colorBase} ${cat.bgBase} ${cat.hoverTarget}`}>
                                    {React.cloneElement(cat.icon as React.ReactElement, { className: "w-[24px] h-[24px]" })}
                                </div>
                                <div className="text-left w-full pt-1">
                                    <h3 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 dark:text-white tracking-tight mb-0.5 line-clamp-1">{cat.nome}</h3>
                                    <p className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">{cat.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default PacientesPorta;
