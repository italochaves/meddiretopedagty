import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';

const RelatorioMedico: React.FC = () => {
    const navigate = useNavigate();
    const { addToQueue } = usePrint();
    
    // Form fields
    const [finalidade, setFinalidade] = useState('');
    const [diagnostico, setDiagnostico] = useState('');
    const [historia, setHistoria] = useState('');
    const [exameFisico, setExameFisico] = useState('');
    const [examesComplementares, setExamesComplementares] = useState('');
    const [conduta, setConduta] = useState('');
    const [conclusao, setConclusao] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [printTwoCopies, setPrintTwoCopies] = useState(false);
    
    // Feedback
    const [addedToQueue, setAddedToQueue] = useState(false);

    // Text generation logic
    const generateHtml = () => {
        const buildBlock = (title: string, content: string) => {
            if (!content.trim()) return '';
            return `<p style="margin-top: 15px; margin-bottom: 5px;"><strong>${title}:</strong></p>
                    <p style="margin-bottom: 15px; margin-top: 0; white-space: pre-wrap;">${content}</p>`;
        };

        const finalidadeStr = finalidade.trim() ? finalidade : '______________________';

        return `
            <div style="font-family: 'Roboto', Arial, sans-serif; font-size: 13.5pt; line-height: 1.6; text-align: justify;">
                <p style="text-align: center; font-weight: bold; margin-bottom: 25px; font-size: 16pt; text-decoration: underline;">RELATÓRIO MÉDICO</p>
                <p style="margin-bottom: 20px;">
                    Paciente supracitado(a), em acompanhamento/avaliação médica nesta data.
                </p>
                
                <p style="margin-bottom: 20px;">
                    <strong>Finalidade:</strong> ${finalidadeStr}
                </p>

                ${buildBlock('Diagnóstico principal', diagnostico)}
                ${buildBlock('História clínica / resumo do caso', historia)}
                ${buildBlock('Exame físico / achados relevantes', exameFisico)}
                ${buildBlock('Exames complementares', examesComplementares)}
                ${buildBlock('Conduta / tratamento realizado', conduta)}
                ${buildBlock('Situação atual / conclusão', conclusao)}
                ${observacoes.trim() ? `<p style="margin-top: 25px; margin-bottom: 5px; font-size: 12.5pt;"><strong>Observações:</strong> ${observacoes}</p>` : ''}
            </div>
        `;
    };

    const handleAddToQueue = () => {
        const html = generateHtml();
        const docId = 'relatorio_' + Date.now();
        
        addToQueue({
            id: docId,
            titulo: 'Relatório Médico',
            texto: html,
            tipo: 'documento'
        });

        if (printTwoCopies) {
            addToQueue({
                id: docId + '_via2',
                titulo: 'Relatório Médico',
                texto: html,
                tipo: 'documento'
            });
        }

        setAddedToQueue(true);
        setTimeout(() => setAddedToQueue(false), 2000);
    };

    return (
        <div className="container mx-auto px-4 max-w-6xl my-8 mb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Relatório Médico</h1>
                    <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-1">Texto estruturado em blocos para relatórios clínicos extensos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* COMANDOS E INPUTS */}
                <div className="lg:col-span-6 xl:col-span-5 bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-7 flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar">
                    
                    {/* FINALIDADE & DIAGNOSTICO */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Finalidade do Relatório</label>
                            <input 
                                type="text"
                                list="finalidades-list"
                                placeholder="Ex: Encaminhamento, Perícia, etc."
                                value={finalidade}
                                onChange={(e) => setFinalidade(e.target.value)}
                                className="w-full h-[60px] pl-5 pr-5 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all placeholder-slate-400"
                            />
                            <datalist id="finalidades-list">
                                <option value="Encaminhamento" />
                                <option value="Perícia Médica" />
                                <option value="Seguimento Clínico" />
                                <option value="Solicitação Administrativa" />
                                <option value="Avaliação Pós-Operatória" />
                                <option value="Afastamento Laboral" />
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Diagnóstico Principal (com CID)</label>
                            <input 
                                type="text" 
                                placeholder="Dígite o diagnóstico..."
                                value={diagnostico}
                                onChange={(e) => setDiagnostico(e.target.value)}
                                className="w-full h-[60px] px-5 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all placeholder-slate-400"
                            />
                        </div>
                    </div>

                    {/* BLOCOS TEXTUAIS GRANDES */}
                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>História clínica / Resumo do caso</span>
                        </label>
                        <textarea 
                            rows={3}
                            placeholder="Sintomas, evolução temporal, tratamentos prévios..."
                            value={historia}
                            onChange={(e) => setHistoria(e.target.value)}
                            className="w-full p-4 text-[15px] font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all resize-none placeholder-slate-400"
                        />
                    </div>

                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Exame Físico / Achados Relevantes</span>
                        </label>
                        <textarea 
                            rows={2}
                            placeholder="Dados vitais, estado geral, inspeção, palpação..."
                            value={exameFisico}
                            onChange={(e) => setExameFisico(e.target.value)}
                            className="w-full p-4 text-[15px] font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all resize-none placeholder-slate-400"
                        />
                    </div>

                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Exames Complementares</span>
                        </label>
                        <textarea 
                            rows={2}
                            placeholder="Laboratoriais, imagem, ECG..."
                            value={examesComplementares}
                            onChange={(e) => setExamesComplementares(e.target.value)}
                            className="w-full p-4 text-[15px] font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all resize-none placeholder-slate-400"
                        />
                    </div>

                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Conduta / Tratamento Realizado</span>
                        </label>
                        <textarea 
                            rows={2}
                            placeholder="Medicações em uso, cirurgias realizadas..."
                            value={conduta}
                            onChange={(e) => setConduta(e.target.value)}
                            className="w-full p-4 text-[15px] font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all resize-none placeholder-slate-400"
                        />
                    </div>

                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Situação Atual / Conclusão</span>
                        </label>
                        <textarea 
                            rows={2}
                            placeholder="Prognóstico, estado clínico atual, incapacidade..."
                            value={conclusao}
                            onChange={(e) => setConclusao(e.target.value)}
                            className="w-full p-4 text-[15px] font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all resize-none placeholder-slate-400"
                        />
                    </div>

                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Observações Finais</span>
                            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tracking-wider">OPCIONAL</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="Observação isolada..."
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            className="w-full h-[60px] px-5 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all placeholder-slate-400"
                        />
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 relative z-0 shrink-0">
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
                <div className="lg:col-span-6 xl:col-span-7 bg-white dark:bg-slate-50 border border-slate-200 dark:border-slate-300 rounded-[2px] p-10 lg:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden min-h-[500px]">
                     {/* Watermark/Texture */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[220px] text-slate-50 dark:text-slate-200/50 font-serif font-black select-none pointer-events-none z-0">
                         R
                     </div>
                     <div className="relative z-10 text-slate-800 dark:text-slate-800" dangerouslySetInnerHTML={{ __html: generateHtml() }} />
                </div>
            </div>
        </div>
    );
};

export default RelatorioMedico;
