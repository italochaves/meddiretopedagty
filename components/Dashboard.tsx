
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Category, Prescription } from '../types';

interface DashboardProps {
    profile?: { nome: string } | null;
}

const Dashboard: React.FC<DashboardProps> = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [favorites, setFavorites] = useState<Prescription[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Prescription[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [greeting, setGreeting] = useState('Olá, Doutor(a)');

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        let mounted = true;

        const loadDashboardData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user || !mounted) return;

                // --- 1. VERIFICAÇÃO DE SEGURANÇA: ASSINATURA ATIVA ---
                const checkSubscription = async () => {
                    let attempts = 0;
                    while (mounted && attempts < 3) { // Tenta até 3 vezes em caso de erro técnico
                        const { data: isActive, error: rpcError } = await supabase.rpc('is_subscription_active');
                        
                        if (!rpcError) {
                            if (isActive === false) {
                                window.location.href = 'https://renovar.meddireto.com';
                                return false;
                            }
                            return true; // Assinatura OK
                        }
                        
                        console.warn("Falha técnica na checagem de assinatura, tentando novamente...", rpcError);
                        attempts++;
                        await wait(1500); // Espera um pouco para o banco acordar
                    }
                    
                    // Se após as tentativas ainda der erro, por segurança, redireciona
                    if (mounted) window.location.href = 'https://renovar.meddireto.com';
                    return false;
                };

                const isAccessGranted = await checkSubscription();
                if (!isAccessGranted) return; // Interrompe o carregamento do resto se não tiver acesso


                // --- 2. CARREGAMENTO DOS DADOS (CONTINUAÇÃO) ---

                // Saudação (Loop até sucesso)
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
                                if (profissao === 'Estudante') setGreeting(`Olá, ${firstName}`);
                                else {
                                    let prefix = 'Dr(a).';
                                    if (sexo === 'Feminino') prefix = 'Dra.';
                                    else if (sexo === 'Masculino') prefix = 'Dr.';
                                    setGreeting(`Olá, ${prefix} ${firstName}`);
                                }
                            }
                            break;
                        }
                        await wait(2000);
                    }
                })();

                // Categorias (Retry Silencioso Infinito)
                (async () => {
                    while (mounted) {
                        const { data, error } = await supabase
                            .from('categorias')
                            .select('*')
                            .order('nome', { ascending: true });
                        
                        if (!error && data) {
                            if (mounted) {
                                setCategories(data);
                                setLoadingCategories(false);
                            }
                            break;
                        }
                        await wait(3000);
                    }
                })();

                // Favoritos (Retry Silencioso Infinito)
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
                .or(`titulo.ilike.%${term}%,condicao.ilike.%${term}%,tags.cs.{${term}}`)
                .limit(10);
            setSearchResults(data || []);
            setIsSearching(false);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const scrollToCategories = (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById('categorias-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="container mx-auto space-y-12 max-w-6xl">
            <section className="text-center mt-4 space-y-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">{greeting}</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 text-lg">Pesquise por prescrições, pacientes ou protocolos para começar.</p>
                </div>
                <div className="max-w-3xl mx-auto relative">
                     <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                        <svg className="w-5 h-5 text-premium-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquise por prescrições, pacientes ou protocolos..."
                        className="w-full py-4 pl-14 pr-4 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all"
                    />
                    {(searchResults.length > 0 || isSearching) && searchTerm.length >= 3 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20 text-left">
                            {isSearching ? (
                                <div className="p-4 text-slate-500 dark:text-slate-400 text-sm">Pesquisando...</div>
                            ) : (
                                searchResults.map((result) => (
                                     <Link key={result.id} to={`/prescricao/${result.id}`} className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700 last:border-0">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{result.titulo}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{result.condicao}</p>
                                     </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Link to="#" onClick={scrollToCategories} className="group relative flex flex-col items-center p-8 text-center transition-all bg-white border cursor-pointer dark:bg-slate-800 rounded-2xl shadow-card hover:shadow-xl border-slate-100 dark:border-slate-700 hover:-translate-y-1">
                    <div className="p-4 mb-4 text-blue-600 transition-colors bg-blue-50 rounded-full dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="14" x="3" y="6" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 6v14"/></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Prescrições Porta</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receitas comuns de consultório e alta.</p>
                </Link>
                <Link to="/hospitalar" className="group relative flex flex-col items-center p-8 text-center transition-all bg-white border cursor-pointer dark:bg-slate-800 rounded-2xl shadow-card hover:shadow-xl border-slate-100 dark:border-slate-700 hover:-translate-y-1">
                    <div className="p-4 mb-4 text-purple-600 transition-colors bg-purple-50 rounded-full dark:bg-purple-900/20 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6V4"/><path d="M22 11v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9"/><path d="M2 11h20"/><path d="M9 22V12h6v10"/><path d="M4 11V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7"/></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">Prescrições Internado</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Protocolos de enfermaria, UTI, dietas e evoluções.</p>
                </Link>
                <Link to="/emergencia" className="group relative flex flex-col items-center p-8 text-center transition-all bg-white border cursor-pointer dark:bg-slate-800 rounded-2xl shadow-card hover:shadow-xl border-slate-100 dark:border-slate-700 hover:-translate-y-1">
                    <div className="p-4 mb-4 text-red-600 transition-colors bg-red-50 rounded-full dark:bg-red-900/20 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 0 1 16 0"/><circle cx="12" cy="13" r="2"/><path d="M5.6 6.6 4 5"/><path d="M18.4 6.6 20 5"/></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">Emergência</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Protocolos de urgência, sala vermelha e trauma.</p>
                </Link>
                <Link to="/pediatria" className="group relative flex flex-col items-center p-8 text-center transition-all bg-white border cursor-pointer dark:bg-slate-800 rounded-2xl shadow-card hover:shadow-xl border-slate-100 dark:border-slate-700 hover:-translate-y-1">
                    <div className="p-4 mb-4 text-pink-500 transition-colors bg-pink-50 rounded-full dark:bg-pink-900/20 dark:text-pink-400 group-hover:bg-pink-500 group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/><path d="M12 14a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z"/><circle cx="12" cy="7" r="1"/></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-pink-500 dark:group-hover:text-pink-400">Pediatria</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Cálculo de doses por peso e protocolos infantis.</p>
                </Link>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Favoritos</h2>
                </div>
                {loadingFavorites ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {favorites.map((fav) => (
                            <Link key={fav.id} to={`/prescricao/${fav.id}`} className="group relative block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="absolute top-4 right-4 text-yellow-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                                </div>
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 pr-6 truncate">{fav.titulo}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{fav.condicao} - {fav.texto?.substring(0, 80)}...</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400">Ainda sem favoritos. Marque suas prescrições mais usadas com uma estrela.</p>
                    </div>
                )}
            </section>

            <section id="categorias-section" className="pt-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Navegar por Categorias</h2>
                </div>
                 {loadingCategories ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                         {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                             <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl animate-pulse"></div>
                         ))}
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {categories.map((category) => (
                            <Link key={category.id} to={`/categoria/${category.id}`} className="flex flex-col items-center justify-center p-4 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-premium-teal dark:hover:border-premium-teal hover:shadow-md transition-all h-full group">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-premium-teal dark:group-hover:text-premium-teal uppercase tracking-wide">{category.nome}</span>
                            </Link>
                        ))}
                    </div>
                 )}
            </section>
        </div>
    );
};

export default Dashboard;
