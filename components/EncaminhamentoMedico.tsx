import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';

const EncaminhamentoMedico: React.FC = () => {
    const navigate = useNavigate();
    const { addToQueue } = usePrint();
    
    // Form fields
    const [destino, setDestino] = useState('');
    const [motivo, setMotivo] = useState('');
    const [resumo, setResumo] = useState('');
    const [prioridade, setPrioridade] = useState<'Nenhuma' | 'Eletivo' | 'Prioritário' | 'Urgente'>('Nenhuma');
    const [exames, setExames] = useState('');
    const [printTwoCopies, setPrintTwoCopies] = useState(false);
    
    // Feedback
    const [addedToQueue, setAddedToQueue] = useState(false);

    // Text generation logic
    const generateHtml = () => {
        const destTexto = destino.trim() ? `<strong>${destino}</strong>` : '______________________';
        const motivoTexto = motivo.trim() ? `<strong>${motivo}</strong>` : '______________________';
        
        let resumoHtml = '';
        if (resumo.trim()) {
            resumoHtml = `<p style="margin-top: 15px; margin-bottom: 5px;"><strong>Resumo Clínico:</strong></p>
                          <p style="margin-bottom: 15px; margin-top: 0; white-space: pre-wrap;">${resumo}</p>`;
        } else {
            resumoHtml = `<p style="margin-top: 15px; margin-bottom: 5px;"><strong>Resumo Clínico:</strong></p>
                          <p style="margin-bottom: 15px; margin-top: 0;">________________________________________________________<br>________________________________________________________</p>`;
        }

        let examesHtml = '';
        if (exames.trim()) {
            examesHtml = `<p style="margin-top: 15px; margin-bottom: 5px;"><strong>Exames / Informações complementares:</strong></p>
                          <p style="margin-bottom: 15px; margin-top: 0; white-space: pre-wrap;">${exames}</p>`;
        }

        let prioridadeHtml = '';
        if (prioridade !== 'Nenhuma') {
            const fontColor = prioridade === 'Urgente' ? '#b91c1c' : (prioridade === 'Prioritário' ? '#d97706' : '#334155');
            prioridadeHtml = `<p style="margin-top: 25px; margin-bottom: 0px; font-size: 13pt;">
                                <strong>Classificação de Risco / Prioridade:</strong> <span style="color: ${fontColor}; font-weight: bold; text-transform: uppercase;">${prioridade}</span>
                              </p>`;
        }

        return `
            <div style="font-family: 'Roboto', Arial, sans-serif; font-size: 14pt; line-height: 1.6; text-align: justify;">
                <p style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 16pt; text-decoration: underline;">ENCAMINHAMENTO MÉDICO</p>
                <p style="margin-bottom: 20px;">
                    Encaminho o(a) paciente supracitado(a) para avaliação em ${destTexto}, com hipótese/indicação de ${motivoTexto}.
                </p>
                
                ${resumoHtml}
                ${examesHtml}

                <p style="margin-top: 25px; margin-bottom: 10px;">
                    Solicito avaliação e conduta especializada.
                </p>
                
                ${prioridadeHtml}
            </div>
        `;
    };

    const handleAddToQueue = () => {
        const html = generateHtml();
        const docId = 'encaminhamento_' + Date.now();
        
        addToQueue({
            id: docId,
            titulo: 'Encaminhamento Médico',
            texto: html,
            tipo: 'documento'
        });

        if (printTwoCopies) {
            addToQueue({
                id: docId + '_via2',
                titulo: 'Encaminhamento Médico',
                texto: html,
                tipo: 'documento'
            });
        }

        setAddedToQueue(true);
        setTimeout(() => setAddedToQueue(false), 2000);
    };

    return (
        <div className="container mx-auto px-4 max-w-5xl my-8 mb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Encaminhamento Médico</h1>
                    <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-1">Modelo rápido para encaminhar a especialista ou serviço referenciado.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* COMANDOS E INPUTS */}
                <div className="bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-7">
                    
                    {/* DESTINO & MOTIVO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Destino</label>
                            <input 
                                type="text"
                                list="destinos-list"
                                placeholder="Especialidade/Serviço..."
                                value={destino}
                                onChange={(e) => setDestino(e.target.value)}
                                className="w-full h-[60px] pl-5 pr-5 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all placeholder-slate-400"
                            />
                            <datalist id="destinos-list">
                                <option value="Cardiologia" />
                                <option value="Ortopedia" />
                                <option value="Neurologia" />
                                <option value="Gastroenterologia" />
                                <option value="Urologia" />
                                <option value="Ginecologia" />
                                <option value="Cirurgia Geral" />
                                <option value="Pronto-Socorro" />
                                <option value="Fisioterapia" />
                                <option value="Psiquiatria" />
                                <option value="Internação Hospitalar" />
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Hipótese / Motivo</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Dor abdominal a ecd..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                className="w-full h-[60px] px-5 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all placeholder-slate-400"
                            />
                        </div>
                    </div>

                    {/* RESUMO CLÍNICO */}
                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Resumo Clínico</span>
                        </label>
                        <textarea 
                            rows={3}
                            placeholder="Descreva o quadro, história e justificativa do encaminhamento..."
                            value={resumo}
                            onChange={(e) => setResumo(e.target.value)}
                            className="w-full p-4 text-[15px] font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all resize-none placeholder-slate-400"
                        />
                    </div>

                    {/* EXAMES COMPLEMENTARES */}
                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Exames e Info Complementares</span>
                            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tracking-wider">OPCIONAL</span>
                        </label>
                        <textarea 
                            rows={2}
                            placeholder="Ex: ECG anexo demonstra supradesnivelamento..."
                            value={exames}
                            onChange={(e) => setExames(e.target.value)}
                            className="w-full p-4 text-[15px] font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all resize-none placeholder-slate-400"
                        />
                    </div>

                    {/* PRIORIDADE */}
                    <div>
                        <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">Prioridade da Avaliação</label>
                        <div className="flex gap-2">
                             <label className={`flex-1 flex text-xs sm:text-sm items-center justify-center p-3 border rounded-xl cursor-pointer transition-all font-bold ${prioridade === 'Nenhuma' ? 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500'}`}>
                                <input type="radio" className="hidden" checked={prioridade === 'Nenhuma'} onChange={() => setPrioridade('Nenhuma')} />
                                Omitir
                            </label>
                            <label className={`flex-1 flex text-xs sm:text-sm items-center justify-center p-3 border rounded-xl cursor-pointer transition-all font-bold ${prioridade === 'Eletivo' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-400 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500'}`}>
                                <input type="radio" className="hidden" checked={prioridade === 'Eletivo'} onChange={() => setPrioridade('Eletivo')} />
                                Eletivo
                            </label>
                            <label className={`flex-1 flex text-xs sm:text-sm items-center justify-center p-3 border rounded-xl cursor-pointer transition-all font-bold ${prioridade === 'Prioritário' ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-500 dark:text-amber-400 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500'}`}>
                                <input type="radio" className="hidden" checked={prioridade === 'Prioritário'} onChange={() => setPrioridade('Prioritário')} />
                                Prioritário
                            </label>
                            <label className={`flex-1 flex text-xs sm:text-sm items-center justify-center p-3 border rounded-xl cursor-pointer transition-all font-bold ${prioridade === 'Urgente' ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-400 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500'}`}>
                                <input type="radio" className="hidden" checked={prioridade === 'Urgente'} onChange={() => setPrioridade('Urgente')} />
                                Urgente
                            </label>
                        </div>
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
                         E
                     </div>
                     <div className="relative z-10 text-slate-800 dark:text-slate-800" dangerouslySetInnerHTML={{ __html: generateHtml() }} />
                </div>
            </div>
        </div>
    );
};

export default EncaminhamentoMedico;
