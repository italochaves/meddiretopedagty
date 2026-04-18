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
        <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#020617] font-sans selection:bg-premium-teal/20">
            
            {/* LADO ESQUERDO: Formulário Exclusivo de Login */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 lg:p-12 z-10 bg-white dark:bg-[#020617] border-r border-slate-100 dark:border-slate-800/50">
                <div className="w-full max-w-[380px] space-y-8 animate-fade-in flex flex-col h-full justify-center">
                    
                    {/* Cabeçalho */}
                    <div className="text-center lg:text-left mt-auto pt-8">
                        <div className="flex justify-center lg:justify-start items-center gap-3 mb-6 group cursor-default">
                             {/* Espaço reservado para a logo.png - Insira o link do GitHub abaixo */}
                             <div className="flex items-center justify-center">
                                 {/* <img src="/logo.png" alt="Logo" className="h-9 w-auto" /> */}
                                 <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-bold">LOGO</div>
                             </div>
                             <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                MedDireto
                            </span>
                        </div>
                        
                        <div className="space-y-1.5">
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                                Área do Assinante
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Acesse seu ecossistema de inteligência clínica avançada.
                            </p>
                        </div>
                    </div>

                    {/* Mensagens de Erro */}
                    {error && (
                        <div className="p-3.5 rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400 text-sm flex items-center gap-3 animate-shake">
                            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="font-medium tracking-tight">{error}</span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleLogin}>
                        
                        {/* Email */}
                        <div className="space-y-1.5 group">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-premium-teal transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-4 focus:ring-premium-teal/5 focus:border-premium-teal focus:bg-white dark:focus:bg-slate-900 transition-all duration-300 outline-none font-medium text-sm"
                                    placeholder="nome@medico.com.br"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5 group">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-premium-teal transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-11 py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-4 focus:ring-premium-teal/5 focus:border-premium-teal focus:bg-white dark:focus:bg-slate-900 transition-all duration-300 outline-none font-medium text-sm"
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-premium-teal transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Links Auxiliares */}
                        <div className="flex items-center justify-end pt-1">
                            <Link to="/password-reset" className="text-[13px] font-bold text-slate-500 hover:text-premium-teal transition-colors duration-300">
                                Recuperar Senha
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden py-3.5 px-6 rounded-2xl bg-slate-900 dark:bg-premium-teal text-white font-bold text-sm shadow-xl shadow-slate-900/10 dark:shadow-premium-teal/20 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-premium-teal/30 transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        Entrar na Plataforma
                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                    
                    <div className="mt-auto pt-8 flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest">&copy; 2025 MedDireto</span>
                        <div className="flex items-center gap-1.5 opacity-80">
                             <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                             <span className="text-[10px] font-bold uppercase tracking-wider">Ambiente Seguro</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: Visual / Marketing */}
            <div className="hidden lg:flex w-[55%] bg-[#080C14] relative overflow-hidden items-center justify-center p-12 lg:p-16">
                {/* Efeitos de Fundo Complexos */}
                <div className="absolute inset-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-premium-teal/10 blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080C14]/60 to-[#080C14]"></div>
                </div>
                
                <div className="relative z-10 w-full max-w-[560px] space-y-10">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.15em] text-premium-teal">
                            <span className="w-1.5 h-1.5 rounded-full bg-premium-teal shadow-[0_0_8px_rgba(0,103,214,0.8)]"></span>
                            Apoio clínico em plantão
                        </div>
                        
                        <h1 className="text-[2.75rem] font-black tracking-tight text-white leading-[1.1]">
                            A precisão da medicina,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-premium-teal to-blue-400">na velocidade do plantão.</span>
                        </h1>
                        
                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-lg">
                            Acesso imediato a condutas e prescrições validadas. Decisões mais seguras e ágeis para você e seus pacientes.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/10 transition-all duration-500">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:bg-premium-teal/20 transition-all">
                                <svg className="w-5 h-5 text-premium-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-base font-bold text-white mb-1.5">Prescrição Ágil</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Modelos validados prontos para adequação e uso rápido.</p>
                        </div>
                        
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/10 transition-all duration-500">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-all">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-base font-bold text-white mb-1.5">Acesso Fluido</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Desenvolvido sob medida para a pressão do ambiente médico.</p>
                        </div>
                    </div>

                    <div className="pt-6 flex items-center gap-4 border-t border-white/5">
                        <div className="flex items-center -space-x-2">
                             <div className="w-8 h-8 rounded-full border border-[#080C14] bg-slate-800 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                             </div>
                             <div className="w-8 h-8 rounded-full border border-[#080C14] bg-slate-700 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                             </div>
                             <div className="w-8 h-8 rounded-full border border-[#080C14] bg-premium-teal/20 flex items-center justify-center backdrop-blur-md">
                                  <span className="text-[10px] font-bold text-premium-teal">+</span>
                             </div>
                        </div>
                        <p className="text-xs font-medium text-slate-400">
                            Mais de <span className="text-white font-bold">2.500 médicos</span> no plantão hoje
                        </p>
                    </div>
                </div>

                {/* Elemento Decorativo: O "M" estilizado ou formas limpas abstratas */}
                <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-tr from-premium-teal/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>
            </div>

        </div>
    );
};

export default AuthPage;