
import React from 'react';
import { usePrint } from '../contexts/PrintContext';

const PrintBar: React.FC = () => {
    const { printQueue, patientName, setPatientName, clearQueue, activeLetterhead, isBackgroundLoaded } = usePrint();

    if (printQueue.length === 0) return null;

    const handlePrint = () => {
        if (!patientName.trim()) {
            alert('Por favor, digite o nome do paciente antes de imprimir.');
            return;
        }
        
        if (!activeLetterhead) {
             if(!confirm('Você não tem um receituário configurado. A impressão sairá em branco. Deseja continuar?')) {
                 return;
             }
        } else if (!isBackgroundLoaded) {
            // Se tem receituário mas ainda não carregou, exibe alerta.
            // O CSS novo no App.tsx deve fazer carregar rápido, mas em redes lentas pode demorar.
            alert('Aguarde o carregamento do papel de parede do receituário...');
            return;
        }
        
        // Small delay to ensure state updates before print dialog
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] bg-white border-slate-200 print:hidden rounded-t-3xl">
            <div className="container flex flex-col items-center justify-between gap-4 mx-auto md:flex-row">
                <div className="flex-1 w-full max-w-xl">
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Nome do Paciente</label>
                    <input
                        type="text"
                        placeholder="Insira o nome do paciente"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-premium-teal focus:ring-2 focus:ring-premium-teal/20 placeholder-slate-400 transition-all"
                    />
                </div>

                <div className="flex items-center gap-6">
                     <div className="text-right">
                        <span className="block text-sm font-bold text-slate-800">Fila de Impressão</span>
                        <span className="block text-sm font-medium text-blue-600">{printQueue.length} itens na fila</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={clearQueue}
                            className="p-3 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Limpar Fila"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        
                        <button
                            type="button"
                            onClick={handlePrint}
                            disabled={!patientName.trim() || (activeLetterhead !== null && !isBackgroundLoaded)}
                            className="flex items-center gap-2 px-6 py-3 font-bold text-white transition-all bg-premium-teal rounded-lg hover:bg-premium-teal-600 shadow-lg hover:shadow-premium-teal/30 active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
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
    );
};

export default PrintBar;
