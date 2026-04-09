
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        
        const handleAuth = async () => {
            console.log("AuthCallback: Iniciando processamento...");

            // 1. Verificar se o Supabase já detectou a sessão automaticamente
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session && mounted) {
                console.log("AuthCallback: Sessão detectada automaticamente. Redirecionando.");
                navigate('/dashboard', { replace: true });
                return;
            }

            // 2. Lógica Manual para HashRouter (Double Hash Issue)
            // Se a URL for .../#/auth/callback#access_token=..., o Supabase pode não ler corretamente.
            // Vamos ler a URL completa e extrair os tokens.
            const currentUrl = window.location.href;
            
            // Regex para buscar tokens em qualquer lugar da string (mesmo após o segundo #)
            const accessTokenMatch = currentUrl.match(/access_token=([^&]+)/);
            const refreshTokenMatch = currentUrl.match(/refresh_token=([^&]+)/);

            if (accessTokenMatch && refreshTokenMatch) {
                const access_token = accessTokenMatch[1];
                const refresh_token = refreshTokenMatch[1];

                console.log("AuthCallback: Tokens encontrados manualmente na URL. Tentando definir sessão...");

                const { data, error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });

                if (!error && data.session && mounted) {
                    console.log("AuthCallback: Sessão definida manualmente com sucesso.");
                    navigate('/dashboard', { replace: true });
                    return;
                } else if (error) {
                    console.error("AuthCallback: Falha ao definir sessão manualmente:", error);
                }
            } else {
                console.log("AuthCallback: Nenhum token encontrado na URL.");
            }
        };

        handleAuth();

        // 3. Listener de segurança para eventos assíncronos
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && mounted) {
                console.log(`AuthCallback: Evento ${event} recebido. Redirecionando.`);
                navigate('/dashboard', { replace: true });
            }
        });

        // 4. Timeout de Segurança (Fallback)
        // Se após 3 segundos nada acontecer, manda pro login para não travar a tela.
        const timeoutId = setTimeout(() => {
            if (mounted) {
                console.warn("AuthCallback: Timeout atingido. Redirecionando para login.");
                navigate('/login', { replace: true });
            }
        }, 3000);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center">
                <div className="w-16 h-16 mb-4 border-4 border-dashed rounded-full animate-spin border-premium-teal border-t-transparent mx-auto"></div>
                <h2 className="text-xl font-bold text-slate-700">Verificando sua conta...</h2>
                <p className="text-slate-500 text-sm mt-2">Estamos validando seu acesso. <br/>Se demorar, você será redirecionado automaticamente.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
