import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Prescription } from '../types';
import { usePrint } from '../contexts/PrintContext';

// Simple Editor Component that initializes once based on initialHtml
// We use a KEY in the parent to force re-mounting when prescription changes,
// ensuring clean state and avoiding complex update logic.
interface RichTextEditorProps {
    initialHtml: string;
    editorRef: React.RefObject<HTMLDivElement>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
    initialHtml, 
    editorRef 
}) => {
    // We use a ref to ensure we only set innerHTML on mount,
    // protecting against React re-renders wiping content.
    const isInitialized = useRef(false);

    useEffect(() => {
        if (editorRef.current && !isInitialized.current) {
            editorRef.current.innerHTML = initialHtml;
            isInitialized.current = true;
        }
    }, [initialHtml, editorRef]);

    return (
        <div
            ref={editorRef}
            contentEditable
            // Added whitespace-pre-wrap here to respect spaces
            className="w-full p-6 font-mono text-base text-slate-700 dark:text-slate-300 focus:outline-none min-h-[400px] overflow-y-auto whitespace-pre-wrap"
            suppressContentEditableWarning={true}
        />
    );
};

const PrescriptionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToQueue } = usePrint();
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [initialHtml, setInitialHtml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState('');
    
    // Editor ref to access the DOM node directly
    const editorRef = useRef<HTMLDivElement>(null);
    
    // State for Toast/Feedback
    const [addedToQueue, setAddedToQueue] = useState(false);
    const [printTwoCopies, setPrintTwoCopies] = useState(false); // Via Dupla

    const [isFavorite, setIsFavorite] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    const copyToClipboard = useCallback(() => {
        if (!editorRef.current) return;
        
        // Copy innerText for plain text clipboard
        const textToCopy = editorRef.current.innerText;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess('Copiado!');
            setTimeout(() => setCopySuccess(''), 3000);
        }, () => {
            setCopySuccess('Falha ao copiar.');
        });
    }, []);

    useEffect(() => {
        const fetchPrescription = async () => {
            if (!id) return;
            setLoading(true);
            setIsFavorite(false);

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);
            }

            const { data, error } = await supabase
                .from('prescricoes')
                .select(`
                    *,
                    categorias ( nome )
                `)
                .eq('id', id)
                .single();

            if (error) {
                setError('Prescrição não encontrada.');
                console.error(error);
            } else {
                setPrescription(data);
                
                // Convert plain text newlines to HTML breaks for the editor initialization
                // NOTE: With whitespace-pre-wrap, we might not strictly need <br>, but keeping it for compatibility
                // if the source text has explicit newlines.
                const formattedHtml = data.texto ? data.texto : ''; 
                setInitialHtml(formattedHtml);
                
                if (session) {
                    // Use maybeSingle() instead of single() to avoid 406 error when no row is found
                    const { data: favoriteData } = await supabase
                        .from('user_favoritos')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .eq('prescricao_id', data.id)
                        .maybeSingle();
                        
                    if (favoriteData) {
                        setIsFavorite(true);
                    }
                }
            }
            setLoading(false);
        };
        fetchPrescription();
    }, [id]);
    
    const handleToggleFavorite = async () => {
        if (!userId || !prescription) return;
        setIsTogglingFavorite(true);
    
        if (isFavorite) {
            const { error } = await supabase
                .from('user_favoritos')
                .delete()
                .match({ user_id: userId, prescricao_id: prescription.id });
            if (error) {
                alert('Erro ao desfavoritar.');
                console.error(error);
            } else {
                setIsFavorite(false);
            }
        } else {
            const { error } = await supabase
                .from('user_favoritos')
                .insert({ user_id: userId, prescricao_id: prescription.id });
            if (error) {
                alert('Erro ao favoritar.');
                console.error(error);
            } else {
                setIsFavorite(true);
            }
        }
        setIsTogglingFavorite(false);
    };

    const handleAddToQueue = () => {
        if (prescription && editorRef.current) {
            const html = editorRef.current.innerHTML;
            
            addToQueue({
                id: prescription.id + Date.now(), 
                titulo: prescription.titulo,
                texto: html,
                tipo: 'prescricao'
            });

            if (printTwoCopies) {
                // Segunda via (ID distinto para evitar React Key Collision)
                addToQueue({
                    id: prescription.id + Date.now() + '_via2', 
                    titulo: prescription.titulo,
                    texto: html, 
                    tipo: 'prescricao'
                });
            }

            setAddedToQueue(true);
            setTimeout(() => setAddedToQueue(false), 2000);
        }
    };

    const handleFormat = (command: string) => {
        // Prevent default on mouse down ensures focus stays on the editable div
        document.execCommand(command, false);
        
        // Re-focus editor just in case
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    // Helper for toolbar buttons
    const handleGoBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(prescription?.categoria_id ? `/categoria/${prescription.categoria_id}` : '/porta');
        }
    };

    const ToolbarButton = ({ command, icon, title }: { command: string, icon: React.ReactNode, title: string }) => (
        <button 
            type="button"
            onMouseDown={(e) => {
                e.preventDefault(); // Critical: Prevents button from stealing focus
                handleFormat(command);
            }}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
            title={title}
        >
            {icon}
        </button>
    );

    if (error) {
        return (
             <div className="container max-w-4xl mx-auto pb-20">
                <button onClick={handleGoBack} className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-semibold transition-all duration-200 transform bg-white dark:bg-slate-800 border rounded-lg shadow-subtle text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar
                </button>
                <div className="p-4 text-center text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg">{error || 'Prescrição não encontrada.'}</div>
             </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto pb-20">
            <button onClick={handleGoBack} className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-semibold transition-all duration-200 transform bg-white dark:bg-slate-800 border rounded-lg shadow-subtle text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-px active:translate-y-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
            </button>

            {/* Success Toast */}
            {addedToQueue && (
                <div className="fixed top-20 right-5 z-50 animate-bounce">
                    <div className="bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Adicionado à fila de impressão!
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-8 sm:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.10)] relative transition-all">
                {loading ? (
                    <div className="animate-pulse space-y-6">
                         <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
                            <div className="w-full">
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                            </div>
                            <div className="w-32 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                         </div>
                         <div className="flex gap-2 mb-8">
                             <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                             <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                         </div>
                         <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                         <div className="w-full h-64 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
                         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                             <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                             <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                         </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
                            <div>
                                <h1 className="mb-2 text-[26px] sm:text-[32px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">{prescription?.titulo}</h1>
                                <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">Condição: <span className="font-bold text-slate-700 dark:text-slate-300">{prescription?.condicao}</span></p>
                            </div>
                            
                            {userId && (
                                <button
                                    onClick={handleToggleFavorite}
                                    disabled={isTogglingFavorite}
                                    className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 text-[13px] font-extrabold uppercase tracking-wide transition-all rounded-[1rem] shadow-sm transform active:scale-95 border-[1.5px] ${isFavorite ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-400 hover:bg-amber-200' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'}`}
                                >
                                    {isTogglingFavorite ? (
                                        'Processando...'
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFavorite ? "0" : "2"} className="w-5 h-5">
                                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                            </svg>
                                            {isFavorite ? 'Salvo' : 'Favoritar'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        
                        <div className="mb-8 space-x-2">
                            {prescription?.tags.map((tag, index) => (
                                <span key={index} className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-premium-teal-800 bg-premium-teal-100 dark:bg-premium-teal-900/50 dark:text-premium-teal-200">{tag}</span>
                            ))}
                        </div>

                        <label className="block mb-2 text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">Texto da Prescrição (Editável)</label>
                        
                        {/* Rich Text Editor Container */}
                        <div className="mb-8 border-[1.5px] border-slate-200/80 dark:border-slate-700/80 rounded-2xl overflow-hidden bg-[#fdfdfd] dark:bg-slate-950/50 focus-within:ring-4 focus-within:ring-premium-teal/20 focus-within:border-premium-teal transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                            {/* Toolbar */}
                            <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 select-none">
                                <ToolbarButton 
                                    command="bold" 
                                    title="Negrito"
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>}
                                />
                                <ToolbarButton 
                                    command="underline" 
                                    title="Sublinhado"
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>}
                                />
                                
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                                
                                <ToolbarButton 
                                    command="justifyLeft" 
                                    title="Alinhar à Esquerda"
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>}
                                />
                                <ToolbarButton 
                                    command="justifyCenter" 
                                    title="Centralizar"
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>}
                                />
                            </div>
                            
                            {/* Editor Area 
                                Key prop ensures the component is remounted when ID changes,
                                preventing contentEditable state issues while navigating.
                            */}
                            <RichTextEditor 
                                key={prescription?.id || 'new'}
                                editorRef={editorRef} 
                                initialHtml={initialHtml} 
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
                            {/* Print Block */}
                            <div className={`flex flex-col gap-3 w-full ${!userId ? 'sm:col-span-1' : ''}`}>
                                <button
                                    onClick={handleAddToQueue}
                                    className={`flex items-center justify-center w-full px-4 py-4 font-extrabold tracking-wide uppercase text-[14px] text-white transition-all duration-200 rounded-xl shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${addedToQueue ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                                >
                                    {addedToQueue ? (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            {printTwoCopies ? 'Adicionadas 2 Vias' : 'Adicionado'}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                            Adicionar à Impressão
                                        </>
                                    )}
                                </button>
                                
                                <label className="flex items-center justify-center gap-2 text-[13px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={printTwoCopies}
                                        onChange={(e) => setPrintTwoCopies(e.target.checked)}
                                        className="w-[18px] h-[18px] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded focus:ring-slate-800 transition-colors bg-white dark:bg-slate-800 cursor-pointer shadow-sm"
                                    />
                                    Imprimir em 2 vias
                                </label>
                            </div>

                            {/* Copy Block */}
                            <div className={`flex flex-col gap-3 w-full ${!userId ? 'col-span-2 sm:col-span-1' : ''}`}>
                                <button
                                    onClick={copyToClipboard}
                                    className={`flex items-center justify-center w-full px-4 py-4 font-extrabold tracking-wide uppercase text-[14px] text-white transition-all duration-200 rounded-xl shadow-[0_8px_20px_-8px_rgba(20,184,166,0.5)] bg-premium-teal hover:bg-premium-teal/90 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-premium-teal focus:ring-offset-white dark:focus:ring-offset-slate-900 border border-transparent`}
                                >
                                    {copySuccess ? (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                            Copiar Texto
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PrescriptionPage;