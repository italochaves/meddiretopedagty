import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';
import { supabase } from "../services/supabase";
import {
    MedicamentoPediatrico,
    medicamentoExigeIdade,
    medicamentoExigePeso,
    validarRestricoesMedicamento,
    calcularIdadeTotalMeses,
    definirTipoCalculo,
    gerarPrescricaoPorPeso,
    gerarPrescricaoPorIdade,
    gerarPrescricaoDoseFixa,
    gerarPrescricaoPorFaixaPeso,
    getLabelTipoCalculo,
    getCorBadgeTipo,
} from './pediatriaLogica';

// ==========================================
// RICH TEXT EDITOR
// ==========================================
interface RichTextEditorProps {
    initialHtml: string;
    editorRef: React.RefObject<HTMLDivElement>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialHtml, editorRef }) => {
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = initialHtml;
        }
    }, [initialHtml, editorRef]);

    return (
        <div
            ref={editorRef}
            contentEditable
            className="w-full p-4 font-mono text-sm text-slate-800 dark:text-slate-200 focus:outline-none min-h-[200px] overflow-y-auto ped-scrollbar whitespace-pre-wrap leading-relaxed"
            suppressContentEditableWarning={true}
        />
    );
};

// ==========================================
// INTERFACES
// ==========================================
type Medication = MedicamentoPediatrico;

interface Protocol {
    id: number;
    nome_condicao: string;
    ids_medicamentos: number[];
    orientacoes_gerais: string;
}

type ModalCor = 'NORMAL' | 'AMARELO' | 'VERMELHO';
type ModalTipo = 'IDADE_OBRIGATORIA' | 'ALERTA_CONFIRMACAO';

interface ModalInfo {
    tipo: ModalTipo;
    medId: number;
    mensagens: string[];
    cor: ModalCor;
    nomeMed: string;
}

// ==========================================
// COMPONENTE: Modal de Alerta/Confirmação
// ==========================================
interface AlertModalProps {
    modalInfo: ModalInfo;
    idadeAnos: string;
    idadeMeses: string;
    onSetIdadeAnos: (v: string) => void;
    onSetIdadeMeses: (v: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
    modalInfo,
    idadeAnos,
    idadeMeses,
    onSetIdadeAnos,
    onSetIdadeMeses,
    onConfirm,
    onCancel,
}) => {
    const isIdade = modalInfo.tipo === 'IDADE_OBRIGATORIA';
    const isVermelho = modalInfo.cor === 'VERMELHO';
    const isAmarelo = modalInfo.cor === 'AMARELO';

    const bgCard = isVermelho
        ? 'border-red-200 dark:border-red-800'
        : isAmarelo
        ? 'border-amber-200 dark:border-amber-800'
        : 'border-blue-200 dark:border-blue-800';

    const iconColor = isVermelho ? 'text-red-500' : isAmarelo ? 'text-amber-500' : 'text-blue-500';
    const titleColor = isVermelho
        ? 'text-red-800 dark:text-red-200'
        : isAmarelo
        ? 'text-amber-800 dark:text-amber-200'
        : 'text-blue-800 dark:text-blue-200';
    const msgColor = isVermelho
        ? 'text-red-700 dark:text-red-300'
        : isAmarelo
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-slate-600 dark:text-slate-400';
    const confirmBg = isVermelho
        ? 'bg-red-600 hover:bg-red-700'
        : isAmarelo
        ? 'bg-amber-500 hover:bg-amber-600'
        : 'bg-premium-teal hover:bg-premium-teal/90';

    const idadeTotalMeses = calcularIdadeTotalMeses(idadeAnos, idadeMeses);
    const canConfirm = isIdade ? (Number(idadeAnos) > 0 || Number(idadeMeses) > 0) : true;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border-2 shadow-2xl overflow-hidden ${bgCard}`}>
                {/* Cabeçalho */}
                <div className="flex items-start gap-3 p-5 pb-3">
                    <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
                        {isIdade ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-black mb-1 ${titleColor}`}>
                            {isIdade ? '👶 Idade necessária' : isVermelho ? '🚨 Alerta Clínico' : '⚠️ Atenção'}
                        </h3>
                        {modalInfo.nomeMed && (
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">
                                {modalInfo.nomeMed}
                            </p>
                        )}
                        {isIdade ? (
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Esta medicação depende da idade da criança para cálculo ou segurança.
                                Informe a idade em anos e meses para continuar.
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                {modalInfo.mensagens.map((msg, i) => (
                                    <p key={i} className={`text-xs leading-relaxed ${msgColor}`}>
                                        • {msg}
                                    </p>
                                ))}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                                    Deseja adicionar mesmo assim?
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inputs de idade (somente para IDADE_OBRIGATORIA) */}
                {isIdade && (
                    <div className="px-5 pb-4">
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Anos
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="18"
                                    value={idadeAnos}
                                    onChange={e => onSetIdadeAnos(e.target.value)}
                                    placeholder="0"
                                    autoFocus
                                    className="w-full text-center text-2xl font-black text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl px-2 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"
                                />
                            </div>
                            <div className="flex-shrink-0 pb-3 text-slate-400 font-bold text-base">e</div>
                            <div className="flex-1">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Meses
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="11"
                                    value={idadeMeses}
                                    onChange={e => onSetIdadeMeses(e.target.value)}
                                    placeholder="0"
                                    className="w-full text-center text-2xl font-black text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl px-2 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"
                                />
                            </div>
                        </div>
                        {(Number(idadeAnos) > 0 || Number(idadeMeses) > 0) && (
                            <p className="text-[11px] text-violet-500 dark:text-violet-400 text-center mt-2 font-bold">
                                = {idadeTotalMeses} meses totais
                            </p>
                        )}
                    </div>
                )}

                {/* Botões */}
                <div className="flex gap-2 px-5 pb-5">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!canConfirm}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${confirmBg}`}
                    >
                        {isIdade ? 'Confirmar' : 'Adicionar mesmo assim'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// COMPONENTE: Fila da Prescrição Compacta
// ==========================================
interface PrescriptionQueueProps {
    orderedMeds: number[];
    medications: Medication[];
    onReorder: (newOrder: number[]) => void;
    onRemove: (id: number) => void;
    onClearAll: () => void;
}

const PrescriptionQueue: React.FC<PrescriptionQueueProps> = ({
    orderedMeds,
    medications,
    onReorder,
    onRemove,
    onClearAll,
}) => {
    const dragIndexRef = useRef<number | null>(null);
    const dragOverIndexRef = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragIndexRef.current = index;
        e.dataTransfer.effectAllowed = 'move';
        (e.currentTarget as HTMLDivElement).style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLDivElement).style.opacity = '1';
        dragIndexRef.current = null;
        dragOverIndexRef.current = null;
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dragOverIndexRef.current = index;
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = dragIndexRef.current;
        if (dragIndex === null || dragIndex === dropIndex) return;
        const newOrder = [...orderedMeds];
        const [moved] = newOrder.splice(dragIndex, 1);
        newOrder.splice(dropIndex, 0, moved);
        onReorder(newOrder);
        dragIndexRef.current = null;
        dragOverIndexRef.current = null;
    };

    const isEmpty = orderedMeds.length === 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    Fila da Prescrição
                    {orderedMeds.length > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-premium-teal text-white text-[10px] font-black">
                            {orderedMeds.length}
                        </span>
                    )}
                </span>
                {!isEmpty && (
                    <button
                        onClick={onClearAll}
                        className="text-[10px] font-semibold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                        title="Limpar todas"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Limpar
                    </button>
                )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {isEmpty ? (
                    <div className="flex items-center justify-center h-10 px-3">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            Nenhum medicamento selecionado
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col max-h-[168px] overflow-y-auto ped-scrollbar">
                        {orderedMeds.map((id, index) => {
                            const med = medications.find(m => m.id === id);
                            if (!med) return null;
                            return (
                                <div
                                    key={id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-grab active:cursor-grabbing group"
                                >
                                    <svg className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                                    </svg>
                                    <span className="w-4 h-4 rounded-full bg-premium-teal/10 dark:bg-premium-teal/20 text-premium-teal text-[9px] font-black flex items-center justify-center flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                                            {med.nome}
                                            {med.apresentacao && <span className="font-normal text-slate-400 ml-1">— {med.apresentacao}</span>}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onRemove(id)}
                                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-50 group-hover:opacity-100"
                                        title={`Remover ${med.nome}`}
                                    >
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// CONSTANTES
// ==========================================
const quickWeights = [5, 10, 15, 20, 25, 30];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const PediatriaPage: React.FC = () => {
    const { addToQueue } = usePrint();

    // ── Estado existente ─────────────────────────────────────
    const [weight, setWeight] = useState<string>('');
    const [mode, setMode] = useState<'prontas' | 'livre'>('livre');
    const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
    const [orderedMeds, setOrderedMeds] = useState<number[]>([]);
    const [customPosologies, setCustomPosologies] = useState<Record<number, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [openPosologyId, setOpenPosologyId] = useState<number | null>(null);
    const [showOrientacoes, setShowOrientacoes] = useState(false);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [isFetchingDB, setIsFetchingDB] = useState(true);
    const [generatedPrescription, setGeneratedPrescription] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [addedToQueue, setAddedToQueue] = useState(false);
    const [orientacoes, setOrientacoes] = useState<string>('');
    const [printTwoCopies, setPrintTwoCopies] = useState(false);

    // ── Novos estados ────────────────────────────────────────
    const [idadeAnos, setIdadeAnos] = useState<string>('');
    const [idadeMeses, setIdadeMeses] = useState<string>('');
    const [modalInfo, setModalInfo] = useState<ModalInfo | null>(null);
    const [pendingMedId, setPendingMedId] = useState<number | null>(null);
    const [alertasConfirmados, setAlertasConfirmados] = useState<Set<number>>(new Set());

    // ==========================================
    // BUSCAR DADOS NO SUPABASE
    // ==========================================
    useEffect(() => {
        async function fetchSupabaseData() {
            try {
                setIsFetchingDB(true);
                const { data: medsData, error: medsError } = await supabase
                    .from('pediatria_medicamentos')
                    .select('*')
                    .order('nome', { ascending: true });
                if (medsError) throw medsError;

                const { data: protosData, error: protosError } = await supabase
                    .from('pediatria_protocolos')
                    .select('*')
                    .order('nome_condicao', { ascending: true });
                if (protosError) throw protosError;

                setMedications(medsData || []);
                setProtocols(protosData || []);
            } catch (err) {
                console.error("Erro ao carregar dados do Supabase:", err);
                setError("Não foi possível carregar a base de dados de medicamentos. Verifique a sua ligação.");
            } finally {
                setIsFetchingDB(false);
            }
        }
        fetchSupabaseData();
    }, []);

    // ==========================================
    // MOTOR DE CÁLCULO ANTIGO — preservado integralmente
    // Usado como fallback para PADRAO_ATUAL
    // ==========================================
    const calculateDose = useCallback((weightVal: number, med: Medication) => {
        const regra = med.regra_calculo.toUpperCase();
        let doseCalculada = 0;
        let atingiuMaximo = false;

        if (regra.includes('FIXO')) {
            const valorFixo = med.regra_calculo.split(':')[1]?.trim() || '1';
            return { valor: valorFixo, atingiuMaximo: false };
        }

        if (regra.includes('*')) {
            const fator = parseFloat(regra.split('*')[1].trim());
            doseCalculada = weightVal * fator;
        } else if (regra.includes('/')) {
            const divisor = parseFloat(regra.split('/')[1].trim());
            doseCalculada = weightVal / divisor;
        }

        if (med.dose_maxima && doseCalculada > med.dose_maxima) {
            doseCalculada = med.dose_maxima;
            atingiuMaximo = true;
        }

        let doseFormatada = '';
        if (med.unidade.toLowerCase() === 'gotas') {
            doseFormatada = Math.round(doseCalculada).toString();
        } else if (med.unidade.toLowerCase() === 'ml') {
            doseFormatada = doseCalculada.toFixed(1).replace('.', ',');
        } else if (med.unidade.toLowerCase().includes('comprimido')) {
            const rounded = Math.round(doseCalculada * 2) / 2;
            doseFormatada = rounded.toString().replace('.', ',');
        } else {
            doseFormatada = doseCalculada.toString().replace('.', ',');
        }

        return { valor: doseFormatada, atingiuMaximo };
    }, []);

    // ==========================================
    // GERADOR DE HTML DA PRESCRIÇÃO
    // Usa novo motor mas mantém fallback PADRAO_ATUAL idêntico ao original
    // regra_antigravity: NÃO aparece na receita impressa
    // ==========================================
    const generateHtmlPrescription = useCallback((
        meds: Medication[],
        weightVal: number,
        obsGerais: string,
        customPoso: Record<number, string>,
        idadeAnosVal: string,
        idadeMesesVal: string
    ) => {
        const grouped = meds.reduce((acc, med) => {
            if (!acc[med.via]) acc[med.via] = [];
            acc[med.via].push(med);
            return acc;
        }, {} as Record<string, Medication[]>);

        let html = '';
        let counter = 1;
        const caracteresMaximosLinha = 68;

        Object.keys(grouped).forEach(via => {
            html += `<div style="text-align: center; margin-top: 10px; margin-bottom: 10px; font-weight: bold;">${via.toUpperCase()}</div>`;
            grouped[via].forEach(med => {
                const tipo = definirTipoCalculo(med);
                const idadeTotalMeses = calcularIdadeTotalMeses(idadeAnosVal, idadeMesesVal);
                const w = weightVal;

                // Calcular dose usando o novo motor
                let resultadoDose;
                if (tipo === 'POR_PESO') {
                    resultadoDose = gerarPrescricaoPorPeso(med, w);
                } else if (tipo === 'POR_IDADE') {
                    const tentativa = gerarPrescricaoPorIdade(med, idadeTotalMeses);
                    // Se não conseguiu calcular por idade e tiver peso disponível
                    // e usar_regra_calculo_original !== NÃO → fallback por peso
                    if (tentativa.precisaConferencia && w > 0 && med.usar_regra_calculo_original !== 'NÃO') {
                        resultadoDose = { ...calculateDose(w, med), tipoCalculo: 'PADRAO_ATUAL' };
                    } else {
                        resultadoDose = tentativa;
                    }
                } else if (tipo === 'DOSE_FIXA') {
                    resultadoDose = gerarPrescricaoDoseFixa(med);
                } else if (tipo === 'FAIXA_PESO') {
                    resultadoDose = gerarPrescricaoPorFaixaPeso(med, w);
                } else {
                    // PADRAO_ATUAL — comportamento 100% original
                    const doseAntiga = calculateDose(w, med);
                    resultadoDose = { ...doseAntiga, tipoCalculo: 'PADRAO_ATUAL' };
                }

                const inicioLinha = `${counter}- ${med.nome.toUpperCase()} ${med.apresentacao.toUpperCase()}`;
                const fimLinha = med.quantidade.toUpperCase();
                const espacoOcupado = inicioLinha.length + fimLinha.length;
                const quantidadeTracinhos = espacoOcupado < caracteresMaximosLinha ? caracteresMaximosLinha - espacoOcupado : 4;
                const tracinhos = '-'.repeat(quantidadeTracinhos);
                html += `<div><strong>${inicioLinha}</strong> <span style="color: #64748b; font-weight: normal;">${tracinhos}</span> <strong>${fimLinha}</strong></div>`;

                const textoPosologia = customPoso[med.id] !== undefined ? customPoso[med.id] : med.posologia_padrao;

                let instrucao: string;
                if (resultadoDose.precisaConferencia) {
                    // Não calculou automaticamente — pede conferência manual
                    instrucao = `⚠️ Conferir dose por faixa etária${textoPosologia ? `. ${textoPosologia}.` : '.'}`;
                    if (resultadoDose.textoManual) {
                        instrucao += `<div style="font-size: 0.82em; color: #64748b; margin-top: 3px; font-style: italic; white-space: pre-wrap;">[Referência: ${resultadoDose.textoManual}]</div>`;
                    }
                } else {
                    // Verifica se o valor já inclui unidade (ex: "5 ml", "1 comprimido")
                    const valorTemUnidade = /ml|mg|gotas|comp/i.test(resultadoDose.valor);
                    if (tipo === 'POR_IDADE' || tipo === 'DOSE_FIXA' || valorTemUnidade) {
                        instrucao = `Dar ${resultadoDose.valor}${valorTemUnidade ? '' : ` ${med.unidade}`}, ${textoPosologia}.`;
                    } else {
                        instrucao = `Dar ${resultadoDose.valor} ${med.unidade}, ${textoPosologia}.`;
                    }
                }

                if (resultadoDose.atingiuMaximo) {
                    instrucao += ` <span style="font-size: 1.1em;" title="Dose ajustada para o limite máximo" aria-label="Dose Máxima">🔒</span>`;
                }

                html += `<div style="margin-bottom: 18px;">${instrucao}</div>`;
                counter++;
            });
        });

        if (obsGerais && obsGerais.trim() !== '') {
            html += `<br/><div style="margin-top: 10px; font-weight: bold;">Orientações gerais:</div>`;
            html += `<div>${obsGerais.replace(/\n/g, '<br/>')}</div>`;
        }

        return html;
    }, [calculateDose]);

    // ==========================================
    // EFFECT: Calculadora em Tempo Real
    // ==========================================
    useEffect(() => {
        setError(null);
        const w = parseFloat(weight);

        if (!weight || isNaN(w) || w <= 0) {
            setGeneratedPrescription(null);
            return;
        }

        let selectedMedsData: Medication[] = [];
        let orientacoesFinais = orientacoes;

        if (mode === 'livre') {
            if (orderedMeds.length === 0) {
                setGeneratedPrescription(null);
                return;
            }
            selectedMedsData = orderedMeds
                .map(id => medications.find(m => m.id === id))
                .filter(Boolean) as Medication[];
        } else {
            if (!selectedProtocol) {
                setGeneratedPrescription(null);
                return;
            }
            const protocoloSelecionado = protocols.find(p => p.id === selectedProtocol);
            if (protocoloSelecionado) {
                selectedMedsData = medications.filter(m => protocoloSelecionado.ids_medicamentos.includes(m.id));
                if (protocoloSelecionado.orientacoes_gerais) {
                    orientacoesFinais = orientacoes
                        ? `${protocoloSelecionado.orientacoes_gerais}\n\n${orientacoes}`
                        : protocoloSelecionado.orientacoes_gerais;
                }
            }
        }

        const htmlOutput = generateHtmlPrescription(selectedMedsData, w, orientacoesFinais, customPosologies, idadeAnos, idadeMeses);
        setGeneratedPrescription(htmlOutput);
    }, [weight, mode, selectedProtocol, orderedMeds, customPosologies, orientacoes, medications, protocols, generateHtmlPrescription, idadeAnos, idadeMeses]);

    // ==========================================
    // LÓGICA DE ADICIONAR MEDICAMENTO
    // ==========================================
    const _finalizarAdicaoMed = useCallback((id: number) => {
        setOrderedMeds(prev => [...prev, id]);
        setPendingMedId(null);
        setModalInfo(null);
    }, []);

    const tryAddMed = useCallback((id: number, idadeAnosOverride?: string, idadeMesesOverride?: string) => {
        const med = medications.find(m => m.id === id);
        if (!med) return;

        const iaUsado = idadeAnosOverride !== undefined ? idadeAnosOverride : idadeAnos;
        const imUsado = idadeMesesOverride !== undefined ? idadeMesesOverride : idadeMeses;

        const exigeIdade = medicamentoExigeIdade(med);
        const exigePeso = medicamentoExigePeso(med);

        // Passo 1: Verificar se exige idade mas não foi preenchida
        if (exigeIdade && !iaUsado && !imUsado) {
            setPendingMedId(id);
            setModalInfo({
                tipo: 'IDADE_OBRIGATORIA',
                medId: id,
                mensagens: [],
                cor: 'NORMAL',
                nomeMed: `${med.nome}${med.apresentacao ? ' — ' + med.apresentacao : ''}`,
            });
            return;
        }

        // Passo 2: Validar restrições com os valores atuais
        const pesoKg = parseFloat(weight) || null;
        const idadeTotalMeses = exigeIdade ? calcularIdadeTotalMeses(iaUsado, imUsado) : null;
        const validacao = validarRestricoesMedicamento(
            med,
            exigePeso ? pesoKg : null,
            exigeIdade ? idadeTotalMeses : null
        );

        if (validacao.precisaConfirmacao && !alertasConfirmados.has(id)) {
            setPendingMedId(id);
            setModalInfo({
                tipo: 'ALERTA_CONFIRMACAO',
                medId: id,
                mensagens: validacao.mensagens,
                cor: validacao.cor,
                nomeMed: `${med.nome}${med.apresentacao ? ' — ' + med.apresentacao : ''}`,
            });
            return;
        }

        // Passo 3: Tudo ok — adicionar
        _finalizarAdicaoMed(id);
    }, [medications, idadeAnos, idadeMeses, weight, alertasConfirmados, _finalizarAdicaoMed]);

    const toggleMed = (id: number) => {
        if (orderedMeds.includes(id)) {
            // Remover
            setOrderedMeds(prev => prev.filter(m => m !== id));
            setOpenPosologyId(prev => prev === id ? null : prev);
            setAlertasConfirmados(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } else {
            tryAddMed(id);
        }
    };

    // ── Confirmar modal ──────────────────────────────────────
    const handleModalConfirm = () => {
        if (!modalInfo || pendingMedId === null) {
            setModalInfo(null);
            return;
        }

        if (modalInfo.tipo === 'IDADE_OBRIGATORIA') {
            // Usuário preencheu a idade — agora verificar alertas com a nova idade
            const med = medications.find(m => m.id === pendingMedId);
            if (!med) { setModalInfo(null); return; }

            const pesoKg = parseFloat(weight) || null;
            const idadeTotalMeses = calcularIdadeTotalMeses(idadeAnos, idadeMeses);
            const validacao = validarRestricoesMedicamento(
                med,
                medicamentoExigePeso(med) ? pesoKg : null,
                idadeTotalMeses
            );

            if (validacao.precisaConfirmacao && !alertasConfirmados.has(pendingMedId)) {
                // Mostrar confirmação de alerta
                setModalInfo({
                    tipo: 'ALERTA_CONFIRMACAO',
                    medId: pendingMedId,
                    mensagens: validacao.mensagens,
                    cor: validacao.cor,
                    nomeMed: modalInfo.nomeMed,
                });
                return;
            }

            // Sem alertas — adicionar
            _finalizarAdicaoMed(pendingMedId);

        } else if (modalInfo.tipo === 'ALERTA_CONFIRMACAO') {
            // Usuário confirmou apesar do alerta
            setAlertasConfirmados(prev => new Set([...prev, pendingMedId]));
            _finalizarAdicaoMed(pendingMedId);
        }
    };

    const handleModalCancel = () => {
        setPendingMedId(null);
        setModalInfo(null);
    };

    // ==========================================
    // AÇÕES
    // ==========================================
    const removeMed = (id: number) => {
        setOrderedMeds(prev => prev.filter(m => m !== id));
        setOpenPosologyId(prev => prev === id ? null : prev);
        setAlertasConfirmados(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const reorderMeds = (newOrder: number[]) => setOrderedMeds(newOrder);
    const clearAllMeds = () => {
        setOrderedMeds([]);
        setOpenPosologyId(null);
        setAlertasConfirmados(new Set());
    };

    const handleCustomPosology = (medId: number, value: string) => {
        setCustomPosologies(prev => ({ ...prev, [medId]: value }));
    };

    const togglePosology = (medId: number) => {
        setOpenPosologyId(prev => prev === medId ? null : medId);
    };

    const copyToClipboard = useCallback(() => {
        if (!editorRef.current) return;
        const textToCopy = editorRef.current.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess('Copiado!');
            setTimeout(() => setCopySuccess(''), 3000);
        }, () => {
            setCopySuccess('Falha ao copiar.');
        });
    }, []);

    const handleAddToQueue = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            addToQueue({
                id: 'pediatria-' + Date.now(),
                titulo: `Prescrição Pediátrica (${weight}kg)`,
                texto: html,
                tipo: 'prescricao'
            });
            if (printTwoCopies) {
                addToQueue({
                    id: 'pediatria-' + Date.now() + '_via2',
                    titulo: `Prescrição Pediátrica (${weight}kg)`,
                    texto: html,
                    tipo: 'prescricao'
                });
            }
            setAddedToQueue(true);
            setTimeout(() => setAddedToQueue(false), 2000);
        }
    };

    const handleFormat = (command: string) => {
        document.execCommand(command, false);
        if (editorRef.current) editorRef.current.focus();
    };

    const ToolbarButton = ({ command, icon, title }: { command: string, icon: React.ReactNode, title: string }) => (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat(command); }} className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title={title}>
            {icon}
        </button>
    );

    // ==========================================
    // LOADING STATE
    // ==========================================
    if (isFetchingDB) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-premium-teal border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Carregando banco de medicamentos...</p>
            </div>
        );
    }

    // ==========================================
    // COMPUTED VALUES (render time)
    // ==========================================

    // Medicamentos atualmente selecionados (modo livre ou protocolo)
    const allSelectedMeds: Medication[] = [];
    if (mode === 'livre') {
        orderedMeds.forEach(id => {
            const m = medications.find(x => x.id === id);
            if (m) allSelectedMeds.push(m);
        });
    } else if (selectedProtocol) {
        const proto = protocols.find(p => p.id === selectedProtocol);
        if (proto) {
            medications.filter(m => proto.ids_medicamentos.includes(m.id)).forEach(m => allSelectedMeds.push(m));
        }
    }

    const medsQueExigemIdade = allSelectedMeds.filter(m => medicamentoExigeIdade(m));
    const medsQueExigemPeso = allSelectedMeds.filter(m => medicamentoExigePeso(m));
    const idadeObrigatoria = medsQueExigemIdade.length > 0;
    const pesoObrigatorio = medsQueExigemPeso.length > 0;

    const pesoKgAtual = parseFloat(weight) || null;
    const idadeTotalMesesAtual = (idadeAnos || idadeMeses)
        ? calcularIdadeTotalMeses(idadeAnos, idadeMeses)
        : null;

    // Alertas ativos em medicamentos selecionados
    const alertasMedsSelecionados = allSelectedMeds
        .map(med => {
            const exigeI = medicamentoExigeIdade(med);
            const exigeP = medicamentoExigePeso(med);
            const val = validarRestricoesMedicamento(
                med,
                exigeP ? pesoKgAtual : null,
                exigeI ? idadeTotalMesesAtual : null
            );
            return { med, validacao: val };
        })
        .filter(x => x.validacao.mensagens.length > 0);

    const mostrarPainelResumo = (
        medsQueExigemPeso.length > 0 ||
        medsQueExigemIdade.length > 0 ||
        alertasMedsSelecionados.length > 0
    );

    const filteredMeds = medications.filter(med => {
        if (searchTerm.trim().length >= 2) {
            const term = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const nome = med.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const apresentacao = med.apresentacao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return nome.includes(term) || apresentacao.includes(term);
        }
        return true;
    });

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <>
            {/* Estilos de scrollbar */}
            <style>{`
                .ped-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .ped-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .ped-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
                .ped-scrollbar::-webkit-scrollbar-thumb:hover { background: #4B5563; }
                .dark .ped-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; }
                .dark .ped-scrollbar::-webkit-scrollbar-thumb:hover { background: #6B7280; }
            `}</style>

            {/* Modal de alerta/confirmação */}
            {modalInfo && (
                <AlertModal
                    modalInfo={modalInfo}
                    idadeAnos={idadeAnos}
                    idadeMeses={idadeMeses}
                    onSetIdadeAnos={setIdadeAnos}
                    onSetIdadeMeses={setIdadeMeses}
                    onConfirm={handleModalConfirm}
                    onCancel={handleModalCancel}
                />
            )}

            {/* Toast de sucesso */}
            {addedToQueue && (
                <div className="fixed top-20 right-5 z-50 animate-bounce">
                    <div className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Adicionado à fila de impressão!
                    </div>
                </div>
            )}

            {/* WRAPPER PRINCIPAL */}
            <div className="flex flex-col animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* CABEÇALHO COMPACTO */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                            <Link to="/dashboard" className="hover:text-premium-teal transition-colors">Dashboard</Link>
                            <span>/</span>
                            <span>Pediatria</span>
                        </div>
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
                                Prescrição Pediátrica Dinâmica
                            </h1>
                        </div>
                    </div>
                </div>

                {/* GRID PRINCIPAL */}
                <div className="flex flex-col lg:flex-row gap-4 items-start">

                    {/* ════════════════════════════════════════
                        COLUNA ESQUERDA — Controles
                    ════════════════════════════════════════ */}
                    <div className="w-full lg:w-[44%] flex flex-col gap-3">

                        {/* ── A. PESO ──────────────────────────── */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-4">
                            <label htmlFor="weight" className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                Peso da Criança
                                {pesoObrigatorio && <span className="ml-1 text-blue-400">*</span>}
                            </label>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative flex-shrink-0">
                                    <input
                                        id="weight"
                                        type="number"
                                        step="0.1"
                                        placeholder="00.0"
                                        value={weight}
                                        onChange={(e) => {
                                            setWeight(e.target.value);
                                            if (parseFloat(e.target.value) <= 0) {
                                                setError("Por favor, insira um peso válido maior que zero.");
                                            } else {
                                                setError(null);
                                            }
                                        }}
                                        className={`w-28 text-2xl font-black text-premium-teal bg-slate-50 dark:bg-slate-900 border-2 rounded-lg px-3 py-1.5 focus:outline-none focus:border-premium-teal focus:ring-2 focus:ring-premium-teal/10 transition-all placeholder-slate-300 dark:placeholder-slate-700 ${pesoObrigatorio && !weight ? 'border-blue-300 dark:border-blue-700' : 'border-slate-200 dark:border-slate-600'}`}
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">kg</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {quickWeights.map(w => (
                                        <button
                                            key={w}
                                            onClick={() => { setWeight(w.toString()); setError(null); }}
                                            className={`px-2 py-1 text-xs font-bold rounded-full transition-colors ${parseFloat(weight) === w ? 'bg-premium-teal text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-premium-teal hover:text-white'}`}
                                        >
                                            {w}kg
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
                            {pesoObrigatorio && medsQueExigemPeso.length > 0 && (
                                <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1.5 flex items-center gap-1">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    ⚖️ Necessário para: {medsQueExigemPeso.map(m => m.nome).join(', ')}
                                </p>
                            )}
                        </div>

                        {/* ── B. IDADE (apenas quando obrigatória ou já preenchida) ── */}
                        {(idadeObrigatoria || idadeAnos || idadeMeses) && (
                            <div className={`bg-white dark:bg-slate-800 rounded-xl border-2 shadow-card p-4 transition-all ${idadeObrigatoria ? 'border-violet-300 dark:border-violet-700' : 'border-slate-100 dark:border-slate-700'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        Idade da Criança
                                        {idadeObrigatoria && <span className="ml-1 text-violet-500">*</span>}
                                    </label>
                                    {idadeObrigatoria && (
                                        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800">
                                            👶 exigida
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mb-1">Anos</label>
                                        <input
                                            id="idade-anos"
                                            type="number"
                                            min="0"
                                            max="18"
                                            placeholder="0"
                                            value={idadeAnos}
                                            onChange={e => setIdadeAnos(e.target.value)}
                                            className={`w-full text-center text-2xl font-black text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border-2 rounded-lg px-2 py-1.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all ${idadeObrigatoria && !idadeAnos && !idadeMeses ? 'border-violet-400 dark:border-violet-600' : 'border-slate-200 dark:border-slate-600'}`}
                                        />
                                    </div>
                                    <div className="flex-shrink-0 pb-2 text-slate-400 font-bold text-sm">e</div>
                                    <div className="flex-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mb-1">Meses</label>
                                        <input
                                            id="idade-meses"
                                            type="number"
                                            min="0"
                                            max="11"
                                            placeholder="0"
                                            value={idadeMeses}
                                            onChange={e => setIdadeMeses(e.target.value)}
                                            className={`w-full text-center text-2xl font-black text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border-2 rounded-lg px-2 py-1.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all ${idadeObrigatoria && !idadeAnos && !idadeMeses ? 'border-violet-400 dark:border-violet-600' : 'border-slate-200 dark:border-slate-600'}`}
                                        />
                                    </div>
                                </div>
                                {(idadeAnos || idadeMeses) && (
                                    <p className="text-[11px] text-violet-500 dark:text-violet-400 text-center mt-2 font-bold">
                                        = {calcularIdadeTotalMeses(idadeAnos, idadeMeses)} meses totais
                                    </p>
                                )}
                                {idadeObrigatoria && medsQueExigemIdade.length > 0 && (
                                    <p className="text-[10px] text-violet-500 dark:text-violet-400 mt-1.5 flex items-center gap-1">
                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Necessária para: {medsQueExigemIdade.map(m => m.nome).join(', ')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ── C. MODO ──────────────────────────── */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-4">
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                                Modo de Prescrição
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMode('prontas')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all ${mode === 'prontas' ? 'border-premium-teal bg-premium-teal/5 text-premium-teal' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-premium-teal/50'}`}
                                >
                                    🩺 Protocolos Prontos
                                </button>
                                <button
                                    onClick={() => setMode('livre')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all ${mode === 'livre' ? 'border-premium-teal bg-premium-teal/5 text-premium-teal' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-premium-teal/50'}`}
                                >
                                    ✏️ Prescrição Livre
                                </button>
                            </div>
                        </div>

                        {/* ── D. FILA (modo livre) ─────────────── */}
                        {mode === 'livre' && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-4">
                                <PrescriptionQueue
                                    orderedMeds={orderedMeds}
                                    medications={medications}
                                    onReorder={reorderMeds}
                                    onRemove={removeMed}
                                    onClearAll={clearAllMeds}
                                />
                            </div>
                        )}

                        {/* ── E. PAINEL DE RESUMO CLÍNICO ──────── */}
                        {mostrarPainelResumo && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-4 space-y-2">
                                <span className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    Resumo Clínico
                                </span>

                                {medsQueExigemPeso.length > 0 && (
                                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <span className="flex-shrink-0 mt-0.5">⚖️</span>
                                        <span>
                                            <strong className="text-blue-600 dark:text-blue-400">Peso necessário para:</strong>{' '}
                                            {medsQueExigemPeso.map(m => m.nome).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {medsQueExigemIdade.length > 0 && (
                                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <span className="flex-shrink-0 mt-0.5">👶</span>
                                        <span>
                                            <strong className="text-violet-600 dark:text-violet-400">Idade necessária para:</strong>{' '}
                                            {medsQueExigemIdade.map(m => m.nome).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {alertasMedsSelecionados.map(({ med, validacao }) => (
                                    <div
                                        key={med.id}
                                        className={`rounded-lg p-2.5 text-xs ${
                                            validacao.cor === 'VERMELHO'
                                                ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                                                : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'
                                        }`}
                                    >
                                        <div className="flex items-start gap-1.5">
                                            <span className="flex-shrink-0">{validacao.cor === 'VERMELHO' ? '🚨' : '⚠️'}</span>
                                            <div className={validacao.cor === 'VERMELHO' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}>
                                                <strong>{med.nome}:</strong>{' '}
                                                {validacao.mensagens.join(' • ')}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}

                        {/* ── F. CONTEÚDO DO MODO ──────────────── */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-4 flex flex-col gap-3">

                            {mode === 'prontas' ? (
                                /* PROTOCOLOS */
                                <>
                                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        Condição Clínica
                                    </label>

                                    {/* Aviso de protocolo com exigências */}
                                    {selectedProtocol && (medsQueExigemIdade.length > 0 || medsQueExigemPeso.length > 0) && (
                                        <div className="text-xs bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 text-blue-700 dark:text-blue-300">
                                            <p className="font-bold mb-1">ℹ️ Este protocolo contém medicações que dependem de:</p>
                                            {medsQueExigemIdade.length > 0 && <p>• Idade da criança (preencha o campo acima)</p>}
                                            {medsQueExigemPeso.length > 0 && <p>• Peso da criança (preencha o campo acima)</p>}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto ped-scrollbar pr-1">
                                        {protocols.map((protocol) => (
                                            <button
                                                key={protocol.id}
                                                onClick={() => setSelectedProtocol(protocol.id)}
                                                className={`p-2.5 rounded-lg border-2 text-xs font-bold transition-all text-left flex items-center justify-between ${selectedProtocol === protocol.id ? 'bg-premium-teal text-white border-premium-teal' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-premium-teal'}`}
                                            >
                                                <span className="truncate">{protocol.nome_condicao}</span>
                                                {selectedProtocol === protocol.id && (
                                                    <svg className="w-3.5 h-3.5 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                /* MEDICAMENTOS LIVRE */
                                <>
                                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        Banco de Medicamentos
                                    </label>

                                    {/* Campo de busca */}
                                    <div className="relative">
                                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar medicamento..."
                                            className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all font-medium placeholder-slate-400"
                                        />
                                        {searchTerm && (
                                            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Lista de medicamentos */}
                                    <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto ped-scrollbar pr-0.5">
                                        {filteredMeds.map((med) => {
                                            const isSelected = orderedMeds.includes(med.id);
                                            const isPosologyOpen = openPosologyId === med.id;
                                            const badgeLabel = getLabelTipoCalculo(med);
                                            const badgeColor = getCorBadgeTipo(med);
                                            const exigeI = medicamentoExigeIdade(med);
                                            const exigeP = medicamentoExigePeso(med);

                                            // Alerta ativo para este medicamento (se selecionado e dados disponíveis)
                                            let temAlerta = false;
                                            let corAlerta: ModalCor = 'NORMAL';
                                            if (isSelected && (pesoKgAtual !== null || idadeTotalMesesAtual !== null)) {
                                                const val = validarRestricoesMedicamento(
                                                    med,
                                                    exigeP ? pesoKgAtual : null,
                                                    exigeI ? idadeTotalMesesAtual : null
                                                );
                                                temAlerta = val.mensagens.length > 0;
                                                corAlerta = val.cor;
                                            }

                                            const borderClass = isSelected
                                                ? temAlerta && corAlerta === 'VERMELHO'
                                                    ? 'bg-red-50/40 dark:bg-red-950/10 border-red-300 dark:border-red-800'
                                                    : temAlerta && corAlerta === 'AMARELO'
                                                    ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-300 dark:border-amber-800'
                                                    : 'bg-premium-teal/5 dark:bg-premium-teal/10 border-premium-teal/60'
                                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-premium-teal/30';

                                            return (
                                                <div key={med.id} className={`rounded-lg border transition-all ${borderClass}`}>
                                                    {/* Linha principal */}
                                                    <div
                                                        onClick={() => toggleMed(med.id)}
                                                        className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-2">
                                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
                                                                    {med.nome}
                                                                </span>
                                                                {/* Badge de tipo de cálculo */}
                                                                {badgeLabel && (
                                                                    <span className={`inline-flex items-center px-1.5 py-0 rounded text-[9px] font-black uppercase tracking-wide leading-4 ${badgeColor}`}>
                                                                        {badgeLabel}
                                                                    </span>
                                                                )}
                                                                {/* Badge: exige idade */}
                                                                {exigeI && (
                                                                    <span className="inline-flex items-center px-1 py-0 rounded text-[9px] leading-4 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" title="Exige idade">
                                                                        👶
                                                                    </span>
                                                                )}
                                                                {/* Badge: exige peso (quando não tem badge de tipo) */}
                                                                {exigeP && !badgeLabel && (
                                                                    <span className="inline-flex items-center px-1 py-0 rounded text-[9px] leading-4 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" title="Exige peso">
                                                                        ⚖️
                                                                    </span>
                                                                )}
                                                                {/* Badge: alerta ativo */}
                                                                {temAlerta && (
                                                                    <span className={`inline-flex items-center px-1 py-0 rounded text-[9px] leading-4 ${corAlerta === 'VERMELHO' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                                                                        {corAlerta === 'VERMELHO' ? '🚨' : '⚠️'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {med.apresentacao && (
                                                                <span className="text-xs text-slate-400 dark:text-slate-500 block truncate leading-tight">
                                                                    {med.apresentacao}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                                            {isSelected && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); togglePosology(med.id); }}
                                                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${isPosologyOpen ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-amber-400 hover:text-amber-500'}`}
                                                                    title="Editar posologia"
                                                                >
                                                                    ✏️ pos.
                                                                </button>
                                                            )}
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'bg-premium-teal border-premium-teal' : 'border-slate-300 dark:border-slate-600'}`}>
                                                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Accordion de posologia */}
                                                    {isSelected && isPosologyOpen && (
                                                        <div className="px-3 pb-2.5 pt-1 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                                                                Ajustar posologia:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={customPosologies[med.id] !== undefined ? customPosologies[med.id] : med.posologia_padrao}
                                                                onChange={(e) => handleCustomPosology(med.id, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-premium-teal transition-all"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {filteredMeds.length === 0 && (
                                            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6 italic">Nenhum medicamento encontrado.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── G. ORIENTAÇÕES GERAIS (recolhível) ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
                            <button
                                onClick={() => setShowOrientacoes(!showOrientacoes)}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    {showOrientacoes ? '▾' : '▸'} Orientações Gerais
                                    {orientacoes.trim() && <span className="w-1.5 h-1.5 rounded-full bg-premium-teal inline-block" />}
                                </span>
                                <span className="text-[11px] text-slate-400">{showOrientacoes ? 'fechar' : 'opcional'}</span>
                            </button>
                            {showOrientacoes && (
                                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                                    <textarea
                                        rows={3}
                                        value={orientacoes}
                                        onChange={(e) => setOrientacoes(e.target.value)}
                                        placeholder="Ex: Refazer exames após 7 dias, manter hidratação..."
                                        className="w-full mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all text-sm resize-none ped-scrollbar"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ════════════════════════════════════════
                        COLUNA DIREITA — Preview sticky
                    ════════════════════════════════════════ */}
                    <div className="w-full lg:w-[56%] lg:sticky lg:top-[80px] flex flex-col" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                        {generatedPrescription ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                                {/* Cabeçalho do preview */}
                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-premium-teal animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Visualização Dinâmica</h2>
                                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                                            Para <strong className="text-premium-teal">{weight}kg</strong>
                                            {(idadeAnos || idadeMeses) && (
                                                <span className="ml-1 text-violet-500">/ {idadeAnos || '0'}a {idadeMeses || '0'}m</span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                        Live
                                    </span>
                                </div>

                                {/* Toolbar de formatação compacta */}
                                <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                                    <ToolbarButton command="bold" title="Negrito" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>} />
                                    <ToolbarButton command="underline" title="Sublinhado" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>} />
                                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                                    <ToolbarButton command="justifyLeft" title="Esquerda" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>} />
                                    <ToolbarButton command="justifyCenter" title="Centro" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>} />
                                </div>

                                {/* Editor com rolagem interna */}
                                <div className="flex-1 overflow-y-auto ped-scrollbar bg-white dark:bg-slate-900">
                                    <RichTextEditor
                                        key={weight + mode + selectedProtocol + orderedMeds.join('-') + idadeAnos + idadeMeses}
                                        editorRef={editorRef}
                                        initialHtml={generatedPrescription}
                                    />
                                </div>

                                {/* Rodapé sticky com botões de ação */}
                                <div className="flex flex-col gap-2 px-3 pb-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0 pt-3">
                                    <label className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={printTwoCopies}
                                            onChange={(e) => setPrintTwoCopies(e.target.checked)}
                                            className="w-[15px] h-[15px] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded focus:ring-slate-800 transition-colors bg-white dark:bg-slate-800 cursor-pointer shadow-sm"
                                        />
                                        Imprimir em 2 vias
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddToQueue}
                                            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-bold text-white transition-all duration-200 rounded-xl focus:outline-none ${addedToQueue ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                                        >
                                            {addedToQueue ? (
                                                <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{printTwoCopies ? 'Adicionadas 2 Vias!' : 'Prontinho!'}</>
                                            ) : (
                                                <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>Mandar p/ Impressão</>
                                            )}
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-bold text-white transition-colors duration-200 rounded-xl bg-premium-teal hover:bg-premium-teal/90 focus:outline-none"
                                        >
                                            {copySuccess ? (
                                                <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Copiado!</>
                                            ) : (
                                                <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>Copiar Rascunho</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Estado vazio do preview */
                            <div className="flex flex-col items-center justify-center p-10 text-center" style={{ minHeight: '300px' }}>
                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-7 h-7 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-1.5">Visualização Dinâmica</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
                                    Insira o <strong className="text-slate-500 dark:text-slate-400">peso</strong> e selecione os <strong className="text-slate-500 dark:text-slate-400">medicamentos</strong> para gerar o rascunho.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PediatriaPage;