import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';
// IMPORTANTE: Ajuste este caminho para o seu ficheiro de configuração do Supabase
import { supabase } from "../services/supabase";

interface RichTextEditorProps {
    initialHtml: string;
    editorRef: React.RefObject<HTMLDivElement>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialHtml, editorRef }) => {
    useEffect(() => {
        if (editorRef.current) {
            // Because we are reactive, update the HTML whenever initialHtml changes
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

// ==========================================
// 1. ESTRUTURA DE DADOS (Espelho do Supabase)
// ==========================================
interface Medication {
    id: number;
    nome: string;
    apresentacao: string;
    via: string;
    regra_calculo: string; // Ex: 'Peso * 0.2', 'Fixo: 1'
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

const quickWeights = [5, 10, 15, 20, 25, 30];

const PediatriaPage: React.FC = () => {
    const { addToQueue } = usePrint();

    // Estados da Interface
    const [weight, setWeight] = useState<string>('');
    const [mode, setMode] = useState<'prontas' | 'livre'>('livre');
    const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
    const [selectedMeds, setSelectedMeds] = useState<number[]>([]);
    const [customPosologies, setCustomPosologies] = useState<Record<number, string>>({});
    const [searchTerm, setSearchTerm] = useState('');

    // Estados de Controlo e Dados Dinâmicos
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
    // 2. BUSCAR DADOS NO SUPABASE AO CARREGAR
    // ==========================================
    useEffect(() => {
        async function fetchSupabaseData() {
            try {
                setIsFetchingDB(true);

                // 1. Vai buscar os medicamentos
                const { data: medsData, error: medsError } = await supabase
                    .from('pediatria_medicamentos')
                    .select('*')
                    .order('nome', { ascending: true });

                if (medsError) throw medsError;

                // 2. Vai buscar os protocolos
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
    // 3. MOTOR DE CÁLCULO NATIVO
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

        // Somente se houver peso válido
        if (!weight || isNaN(w) || w <= 0) {
            setGeneratedPrescription(null);
            return;
        }

        let selectedMedsData: Medication[] = [];
        let orientacoesFinais = orientacoes;

        if (mode === 'livre') {
            if (selectedMeds.length === 0) {
                setGeneratedPrescription(null);
                return;
            }
            selectedMedsData = medications.filter(m => selectedMeds.includes(m.id));
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

        // Real-time generator
        const htmlOutput = generateHtmlPrescription(selectedMedsData, w, orientacoesFinais, customPosologies);
        setGeneratedPrescription(htmlOutput);

    }, [weight, mode, selectedProtocol, selectedMeds, customPosologies, orientacoes, medications, protocols, generateHtmlPrescription]);

    // ==========================================
    // AÇÕES DA INTERFACE
    // ==========================================
    const toggleMed = (id: number) => {
        setSelectedMeds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const handleCustomPosology = (medId: number, value: string) => {
        setCustomPosologies(prev => ({ ...prev, [medId]: value }));
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
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat(command); }} className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title={title}>
            {icon}
        </button>
    );

    if (isFetchingDB) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-premium-teal border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300">A carregar base de dados de medicamentos...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 lg:px-8 space-y-8 animate-fade-in pb-20 max-w-[1400px]">
            {/* Cabeçalho */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm mb-2">
                    <Link to="/dashboard" className="hover:text-premium-teal transition-colors">Dashboard</Link>
                    <span>/</span>
                    <span>Pediatria</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                    Prescrição Pediátrica Dinâmica
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                    Cálculo avançado de doses com Quick Entry & Live Preview.
                </p>
            </div>

            {addedToQueue && (
                <div className="fixed top-20 right-5 z-50 animate-bounce">
                    <div className="bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Adicionado à fila de impressão!
                    </div>
                </div>
            )}

            {/* Layout Lado a Lado (Em Desktop) */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* 🔴 COLUNA ESQUERDA: Controles e Inputs */}
                <div className="w-full lg:w-[45%] bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-6 md:p-8 space-y-8 lg:sticky lg:top-24">

                    {/* Input de Peso + Quick Entry */}
                    <div className="space-y-4">
                        <label htmlFor="weight" className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                            Peso da Criança (kg)
                        </label>
                        <div className="relative">
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
                                className="w-full text-4xl font-black text-premium-teal bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-4 focus:outline-none focus:border-premium-teal focus:ring-4 focus:ring-premium-teal/10 transition-all placeholder-slate-300 dark:placeholder-slate-700"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">kg</span>
                        </div>
                        {error && <p className="text-sm font-bold text-red-500 mt-1">{error}</p>}

                        {/* Quick Weight Pills */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {quickWeights.map(w => (
                                <button
                                    key={w}
                                    onClick={() => { setWeight(w.toString()); setError(null); }}
                                    className="px-3 py-1.5 text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-premium-teal hover:text-white transition-colors"
                                >
                                    {w}kg
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Seleção de Modo */}
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setMode('prontas')} className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'prontas' ? 'border-premium-teal bg-premium-teal/5 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-premium-teal/50'}`}>
                            <h3 className="font-bold text-slate-800 dark:text-white">Protocolos Prontos</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">Kits de clínica</p>
                        </button>
                        <button onClick={() => setMode('livre')} className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'livre' ? 'border-premium-teal bg-premium-teal/5 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-premium-teal/50'}`}>
                            <h3 className="font-bold text-slate-800 dark:text-white">Prescrição Livre</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">Personalizado</p>
                        </button>
                    </div>

                    {/* Conteúdo Dinâmico do Modo */}
                    {mode === 'prontas' ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                Condição Clínica
                            </label>
                            <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {protocols.map((protocol) => (
                                    <button
                                        key={protocol.id}
                                        onClick={() => setSelectedProtocol(protocol.id)}
                                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-all text-left flex items-center justify-between ${selectedProtocol === protocol.id ? 'bg-premium-teal text-white border-premium-teal' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-premium-teal'}`}
                                    >
                                        {protocol.nome_condicao}
                                        {selectedProtocol === protocol.id && (
                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                    Medicamentos do Banco
                                </label>
                            </div>

                            {/* Busca */}
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar medicamento..."
                                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all font-medium placeholder-slate-400"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {medications.filter(med => {
                                    if (searchTerm.trim().length >= 2) {
                                        const term = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                        const nome = med.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                        const apresentacao = med.apresentacao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                        return nome.includes(term) || apresentacao.includes(term);
                                    }
                                    return true;
                                }).map((med) => {
                                    const isSelected = selectedMeds.includes(med.id);
                                    return (
                                        <div key={med.id} className={`flex flex-col rounded-xl border transition-all ${isSelected ? 'bg-premium-teal/5 border-premium-teal shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-premium-teal/30'}`}>
                                            <div
                                                onClick={() => toggleMed(med.id)}
                                                className="flex items-center justify-between p-4 cursor-pointer"
                                            >
                                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                                    {med.nome} <span className="text-xs text-slate-500 font-normal block">{med.apresentacao}</span>
                                                </span>
                                                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-premium-teal border-premium-teal' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                </div>
                                            </div>

                                            {/* Edição On-The-Fly Ativa apenas se selecionado */}
                                            {isSelected && (
                                                <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-3 mt-1 animate-fade-in">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">✏️ Ajustar Posologia Padrão:</label>
                                                    <input
                                                        type="text"
                                                        value={customPosologies[med.id] !== undefined ? customPosologies[med.id] : med.posologia_padrao}
                                                        onChange={(e) => handleCustomPosology(med.id, e.target.value)}
                                                        className="w-full mt-2 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-premium-teal transition-all"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-2">
                            Orientações Gerais Fixas (Opcional)
                        </label>
                        <textarea
                            rows={3}
                            value={orientacoes}
                            onChange={(e) => setOrientacoes(e.target.value)}
                            placeholder="Ex: Refazer exames após 7 dias, manter hidratação..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-premium-teal/20 focus:border-premium-teal transition-all text-sm resize-none"
                        />
                    </div>
                </div>

                {/* 🔵 COLUNA DIREITA: Preview em Tempo Real */}
                <div className="w-full lg:w-[55%]">
                    {generatedPrescription ? (
                        <div className="p-6 md:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 transition-all">
                            <div className="flex flex-col items-start mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                                    <svg className="w-6 h-6 text-premium-teal animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    Visualização Dinâmica
                                </h2>
                                <p className="text-slate-500 text-sm mt-1 font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600">
                                    Rascunho calculado para <strong className="text-premium-teal">{weight}kg</strong>
                                </p>
                            </div>

                            <div className="mb-6 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm relative">
                                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-2">
                                    <div className="flex items-center gap-1 p-2">
                                        <ToolbarButton command="bold" title="Negrito" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>} />
                                        <ToolbarButton command="underline" title="Sublinhado" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>} />
                                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                                        <ToolbarButton command="justifyLeft" title="Esquerda" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>} />
                                        <ToolbarButton command="justifyCenter" title="Centro" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-bold pr-4 uppercase tracking-widest flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live</span>
                                </div>

                                <RichTextEditor key={weight + mode + selectedProtocol + selectedMeds.join('-')} editorRef={editorRef} initialHtml={generatedPrescription} />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={handleAddToQueue} className={`flex-1 flex items-center justify-center px-4 py-4 font-bold text-white transition-all duration-200 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${addedToQueue ? 'bg-green-600 focus:ring-green-500' : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 focus:ring-slate-500'}`}>
                                    {addedToQueue ? (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Prontinho!</>
                                    ) : (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Mandar p/ Impressão</>
                                    )}
                                </button>
                                <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center px-4 py-4 font-bold text-white transition-colors duration-200 rounded-xl shadow bg-premium-teal hover:bg-premium-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-premium-teal">
                                    {copySuccess ? (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Copiado</>
                                    ) : (
                                        <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Copiar Rascunho</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/50 p-10 text-center shadow-sm">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <svg className="w-12 h-12 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-500 dark:text-slate-400 mb-2">Editor Ocioso</h3>
                            <p className="text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
                                Para visualizar o rascunho mágico: <br /> <strong>1. Insira o Peso</strong> e <strong>2. Selecione os medicamentos.</strong>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PediatriaPage;