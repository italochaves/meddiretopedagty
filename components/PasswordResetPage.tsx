
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
            redirectTo: window.location.origin + '/#/reset-password', 
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Se um usuário com este e-mail existir, um link para redefinir a senha foi enviado.');
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 -m-10">
            <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-premium-teal">Redefinir Senha</h1>
                    <p className="mt-2 text-slate-600">Digite seu e-mail para receber o link de redefinição.</p>
                </div>

                {message && <div className="p-3 text-sm text-center text-green-800 bg-green-100 rounded-lg">{message}</div>}
                {error && <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg">{error}</div>}

                <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="relative block w-full px-4 py-3 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-premium-teal focus:border-premium-teal focus:z-10 sm:text-sm"
                            placeholder="Seu endereço de e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white border border-transparent rounded-lg group bg-premium-teal hover:bg-premium-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-teal disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </button>
                    </div>
                </form>
                 <div className="text-sm text-center">
                    <Link to="/login" className="font-medium text-premium-teal hover:text-premium-teal/80">
                        Voltar para o Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetPage;
