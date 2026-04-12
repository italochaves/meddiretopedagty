
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const FirstAccessModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estado para controlar a conclusão do fluxo
    const [isFinalized, setIsFinalized] = useState(false);

    // Form States
    const [profissao, setProfissao] = useState('');
    const [sexo, setSexo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const checkProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('profissao, sexo')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.error("Error checking profile:", error);
                return;
            }

            if (!profile || !profile.profissao || !profile.sexo) {
                setIsOpen(true);
            }
        };

        checkProfile();
    }, []);

    // --- LISTENER DE EVENTOS ---
    useEffect(() => {
        if (!isOpen || step !== 2) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY') {
                setLoading(false);
                setIsFinalized(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [isOpen, step]);

    // Ação de Fechar e Entrar
    const handleComplete = () => {
        setIsOpen(false);
        window.location.hash = '/tutorial';
    };

    // ETAPA 1: Salvar Perfil
    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!profissao || !sexo) {
            setError('Por favor, preencha todos os campos.');
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não identificado.");

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    profissao: profissao,
                    sexo: sexo
                }, { onConflict: 'id' });

            if (profileError) throw profileError;

            setStep(2);
            setError(''); 

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao salvar perfil.');
        } finally {
            setLoading(false);
        }
    };

    // ETAPA 2: Atualizar Senha
    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!password || !confirmPassword) {
            setError('Defina sua nova senha.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            const { error: authError } = await supabase.auth.updateUser({
                password: password
            });

            if (authError) throw authError;

            setIsFinalized(true);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao atualizar senha.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative">
                
                {/* Header (Só mostra se não finalizado) */}
                {!isFinalized && (
                    <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
                        <h2 className="text-2xl font-extrabold text-slate-800">Bem-vindo!</h2>
                        <p className="text-sm text-slate-500 mt-2">
                            {step === 1 ? 'Primeiro, complete seus dados profissionais.' : 'Agora, defina uma senha segura.'}
                        </p>
                        
                        <div className="flex justify-center gap-2 mt-4">
                            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 1 ? 'bg-blue-600' : 'bg-green-500'}`}></div>
                            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-3 text-sm rounded-lg border font-medium flex items-center gap-2 bg-red-50 text-red-700 border-red-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}

                {/* STEP 1 FORM */}
                {step === 1 && (
                    <form onSubmit={handleStep1} className="p-6 space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Profissão</label>
                                <select
                                    value={profissao}
                                    onChange={(e) => setProfissao(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="" disabled>Selecione...</option>
                                    <option value="Médico">Médico</option>
                                    <option value="Estudante">Estudante</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Sexo</label>
                                <select
                                    value={sexo}
                                    onChange={(e) => setSexo(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="" disabled>Selecione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Salvando...' : 'Continuar →'}
                        </button>
                    </form>
                )}

                {/* STEP 2 FORM */}
                {step === 2 && !isFinalized && (
                    <form onSubmit={handleStep2} className="p-6 space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nova Senha</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Senha</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repita a senha"
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Salvando...' : 'Salvar e Acessar'}
                        </button>
                    </form>
                )}

                {/* SUCESSO FINAL - MENSAGEM CHAMATIVA */}
                {isFinalized && (
                    <div className="p-10 text-center flex flex-col items-center justify-center animate-fade-in">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-md">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Tudo Pronto!</h2>
                        <p className="text-slate-600 mb-8 text-lg">
                            Seu cadastro foi finalizado com sucesso.
                        </p>
                        
                        <button
                            onClick={handleComplete}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xl shadow-green-500/30 transition-all transform hover:-translate-y-1 active:scale-95 text-lg flex items-center justify-center gap-2"
                        >
                            <span>Entrar no MedDireto</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FirstAccessModal;
