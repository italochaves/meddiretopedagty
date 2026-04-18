import FirstAccessModal from './components/FirstAccessModal';
import OnboardingModal from './components/OnboardingModal';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import { UserProfile } from './types';
import AuthPage from './components/AuthPage';
import AuthCallback from './components/AuthCallback';
import Dashboard from './components/Dashboard';
import CategoryPage from './components/CategoryPage';
import PrescriptionPage from './components/PrescriptionPage';
import Admin from './components/Admin';
import Settings from './components/Settings';
import Calculadoras from './components/Calculadoras';
import MinhasReceitas from './components/MinhasReceitas';
import HospitalarPage from './components/HospitalarPage';
import EmergenciaPage from './components/EmergenciaPage';
import IntubacaoPage from './components/IntubacaoPage';
import SedacaoPage from './components/SedacaoPage';
import HidroeletroliticoPage from './components/HidroeletroliticoPage';
import AnafilaxiaPage from './components/AnafilaxiaPage';
import TaquiarritmiasPage from './components/TaquiarritmiasPage';
import BradiarritmiasPage from './components/BradiarritmiasPage';
import CetoacidosePage from './components/CetoacidosePage';
import ConvulsaoPage from './components/ConvulsaoPage';
import DrogasVasoativasPage from './components/DrogasVasoativasPage';
import PediatriaPage from './components/PediatriaPage';
import PacientesPorta from './components/PacientesPorta';
import DocumentosMedicos from './components/DocumentosMedicos';
import AtestadoMedico from './components/AtestadoMedico';
import DeclaracaoComparecimento from './components/DeclaracaoComparecimento';
import EncaminhamentoMedico from './components/EncaminhamentoMedico';
import RelatorioMedico from './components/RelatorioMedico';
import SolicitacaoExames from './components/SolicitacaoExames';
import MeuCadastroPage from './components/MeuCadastroPage';
import TutorialPage from './components/TutorialPage';
import FavoritosPage from './components/FavoritosPage';
import PrescricaoLivre from './components/PrescricaoLivre';
import UnderConstruction from './components/UnderConstruction';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import PasswordResetPage from './components/PasswordResetPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import { PrintProvider, usePrint } from './contexts/PrintContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrintBar from './components/PrintBar';
import PrintLayout from './components/PrintLayout';
import SessionMonitor from './components/SessionMonitor';

const AppContent: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { refreshLetterhead } = usePrint();

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Busca Perfil com Retry Infinito
    const fetchProfile = async (userId: string, mounted: { current: boolean }) => {
        while (mounted.current) {
            try {
                const { data: userProfile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();
                
                if (!error) {
                    if (mounted.current) setProfile(userProfile);
                    break; // Sucesso, sai do loop
                }
                console.warn("Retrying profile fetch due to Supabase delay...");
            } catch (e) {
                console.error("Fetch error, retrying...", e);
            }
            await wait(2500); // Espera 2.5s antes de tentar de novo
        }
    };

    useEffect(() => {
        const mounted = { current: true };

        const initializeAuth = async () => {
            if (mounted.current) setLoading(true);
            
            let initialSessionFound = false;
            
            // Loop para garantir que pegamos a sessão mesmo com instabilidade inicial
            while (mounted.current && !initialSessionFound) {
                const { data: { session: initialSession }, error } = await supabase.auth.getSession();
                
                if (!error) {
                    if (initialSession && mounted.current) {
                        setSession(initialSession);
                        fetchProfile(initialSession.user.id, mounted);
                        refreshLetterhead();
                    }
                    initialSessionFound = true; // Mesmo que null, o Supabase respondeu
                } else {
                    console.warn("Auth check failed, retrying...");
                    await wait(2000);
                }
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                if (!mounted.current) return;

                if (event === 'SIGNED_OUT') {
                    localStorage.clear();
                    setSession(null);
                    setProfile(null);
                    refreshLetterhead();
                    setLoading(false);
                    return;
                }

                if (currentSession) {
                    setSession(currentSession);
                    if (currentSession.user.id !== session?.user.id || !profile) {
                         fetchProfile(currentSession.user.id, mounted);
                         refreshLetterhead();
                    }
                }
                setLoading(false);
            });

            if (mounted.current) setLoading(false);
            return subscription;
        };

        let authSubscription: { unsubscribe: () => void } | null = null;
        initializeAuth().then(sub => {
            authSubscription = sub || null;
        });

        return () => {
            mounted.current = false;
            if (authSubscription) authSubscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-slate-900 font-sans">
                <div className="sticky top-0 z-40 w-full bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 h-16 shadow-sm">
                    <div className="container px-4 mx-auto flex items-center justify-between h-full">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                             <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <main className="flex-grow p-6 sm:p-8 md:p-10 container mx-auto max-w-6xl">
                      <div className="flex flex-col items-center space-y-8 mt-4">
                        <div className="w-1/3 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                        <div className="w-full max-w-3xl h-14 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                        <div className="flex gap-3">
                             {[1,2,3,4,5].map(i => <div key={i} className="w-24 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>)}
                        </div>
                      </div>
                </main>
            </div>
        );
    }
    
    return (
        <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 print:hidden transition-colors duration-200">
                {session && <FirstAccessModal />}
                {session && <OnboardingModal />}
                {session && <SessionMonitor />}
                {session && <Header profile={profile} />}
                <main className="flex-grow p-6 sm:p-8 md:p-10">
                    <Routes>
                        <Route path="/login" element={!session ? <AuthPage /> : <Navigate to="/dashboard" />} />
                        <Route path="/password-reset" element={!session ? <PasswordResetPage /> : <Navigate to="/dashboard" />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/" element={!session ? <Navigate to="/login" /> : <Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<ProtectedRoute session={session}><Dashboard /></ProtectedRoute>} />
                        <Route path="/porta" element={<ProtectedRoute session={session}><PacientesPorta /></ProtectedRoute>} />
                        <Route path="/hospitalar" element={<ProtectedRoute session={session}><HospitalarPage /></ProtectedRoute>} />
                        <Route path="/emergencia" element={<ProtectedRoute session={session}><EmergenciaPage /></ProtectedRoute>} />
                        <Route path="/emergencia/intubacao" element={<ProtectedRoute session={session}><IntubacaoPage /></ProtectedRoute>} />
                        <Route path="/emergencia/sedacao" element={<ProtectedRoute session={session}><SedacaoPage /></ProtectedRoute>} />
                        <Route path="/emergencia/hidroeletrolitico" element={<ProtectedRoute session={session}><HidroeletroliticoPage /></ProtectedRoute>} />
                        <Route path="/emergencia/anafilaxia" element={<ProtectedRoute session={session}><AnafilaxiaPage /></ProtectedRoute>} />
                        <Route path="/emergencia/taquiarritmias" element={<ProtectedRoute session={session}><TaquiarritmiasPage /></ProtectedRoute>} />
                        <Route path="/emergencia/bradiarritmias" element={<ProtectedRoute session={session}><BradiarritmiasPage /></ProtectedRoute>} />
                        <Route path="/emergencia/cetoacidose" element={<ProtectedRoute session={session}><CetoacidosePage /></ProtectedRoute>} />
                        <Route path="/emergencia/convulsao" element={<ProtectedRoute session={session}><ConvulsaoPage /></ProtectedRoute>} />
                        <Route path="/emergencia/drogas-vasoativas" element={<ProtectedRoute session={session}><DrogasVasoativasPage /></ProtectedRoute>} />
                        <Route path="/prescricao-livre" element={<ProtectedRoute session={session}><PrescricaoLivre /></ProtectedRoute>} />
                        <Route path="/pediatria" element={<ProtectedRoute session={session}><PediatriaPage /></ProtectedRoute>} />
                        <Route path="/documentos" element={<ProtectedRoute session={session}><DocumentosMedicos /></ProtectedRoute>} />
                        <Route path="/documentos/atestado" element={<ProtectedRoute session={session}><AtestadoMedico /></ProtectedRoute>} />
                        <Route path="/documentos/comparecimento" element={<ProtectedRoute session={session}><DeclaracaoComparecimento /></ProtectedRoute>} />
                        <Route path="/documentos/encaminhamento" element={<ProtectedRoute session={session}><EncaminhamentoMedico /></ProtectedRoute>} />
                        <Route path="/documentos/relatorio" element={<ProtectedRoute session={session}><RelatorioMedico /></ProtectedRoute>} />
                        <Route path="/documentos/exames" element={<ProtectedRoute session={session}><SolicitacaoExames /></ProtectedRoute>} />
                        <Route path="/calculadoras" element={<ProtectedRoute session={session}><Calculadoras /></ProtectedRoute>} />
                        <Route path="/minhas-receitas" element={<ProtectedRoute session={session}><MinhasReceitas /></ProtectedRoute>} />
                        <Route path="/favoritos" element={<ProtectedRoute session={session}><FavoritosPage /></ProtectedRoute>} />
                        <Route path="/tutorial" element={<ProtectedRoute session={session}><TutorialPage /></ProtectedRoute>} />
                        <Route path="/meu-cadastro" element={<ProtectedRoute session={session}><MeuCadastroPage /></ProtectedRoute>} />
                        <Route path="/categoria/:id" element={<ProtectedRoute session={session}><CategoryPage /></ProtectedRoute>} />
                        <Route path="/prescricao/:id" element={<ProtectedRoute session={session}><PrescriptionPage /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute session={session}><Settings profile={profile} onProfileUpdate={() => session && fetchProfile(session.user.id, { current: true })} /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute session={session} requiredRole="admin" profile={profile}><Admin /></ProtectedRoute>} />
                    </Routes>
                </main>
                {session && <Footer />}
                {session && <PrintBar />}
            </div>
            {session && <PrintLayout />}
        </BrowserRouter>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <PrintProvider>
                <AppContent />
            </PrintProvider>
        </ThemeProvider>
    );
};

export default App;
