import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Prescription } from '../types';

interface DashboardProps {
    profile?: { nome: string } | null;
}

const Dashboard: React.FC<DashboardProps> = () => {
    const [favorites, setFavorites] = useState<Prescription[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Prescription[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [greeting, setGreeting] = useState('Bem-vindo, Dr.');
    const [notes, setNotes] = useState(() => {
        try { return localStorage.getItem('meddireto_notes') || ''; } catch { return ''; }
    });

    const handleNotesChange = (value: string) => {
        setNotes(value);
        try { localStorage.setItem('meddireto_notes', value); } catch {}
    };

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        let mounted = true;

        const loadDashboardData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user || !mounted) return;

                const checkSubscription = async () => {
                    let attempts = 0;
                    while (mounted && attempts < 3) {
                        const { data: isActive, error: rpcError } = await supabase.rpc('is_subscription_active');
                        if (!rpcError) {
                            if (isActive === false) {
                                window.location.href = 'https://renovar.meddireto.com';
                                return false;
                            }
                            return true;
                        }
                        attempts++;
                        await wait(1500);
                    }
                    if (mounted) window.location.href = 'https://renovar.meddireto.com';
                    return false;
                };

                const isAccessGranted = await checkSubscription();
                if (!isAccessGranted) return;

                // User Greeting
                (async () => {
                    while (mounted) {
                        const { data, error } = await supabase
                            .from('profiles')
                            .select('nome, sexo, profissao')
                            .eq('id', user.id)
                            .maybeSingle();

                        if (!error) {
                            const fullName = data?.nome || user.user_metadata?.full_name || '';
                            const sexo = data?.sexo || user.user_metadata?.sexo;
                            const profissao = data?.profissao || user.user_metadata?.profissao;
                            if (fullName) {
                                const firstName = fullName.split(' ')[0];
                                const lastName = fullName.split(' ').length > 1 ? fullName.split(' ')[1] : '';
                                const shortName = lastName ? `${firstName} ${lastName}` : firstName;

                                if (profissao === 'Estudante') setGreeting(`Bem-vindo, ${shortName}`);
                                else {
                                    let prefix = 'Dr(a)';
                                    if (sexo === 'Feminino') prefix = 'Dra.';
                                    else if (sexo === 'Masculino') prefix = 'Dr.';
                                    setGreeting(`Bem-vindo, ${prefix} ${shortName}`);
                                }
                            }
                            break;
                        }
                        await wait(2000);
                    }
                })();

                // Favorites
                (async () => {
                    while (mounted) {
                        const { data, error } = await supabase
                            .from('user_favoritos')
                            .select('prescricoes(*)')
                            .eq('user_id', user.id);
                        if (!error) {
                            if (mounted && data) {
                                const favoritePrescriptions = data.map((fav: any) => fav.prescricoes).filter(Boolean);
                                setFavorites(favoritePrescriptions);
                                setLoadingFavorites(false);
                            }
                            break;
                        }
                        await wait(3000);
                    }
                })();

            } catch (error) {
                console.error("Erro fatal no carregamento:", error);
            }
        };

        loadDashboardData();
        return () => { mounted = false; };
    }, []);
    
    useEffect(() => {
        if (searchTerm.trim().length < 3) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const delayDebounceFn = setTimeout(async () => {
            const term = searchTerm.trim();
            const { data } = await supabase
                .from('prescricoes')
                .select('*')
                .or(`titulo.ilike.%${term}%,condicao.ilike.%${term}%,texto.ilike.%${term}%,tags.cs.{${term}}`)
                .limit(10);
            setSearchResults(data || []);
            setIsSearching(false);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);



    return (
        <div className="container mx-auto px-4 sm:px-6 max-w-[1240px] mt-6 sm:mt-10 mb-24">
            
            {/* HERO SECTION — Paleta Azul Clínico Profundo */}
            <section className="relative w-full rounded-[2rem] shadow-[0_24px_60px_-15px_rgba(10,25,47,0.55)]">
                {/* Fundo com overflow-hidden separado dos glows */}
                <div className="absolute inset-0 overflow-hidden rounded-[2rem]" style={{background: 'linear-gradient(145deg, #0d1f35 0%, #122540 40%, #0e2038 70%, #0a1c32 100%)'}}>
                    {/* Glow suave em verde-azulado médico */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/5 blur-[120px] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-teal-400/6 blur-[100px] rounded-full pointer-events-none -translate-x-1/4 translate-y-1/4"></div>
                    {/* Linha de grade sutil para dar textura clínica */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px'}}></div>
                </div>

                {/* Conteúdo — sem overflow-hidden para dropdown escapar */}
                <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center px-6 py-12 sm:py-14 text-center">
                    {/* Marca de credibilidade sutil acima do título */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300/80 uppercase tracking-[0.15em] mb-5 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
                        Plataforma Clínica Profissional
                    </div>
                    <h1 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold tracking-[-0.02em] text-white mb-3 leading-[1.15]">
                        {greeting}
                    </h1>
                    <p className="text-slate-400 text-[14px] sm:text-[16px] max-w-xl mx-auto mb-9 font-medium leading-relaxed">
                        Protocolos clínicos, prescrições e documentos médicos em um só lugar.
                    </p>

                    {/* BARRA DE BUSCA PREMIUM */}
                    <div className="w-full max-w-3xl relative group mt-2">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                            <svg className="w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Pesquise por medicações, doenças ou documentos..."
                            className="w-full h-[58px] sm:h-[64px] pl-[50px] pr-20 text-[15px] text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-white/20 dark:border-slate-700 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-semibold placeholder-slate-400 dark:placeholder-slate-500"
                        />


                        {/* Search Dropdown */}
                        {searchTerm.trim().length >= 3 && (
                            <div className="absolute top-[76px] left-0 right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 z-[100] text-left max-h-[420px] overflow-y-auto custom-scrollbar">
                                {isSearching ? (
                                    <div className="p-10 text-center text-slate-400 text-[15px] font-medium">Consultando o acérvo médico...</div>
                                ) : searchResults.length > 0 ? (
                                    <div className="p-2 space-y-0.5">
                                        {searchResults.map((result) => (
                                            <Link key={result.id} to={`/prescricao/${result.id}`} className="block px-5 py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="font-bold text-[15px] text-slate-800 dark:text-slate-200 tracking-tight">{result.titulo}</p>
                                                    {result.condicao && <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">{result.condicao}</span>}
                                                </div>
                                                {result.texto && <p className="text-[13px] text-slate-400 dark:text-slate-500 line-clamp-1 font-medium">{result.texto.replace(/<[^>]*>?/gm, ' ')}</p>}
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                        <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nenhum protocolo encontrado</p>
                                        <p className="text-[13px] text-slate-400 font-medium">Verifique os termos ou busque por sinônimos.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 6 MÓDULOS PRINCIPAIS — Grade 3×2 — Paleta Clínica Refinada */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-8 relative z-20">

                {/* Ambulatório */}
                <Link to="/porta" className="group flex items-start gap-5 p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(30,100,180,0.10)] hover:-translate-y-1 hover:border-blue-300/60 dark:hover:border-blue-700/40 transition-all duration-300">
                    <div className="flex-shrink-0 w-13 h-13 sm:w-[52px] sm:h-[52px] flex items-center justify-center text-[#2563a8] bg-[#eff6ff] dark:bg-blue-950/40 rounded-xl group-hover:bg-[#2563a8] group-hover:text-white transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1.5"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[15px] sm:text-[16px] font-bold text-slate-800 dark:text-white leading-tight mb-1 tracking-[-0.01em]">Ambulatório</h3>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">Receituários para atendimento em UPA, UBS e ambulatórios</p>
                    </div>
                </Link>

                {/* Internação */}
                <Link to="/hospitalar" className="group flex items-start gap-5 p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(90,50,180,0.10)] hover:-translate-y-1 hover:border-violet-300/60 dark:hover:border-violet-700/40 transition-all duration-300">
                    <div className="flex-shrink-0 w-13 h-13 sm:w-[52px] sm:h-[52px] flex items-center justify-center text-[#6d44bf] bg-[#f5f0ff] dark:bg-violet-950/40 rounded-xl group-hover:bg-[#6d44bf] group-hover:text-white transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/><path d="M2 17V9"/><path d="M22 17V9"/><rect x="6" y="11" width="12" height="6" rx="1"/><circle cx="8" cy="8" r="2"/></svg>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[15px] sm:text-[16px] font-bold text-slate-800 dark:text-white leading-tight mb-1 tracking-[-0.01em]">Internação</h3>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">Prescrições para enfermaria</p>
                    </div>
                </Link>

                {/* Emergência */}
                <Link to="/emergencia" className="group flex items-start gap-5 p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(200,40,40,0.09)] hover:-translate-y-1 hover:border-red-300/60 dark:hover:border-red-700/40 transition-all duration-300">
                    <div className="flex-shrink-0 w-13 h-13 sm:w-[52px] sm:h-[52px] flex items-center justify-center text-[#c0392b] bg-[#fef2f2] dark:bg-red-950/40 rounded-xl group-hover:bg-[#c0392b] group-hover:text-white transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[15px] sm:text-[16px] font-bold text-slate-800 dark:text-white leading-tight mb-1 tracking-[-0.01em]">Emergência</h3>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">Sala vermelha, urgência e protocolos críticos</p>
                    </div>
                </Link>

                {/* Pediatria */}
                <Link to="/pediatria" className="group flex items-start gap-5 p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(180,120,10,0.09)] hover:-translate-y-1 hover:border-amber-300/60 dark:hover:border-amber-700/40 transition-all duration-300">
                    <div className="flex-shrink-0 w-13 h-13 sm:w-[52px] sm:h-[52px] flex items-center justify-center text-[#b45309] bg-[#fffbeb] dark:bg-amber-950/40 rounded-xl group-hover:bg-[#b45309] group-hover:text-white transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 4 0v6a4 4 0 0 0 8 0v-1"/><circle cx="17" cy="10" r="2"/><circle cx="19" cy="19" r="2"/><path d="M17 12v5a2 2 0 0 0 2 2"/></svg>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[15px] sm:text-[16px] font-bold text-slate-800 dark:text-white leading-tight mb-1 tracking-[-0.01em]">Pediatria</h3>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">Prescrições, doses e cuidados pediátricos</p>
                    </div>
                </Link>

                {/* Documentos Médicos */}
                <Link to="/documentos" className="group flex items-start gap-5 p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(10,130,120,0.09)] hover:-translate-y-1 hover:border-teal-300/60 dark:hover:border-teal-700/40 transition-all duration-300">
                    <div className="flex-shrink-0 w-13 h-13 sm:w-[52px] sm:h-[52px] flex items-center justify-center text-[#0d7a71] bg-[#f0fdfa] dark:bg-teal-950/40 rounded-xl group-hover:bg-[#0d7a71] group-hover:text-white transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6"/><path d="M12 7v4"/><path d="M9 15h6"/><path d="M9 11h2"/></svg>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[15px] sm:text-[16px] font-bold text-slate-800 dark:text-white leading-tight mb-1 tracking-[-0.01em]">Documentos Médicos</h3>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">Atestados, encaminhamentos e outros documentos</p>
                    </div>
                </Link>

                {/* Minhas Receitas */}
                <Link to="/minhas-receitas" className="group flex items-start gap-5 p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(60,70,200,0.09)] hover:-translate-y-1 hover:border-indigo-300/60 dark:hover:border-indigo-700/40 transition-all duration-300">
                    <div className="flex-shrink-0 w-13 h-13 sm:w-[52px] sm:h-[52px] flex items-center justify-center text-[#3b4dc4] bg-[#eef2ff] dark:bg-indigo-950/40 rounded-xl group-hover:bg-[#3b4dc4] group-hover:text-white transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h5"/><path d="M8 17h8"/><path d="M8 9h2"/></svg>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[15px] sm:text-[16px] font-bold text-slate-800 dark:text-white leading-tight mb-1 tracking-[-0.01em]">Minhas Receitas</h3>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">Acesse suas prescrições salvas e mais usadas</p>
                    </div>
                </Link>

            </section>

            {/* MAIN SECTIONS LAYOUT */}
            <div className="mt-14 sm:mt-16 space-y-14 sm:space-y-16 px-2 sm:px-0">
                
                {/* FAVORITOS */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                Seus Favoritos
                            </h2>
                        </div>
                        <Link to="/favoritos" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 uppercase tracking-widest transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-auto">
                            Ver todos <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>
                    
                    {loadingFavorites ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {[1,2,3,4].map(i => <div key={i} className="h-[110px] bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
                        </div>
                    ) : favorites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {favorites.map((fav) => (
                                <Link key={fav.id} to={`/prescricao/${fav.id}`} className="group relative flex items-start bg-white dark:bg-slate-900 border-[1.5px] border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-5px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-amber-200 dark:hover:border-amber-500/50 transition-all duration-300">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 mb-1.5">
                                            <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 tracking-tight pr-5">{fav.titulo}</h3>
                                        </div>
                                        {fav.condicao && <span className="inline-block text-[10px] font-black text-premium-teal bg-premium-teal/10 px-2 py-0.5 rounded mr-2 uppercase tracking-wide truncate max-w-full">{fav.condicao}</span>}
                                    </div>
                                    <div className="text-slate-300 group-hover:text-amber-500 transition-colors shrink-0 -mt-1 -mr-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400">Nenhum atalho salvo. Marque prescrições com a estrela para acesso rápido.</p>
                        </div>
                    )}
                </section>

                {/* AÇÕES RÁPIDAS + ANOTAÇÕES — Grid lado a lado */}
                <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    
                    {/* AÇÕES RÁPIDAS (3 colunas) */}
                    <div className="lg:col-span-3">
                        <div className="mb-5">
                            <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white tracking-tight mb-1 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-premium-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                Ações Rápidas
                            </h2>
                            <p className="text-[14px] text-slate-500 font-medium">Comece uma ação imediata com poucos cliques</p>
                        </div>
                        <div className="space-y-3">
                            {/* Prescrição Adulto */}
                            <Link to="/porta" className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.06)] hover:border-blue-200 dark:hover:border-blue-800/50 hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1.5"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">Prescrição Adulto</h3>
                                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Prescrição rápida para pacientes adultos</p>
                                </div>
                                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 dark:text-slate-600 ml-auto flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </Link>

                            {/* Prescrição Pediátrica */}
                            <Link to="/pediatria" className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.06)] hover:border-amber-200 dark:hover:border-amber-800/50 hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-amber-600 bg-amber-50 dark:bg-amber-500/10 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5a2 2 0 0 1 4 0v6a4 4 0 0 0 8 0v-1"/><circle cx="17" cy="10" r="2"/><circle cx="19" cy="19" r="2"/><path d="M17 12v5a2 2 0 0 0 2 2"/></svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">Prescrição Pediátrica</h3>
                                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Prescrição com foco em doses e condutas pediátricas</p>
                                </div>
                                <svg className="w-5 h-5 text-slate-300 group-hover:text-amber-500 dark:text-slate-600 ml-auto flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </Link>

                            {/* Atestado Médico */}
                            <Link to="/documentos/atestado" className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.06)] hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h4"/><path d="M9 9h2"/></svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">Atestado Médico</h3>
                                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Gere atestado médico com poucos campos</p>
                                </div>
                                <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 dark:text-slate-600 ml-auto flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>

                    {/* ANOTAÇÕES (2 colunas) */}
                    <div className="lg:col-span-2">
                        <div className="mb-5">
                            <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white tracking-tight mb-1 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                Anotações
                            </h2>
                            <p className="text-[14px] text-slate-500 font-medium">Suas notas pessoais do plantão</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] overflow-hidden h-[calc(100%-60px)] min-h-[220px]">
                            <textarea
                                value={notes}
                                onChange={(e) => handleNotesChange(e.target.value)}
                                placeholder="Anote algo rápido aqui… lembretes do plantão, pendências, condutas a revisar..."
                                className="w-full h-full min-h-[220px] p-5 text-[14px] font-medium text-slate-700 dark:text-slate-300 bg-transparent border-none outline-none resize-none placeholder-slate-400 dark:placeholder-slate-600 leading-relaxed"
                            />
                        </div>
                    </div>

                </section>
                
            </div>
        </div>
    );
};

export default Dashboard;
