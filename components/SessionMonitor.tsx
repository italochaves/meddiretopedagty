import React, { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase'; 
import { useNavigate } from 'react-router-dom';

// INTERVALO FINAL: 1 Minuto (60.000 ms)
// Ideal para economizar bateria e manter a segurança.
const SESSION_CHECK_INTERVAL = 60 * 1000;

const SessionMonitor: React.FC = () => {
    const isCheckingRef = useRef(false);

    const handleLogout = useCallback(async (msg: string) => {
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = '/'; 
        
        // Delay para garantir que o redirect aconteça antes do alert
        setTimeout(() => {
            alert(msg);
        }, 500);
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            // Se o app estiver minimizado/aba oculta, não gasta processamento
            if (document.hidden) return;
            
            if (isCheckingRef.current) return;
            
            // 1. Pega os dados locais
            const localSessionId = localStorage.getItem('meddireto_session_id');
            const deviceType = localStorage.getItem('meddireto_device_type');

            if (!localSessionId || !deviceType) return;

            isCheckingRef.current = true;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return; 

                // 2. Busca a sessão oficial no banco
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('allowed_sessions')
                    .eq('id', user.id)
                    .single();

                if (error || !profile) return;

                const sessions = profile.allowed_sessions || {};
                
                // 3. Verifica APENAS a vaga do meu tipo (Mobile ou Desktop)
                const serverSessionId = sessions[deviceType];

                // Se existe uma sessão ativa no servidor para este tipo, e não é a minha...
                if (serverSessionId && serverSessionId !== localSessionId) {
                    await handleLogout('Sua conta foi conectada em outro dispositivo deste mesmo tipo.');
                }

            } catch (err) {
                console.error("Erro silencioso no monitor:", err);
            } finally {
                isCheckingRef.current = false;
            }
        };

        // Roda a verificação inicial
        checkSession();

        // Agenda as próximas
        const intervalId = setInterval(checkSession, SESSION_CHECK_INTERVAL);

        return () => clearInterval(intervalId);
    }, [handleLogout]);

    return null;
};

export default SessionMonitor;