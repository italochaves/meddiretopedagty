import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';
import { supabase } from '../services/supabase';

// =============================================
// TIPOS
// =============================================
interface AmbDroga {
    id: number;
    nome: string;
    categoria: string;
    subcategoria: string | null;
    via: string;
    apresentacao: string;
    posologia_padrao: string;
    texto_receita: string;
    orientacoes_extras: string | null;
}

// =============================================
// COMPONENTE: Fila da Prescrição (com drag-drop)
// =============================================
interface PrescQueueProps {
    orderedIds: number[];
    drogas: AmbDroga[];
    onReorder: (newOrder: number[]) => void;
    onRemove: (id: number) => void;
    onClearAll: () => void;
}

const PrescQueue: React.FC<PrescQueueProps> = ({ orderedIds, drogas, onReorder, onRemove, onClearAll }) => {
    const dragIndexRef = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragIndexRef.current = index;
        e.dataTransfer.effectAllowed = 'move';
        (e.currentTarget as HTMLDivElement).style.opacity = '0.5';
    };
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLDivElement).style.opacity = '1';
        dragIndexRef.current = null;
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = dragIndexRef.current;
        if (dragIndex === null || dragIndex === dropIndex) return;
        const newOrder = [...orderedIds];
        const [moved] = newOrder.splice(dragIndex, 1);
        newOrder.splice(dropIndex, 0, moved);
        onReorder(newOrder);
    };

    const isEmpty = orderedIds.length === 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    Fila da Prescrição
                    {orderedIds.length > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-premium-teal text-white text-[10px] font-black">
                            {orderedIds.length}
                        </span>
                    )}
                </span>
                {!isEmpty && (
                    <button
                        onClick={onClearAll}
                        className="text-[10px] font-semibold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                        title="Limpar tudo"
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
                    <div className="flex flex-col max-h-[168px] overflow-y-auto rx-scrollbar">
                        {orderedIds.map((id, index) => {
                            const droga = drogas.find(d => d.id === id);
                            if (!droga) return null;
                            return (
                                <div
                                    key={id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-grab active:cursor-grabbing group"
                                >
                                    {/* Drag handle */}
                                    <svg className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                                        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                                        <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                                    </svg>
                                    {/* Número */}
                                    <span className="w-4 h-4 rounded-full bg-premium-teal/10 dark:bg-premium-teal/20 text-premium-teal text-[9px] font-black flex items-center justify-center flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    {/* Nome + via */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                                            {droga.nome}
                                            {droga.apresentacao && (
                                                <span className="font-normal text-slate-400 dark:text-slate-500 ml-1">
                                                    — {droga.apresentacao}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">{droga.via}</p>
                                    </div>
                                    {/* Botão X */}
                                    <button
                                        onClick={() => onRemove(id)}
                                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-50 group-hover:opacity-100"
                                        title={`Remover ${droga.nome}`}
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

// =============================================
// RICH TEXT EDITOR
// =============================================
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
            className="w-full p-5 font-mono text-sm text-slate-800 dark:text-slate-200 focus:outline-none overflow-y-auto rx-scrollbar whitespace-pre-wrap leading-relaxed"
            style={{ minHeight: '200px' }}
            suppressContentEditableWarning={true}
        />
    );
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
const PrescricaoLivre: React.FC = () => {
    const { addToQueue } = usePrint();

    // Dados do banco
    const [drogas, setDrogas] = useState<AmbDroga[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Filtros do catálogo
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
    const [selectedSubcategoria, setSelectedSubcategoria] = useState<string | null>(null);
    const [showAllCats, setShowAllCats] = useState(false);

    // Fila (ordenada, sem duplicatas)
    const [orderedIds, setOrderedIds] = useState<number[]>([]);
    // Textos de receita customizados por ID de droga
    const [customTexts, setCustomTexts] = useState<Record<number, string>>({});
    // ID de droga com edição aberta
    const [openEditId, setOpenEditId] = useState<number | null>(null);

    // Orientações gerais
    const [orientacoes, setOrientacoes] = useState('');
    const [showOrientacoes, setShowOrientacoes] = useState(false);

    // Editor / UI
    const editorRef = useRef<HTMLDivElement>(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [addedToQueue, setAddedToQueue] = useState(false);

    // Limites de impressão
    const CHAR_WARN  = 1050;
    const CHAR_LIMIT = 1250;
    const ITEM_LIMIT = 8;
    const CAT_VISIBLE = 5;

    // =============================================
    // FETCH DO SUPABASE
    // =============================================
    useEffect(() => {
        async function fetchDrogas() {
            try {
                setIsFetching(true);
                const { data, error } = await supabase
                    .from('ambulatorio_drogas')
                    .select('*')
                    .order('categoria', { ascending: true })
                    .order('nome', { ascending: true });

                if (error) throw error;
                setDrogas(data || []);
            } catch (err) {
                console.error('Erro ao carregar ambulatorio_drogas:', err);
                setFetchError('Não foi possível carregar a base de medicamentos. Verifique sua conexão.');
            } finally {
                setIsFetching(false);
            }
        }
        fetchDrogas();
    }, []);

    // =============================================
    // CATEGORIAS E SUBCATEGORIAS DERIVADAS
    // =============================================
    const categorias = [...new Set(drogas.map(d => d.categoria))].sort();

    const subcategorias = selectedCategoria
        ? [...new Set(drogas.filter(d => d.categoria === selectedCategoria && d.subcategoria).map(d => d.subcategoria!))].sort()
        : [];

    // =============================================
    // FILTRAGEM DE MEDICAMENTOS
    // =============================================
    const normalize = (str: string) =>
        str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filteredDrogas = drogas.filter(d => {
        if (searchTerm.trim().length >= 2) {
            const term = normalize(searchTerm.trim());
            return normalize(d.nome).includes(term) ||
                   normalize(d.categoria).includes(term) ||
                   (d.subcategoria && normalize(d.subcategoria).includes(term)) ||
                   normalize(d.apresentacao).includes(term);
        }
        if (!selectedCategoria) return true;
        if (selectedSubcategoria) return d.categoria === selectedCategoria && d.subcategoria === selectedSubcategoria;
        return d.categoria === selectedCategoria;
    });

    // =============================================
    // TOGGLE / REMOVER / REORDENAR FILA
    // =============================================
    const toggleDroga = (droga: AmbDroga) => {
        if (orderedIds.includes(droga.id)) {
            // Remove
            setOrderedIds(prev => prev.filter(id => id !== droga.id));
            setOpenEditId(prev => prev === droga.id ? null : prev);
        } else {
            // Adiciona ao final
            setOrderedIds(prev => [...prev, droga.id]);
        }
    };

    const removeDroga = (id: number) => {
        setOrderedIds(prev => prev.filter(i => i !== id));
        setOpenEditId(prev => prev === id ? null : prev);
    };

    const reorderDrogas = (newOrder: number[]) => setOrderedIds(newOrder);

    const clearAll = () => {
        setOrderedIds([]);
        setCustomTexts({});
        setOpenEditId(null);
        setOrientacoes('');
    };

    const handleCustomText = (id: number, value: string) => {
        setCustomTexts(prev => ({ ...prev, [id]: value }));
    };

    const toggleEdit = (id: number) => {
        setOpenEditId(prev => prev === id ? null : id);
    };

    // =============================================
    // GERAR HTML DA PRESCRIÇÃO
    // =============================================
    const generatePrescriptionHtml = useCallback((): string => {
        if (orderedIds.length === 0) return '';

        const selectedDrogas = orderedIds
            .map(id => drogas.find(d => d.id === id))
            .filter(Boolean) as AmbDroga[];

        // Agrupar por via (mantendo a ordem da fila)
        const grouped: Record<string, AmbDroga[]> = {};
        selectedDrogas.forEach(d => {
            const via = d.via || 'USO NÃO ESPECIFICADO';
            if (!grouped[via]) grouped[via] = [];
            grouped[via].push(d);
        });

        let html = '';
        let counter = 1;

        Object.keys(grouped).forEach(via => {
            html += `<div style="text-align: center; margin-top: 10px; margin-bottom: 10px; font-weight: bold;">${via.toUpperCase()}</div>`;
            grouped[via].forEach(droga => {
                const textoBase = customTexts[droga.id] !== undefined
                    ? customTexts[droga.id]
                    : (droga.texto_receita || '');
                const textoLimpo = textoBase.replace(/^\d+[.\-)\s]*/, '').trim();
                html += `<div style="margin-bottom: 14px;">${counter}- ${textoLimpo}</div>`;
                counter++;
            });
        });

        if (orientacoes.trim()) {
            html += `<br/><div style="margin-top: 10px; font-weight: bold;">Orientações gerais:</div>`;
            html += `<div>${orientacoes.replace(/\n/g, '<br/>')}</div>`;
        }

        return html;
    }, [orderedIds, drogas, customTexts, orientacoes]);

    // Atualizar preview sempre que a fila/textos/orientações mudar
    const prescriptionHtml = generatePrescriptionHtml();

    const plainTextLength = prescriptionHtml
        ? prescriptionHtml.replace(/<[^>]*>/gm, ' ').replace(/\s+/g, ' ').trim().length
        : 0;

    const overflowStatus: 'ok' | 'warning' | 'danger' =
        plainTextLength > CHAR_LIMIT ? 'danger'
        : plainTextLength > CHAR_WARN  ? 'warning'
        : 'ok';

    // =============================================
    // AÇÕES
    // =============================================
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
        if (overflowStatus === 'danger') return;
        if (editorRef.current) {
            addToQueue({
                id: 'prescricao-livre-' + Date.now(),
                titulo: `Prescrição Livre (${orderedIds.length} itens)`,
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

    const ToolbarButton = ({ command, icon, title }: { command: string; icon: React.ReactNode; title: string }) => (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleFormat(command); }}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            title={title}
        >
            {icon}
        </button>
    );

    // =============================================
    // LOADING STATE
    // =============================================
    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-premium-teal border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Carregando base de medicamentos...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{fetchError}</p>
                <Link to="/porta" className="text-premium-teal font-bold hover:underline">Voltar ao Ambulatório</Link>
            </div>
        );
    }

    const visibleCats = showAllCats ? categorias : categorias.slice(0, CAT_VISIBLE);

    // =============================================
    // RENDER
    // =============================================
    return (
        <>
            {/* Scrollbar escura — usada pela classe rx-scrollbar */}
            <style>{`
                .rx-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .rx-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .rx-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 99px; }
                .rx-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}</style>

            {/* Toast de adição à fila */}
            {addedToQueue && (
                <div className="fixed top-20 right-5 z-50 animate-bounce">
                    <div className="bg-slate-800 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold">
                        <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Adicionado à fila de impressão!
                    </div>
                </div>
            )}

            <div className="animate-fade-in pb-24" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>

                {/* ── Cabeçalho compacto ───────────────────── */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="/dashboard" className="hover:text-premium-teal transition-colors">Dashboard</Link>
                        <span>/</span>
                        <Link to="/porta" className="hover:text-premium-teal transition-colors">Ambulatório</Link>
                        <span>/</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">Prescrição Livre</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                            Prescrição Livre
                        </h1>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Ambulatório Adulto</span>
                    </div>
                </div>

                {/* ── Grid principal ───────────────────────── */}
                <div className="flex flex-col lg:flex-row gap-4 items-start">

                    {/* ════════════════════════════════════════
                        COLUNA ESQUERDA (44%)
                    ════════════════════════════════════════ */}
                    <div className="w-full lg:w-[44%] flex flex-col gap-3">

                        {/* A. BUSCA */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-4">
                            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                Buscar Medicamento
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (e.target.value.trim().length >= 2) {
                                            setSelectedCategoria(null);
                                            setSelectedSubcategoria(null);
                                        }
                                    }}
                                    placeholder="Digite o nome do medicamento..."
                                    className="w-full pl-9 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all font-medium placeholder-slate-400"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* B. FILA DA PRESCRIÇÃO */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-4">
                            <PrescQueue
                                orderedIds={orderedIds}
                                drogas={drogas}
                                onReorder={reorderDrogas}
                                onRemove={removeDroga}
                                onClearAll={clearAll}
                            />
                        </div>

                        {/* C. CATEGORIAS (compactas) */}
                        {!searchTerm.trim() && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-4">
                                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                                    Categorias
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => {
                                            setSelectedCategoria(null);
                                            setSelectedSubcategoria(null);
                                        }}
                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border-2 transition-all ${
                                            selectedCategoria === null
                                                ? 'bg-premium-teal text-white border-premium-teal'
                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-premium-teal/50 hover:text-premium-teal'
                                        }`}
                                    >
                                        Todas
                                    </button>
                                    {visibleCats.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategoria(selectedCategoria === cat ? null : cat);
                                                setSelectedSubcategoria(null);
                                            }}
                                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border-2 transition-all ${
                                                selectedCategoria === cat
                                                    ? 'bg-premium-teal text-white border-premium-teal'
                                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-premium-teal/50 hover:text-premium-teal'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                    {categorias.length > CAT_VISIBLE && (
                                        <button
                                            onClick={() => setShowAllCats(v => !v)}
                                            className="px-2.5 py-1 text-xs font-bold rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-premium-teal/50 hover:text-premium-teal transition-all"
                                        >
                                            {showAllCats ? '▲ Menos' : `+${categorias.length - CAT_VISIBLE} mais`}
                                        </button>
                                    )}
                                </div>

                                {/* Subcategorias */}
                                {subcategorias.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                                        <button
                                            onClick={() => setSelectedSubcategoria(null)}
                                            className={`px-2 py-1 text-[11px] font-bold rounded border transition-all ${
                                                !selectedSubcategoria
                                                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 border-slate-800 dark:border-slate-200'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                                            }`}
                                        >
                                            Todas
                                        </button>
                                        {subcategorias.map(sub => (
                                            <button
                                                key={sub}
                                                onClick={() => setSelectedSubcategoria(selectedSubcategoria === sub ? null : sub)}
                                                className={`px-2 py-1 text-[11px] font-bold rounded border transition-all ${
                                                    selectedSubcategoria === sub
                                                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 border-slate-800 dark:border-slate-200'
                                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                                                }`}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* D. BANCO DE MEDICAMENTOS */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card p-4">
                            <div className="flex items-center justify-between mb-2.5">
                                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {searchTerm.trim().length >= 2 ? `Resultados (${filteredDrogas.length})` : 'Medicamentos'}
                                </label>
                                {filteredDrogas.length > 0 && (
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{filteredDrogas.length} itens</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto rx-scrollbar pr-0.5">
                                {filteredDrogas.length > 0 ? filteredDrogas.map(droga => {
                                    const isSelected = orderedIds.includes(droga.id);
                                    const isEditOpen = openEditId === droga.id;
                                    return (
                                        <div
                                            key={droga.id}
                                            className={`rounded-lg border transition-all ${
                                                isSelected
                                                    ? 'bg-premium-teal/5 dark:bg-premium-teal/10 border-premium-teal/60'
                                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-premium-teal/30'
                                            }`}
                                        >
                                            {/* Linha clicável principal */}
                                            <div
                                                onClick={() => toggleDroga(droga)}
                                                className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
                                            >
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate leading-tight">
                                                        {droga.nome}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 block leading-tight mt-0.5 truncate">
                                                        {droga.apresentacao}{droga.via && <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>}{droga.via}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    {isSelected && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleEdit(droga.id); }}
                                                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                                                isEditOpen
                                                                    ? 'bg-amber-500 border-amber-500 text-white'
                                                                    : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-amber-400 hover:text-amber-500'
                                                            }`}
                                                            title="Editar texto da receita"
                                                        >
                                                            ✏️ editar
                                                        </button>
                                                    )}
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                                        isSelected
                                                            ? 'bg-premium-teal border-premium-teal'
                                                            : 'border-slate-300 dark:border-slate-600 group-hover:border-premium-teal/50'
                                                    }`}>
                                                        {isSelected && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Accordion: editar texto da receita */}
                                            {isSelected && isEditOpen && (
                                                <div className="px-3 pb-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                                                        Texto da receita:
                                                    </label>
                                                    <textarea
                                                        rows={3}
                                                        value={customTexts[droga.id] !== undefined ? customTexts[droga.id] : droga.texto_receita}
                                                        onChange={(e) => handleCustomText(droga.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-premium-teal/30 focus:border-premium-teal transition-all resize-none rx-scrollbar"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8 italic">
                                        Nenhum medicamento encontrado.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* E. ORIENTAÇÕES GERAIS (recolhível) */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
                            <button
                                onClick={() => setShowOrientacoes(!showOrientacoes)}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    {showOrientacoes ? '▾' : '▸'} Orientações Gerais
                                    {orientacoes.trim() && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-premium-teal inline-block" />
                                    )}
                                </span>
                                <span className="text-[11px] text-slate-400">{showOrientacoes ? 'fechar' : 'opcional'}</span>
                            </button>
                            {showOrientacoes && (
                                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                                    <textarea
                                        rows={3}
                                        value={orientacoes}
                                        onChange={(e) => setOrientacoes(e.target.value)}
                                        placeholder="Ex: Retorno em 7 dias, manter hidratação oral..."
                                        className="w-full mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all text-sm resize-none rx-scrollbar placeholder-slate-400"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ════════════════════════════════════════
                        COLUNA DIREITA (56%) — Preview sticky
                    ════════════════════════════════════════ */}
                    <div className="w-full lg:w-[56%] lg:sticky lg:top-[80px]" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                        <div
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col overflow-hidden"
                            style={{ maxHeight: 'calc(100vh - 100px)' }}
                        >
                            {/* Header do preview */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-premium-teal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Prescrição</h2>
                                    {orderedIds.length > 0 && (
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                                            <strong className="text-premium-teal">{orderedIds.length}</strong> {orderedIds.length === 1 ? 'item' : 'itens'}
                                        </span>
                                    )}
                                </div>
                                {orderedIds.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-[10px] font-bold text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Limpar tudo
                                    </button>
                                )}
                            </div>

                            {orderedIds.length > 0 ? (
                                <>
                                    {/* Toolbar de formatação */}
                                    <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                                        <ToolbarButton command="bold" title="Negrito" icon={
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                                            </svg>
                                        } />
                                        <ToolbarButton command="underline" title="Sublinhado" icon={
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
                                            </svg>
                                        } />
                                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-0.5" />
                                        <ToolbarButton command="justifyLeft" title="Alinhar esquerda" icon={
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                                <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
                                                <line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
                                            </svg>
                                        } />
                                        <ToolbarButton command="justifyCenter" title="Centralizar" icon={
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                                <line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
                                                <line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" />
                                            </svg>
                                        } />
                                        <div className="ml-auto flex items-center gap-1 pr-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Editável</span>
                                        </div>
                                    </div>

                                    {/* Aviso de overflow */}
                                    {overflowStatus !== 'ok' && (
                                        <div className={`mx-3 mt-3 flex items-start gap-2 p-3 rounded-lg border flex-shrink-0 ${
                                            overflowStatus === 'danger'
                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50'
                                                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50'
                                        }`}>
                                            <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${overflowStatus === 'danger' ? 'text-red-500' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                            <p className={`text-xs font-bold ${overflowStatus === 'danger' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                                {overflowStatus === 'danger'
                                                    ? 'Prescrição excede o espaço do receituário — reduza o conteúdo'
                                                    : 'Texto próximo do limite da folha — revise antes de imprimir'
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* Editor scrollável */}
                                    <div className="flex-1 overflow-hidden mx-3 mt-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                                        <div className="h-full overflow-y-auto rx-scrollbar">
                                            <RichTextEditor
                                                key={orderedIds.join('-') + Object.entries(customTexts).join('') + orientacoes}
                                                editorRef={editorRef}
                                                initialHtml={prescriptionHtml}
                                            />
                                        </div>
                                    </div>

                                    {/* Contador de caracteres */}
                                    <div className={`mx-3 mt-2 px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] font-bold flex-shrink-0 ${
                                        overflowStatus === 'danger'
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                                            : overflowStatus === 'warning'
                                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                            : 'bg-slate-50 dark:bg-slate-900/50 text-slate-400'
                                    }`}>
                                        <span>Espaço da folha</span>
                                        <span className="tabular-nums">{plainTextLength} / {CHAR_LIMIT}</span>
                                    </div>

                                    {/* Aviso limite de itens */}
                                    {orderedIds.length >= ITEM_LIMIT && (
                                        <div className="mx-3 mt-1 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg flex-shrink-0">
                                            <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                                                Limite recomendado atingido. Muitos itens podem exceder o receituário.
                                            </p>
                                        </div>
                                    )}

                                    {/* Botões de ação */}
                                    <div className="flex gap-2 px-3 py-3 flex-shrink-0">
                                        <button
                                            onClick={handleAddToQueue}
                                            disabled={overflowStatus === 'danger'}
                                            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-bold text-white transition-all rounded-xl focus:outline-none ${
                                                overflowStatus === 'danger'
                                                    ? 'bg-red-300 dark:bg-red-900/40 cursor-not-allowed opacity-60'
                                                    : addedToQueue
                                                    ? 'bg-green-600'
                                                    : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'
                                            }`}
                                        >
                                            {overflowStatus === 'danger' ? (
                                                <><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>Excede a folha</>
                                            ) : addedToQueue ? (
                                                <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Adicionado!</>
                                            ) : (
                                                <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>Mandar p/ Impressão</>
                                            )}
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-bold text-white transition-colors rounded-xl bg-premium-teal hover:bg-premium-teal/90 focus:outline-none"
                                        >
                                            {copySuccess ? (
                                                <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Copiado!</>
                                            ) : (
                                                <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>Copiar Rascunho</>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* Estado vazio — discreto e profissional */
                                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4">
                                        <svg className="w-7 h-7 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-1.5">Prescrição vazia</h3>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
                                        Selecione uma <strong className="text-slate-500 dark:text-slate-400">categoria</strong> à esquerda e clique nos medicamentos para montar a prescrição.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrescricaoLivre;
