import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';
import { supabase } from "../services/supabase";

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
interface Medication {
    id: number;
    nome: string;
    apresentacao: string;
    via: string;
    regra_calculo: string;
    unidade: string;
    posologia_padrao: string;
    quantidade: string;
    dose_maxima?: number;
}

interface Protocol {
    id: number;
    nome_condicao: string;
    ids_medicamentos: number[];
    orientacoes_gerais: string;
}

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
        <div className="space-y-1">
            {/* Cabeçalho compacto */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    Fila
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

            {/* Área da fila */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {isEmpty ? (
                    <div className="flex items-center justify-center h-8 px-3">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                            Nenhum medicamento selecionado
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col max-h-[140px] overflow-y-auto ped-scrollbar">
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
                                    className="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-grab active:cursor-grabbing"
                                >
                                    {/* Handle */}
                                    <svg className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                                    </svg>
                                    <span className="w-4 h-4 rounded-full bg-premium-teal/10 dark:bg-premium-teal/20 text-premium-teal text-[9px] font-black flex items-center justify-center flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                                            {med.nome}
                                            {med.apresentacao && <span className="font-normal text-slate-400 ml-1">— {med.apresentacao}</span>}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onRemove(id)}
                                        className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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

    const [weight, setWeight] = useState<string>('');
    const [mode, setMode] = useState<'prontas' | 'livre'>('livre');
    const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
    const [orderedMeds, setOrderedMeds] = useState<number[]>([]);
    const [customPosologies, setCustomPosologies] = useState<Record<number, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    // Controle de accordion de posologia por medicamento
    const [openPosologyId, setOpenPosologyId] = useState<number | null>(null);
    // Controle do accordion de orientações gerais
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
    // MOTOR DE CÁLCULO
    // ==========================================
    const calculateDose = useCallback((weightVal: number, med: Medication) => {
        const regra = med.regra_calculo.toUpperCase();
        let doseCalculada = 0;
        let atingiuMaximo = false;

        if (regra.includes('FIXO')) {
            const valorFixo = regra.split(':')[1]?.trim() || '1';
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

    const generateHtmlPrescription = useCallback((meds: Medication[], weightVal: number, obsGerais: string, customPoso: Record<number, string>) => {
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
                const resultadoDose = calculateDose(weightVal, med);
                const inicioLinha = `${counter}- ${med.nome.toUpperCase()} ${med.apresentacao.toUpperCase()}`;
                const fimLinha = med.quantidade.toUpperCase();
                const espacoOcupado = inicioLinha.length + fimLinha.length;
                const quantidadeTracinhos = espacoOcupado < caracteresMaximosLinha ? caracteresMaximosLinha - espacoOcupado : 4;
                const tracinhos = '-'.repeat(quantidadeTracinhos);
                html += `<div><strong>${inicioLinha}</strong> <span style="color: #64748b; font-weight: normal;">${tracinhos}</span> <strong>${fimLinha}</strong></div>`;
                const textoPosologia = customPoso[med.id] !== undefined ? customPoso[med.id] : med.posologia_padrao;
                let instrucao = `Dar ${resultadoDose.valor} ${med.unidade}, ${textoPosologia}.`;
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

        const htmlOutput = generateHtmlPrescription(selectedMedsData, w, orientacoesFinais, customPosologies);
        setGeneratedPrescription(htmlOutput);
    }, [weight, mode, selectedProtocol, orderedMeds, customPosologies, orientacoes, medications, protocols, generateHtmlPrescription]);

    // ==========================================
    // AÇÕES
    // ==========================================
    const toggleMed = (id: number) => {
        setOrderedMeds(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
        // Fecha posologia se desmarcar
        if (orderedMeds.includes(id)) {
            setOpenPosologyId(prev => prev === id ? null : prev);
        }
    };

    const removeMed = (id: number) => {
        setOrderedMeds(prev => prev.filter(m => m !== id));
        setOpenPosologyId(prev => prev === id ? null : prev);
    };

    const reorderMeds = (newOrder: number[]) => setOrderedMeds(newOrder);
    const clearAllMeds = () => { setOrderedMeds([]); setOpenPosologyId(null); };

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
            addToQueue({
                id: 'pediatria-' + Date.now(),
                titulo: `Prescrição Pediátrica (${weight}kg)`,
                texto: editorRef.current.innerHTML,
                tipo: 'prescricao'
            });
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

    const filteredMeds = medications.filter(med => {
        if (searchTerm.trim().length >= 2) {
            const term = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const nome = med.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const apresentacao = med.apresentacao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return nome.includes(term) || apresentacao.includes(term);
        }
        return true;
    });

    return (
        <>
            {/* Estilos de scrollbar escura embutidos */}
            <style>{`
                .ped-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .ped-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .ped-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
                .ped-scrollbar::-webkit-scrollbar-thumb:hover { background: #4B5563; }
                .dark .ped-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; }
                .dark .ped-scrollbar::-webkit-scrollbar-thumb:hover { background: #6B7280; }
            `}</style>

            {/* Toast de sucesso */}
            {addedToQueue && (
                <div className="fixed top-20 right-5 z-50 animate-bounce">
                    <div className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Adicionado à fila de impressão!
                    </div>
                </div>
            )}

            {/* WRAPPER PRINCIPAL — ocupa altura útil da tela */}
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
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Cálculo de doses com live preview
                            </span>
                        </div>
                    </div>
                </div>

                {/* GRID PRINCIPAL: duas colunas fixas */}
                <div className="flex flex-col lg:flex-row gap-4 items-start">

                    {/* ════════════════════════════════════════
                        COLUNA ESQUERDA — Controles compactos
                    ════════════════════════════════════════ */}
                    <div className="w-full lg:w-[44%] flex flex-col gap-3">

                        {/* ── A. PESO ──────────────────────────── */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-3">
                            <label htmlFor="weight" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                                Peso da Criança
                            </label>
                            {/* Peso + quick pills em linha */}
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
                                        className="w-28 text-2xl font-black text-premium-teal bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:border-premium-teal focus:ring-2 focus:ring-premium-teal/10 transition-all placeholder-slate-300 dark:placeholder-slate-700"
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
                        </div>

                        {/* ── B. MODO ──────────────────────────── */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-3">
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                Modo de Prescrição
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMode('prontas')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border-2 transition-all ${mode === 'prontas' ? 'border-premium-teal bg-premium-teal/5 text-premium-teal' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-premium-teal/50'}`}
                                >
                                    🩺 Protocolos Prontos
                                </button>
                                <button
                                    onClick={() => setMode('livre')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border-2 transition-all ${mode === 'livre' ? 'border-premium-teal bg-premium-teal/5 text-premium-teal' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-premium-teal/50'}`}
                                >
                                    ✏️ Prescrição Livre
                                </button>
                            </div>
                        </div>

                        {/* ── C. FILA (modo livre) ─────────────── */}
                        {mode === 'livre' && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-3">
                                <PrescriptionQueue
                                    orderedMeds={orderedMeds}
                                    medications={medications}
                                    onReorder={reorderMeds}
                                    onRemove={removeMed}
                                    onClearAll={clearAllMeds}
                                />
                            </div>
                        )}

                        {/* ── D. CONTEÚDO DINÂMICO DO MODO ─────── */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-3 flex flex-col gap-2">

                            {mode === 'prontas' ? (
                                /* PROTOCOLOS */
                                <>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        Condição Clínica
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto ped-scrollbar pr-1">
                                        {protocols.map((protocol) => (
                                            <button
                                                key={protocol.id}
                                                onClick={() => setSelectedProtocol(protocol.id)}
                                                className={`p-2 rounded-lg border-2 text-xs font-bold transition-all text-left flex items-center justify-between ${selectedProtocol === protocol.id ? 'bg-premium-teal text-white border-premium-teal' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-premium-teal'}`}
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
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        Banco de Medicamentos
                                    </label>

                                    {/* Busca */}
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

                                    {/* Lista compacta de medicamentos */}
                                    <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto ped-scrollbar pr-1">
                                        {filteredMeds.map((med) => {
                                            const isSelected = orderedMeds.includes(med.id);
                                            const isPosologyOpen = openPosologyId === med.id;
                                            return (
                                                <div key={med.id} className={`rounded-lg border transition-all ${isSelected ? 'bg-premium-teal/5 border-premium-teal' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-premium-teal/30'}`}>
                                                    {/* Linha principal do medicamento */}
                                                    <div
                                                        onClick={() => toggleMed(med.id)}
                                                        className="flex items-center justify-between px-3 py-2 cursor-pointer"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight block truncate">
                                                                {med.nome}
                                                            </span>
                                                            {med.apresentacao && (
                                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate leading-tight">
                                                                    {med.apresentacao}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                                            {/* Botão editar posologia — apenas se selecionado */}
                                                            {isSelected && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); togglePosology(med.id); }}
                                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${isPosologyOpen ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-amber-400 hover:text-amber-500'}`}
                                                                    title="Editar posologia"
                                                                >
                                                                    ✏️ pos.
                                                                </button>
                                                            )}
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-premium-teal border-premium-teal' : 'border-slate-300 dark:border-slate-600'}`}>
                                                                {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Accordion de posologia — só abre se isSelected E isPosologyOpen */}
                                                    {isSelected && isPosologyOpen && (
                                                        <div className="px-3 pb-2 pt-1 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                                                            <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                                                                Ajustar posologia:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={customPosologies[med.id] !== undefined ? customPosologies[med.id] : med.posologia_padrao}
                                                                onChange={(e) => handleCustomPosology(med.id, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-premium-teal transition-all"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {filteredMeds.length === 0 && (
                                            <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum medicamento encontrado.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── E. ORIENTAÇÕES GERAIS (recolhível) ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
                            <button
                                onClick={() => setShowOrientacoes(!showOrientacoes)}
                                className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                            >
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {showOrientacoes ? '▾' : '▸'} Orientações Gerais
                                    {orientacoes.trim() && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-premium-teal inline-block align-middle" />}
                                </span>
                                <span className="text-[10px] text-slate-400">{showOrientacoes ? 'fechar' : 'abrir'}</span>
                            </button>
                            {showOrientacoes && (
                                <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-700">
                                    <textarea
                                        rows={3}
                                        value={orientacoes}
                                        onChange={(e) => setOrientacoes(e.target.value)}
                                        placeholder="Ex: Refazer exames após 7 dias, manter hidratação..."
                                        className="w-full mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all text-xs resize-none ped-scrollbar"
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
                                        key={weight + mode + selectedProtocol + orderedMeds.join('-')}
                                        editorRef={editorRef}
                                        initialHtml={generatedPrescription}
                                    />
                                </div>

                                {/* Rodapé sticky com botões de ação */}
                                <div className="flex gap-2 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                                    <button
                                        onClick={handleAddToQueue}
                                        className={`flex-1 flex items-center justify-center px-3 py-2.5 text-xs font-bold text-white transition-all duration-200 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-offset-1 ${addedToQueue ? 'bg-green-600 focus:ring-green-500' : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 focus:ring-slate-500'}`}
                                    >
                                        {addedToQueue ? (
                                            <><svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Prontinho!</>
                                        ) : (
                                            <><svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Mandar p/ Impressão</>
                                        )}
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex-1 flex items-center justify-center px-3 py-2.5 text-xs font-bold text-white transition-colors duration-200 rounded-lg shadow bg-premium-teal hover:bg-premium-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-premium-teal"
                                    >
                                        {copySuccess ? (
                                            <><svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Copiado!</>
                                        ) : (
                                            <><svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Copiar Rascunho</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Estado vazio do preview */
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 p-8 text-center" style={{ minHeight: '300px' }}>
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <svg className="w-8 h-8 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-500 dark:text-slate-400 mb-1">Editor Ocioso</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[220px] leading-relaxed">
                                    Insira o <strong>peso</strong> e selecione os <strong>medicamentos</strong> para gerar o rascunho.
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