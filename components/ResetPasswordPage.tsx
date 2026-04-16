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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 font-sans p-4">
            <div className="w-full max-w-md p-8 md:p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <img 
                            src="/logo.png" 
                            alt="MedDireto Logo" 
                            className="h-10 w-auto" 
                        />
                        <span className="text-2xl font-extrabold tracking-tight text-brand-gray dark:text-white relative top-[1px]">
                            MedDireto
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Redefinir senha</h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {isInvalidLink 
                            ? "Não é possível continuar com a redefinição." 
                            : "Digite sua nova senha para acessar sua conta novamente."}
                    </p>
                </div>

                {message && (
                    <div className="mb-6 p-4 text-sm text-center text-green-800 bg-green-50 border border-green-200 rounded-xl dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 animate-fade-in">
                        <div className="flex items-center justify-center gap-2">
                             <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             {message}
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="mb-6 p-4 text-sm text-center text-red-800 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 animate-fade-in">
                        <div className="flex items-center justify-center flex-col gap-2">
                            <div className="flex items-center gap-2 font-medium">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Houve um problema
                            </div>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {!isInvalidLink && !message && (
                    <form className="space-y-6" onSubmit={handleReset}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nova senha</label>
                            <input
                                type="password"
                                required
                                className={`block w-full px-4 py-3 border ${!passwordLengthValid ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-premium-teal focus:border-premium-teal'} rounded-xl bg-white dark:bg-slate-800 focus:ring-2 transition-colors focus:outline-none`}
                                placeholder="Digite sua nova senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            {!passwordLengthValid && (
                                <p className="mt-1 text-xs text-red-500">A senha deve ter no mínimo 8 caracteres.</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar nova senha</label>
                            <input
                                type="password"
                                required
                                className={`block w-full px-4 py-3 border ${!passwordsMatch ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-premium-teal focus:border-premium-teal'} rounded-xl bg-white dark:bg-slate-800 focus:ring-2 transition-colors focus:outline-none`}
                                placeholder="Confirme sua nova senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                            {!passwordsMatch && (
                                <p className="mt-1 text-xs text-red-500">As senhas não coincidem.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isInvalidLink || !passwordLengthValid || !passwordsMatch || !password || !confirmPassword}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-premium-teal hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-teal disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processando...
                                </span>
                            ) : 'Redefinir senha'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-medium text-premium-teal hover:text-teal-700 transition-colors">
                        Voltar para o login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
