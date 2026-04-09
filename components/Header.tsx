
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
    profile: UserProfile | null;
}

const Header: React.FC<HeaderProps> = ({ profile }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    // Greeting State
    const [greeting, setGreeting] = useState('');

    // Fetch user metadata for personalized greeting
    useEffect(() => {
        const fetchUserMetadata = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user && user.user_metadata) {
                const meta = user.user_metadata;
                const fullName = meta.full_name || meta.nome || '';
                
                // Divide o nome por espaços e pega os dois primeiros
                const nameParts = fullName.trim().split(/\s+/);
                
                if (nameParts.length > 0) {
                    // Pega o primeiro e o segundo nome (se existir)
                    const displayName = nameParts.slice(0, 2).join(' ');
                    setGreeting(displayName);
                } else {
                    setGreeting('Usuário');
                }
            }
        };

        fetchUserMetadata();

        // Listen for Auth changes to update greeting immediately
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                fetchUserMetadata();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            // We await the signOut process
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // NOTE: We do NOT manually navigate('/login') here.
            // We rely on App.tsx -> onAuthStateChange -> setSession(null) -> ProtectedRoute -> Redirect to Login.
            
        } catch (error) {
            console.error("Logout failed:", error);
            // Fallback strategy: Force clear and hard reload if standard logout fails
            localStorage.clear();
            window.location.href = '/'; 
        } finally {
            setIsLoggingOut(false);
        }
    };

    const isActive = (path: string) => 
        location.pathname === path 
            ? 'text-premium-teal font-semibold bg-premium-teal/5 rounded-lg text-center leading-tight' 
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-center leading-tight';

    const closeSidebar = () => setIsSidebarOpen(false);

    const mobileLinkClass = (path: string) => 
        `block px-4 py-3 text-base font-medium transition-colors ${
            location.pathname === path
            ? 'text-premium-teal bg-premium-teal/10 border-r-4 border-premium-teal'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`;

    return (
        <>
            <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm print:hidden transition-colors duration-200">
                <div className="container px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        
                        {/* Left Side: Hamburger & Logo */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Hamburger Button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-2 text-slate-500 rounded-md md:hidden hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-premium-teal"
                                aria-label="Abrir menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* --- LOGO NOVO (DESKTOP E HEADER PRINCIPAL) --- */}
                            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
                                <img 
                                    src="/logo.png" 
                                    alt="MedDireto Logo" 
                                    className="h-10 w-auto" 
                                />
                                <span className="text-xl font-extrabold tracking-tight text-brand-gray dark:text-white relative top-[1px]">
                                    MedDireto
                                </span>
                            </Link>
                            
                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center space-x-2 text-sm font-medium ml-6">
                                <Link to="/dashboard" className={`px-3 py-2 ${isActive('/dashboard')}`}>Prescrições</Link>
                                <Link to="/minhas-receitas" className={`px-3 py-2 ${isActive('/minhas-receitas')}`}>Minhas Receitas</Link>
                                <Link to="/calculadoras" className={`px-3 py-2 ${isActive('/calculadoras')}`}>Calculadoras</Link>
                                <Link to="/settings" className={`px-3 py-2 ${isActive('/settings')}`}>Configurações</Link>
                                <Link to="/meu-cadastro" className={`px-3 py-2 ${isActive('/meu-cadastro')}`}>Meu Cadastro</Link>
                            </nav>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            
                            {/* Theme Toggle Button */}
                            <button 
                                onClick={toggleTheme} 
                                className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-full transition-colors"
                                aria-label="Alternar tema"
                            >
                                {isDarkMode ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            <div className="flex items-center gap-4 text-sm font-medium">
                                <span className="text-slate-600 dark:text-slate-300 hidden sm:block text-center leading-tight">
                                    {greeting}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                >
                                    {isLoggingOut ? 'Saindo...' : 'Sair'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Mobile Sidebar Panel */}
            <div 
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 dark:border-slate-700">
                        {/* --- LOGO NOVO (SIDEBAR MOBILE) --- */}
                        <Link to="/dashboard" onClick={closeSidebar} className="flex items-center gap-3">
                            <img 
                                src="/logo.png" 
                                alt="MedDireto Logo" 
                                className="h-8 w-auto" 
                            />
                            <span className="text-xl font-extrabold tracking-tight text-brand-gray dark:text-white">
                                MedDireto
                            </span>
                        </Link>
                        
                        <button 
                            onClick={closeSidebar}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Sidebar Links */}
                    <nav className="flex-1 py-4 overflow-y-auto">
                        <div className="px-4 mb-2">
                             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
                        </div>
                        <Link to="/dashboard" onClick={closeSidebar} className={mobileLinkClass('/dashboard')}>
                            Prescrições
                        </Link>
                        <Link to="/minhas-receitas" onClick={closeSidebar} className={mobileLinkClass('/minhas-receitas')}>
                            Minhas Receitas
                        </Link>
                        <Link to="/calculadoras" onClick={closeSidebar} className={mobileLinkClass('/calculadoras')}>
                            Calculadoras
                        </Link>
                        <Link to="/settings" onClick={closeSidebar} className={mobileLinkClass('/settings')}>
                            Configurações
                        </Link>
                        <Link to="/meu-cadastro" onClick={closeSidebar} className={mobileLinkClass('/meu-cadastro')}>
                            Meu Cadastro
                        </Link>
                    </nav>

                    {/* Sidebar Footer (User Info) */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-premium-teal/20 flex items-center justify-center text-premium-teal font-bold">
                                {profile?.nome ? profile.nome.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {profile?.nome ? profile.nome.split(' ')[0] : 'Usuário'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {profile?.profissao || 'Profissional'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { closeSidebar(); handleLogout(); }}
                            disabled={isLoggingOut}
                            className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-900/30 transition-colors disabled:opacity-50"
                        >
                            {isLoggingOut ? 'Saindo...' : 'Sair'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
