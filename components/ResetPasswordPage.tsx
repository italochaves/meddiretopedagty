import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isInvalidLink, setIsInvalidLink] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [passwordLengthValid, setPasswordLengthValid] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const href = window.location.href;
            if (href.includes('error_description') || href.includes('error=')) {
                setError('Este link de redefinição é inválido ou expirou. Solicite um novo e-mail.');
                setIsInvalidLink(true);
                return;
            }

            // Aguarda inicialização do Supabase que lê os tokens da URL
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Se a sessão não estiver pronta imediatamente, tentar mais uma vez após pequeno atraso
                setTimeout(async () => {
                    const { data: { session: retrySession } } = await supabase.auth.getSession();
                    if (!retrySession) {
                        setError('Sessão de recuperação ausente. Este link de redefinição é inválido ou expirou. Solicite um novo e-mail.');
                        setIsInvalidLink(true);
                    }
                }, 1500);
            }
        };
        checkSession();
    }, []);

    const validateForm = () => {
        let valid = true;
        if (password.length > 0 && password.length < 8) {
             setPasswordLengthValid(false);
             valid = false;
        } else {
             setPasswordLengthValid(true);
        }

        if (confirmPassword.length > 0 && password !== confirmPassword) {
             setPasswordsMatch(false);
             valid = false;
        } else {
             setPasswordsMatch(true);
        }
        
        return valid;
    };

    useEffect(() => {
         validateForm();
    }, [password, confirmPassword]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 8) {
            setPasswordLengthValid(false);
            return;
        }
        if (password !== confirmPassword) {
            setPasswordsMatch(false);
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Atualiza a senha do usuário com a API oficial do Supabase
            const { error: updateError } = await supabase.auth.updateUser({ password });
            
            if (updateError) {
                throw updateError;
            }

            setMessage('Senha redefinida com sucesso. Redirecionando para o login...');
            
            // Faz logout para garantir que o usuário precisará usar a nova senha depois
            await supabase.auth.signOut();

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            console.error('Password reset error:', err);
            setError('Não foi possível redefinir a senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617] font-sans p-6 overflow-hidden">
            <div className="w-full max-w-[460px] space-y-10 animate-fade-in bg-white dark:bg-[#020617] p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative">
                
                {/* Efeitos Decorativos */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-premium-teal/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -ml-16 -mb-16"></div>

                <div className="text-center space-y-4 relative z-10">
                    <div className="flex justify-center mb-6">
                        {/* Espaço reservado para a logo.png - Insira o link do GitHub abaixo */}
                        <div className="flex items-center justify-center">
                            {/* <img src="/logo.png" alt="Logo" className="h-10 w-auto" /> */}
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-bold">LOGO</div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Gerar Nova Senha</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                        {isInvalidLink 
                            ? "Não é possível continuar com a redefinição." 
                            : "Defina uma credencial forte e segura para retomar seu acesso."}
                    </p>
                </div>

                {message && (
                    <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-4 animate-fade-in font-semibold">
                         <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                         </div>
                         {message}
                    </div>
                )}
                
                {error && (
                    <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400 text-sm flex items-start gap-4 animate-shake font-semibold">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl mt-0.5">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-red-900 dark:text-red-300">Houve um problema</span>
                            <span className="text-xs opacity-80 font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {!isInvalidLink && !message && (
                    <form className="space-y-7 relative z-10" onSubmit={handleReset}>
                        <div className="space-y-5">
                            <div className="space-y-1.5 group">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Nova Chave de Acesso</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-premium-teal transition-colors">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className={`block w-full pl-12 pr-4 py-4 border ${!passwordLengthValid ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-premium-teal/5 focus:border-premium-teal'} rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 transition-all duration-300 outline-none font-medium text-sm`}
                                        placeholder="Mínimo 8 caracteres"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                {!passwordLengthValid && (
                                    <p className="ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider animate-fade-in">A senha deve ter no mínimo 8 caracteres</p>
                                )}
                            </div>
                            
                            <div className="space-y-1.5 group">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Confirmar Nova Chave</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-premium-teal transition-colors">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className={`block w-full pl-12 pr-4 py-4 border ${!passwordsMatch ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-premium-teal/5 focus:border-premium-teal'} rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 transition-all duration-300 outline-none font-medium text-sm`}
                                        placeholder="Repita sua senha"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                {!passwordsMatch && (
                                    <p className="ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider animate-fade-in">As senhas não coincidem</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isInvalidLink || !passwordLengthValid || !passwordsMatch || !password || !confirmPassword}
                            className="w-full relative group overflow-hidden py-4 px-6 rounded-2xl bg-slate-900 dark:bg-premium-teal text-white font-bold text-base shadow-xl shadow-slate-900/10 dark:shadow-premium-teal/20 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-premium-teal/30 transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
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
                                        Redefinir Senha
                                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                )}

                <div className="text-center relative z-10 pt-4">
                    <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-premium-teal transition-colors duration-300 flex items-center justify-center gap-2 group">
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Voltar para o login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
