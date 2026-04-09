
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

const Icons = {
    User: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    CreditCard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
    ),
    Lock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    )
};

const MeuCadastroPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Password Form State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passLoading, setPassLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                setEmail(user.email || '');
                
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (!error && profileData) {
                    setProfile(profileData);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!currentPassword) {
            setMessage({ type: 'error', text: 'Por favor, digite sua senha atual.' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
            return;
        }

        setPassLoading(true);

        try {
            // 1. Re-authenticate to verify current password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: currentPassword
            });

            if (signInError) {
                throw new Error('A senha atual está incorreta.');
            }

            // 2. Update to new password
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

            if (updateError) {
                throw new Error('Erro ao atualizar: ' + updateError.message);
            }

            // Success
            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setPassLoading(false);
        }
    };

    // Subscription Status Logic
    const getSubscriptionStatus = () => {
        if (!profile?.expires_at) return { status: 'inactive', label: 'INATIVO', color: 'red' };
        
        const expireDate = new Date(profile.expires_at);
        const now = new Date();
        
        if (expireDate > now) {
            return { 
                status: 'active', 
                label: 'ATIVO', 
                color: 'green',
                formattedDate: new Intl.DateTimeFormat('pt-BR').format(expireDate)
            };
        } else {
            return { 
                status: 'expired', 
                label: 'EXPIRADO', 
                color: 'red',
                formattedDate: new Intl.DateTimeFormat('pt-BR').format(expireDate)
            };
        }
    };

    const subStatus = getSubscriptionStatus();

    if (loading) {
        return (
            <div className="container mx-auto max-w-4xl p-6 space-y-6">
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl pb-20">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">Meu Cadastro</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* BLOCO A: DADOS PESSOAIS */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Icons.User />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Dados Pessoais</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail (Login)</label>
                            <input 
                                type="text" 
                                value={email} 
                                disabled
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Profissão</label>
                            <input 
                                type="text" 
                                value={profile?.profissao || 'Não informado'} 
                                disabled
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* BLOCO B: STATUS DA ASSINATURA */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div className={`p-2 rounded-lg ${subStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                            <Icons.CreditCard />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Assinatura</h2>
                    </div>

                    <div className="text-center py-4">
                        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-3 ${
                            subStatus.color === 'green' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                            {subStatus.label}
                        </div>
                        
                        {profile?.expires_at ? (
                            <p className="text-slate-600 dark:text-slate-300">
                                {subStatus.status === 'active' ? 'Válido até' : 'Expirou em'}: <br/>
                                <span className="text-2xl font-mono font-bold text-slate-800 dark:text-white">
                                    {subStatus.formattedDate}
                                </span>
                            </p>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Nenhuma assinatura ativa encontrada.
                            </p>
                        )}
                    </div>
                </div>

                {/* BLOCO C: SEGURANÇA */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                            <Icons.Lock />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Segurança</h2>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Atual</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none dark:bg-slate-700 dark:text-white transition-all"
                                placeholder="Digite sua senha atual"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nova Senha</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none dark:bg-slate-700 dark:text-white transition-all"
                                placeholder="******"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmar Senha</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none dark:bg-slate-700 dark:text-white transition-all"
                                placeholder="******"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                                message.type === 'success' 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {message.type === 'success' && <Icons.Check />}
                                {message.text}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={passLoading || !newPassword || !currentPassword}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {passLoading ? 'Atualizando...' : 'Alterar Senha'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default MeuCadastroPage;
