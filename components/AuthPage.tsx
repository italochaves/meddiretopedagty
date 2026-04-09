import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Link, useLocation } from 'react-router-dom';
import { getDeviceType } from '../deviceDetector'; // <--- IMPORTANTE: Importando a função nova

const AuthPage: React.FC = () => {
    const location = useLocation();
    
    // Form State (Apenas Login)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Captura erros de URL (ex: link de senha expirado)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const errorDesc = params.get('error_description');
        if (errorDesc) {
            setError(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
        }
    }, [location]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Tenta fazer o login
            const { data, error } = await supabase.auth.signInWithPassword({ 
                email, 
                password 
            });

            if (error) throw error;

            // --- INÍCIO DA NOVA CONFIGURAÇÃO (1 PC + 1 CELULAR) ---
            if (data.user) {
                // A. Identifica o dispositivo e gera ID
                const deviceType = getDeviceType(); // 'mobile' ou 'desktop'
                const newSessionId = crypto.randomUUID(); // Gera um ID único profissional

                // B. Salva no navegador (Crachá Local)
                localStorage.setItem('meddireto_session_id', newSessionId);
                localStorage.setItem('meddireto_device_type', deviceType);

                // C. Busca sessões ativas no banco para não apagar a do outro dispositivo
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('allowed_sessions')
                    .eq('id', data.user.id)
                    .single();

                // D. Atualiza SÓ a vaga do meu tipo (preserva a outra)
                const currentSessions = profile?.allowed_sessions || {};
                
                const updatedSessions = {
                    ...currentSessions,       // Mantém o que já existia (ex: mantém o mobile se eu sou desktop)
                    [deviceType]: newSessionId // Sobrescreve SÓ a minha categoria
                };

                // E. Salva a nova lista no banco
                await supabase
                    .from('profiles')
                    .update({ allowed_sessions: updatedSessions })
                    .eq('id', data.user.id);
            }
            // --- FIM DA CONFIGURAÇÃO ---
            
            // O redirecionamento é automático pelo App.tsx ouvindo a sessão
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' 
                ? 'E-mail ou senha incorretos.' 
                : 'Erro ao fazer login. Verifique seus dados.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-900 font-sans">
            
            {/* LADO ESQUERDO: Formulário Exclusivo de Login */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    
                    {/* Cabeçalho */}
                    <div className="text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start items-center gap-3 mb-4">
                             <img 
                                src="/logo.png" 
                                alt="MedDireto Logo" 
                                className="h-10 w-auto" 
                             />
                             <span className="text-2xl font-extrabold tracking-tight text-brand-gray dark:text-white relative top-[1px]">
                                MedDireto
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-4">
                            Área do Assinante
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Acesse sua central de inteligência clínica.
                        </p>
                    </div>

                    {/* Mensagens de Erro */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2 animate-fade-in">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleLogin}>
                        
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-premium-teal focus:border-premium-teal transition-colors"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-premium-teal focus:border-premium-teal transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Links Auxiliares */}
                        <div className="flex items-center justify-end text-sm">
                            <Link to="/password-reset" className="font-medium text-premium-teal hover:text-teal-700 transition-colors">
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-premium-teal hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-teal disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Entrar na Plataforma'}
                        </button>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
                        &copy; 2025 MedDireto. Acesso restrito a assinantes.
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: Visual / Marketing */}
            <div className="hidden lg:flex w-1/2 bg-[#0A1929] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#003366] opacity-90"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-premium-teal/20 blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[100px]"></div>

                <div className="relative z-10 px-16 max-w-2xl text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Atualizado em tempo real
                    </div>
                    
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                        Domine o caos do plantão com <span className="text-transparent bg-clip-text bg-gradient-to-r from-premium-teal to-blue-400">segurança absoluta</span>.
                    </h1>
                    
                    <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                        Esqueça os PDFs desatualizados. Tenha uma central de inteligência clínica validada para adultos: do diagnóstico à prescrição impressa em segundos.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <svg className="w-6 h-6 text-premium-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-sm font-medium">Prescrições Prontas</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <svg className="w-6 h-6 text-premium-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <span className="text-sm font-medium">Rápido e sem instalar</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AuthPage;