
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';

const PasswordResetPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://med-direto.vercel.app/reset-password', 
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Se um usuário com este e-mail existir, um link para redefinir a senha foi enviado.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617] font-sans p-6">
            <div className="w-full max-w-[420px] space-y-10 animate-fade-in bg-white dark:bg-[#020617] p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                {/* Efeito Decorativo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-premium-teal/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="text-center space-y-4 relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center justify-center">
                            <img src="/logo.png" alt="MedDireto Logo" className="h-10 w-auto" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Redefinir Senha</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                        Esqueceu sua chave de acesso? Digite seu e-mail para receber o link de recuperação.
                    </p>
                </div>

                {message && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-3 animate-fade-in font-medium">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {message}
                    </div>
                )}
                
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400 text-sm flex items-center gap-3 animate-shake font-medium">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                <form className="space-y-6 relative z-10" onSubmit={handlePasswordReset}>
                    <div className="space-y-1.5 group">
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">E-mail de Cadastro</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-premium-teal transition-colors">
                                <svg className="h-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-4 focus:ring-premium-teal/5 focus:border-premium-teal focus:bg-white dark:focus:bg-slate-900 transition-all duration-300 outline-none font-medium text-sm"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
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
                                    Enviar Link de Recuperação
                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </>
                            )}
                        </span>
                    </button>
                </form>

                 <div className="text-center relative z-10">
                    <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-premium-teal transition-colors duration-300 flex items-center justify-center gap-2 group">
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Voltar para o Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetPage;
