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

interface PrescItem {
    uid: string;           // id único na receita (para remoção)
    droga: AmbDroga;
}

// =============================================
// RICH TEXT EDITOR (mesmo padrão da Pediatria)
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
            className="w-full p-8 font-mono text-base text-slate-800 dark:text-slate-200 focus:outline-none min-h-[400px] overflow-y-auto whitespace-pre-wrap leading-relaxed"
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

    // Filtros do painel esquerdo
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
    const [selectedSubcategoria, setSelectedSubcategoria] = useState<string | null>(null);

    // Prescrição montada
    const [prescItems, setPrescItems] = useState<PrescItem[]>([]);
    const [orientacoes, setOrientacoes] = useState('');

    // Editor / UI
    const editorRef = useRef<HTMLDivElement>(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [addedToQueue, setAddedToQueue] = useState(false);

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
    const filteredDrogas = drogas.filter(d => {
        if (searchTerm.trim().length >= 2) {
            const term = searchTerm.toLowerCase();
            return d.nome.toLowerCase().includes(term) ||
                   d.categoria.toLowerCase().includes(term) ||
                   (d.subcategoria && d.subcategoria.toLowerCase().includes(term)) ||
                   d.apresentacao.toLowerCase().includes(term);
        }
        if (!selectedCategoria) return false;
        if (selectedSubcategoria) return d.categoria === selectedCategoria && d.subcategoria === selectedSubcategoria;
        return d.categoria === selectedCategoria;
    });

    // =============================================
    // ADICIONAR / REMOVER ITEM DA PRESCRIÇÃO
    // =============================================
    const addItem = (droga: AmbDroga) => {
        const uid = `${droga.id}-${Date.now()}`;
        setPrescItems(prev => [...prev, { uid, droga }]);
    };

    const removeItem = (uid: string) => {
        setPrescItems(prev => prev.filter(item => item.uid !== uid));
    };

    const clearAll = () => {
        setPrescItems([]);
        setOrientacoes('');
    };

    // =============================================
    // GERAR HTML DA PRESCRIÇÃO
    // =============================================
    const generatePrescriptionHtml = useCallback((): string => {
        if (prescItems.length === 0) return '';

        // Agrupar por via
        const grouped: Record<string, PrescItem[]> = {};
        prescItems.forEach(item => {
            const via = item.droga.via || 'USO NÃO ESPECIFICADO';
            if (!grouped[via]) grouped[via] = [];
            grouped[via].push(item);
        });

        let html = '';
        let counter = 1;

        Object.keys(grouped).forEach(via => {
            html += `<div style="text-align: center; margin-top: 10px; margin-bottom: 10px; font-weight: bold;">${via.toUpperCase()}</div>`;

            grouped[via].forEach(item => {
                // Usa texto_receita do banco com numeração dinâmica
                const textoBase = item.droga.texto_receita || '';
                // Substitui qualquer numeração existente no início do texto
                const textoLimpo = textoBase.replace(/^\d+[\.\-\)\s]*/, '').trim();
                html += `<div style="margin-bottom: 14px;">${counter}- ${textoLimpo}</div>`;
                counter++;
            });
        });

        if (orientacoes.trim()) {
            html += `<br/><div style="margin-top: 10px; font-weight: bold;">Orientações gerais:</div>`;
            html += `<div>${orientacoes.replace(/\n/g, '<br/>')}</div>`;
        }

        return html;
    }, [prescItems, orientacoes]);

    // Gerar prescrição sempre que mudar
    const prescriptionHtml = generatePrescriptionHtml();

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
        if (editorRef.current) {
            addToQueue({
                id: 'prescricao-livre-' + Date.now(),
                titulo: `Prescrição Livre (${prescItems.length} itens)`,
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
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat(command); }} className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title={title}>
            {icon}
        </button>
    );

    // =============================================
    // LOADING STATE
    // =============================================
    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-premium-teal border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Carregando base de medicamentos...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{fetchError}</p>
                <Link to="/porta" className="text-premium-teal font-bold hover:underline">Voltar ao Ambulatório</Link>
            </div>
        );
    }

    // =============================================
    // RENDER
    // =============================================
    return (
        <div className="container mx-auto px-4 lg:px-8 space-y-8 animate-fade-in pb-20 max-w-[1400px]">

            {/* Cabeçalho */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm mb-2">
                    <Link to="/dashboard" className="hover:text-premium-teal transition-colors">Dashboard</Link>
                    <span>/</span>
                    <Link to="/porta" className="hover:text-premium-teal transition-colors">Ambulatório</Link>
                    <span>/</span>
                    <span>Prescrição Livre</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                    Prescrição Livre
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                    Monte uma prescrição personalizada para o atendimento ambulatorial.
                </p>
            </div>

            {/* Toast de adição à fila */}
            {addedToQueue && (
                <div className="fixed top-20 right-5 z-50 animate-bounce">
                    <div className="bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Adicionado à fila de impressão!
                    </div>
                </div>
            )}

            {/* Layout lado a lado */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* ===== PAINEL ESQUERDO: Catálogo ===== */}
                <div className="w-full lg:w-[45%] bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6 md:p-8 space-y-6 lg:sticky lg:top-24">

                    {/* Busca */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-2">
                            Buscar Medicamento
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value.trim().length >= 2) { setSelectedCategoria(null); setSelectedSubcategoria(null); } }}
                                placeholder="Digite o nome do medicamento..."
                                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all font-medium placeholder-slate-400"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categorias */}
                    {!searchTerm.trim() && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-3">
                                Categorias
                            </label>
                            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                {categorias.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategoria(selectedCategoria === cat ? null : cat); setSelectedSubcategoria(null); }}
                                        className={`px-3 py-2 text-sm font-bold rounded-xl border-2 transition-all ${
                                            selectedCategoria === cat
                                                ? 'bg-premium-teal text-white border-premium-teal shadow-md'
                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-premium-teal/50'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subcategorias */}
                    {!searchTerm.trim() && subcategorias.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                Subcategorias de {selectedCategoria}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedSubcategoria(null)}
                                    className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                        !selectedSubcategoria
                                            ? 'bg-slate-800 text-white border-slate-800'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                                    }`}
                                >
                                    Todas
                                </button>
                                {subcategorias.map(sub => (
                                    <button
                                        key={sub}
                                        onClick={() => setSelectedSubcategoria(selectedSubcategoria === sub ? null : sub)}
                                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                            selectedSubcategoria === sub
                                                ? 'bg-slate-800 text-white border-slate-800'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                                        }`}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lista de Medicamentos */}
                    <div>
                        {(selectedCategoria || searchTerm.trim().length >= 2) && (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                        {searchTerm.trim().length >= 2 ? `Resultados (${filteredDrogas.length})` : 'Medicamentos'}
                                    </label>
                                    {filteredDrogas.length > 0 && (
                                        <span className="text-xs text-slate-400 font-medium">{filteredDrogas.length} itens</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                    {filteredDrogas.length > 0 ? filteredDrogas.map(droga => {
                                        const isInPrescription = prescItems.some(p => p.droga.id === droga.id);
                                        return (
                                            <button
                                                key={droga.id}
                                                onClick={() => addItem(droga)}
                                                className={`flex items-start text-left p-4 rounded-xl border-2 transition-all group ${
                                                    isInPrescription
                                                        ? 'bg-premium-teal/5 border-premium-teal/40 dark:border-premium-teal/30'
                                                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-premium-teal/50 hover:bg-white dark:hover:bg-slate-900'
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-[14px] block">
                                                        {droga.nome}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                                                        {droga.apresentacao} • {droga.via}
                                                    </span>
                                                    {droga.posologia_padrao && (
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1 italic">
                                                            {droga.posologia_padrao}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ml-3 mt-0.5 ${
                                                    isInPrescription
                                                        ? 'bg-premium-teal text-white'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 group-hover:bg-premium-teal group-hover:text-white'
                                                }`}>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </div>
                                            </button>
                                        );
                                    }) : (
                                        <div className="py-8 text-center text-sm text-slate-400 font-medium">
                                            Nenhum medicamento encontrado.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {!selectedCategoria && searchTerm.trim().length < 2 && (
                            <div className="py-10 text-center">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Selecione uma categoria</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">ou busque pelo nome do medicamento acima.</p>
                            </div>
                        )}
                    </div>

                    {/* Orientações gerais */}
                    {prescItems.length > 0 && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-2">
                                Orientações Gerais (Opcional)
                            </label>
                            <textarea
                                rows={3}
                                value={orientacoes}
                                onChange={(e) => setOrientacoes(e.target.value)}
                                placeholder="Ex: Retorno em 7 dias, manter hidratação oral..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all text-sm resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* ===== PAINEL DIREITO: Preview ===== */}
                <div className="w-full lg:w-[55%]">
                    {prescItems.length > 0 ? (
                        <div className="p-6 md:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 transition-all">

                            {/* Header do preview */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 gap-3">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                                        <svg className="w-6 h-6 text-premium-teal animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        Prescrição
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium mt-0.5">
                                        {prescItems.length} {prescItems.length === 1 ? 'item' : 'itens'} adicionados
                                    </p>
                                </div>
                                <button
                                    onClick={clearAll}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Limpar tudo
                                </button>
                            </div>

                            {/* Lista de itens removíveis */}
                            <div className="mb-4 space-y-1">
                                {prescItems.map((item, idx) => (
                                    <div key={item.uid} className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg group">
                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
                                            <span className="text-premium-teal font-bold mr-1.5">{idx + 1}.</span>
                                            {item.droga.nome} <span className="text-slate-400 font-normal">• {item.droga.via}</span>
                                        </span>
                                        <button
                                            onClick={() => removeItem(item.uid)}
                                            className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 transition-opacity flex-shrink-0"
                                            title="Remover item"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Editor rico */}
                            <div className="mb-6 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm relative">
                                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-2">
                                    <div className="flex items-center gap-1 p-2">
                                        <ToolbarButton command="bold" title="Negrito" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>} />
                                        <ToolbarButton command="underline" title="Sublinhado" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>} />
                                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                                        <ToolbarButton command="justifyLeft" title="Esquerda" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>} />
                                        <ToolbarButton command="justifyCenter" title="Centro" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-bold pr-4 uppercase tracking-widest flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Editável
                                    </span>
                                </div>

                                <RichTextEditor
                                    key={prescItems.map(p => p.uid).join('-') + orientacoes}
                                    editorRef={editorRef}
                                    initialHtml={prescriptionHtml}
                                />
                            </div>

                            {/* Botões de ação */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddToQueue}
                                    className={`flex-1 flex items-center justify-center px-4 py-4 font-bold text-white transition-all duration-200 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        addedToQueue
                                            ? 'bg-green-600 focus:ring-green-500'
                                            : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 focus:ring-slate-500'
                                    }`}
                                >
                                    {addedToQueue ? (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Prontinho!</>
                                    ) : (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Mandar p/ Impressão</>
                                    )}
                                </button>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 flex items-center justify-center px-4 py-4 font-bold text-white transition-colors duration-200 rounded-xl shadow bg-premium-teal hover:bg-premium-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-teal"
                                >
                                    {copySuccess ? (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Copiado</>
                                    ) : (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Copiar Texto</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Estado vazio */
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/50 p-10 text-center shadow-sm">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <svg className="w-12 h-12 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-500 dark:text-slate-400 mb-2">Prescrição vazia</h3>
                            <p className="text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
                                Selecione uma <strong>categoria</strong> à esquerda e clique nos medicamentos para montar a prescrição automaticamente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrescricaoLivre;
