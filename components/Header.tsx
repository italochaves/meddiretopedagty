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

    useEffect(() => {
        const fetchUserMetadata = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user && user.user_metadata) {
                const meta = user.user_metadata;
                const fullName = meta.full_name || meta.nome || '';
                
                const nameParts = fullName.trim().split(/\s+/);
                
                if (nameParts.length > 0) {
                    const displayName = nameParts.slice(0, 2).join(' ');
                    setGreeting(displayName);
                } else {
                    setGreeting('Dr(a)');
                }
            }
        };

        fetchUserMetadata();

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
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("Logout failed:", error);
            localStorage.clear();
            window.location.href = '/'; 
        } finally {
            setIsLoggingOut(false);
        }
    };

    // New "The Clinical Atelier" styling pattern for links
    const isActive = (path: string) => 
        location.pathname === path 
            ? 'text-premium-teal font-bold bg-premium-teal/10 dark:bg-premium-teal/15 rounded-xl transition-all' 
            : 'text-slate-600 font-semibold hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 rounded-xl transition-all';

    const closeSidebar = () => setIsSidebarOpen(false);

    const mobileLinkClass = (path: string) => 
        `block px-4 py-3 text-[15px] font-semibold transition-colors ${
            location.pathname === path
            ? 'text-premium-teal bg-premium-teal/8 border-r-[3px] border-premium-teal'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900'
        }`;

    return (
        <>
            <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-subtle backdrop-blur-sm print:hidden transition-colors duration-200">
                <div className="container px-4 mx-auto sm:px-6 lg:px-8 max-w-[1400px]">
                    <div className="flex items-center justify-between h-[72px]">
                        
                        {/* Left Side: Hamburger & Logo */}
                        <div className="flex items-center gap-2">
                            {/* Mobile Hamburger Button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-2 text-slate-500 rounded-md lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                                aria-label="Abrir menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* LOGO (Clean & Professional) */}
                            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity group mr-4 xl:mr-8">
                                <span className="text-[22px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    MedDireto
                                </span>
                            </Link>
                            
                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-[15px]">
                                <Link to="/dashboard" className={`px-3 xl:px-4 py-2 ${isActive('/dashboard')}`}>Início</Link>

                                <Link to="/calculadoras" className={`px-3 xl:px-4 py-2 ${isActive('/calculadoras')}`}>Calculadoras</Link>
                                <Link to="/settings" className={`px-3 xl:px-4 py-2 ${isActive('/settings')}`}>Configurações de Impressão</Link>
                            </nav>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4">
                            
                            {/* Desktop Secondary Links */}
                            <div className="hidden lg:flex items-center mr-2 xl:mr-4 border-r border-slate-200 dark:border-slate-700 pr-4 xl:pr-6">
                                <Link to="/meu-cadastro" className="text-[14px] text-slate-600 dark:text-slate-400 font-semibold px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800 transition-all">Meu Perfil</Link>
                                <Link to="/tutorial" className="text-[14px] text-slate-600 dark:text-slate-400 font-semibold px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800 transition-all">Ajuda</Link>
                            </div>

                            {/* Theme Toggle Button */}
                            <button 
                                onClick={toggleTheme} 
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                {isDarkMode ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {/* User Avatar & Logout */}
                            <div className="flex items-center gap-3 ml-2">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                        {greeting}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="text-[12px] font-medium text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        {isLoggingOut ? 'Saindo...' : 'Sair da Conta'}
                                    </button>
                                </div>
                                <div className="w-[38px] h-[38px] rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden border-2 border-white dark:border-slate-700 ring-1 ring-slate-200 dark:ring-slate-700">
                                    {profile?.nome 
                                        ? profile.nome.trim().charAt(0).toUpperCase() 
                                        : (greeting && greeting !== 'Dr(a)' ? greeting.trim().charAt(0).toUpperCase() : 'U')
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm lg:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Mobile Sidebar Panel */}
            <div 
                className={`fixed top-0 left-0 z-[60] h-full w-[280px] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between px-6 h-[72px] border-b border-slate-100 dark:border-slate-800">
                        <Link to="/dashboard" onClick={closeSidebar} className="flex items-center gap-3">
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                MedDireto
                            </span>
                        </Link>
                        
                        <button 
                            onClick={closeSidebar}
                            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Sidebar Links */}
                    <nav className="flex-1 py-6 overflow-y-auto">
                        <div className="px-6 mb-3">
                             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Plataforma Clínica</p>
                        </div>
                        <Link to="/dashboard" onClick={closeSidebar} className={mobileLinkClass('/dashboard')}>
                            Início
                        </Link>
                        <Link to="/calculadoras" onClick={closeSidebar} className={mobileLinkClass('/calculadoras')}>
                            Calculadoras
                        </Link>
                        <Link to="/settings" onClick={closeSidebar} className={mobileLinkClass('/settings')}>
                            Configurações de Impressão
                        </Link>
                        
                        <div className="px-6 mt-8 mb-3">
                             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Conta</p>
                        </div>
                        <Link to="/meu-cadastro" onClick={closeSidebar} className={mobileLinkClass('/meu-cadastro')}>
                            Meu Perfil
                        </Link>
                        <Link to="/tutorial" onClick={closeSidebar} className={mobileLinkClass('/tutorial')}>
                            Ajuda
                        </Link>
                    </nav>

                    {/* Sidebar Footer (User Info) */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white font-bold">
                                {profile?.nome 
                                    ? profile.nome.trim().charAt(0).toUpperCase() 
                                    : (greeting && greeting !== 'Dr(a)' ? greeting.trim().charAt(0).toUpperCase() : 'U')
                                }
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-slate-800 dark:text-white leading-tight">
                                    {profile?.nome 
                                        ? profile.nome.split(' ')[0] 
                                        : (greeting && greeting !== 'Dr(a)' ? greeting.split(' ')[0] : 'Doutor(a)')
                                    }
                                </p>
                                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                                    {profile?.profissao || 'Acesso Premium'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { closeSidebar(); handleLogout(); }}
                            disabled={isLoggingOut}
                            className="w-full py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isLoggingOut ? 'Desconectando...' : 'Fazer Logout'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
