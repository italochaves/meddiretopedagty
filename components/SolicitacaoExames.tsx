import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';

// Exam Database Definition
const examGroups = [
    {
        title: "Hematologia",
        items: ["Hemograma completo", "Plaquetas", "Reticulócitos", "Coagulograma", "TAP / INR", "TTPA"]
    },
    {
        title: "Bioquímica",
        items: ["Glicemia", "Hemoglobina glicada", "Ureia", "Creatinina", "Ácido úrico", "Colesterol total e frações", "Triglicerídeos"]
    },
    {
        title: "Eletrólitos / Função Renal",
        items: ["Sódio", "Potássio", "Cálcio total", "Cálcio ionizado", "Magnésio", "Fósforo"]
    },
    {
        title: "Função Hepática / Pancreática",
        items: ["TGO", "TGP", "FA", "GGT", "Bilirrubinas", "Albumina", "Amilase", "Lipase"]
    },
    {
        title: "Inflamação / Infecção",
        items: ["PCR", "VHS", "Procalcitonina"]
    },
    {
        title: "Urina / Fezes",
        items: ["EAS", "Urocultura", "Parasitológico de fezes", "Pesquisa de sangue oculto nas fezes"]
    },
    {
        title: "Hormônios",
        items: ["TSH", "T4 livre", "Beta-HCG", "Insulina", "Cortisol"]
    },
    {
        title: "Sorologias",
        items: ["HIV", "HBsAg", "Anti-HCV", "VDRL", "Dengue", "Chikungunya", "Zika"]
    },
    {
        title: "Imagem",
        items: ["Radiografia", "Ultrassonografia", "Tomografia computadorizada", "Ressonância magnética", "Mamografia"]
    },
    {
        title: "Cardiológicos",
        items: ["Eletrocardiograma", "Ecocardiograma", "MAPA", "Holter"]
    }
];

const SolicitacaoExames: React.FC = () => {
    const navigate = useNavigate();
    const { addToQueue } = usePrint();
    
    // Form fields
    const [indicacao, setIndicacao] = useState('');
    const [outrosExames, setOutrosExames] = useState('');
    const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
    const [printTwoCopies, setPrintTwoCopies] = useState(false);
    
    // Feedback
    const [addedToQueue, setAddedToQueue] = useState(false);

    const toggleExam = (examName: string) => {
        const newSet = new Set(selectedExams);
        if (newSet.has(examName)) {
            newSet.delete(examName);
        } else {
            newSet.add(examName);
        }
        setSelectedExams(newSet);
    };

    // Text generation logic - Multi-page dynamic architecture
    const generatePagesHtml = (): string[] => {
        // Build list of selected exams
        const examesList: string[] = [];
        examGroups.forEach(group => {
            group.items.forEach(exam => {
                if (selectedExams.has(exam)) {
                    examesList.push(exam);
                }
            });
        });

        // Add additional exams line by line
        const outrosClean = outrosExames.split('\n').map(e => e.trim()).filter(e => e.length > 0);
        outrosClean.forEach(e => examesList.push(e));

        const totalExames = examesList.length;
        
        // Estima linhas da indicação (1 linha gasta aprox. 1 item de espaço)
        const indicacaoLength = indicacao.trim().length;
        const indicacaoLines = indicacao.trim() ? Math.ceil(indicacaoLength / 60) + 2 : 0; 

        // Penalidade (cada linha de texto livre come espaço da lista)
        const penaltyNormal = indicacaoLines;
        const penaltyCompact = indicacaoLines * 2; // Pois as colunas duplicam a densidade vertical
        
        // Definição dos limites verticais rígidos para a área variável (contentHeightPercent do PrintLayout)
        // Valores testados para caberem com segurança antes de tocar na data/assinatura
        const MAX_NORMAL = 15 - penaltyNormal; 
        const MAX_COMPACT = 38 - penaltyCompact; // 2 colunas de 19

        let compactMode = false;
        let maxItemsPerPage = MAX_NORMAL;

        // Gatilho do modo denso
        if (totalExames > MAX_NORMAL) {
            compactMode = true;
            maxItemsPerPage = MAX_COMPACT > 0 ? MAX_COMPACT : 10; // Failsafe
        }

        // Fatiador de Páginas Recursivo
        const chunks: string[][] = [];
        for (let i = 0; i < Math.max(totalExames, 1); i += maxItemsPerPage) {
            chunks.push(examesList.slice(i, i + maxItemsPerPage));
        }

        const pagesHtml: string[] = [];
        
        chunks.forEach((chunk, idx) => {
            const isLastPage = idx === chunks.length - 1;
            
            let examsHtml = '';
            if (chunk.length > 0) {
                const columnStyle = compactMode 
                    ? `column-count: 2; column-gap: 50px; font-size: 11.5pt; line-height: 1.4; margin-bottom: 15px; padding-left: 20px;` 
                    : `column-count: 1; font-size: 14pt; line-height: 1.8; margin-bottom: 25px; padding-left: 20px;`;
                    
                examsHtml = `<ul style="margin-top: 15px; ${columnStyle}">`;
                chunk.forEach(exm => {
                    examsHtml += `<li>${exm}</li>`;
                });
                examsHtml += `</ul>`;
            } else {
                examsHtml = `<p style="margin-top: 15px; margin-bottom: 25px; color: #94a3b8; font-style: italic;">[ Nenhum exame selecionado ]</p>`;
            }

            let indicacaoHtml = '';
            // Coloca a indicação apenas na última página para respeitar a gravidade final do documento
            if (isLastPage && indicacao.trim()) {
                indicacaoHtml = `
                    <div style="margin-top: auto; padding-top: 15px;">
                        <p style="margin-bottom: 5px; font-size: 12pt;"><strong>Indicação clínica / justificativa:</strong></p>
                        <p style="margin-top: 0; margin-bottom: 0px; white-space: pre-wrap; font-size: 12pt; line-height: 1.4;">${indicacao}</p>
                    </div>`;
            }
            
            const contPageHtml = chunks.length > 1 ? `<p style="text-align: right; font-size: 9pt; color: #888; margin-top: 10px; margin-bottom: -10px;">Pág ${idx + 1}/${chunks.length}</p>` : '';

            // Layout Master do HTML
            pagesHtml.push(`
                <div style="font-family: 'Roboto', Arial, sans-serif; font-size: 14pt; line-height: 1.6; text-align: justify; height: 100%; display: flex; flex-direction: column;">
                    <p style="text-align: center; font-weight: bold; margin-bottom: ${compactMode ? '15px' : '30px'}; font-size: 16pt; text-decoration: underline;">
                        SOLICITAÇÃO DE EXAMES
                    </p>
                    <p style="margin-bottom: ${compactMode ? '10px' : '20px'}; font-size: ${compactMode ? '12pt' : '14pt'};">
                        Solicito a realização dos exames abaixo para propedêutica/avaliação clínica do(a) paciente supracitado(a).
                    </p>
                    
                    <div style="flex-grow: 1; display: flex; flex-direction: column;">
                        ${examsHtml}
                        ${indicacaoHtml}
                    </div>
                    
                    ${contPageHtml}
                </div>
            `);
        });

        return pagesHtml;
    };

    const handleAddToQueue = () => {
        const pages = generatePagesHtml();
        const baseId = 'exames_' + Date.now();
        
        // Page Loop (1..N)
        pages.forEach((html, idx) => {
            const docId = `${baseId}_p${idx}`;
            addToQueue({
                id: docId,
                titulo: `Solicitação de Exames${pages.length > 1 ? ` (Pág ${idx + 1})` : ''}`,
                texto: html,
                tipo: 'documento'
            });
        });

        // Duplicatas para a Fila (se marcado)
        if (printTwoCopies) {
            pages.forEach((html, idx) => {
                const docId = `${baseId}_p${idx}_via2`;
                addToQueue({
                    id: docId,
                    titulo: `Solicitação de Exames${pages.length > 1 ? ` (Pág ${idx + 1})` : ''} - 2ª Via`,
                    texto: html,
                    tipo: 'documento'
                });
            });
        }

        setAddedToQueue(true);
        setTimeout(() => setAddedToQueue(false), 2000);
    };

    return (
        <div className="container mx-auto px-4 max-w-7xl my-8 mb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Solicitação de Exames</h1>
                    <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-1">Pedido padronizado com justificativas para exames laboratoriais e imagem.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COMANDOS E INPUTS */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-7 flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar">
                    
                    {/* INDICAÇÃO CLÍNICA */}
                    <div>
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Indicação Clínica / Justificativa</span>
                            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tracking-wider">OPCIONAL</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="Ex: Investigação de dor pélvica, Acompanhamento pós-operatório..."
                            value={indicacao}
                            onChange={(e) => setIndicacao(e.target.value)}
                            className="w-full h-[60px] px-5 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all placeholder-slate-400"
                        />
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800/80 my-2" />

                    {/* LISTA DE EXAMES - CHECKBOXES */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Catálogo de Exames</label>
                            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">{selectedExams.size} marcados</span>
                        </div>
                        
                        <div className="space-y-6 columns-1 md:columns-2 gap-6">
                            {examGroups.map((group, gIdx) => (
                                <div key={gIdx} className="break-inside-avoid shadow-sm border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden mb-6 bg-slate-50/50 dark:bg-slate-950/30">
                                    <div className="bg-slate-100 dark:bg-slate-800/60 px-4 py-2 border-b border-slate-200/60 dark:border-slate-800/80">
                                        <h4 className="text-[13px] font-extrabold text-slate-700 dark:text-slate-200 tracking-tight">{group.title}</h4>
                                    </div>
                                    <div className="p-3 flex flex-col gap-1">
                                        {group.items.map((exam, eIdx) => {
                                            const isSelected = selectedExams.has(exam);
                                            return (
                                                <label 
                                                    key={eIdx} 
                                                    className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-sky-50 dark:bg-sky-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => toggleExam(exam)}
                                                        className="mt-1 w-4 h-4 text-sky-600 dark:text-sky-400 border-slate-300 dark:border-slate-600 rounded focus:ring-sky-600 focus:ring-2 bg-white dark:bg-slate-800 cursor-pointer"
                                                    />
                                                    <span className={`text-sm font-medium select-none ${isSelected ? 'text-sky-900 dark:text-sky-300' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {exam}
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800/80 my-2" />

                    {/* OUTROS EXAMES LIVRES */}
                    <div>
                         <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Outros Exames (Adicionais)</span>
                        </label>
                        <p className="text-[13px] font-medium text-slate-500 mb-3">Escreva um exame por linha caso ele não conste na lista acima.</p>
                        <textarea 
                            rows={3}
                            placeholder="Dosagem de Vitamina B12&#10;Ferro Sérico&#10;Ferritina..."
                            value={outrosExames}
                            onChange={(e) => setOutrosExames(e.target.value)}
                            className="w-full p-4 text-[15px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all resize-none"
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

                {/* PREVIEW DO DOCUMENTO (LISTA AUTO-EXPANSÍVEL) */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                     {generatePagesHtml().map((html, idx) => (
                         <div key={idx} className="bg-white dark:bg-slate-50 border border-slate-200 dark:border-slate-300 rounded-[2px] p-10 lg:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden min-h-[500px]">
                              {/* Watermark/Texture */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[220px] text-slate-50 dark:text-slate-200/50 font-serif font-black select-none pointer-events-none z-0">
                                  S
                              </div>
                              <div className="relative z-10 text-slate-800 dark:text-slate-800 h-full" dangerouslySetInnerHTML={{ __html: html }} />
                         </div>
                     ))}
                </div>
            </div>
        </div>
    );
};

export default SolicitacaoExames;
