import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';

const PrintBar: React.FC = () => {
    const { printQueue, removeFromQueue, patientName, setPatientName, clearQueue, activeLetterhead, isBackgroundLoaded, printFormat, setPrintFormat } = usePrint();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDocsMenuOpen, setIsDocsMenuOpen] = useState(false);
    const [nameError, setNameError] = useState(false);
    
    const docsMenuRef = useRef<HTMLDivElement>(null);

    // Fechar dropdown de documentos ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (docsMenuRef.current && !docsMenuRef.current.contains(event.target as Node)) {
                setIsDocsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (printQueue.length === 0) return null;

    const handlePrint = () => {
        if (!patientName.trim()) {
            setNameError(true);
            setTimeout(() => setNameError(false), 3000);
            return;
        }
        
        if (!activeLetterhead) {
             if(!window.confirm('Você não tem um receituário configurado. A impressão sairá em branco. Deseja continuar?')) {
                 return;
             }
        } else if (!isBackgroundLoaded) {
            alert('Aguarde o carregamento do papel de parede do receituário...');
            return;
        }

        // Verifica overflow antes de imprimir
        if (overflowItems.length > 0) {
            const nomes = overflowItems.map(i => `• ${i.titulo}`).join('\n');
            const continuar = window.confirm(
                `⚠️ Atenção: ${overflowItems.length === 1 ? 'a prescrição abaixo excede' : `as ${overflowItems.length} prescrições abaixo excedem`} o espaço útil do receituário e poderão ser cortadas na impressão:\n\n${nomes}\n\nDeseja imprimir mesmo assim?`
            );
            if (!continuar) return;
        }
        
        setTimeout(() => {
            window.print();
            setIsDrawerOpen(false);
        }, 100);
    };

    const handleClearQueue = () => {
        if (window.confirm("Tem certeza que deseja remover todos os itens adicionados à impressão?")) {
            clearQueue();
            setIsDrawerOpen(false);
        }
    };

    const PRINT_CHAR_LIMIT = 1250; // limite seguro de caracteres por folha

    const extractPlainText = (html: string) =>
        html.replace(/<[^>]*>/gm, ' ').replace(/\s+/g, ' ').trim();

    const extractSnippet = (html: string) => {
        const text = extractPlainText(html);
        return text.length > 80 ? text.substring(0, 80) + '...' : text;
    };

    // Itens da fila que excedem o limite seguro de caracteres
    const overflowItems = printQueue.filter(
        item => extractPlainText(item.texto).length > PRINT_CHAR_LIMIT
    );

    return (
        <>
            {/* Overlay Escurecido Atrás do Drawer */}
            {isDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] print:hidden transition-opacity"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Slide-Up Drawer da Fila */}
            {isDrawerOpen && (
            <div className="fixed bottom-[88px] left-0 right-0 z-[70] print:hidden px-4 md:px-0 animate-fade-in">
                <div className="max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] border-[1.5px] border-slate-200/50 dark:border-slate-800/80 max-h-[70vh] flex flex-col">
                    
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between p-6 px-8 border-b-[1.5px] border-slate-100 dark:border-slate-800/80">
                        <div>
                            <h3 className="text-[20px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">Fila de Impressão</h3>
                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Gerencie a ordem e os itens antes de imprimir.</p>
                        </div>
                        <button 
                            onClick={() => setIsDrawerOpen(false)}
                            className="p-2.5 text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-200/50 dark:border-slate-700/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Drawer Content (List) */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 pb-10">
                        {overflowItems.length > 0 && (
                            <div className="flex items-start gap-3 p-4 mb-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl">
                                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                <div>
                                    <p className="text-[13px] font-extrabold text-amber-800 dark:text-amber-300 mb-0.5">
                                        {overflowItems.length === 1 ? '1 prescrição' : `${overflowItems.length} prescrições`} pode’m ultrapassar o espaço do receituário
                                    </p>
                                    <p className="text-[12px] font-medium text-amber-700 dark:text-amber-400">
                                        Reduza o conteúdo ou será solicitada confirmação ao imprimir.
                                    </p>
                                </div>
                            </div>
                        )}

                        {printQueue.length === 0 ? (
                            <div className="text-center text-slate-500 py-10 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                                Nenhum item na fila no momento.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {printQueue.map((item, index) => (
                                    <div key={item.id} className="group relative flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-premium-teal/30 dark:hover:border-premium-teal/30 transition-all duration-300">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold flex-shrink-0 text-[13px] border border-slate-200 dark:border-slate-700 group-hover:bg-premium-teal/10 group-hover:text-premium-teal group-hover:border-premium-teal/20 transition-colors">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white tracking-tight line-clamp-1">{item.titulo}</h4>
                                                {extractPlainText(item.texto).length > PRINT_CHAR_LIMIT && (
                                                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 rounded-full">
                                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75M12 15.75h.007v.008H12v-.008z" /></svg>
                                                        Longo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                                {extractSnippet(item.texto)}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => removeFromQueue(item.id)}
                                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                                            title="Remover item da fila"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}

            {/* Barra Principal Base Premium */}
            <div className="fixed bottom-4 left-4 right-4 z-[48] print:hidden flex justify-center">
                <div className="bg-white dark:bg-slate-900 border-[2px] border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.3)] ring-4 ring-slate-100 dark:ring-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 p-3 pr-4 max-w-6xl w-full transition-all">
                    {/* Input NOME PACIENTE */}
                    <div className="flex-1 w-full max-w-md relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden pr-2">
                        <div className="flex-shrink-0 w-12 flex items-center justify-center text-slate-400 border-r border-slate-200/60 dark:border-slate-800/60 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${nameError ? 'text-red-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div className="flex-1 relative flex items-center h-[54px]">
                            <input
                                type="text"
                                placeholder={nameError ? '⚠ Digite o nome para imprimir' : 'Nome completo do paciente...'}
                                value={patientName}
                                onChange={(e) => {
                                    setPatientName(e.target.value);
                                    if (e.target.value) setNameError(false);
                                }}
                                className={`w-full h-full bg-transparent border-none focus:ring-0 text-[15px] font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none ${nameError ? 'placeholder-red-400' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Controles da Fila e Imprimir */}
                    <div className="flex items-center justify-between w-full md:w-auto gap-3 md:gap-5">
                        
                        {/* Dropdown de Documentos Rápidos */}
                        <div className="relative" ref={docsMenuRef}>
                            <button 
                                type="button"
                                onClick={() => setIsDocsMenuOpen(!isDocsMenuOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-extrabold text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-[1.1rem] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px] text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Documentos
                                <svg className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isDocsMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            
                            {isDocsMenuOpen && (
                                <div className="absolute bottom-full left-0 mb-3 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-50 py-2 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/50 mb-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acesso Rápido</p>
                                    </div>
                                    <Link to="/documentos/atestado" onClick={() => setIsDocsMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 transition-colors">Atestado Médico</Link>
                                    <Link to="/documentos/comparecimento" onClick={() => setIsDocsMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 transition-colors">Comparecimento</Link>
                                    <Link to="/documentos/encaminhamento" onClick={() => setIsDocsMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 transition-colors">Encaminhamento</Link>
                                    <Link to="/documentos/exames" onClick={() => setIsDocsMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-900/20 transition-colors">Solicitação de Exames</Link>
                                    <Link to="/documentos/relatorio" onClick={() => setIsDocsMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/20 transition-colors">Relatório Médico</Link>
                                </div>
                            )}
                        </div>

                        {/* Espaço Clicável - Fila */}
                        <div className="w-[2px] h-[34px] bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block rounded-full"></div>
                        
                        {/* Controle / Contador Clicável */}
                        <div 
                            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                            className="flex flex-col items-end cursor-pointer group px-3 py-1.5 -mx-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                        >
                            <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-premium-teal transition-colors tracking-tight">
                                Fila atual
                                <svg 
                                    className={`w-4 h-4 text-premium-teal transform transition-transform duration-300 ${isDrawerOpen ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                                </svg>
                            </span>
                            <span className="inline-block px-2.5 py-0.5 mt-0.5 text-[11px] font-black uppercase text-white bg-blue-600 rounded-full shadow-sm tracking-wide">
                                {printQueue.length} {printQueue.length === 1 ? 'item' : 'itens'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                type="button"
                                onClick={handleClearQueue}
                                className="p-2.5 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                                title="Esvaziar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>

                            {/* Formato do Papel (Segmented Control Premium) */}
                            <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 mr-1 shadow-inner opacity-90">
                                <button
                                    onClick={() => setPrintFormat('A4')}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-extrabold rounded-xl transition-all ${printFormat === 'A4' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                    title="A4 Padrão (1 por folha)"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2.5" />
                                    </svg>
                                    <span className="hidden sm:inline">A4 Padrão</span>
                                    <span className="sm:hidden">A4</span>
                                </button>
                                <button
                                    onClick={() => setPrintFormat('A5_DUAL')}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-extrabold rounded-xl transition-all ${printFormat === 'A5_DUAL' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                    title="2x A5 Lado a Lado (2 por folha)"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <rect x="3" y="5" width="8" height="14" rx="1.5" strokeWidth="2.5" />
                                        <rect x="13" y="5" width="8" height="14" rx="1.5" strokeWidth="2.5" />
                                    </svg>
                                    <span className="hidden sm:inline">2x A5 Livre</span>
                                    <span className="sm:hidden">2xA5</span>
                                </button>
                            </div>
                            
                            <button
                                type="button"
                                onClick={handlePrint}
                                disabled={activeLetterhead !== null && !isBackgroundLoaded}
                                className="flex items-center gap-2 px-6 py-4 font-extrabold text-white transition-all bg-premium-teal rounded-2xl hover:bg-premium-teal-700 shadow-[0_8px_20px_rgba(15,118,110,0.25)] hover:shadow-[0_12px_25px_rgba(15,118,110,0.4)] active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[13px]"
                            >
                                {activeLetterhead && !isBackgroundLoaded ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Carregando...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        IMPRIMIR TUDO
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintBar;
