import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';

const DeclaracaoComparecimento: React.FC = () => {
    const navigate = useNavigate();
    const { addToQueue } = usePrint();
    
    // Form fields
    const [tipo, setTipo] = useState<'Paciente' | 'Acompanhante'>('Paciente');
    const [nomeAcompanhante, setNomeAcompanhante] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFim, setHoraFim] = useState('');
    const [observacao, setObservacao] = useState('');
    const [printTwoCopies, setPrintTwoCopies] = useState(false);
    
    // Feedback
    const [addedToQueue, setAddedToQueue] = useState(false);

    // Text generation logic
    const generateHtml = () => {
        let textoPrincipal = '';
        
        if (tipo === 'Paciente') {
            textoPrincipal = `Declaro, para os devidos fins, que o(a) paciente supracitado(a) compareceu a atendimento médico nesta data`;
        } else {
            const nomeAcompText = nomeAcompanhante.trim() ? `<strong>${nomeAcompanhante}</strong>` : '______________________';
            textoPrincipal = `Declaro, para os devidos fins, que ${nomeAcompText}, na condição de acompanhante do(a) paciente supracitado(a), compareceu a este atendimento nesta data`;
        }

        let periodoText = '.';
        if (horaInicio || horaFim) {
            const hi = horaInicio || '___:___';
            const hf = horaFim || '___:___';
            periodoText = `, no período de ${hi} às ${hf}.`;
        }

        let obsText = '';
        if (observacao.trim()) {
            obsText = `<p style="margin-top: 20px; font-size: 13pt;"><strong>Observação:</strong> ${observacao}</p>`;
        }

        return `
            <div style="font-family: 'Roboto', Arial, sans-serif; font-size: 14pt; line-height: 1.6; text-align: justify;">
                <p style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 16pt; text-decoration: underline;">DECLARAÇÃO DE COMPARECIMENTO</p>
                <p style="margin-bottom: 20px;">
                    ${textoPrincipal}${periodoText}
                </p>
                ${obsText}
            </div>
        `;
    };

    const handleAddToQueue = () => {
        const html = generateHtml();
        const docId = 'comparecimento_' + Date.now();
        
        addToQueue({
            id: docId,
            titulo: 'Declaração de Comparecimento',
            texto: html,
            tipo: 'documento'
        });

        if (printTwoCopies) {
            addToQueue({
                id: docId + '_via2',
                titulo: 'Declaração de Comparecimento',
                texto: html,
                tipo: 'documento'
            });
        }

        setAddedToQueue(true);
        setTimeout(() => setAddedToQueue(false), 2000);
    };

    return (
        <div className="container mx-auto px-4 max-w-4xl my-8 mb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Declaração de Comparecimento</h1>
                    <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-1">Comprove a presença do paciente ou do acompanhante no atendimento.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* COMANDOS E INPUTS */}
                <div className="bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-7">
                    
                    {/* TIPO */}
                    <div>
                        <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">Tipo de Declaração</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all font-bold ${tipo === 'Paciente' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-400 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>
                                <input type="radio" className="hidden" name="tipo_decl" checked={tipo === 'Paciente'} onChange={() => setTipo('Paciente')} />
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                Paciente
                            </label>
                            <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all font-bold ${tipo === 'Acompanhante' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-400 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>
                                <input type="radio" className="hidden" name="tipo_decl" checked={tipo === 'Acompanhante'} onChange={() => setTipo('Acompanhante')} />
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                Acompanhante
                            </label>
                        </div>
                    </div>

                    {/* NOME DO ACOMPANHANTE */}
                    {tipo === 'Acompanhante' && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Nome do Acompanhante</label>
                            <input 
                                type="text" 
                                placeholder="Digite o nome completo"
                                value={nomeAcompanhante}
                                onChange={(e) => setNomeAcompanhante(e.target.value)}
                                className="w-full h-[60px] px-5 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all placeholder-slate-400"
                            />
                        </div>
                    )}

                    {/* HORÁRIOS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                                <span>Hora Inicial</span>
                                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tracking-wider">OPCIONAL</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                </div>
                                <input 
                                    type="time" 
                                    value={horaInicio}
                                    onChange={(e) => setHoraInicio(e.target.value)}
                                    className="w-full h-[60px] pl-[52px] pr-5 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                                <span>Hora Final</span>
                                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tracking-wider">OPCIONAL</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                </div>
                                <input 
                                    type="time" 
                                    value={horaFim}
                                    onChange={(e) => setHoraFim(e.target.value)}
                                    className="w-full h-[60px] pl-[52px] pr-5 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* OBSERVAÇÃO */}
                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Observação Complementar</span>
                            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tracking-wider">OPCIONAL</span>
                        </label>
                        <textarea 
                            rows={2}
                            placeholder="Ex: Liberado para retorno às atividades laborais após o exame..."
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                            className="w-full p-4 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all placeholder-slate-400 resize-none"
                        />
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 relative z-0">
                        {/* Print Block */}
                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={handleAddToQueue}
                                className={`flex items-center justify-center w-full px-4 py-4 font-extrabold tracking-wide text-white transition-all duration-200 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${addedToQueue ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                            >
                                {addedToQueue ? (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                        {printTwoCopies ? 'ADICIONADAS 2 VIAS' : 'ADICIONADO!'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                        ENVIAR PARA IMPRESSÃO
                                    </>
                                )}
                            </button>
                            
                            <label className="flex items-center justify-center gap-2 text-[14px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={printTwoCopies}
                                    onChange={(e) => setPrintTwoCopies(e.target.checked)}
                                    className="w-4 h-4 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded focus:ring-slate-800 transition-colors bg-white dark:bg-slate-800 cursor-pointer"
                                />
                                Imprimir em 2 vias
                            </label>
                        </div>
                    </div>
                </div>

                {/* PREVIEW DO DOCUMENTO */}
                <div className="bg-white dark:bg-slate-50 border border-slate-200 dark:border-slate-300 rounded-[2px] p-10 lg:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden min-h-[500px]">
                     {/* Watermark/Texture */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[220px] text-slate-50 dark:text-slate-200/50 font-serif font-black select-none pointer-events-none z-0">
                         D
                     </div>
                     <div className="relative z-10 text-slate-800 dark:text-slate-800" dangerouslySetInnerHTML={{ __html: generateHtml() }} />
                </div>
            </div>
        </div>
    );
};

export default DeclaracaoComparecimento;
