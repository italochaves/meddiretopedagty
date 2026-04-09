
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { PrintItem, Letterhead } from '../types';
import { supabase } from '../services/supabase';

interface PrintContextType {
    printQueue: PrintItem[];
    patientName: string;
    activeLetterhead: Letterhead | null;
    isBackgroundLoaded: boolean; // New state
    addToQueue: (item: PrintItem) => void;
    removeFromQueue: (id: string) => void;
    clearQueue: () => void;
    setPatientName: (name: string) => void;
    setIsBackgroundLoaded: (loaded: boolean) => void; // New setter
    refreshLetterhead: () => Promise<void>;
}

const PrintContext = createContext<PrintContextType | undefined>(undefined);

export const PrintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [printQueue, setPrintQueue] = useState<PrintItem[]>([]);
    const [patientName, setPatientName] = useState('');
    const [activeLetterhead, setActiveLetterhead] = useState<Letterhead | null>(null);
    const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(true); // Default true if no letterhead

    const fetchActiveLetterhead = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Reset loading state when fetching new letterhead
        setIsBackgroundLoaded(false); 

        const { data, error } = await supabase
            .from('user_letterheads')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('active', true)
            .maybeSingle();
        
        if (!error && data) {
            setActiveLetterhead(data);
            // We set false here, PrintLayout will set true on onLoad
            setIsBackgroundLoaded(false); 
        } else {
            setActiveLetterhead(null);
            // If no letterhead, we are "loaded" (nothing to wait for)
            setIsBackgroundLoaded(true); 
        }
    }, []);

    // Initial fetch when the provider mounts
    useEffect(() => {
        fetchActiveLetterhead();
    }, [fetchActiveLetterhead]);

    const addToQueue = useCallback((item: PrintItem) => {
        setPrintQueue(prev => {
            return [...prev, item];
        });
    }, []);

    const removeFromQueue = useCallback((id: string) => {
        setPrintQueue(prev => prev.filter(item => item.id !== id));
    }, []);

    const clearQueue = useCallback(() => {
        setPrintQueue([]);
        setPatientName('');
    }, []);

    return (
        <PrintContext.Provider value={{
            printQueue,
            patientName,
            activeLetterhead,
            isBackgroundLoaded,
            addToQueue,
            removeFromQueue,
            clearQueue,
            setPatientName,
            setIsBackgroundLoaded,
            refreshLetterhead: fetchActiveLetterhead
        }}>
            {children}
        </PrintContext.Provider>
    );
};

export const usePrint = () => {
    const context = useContext(PrintContext);
    if (context === undefined) {
        throw new Error('usePrint must be used within a PrintProvider');
    }
    return context;
};
