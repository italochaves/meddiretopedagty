
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Types ---
type FlowStep = 
    | 'INITIAL' 
    | 'UNSTABLE' 
    | 'UNSTABLE_FAILURE' // Novo estado para falha terapêutica
    | 'STABLE_CHECK_QRS' 
    | 'WIDE_QRS' 
    | 'NARROW_CHECK_RHYTHM' 
    | 'NARROW_IRREGULAR' 
    | 'NARROW_REGULAR'
    | 'RESOLVED';

// --- Components ---

const BackButton: React.FC<{ onClick: () => void, isRoot: boolean }> = ({ onClick, isRoot }) => {
    if (isRoot) {
        return (
            <Link to="/emergencia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Sair
            </Link>
        );
    }
    return (
        <button onClick={onClick} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
        </button>
    );
};

// Card de Pergunta (Decisão)
const QuestionCard: React.FC<{ 
    title: string; 
    subtitle?: string; 
    symptoms?: string[];
    onYes: () => void; 
    onNo: () => void;
    yesLabel?: string;
    noLabel?: string;
    isUrgent?: boolean;
}> = ({ title, subtitle, symptoms, onYes, onNo, yesLabel = "SIM", noLabel = "NÃO", isUrgent = false }) => (
    <div className="flex flex-col items-center animate-fade-in w-full max-w-2xl mx-auto">
        <div className={`w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-t-8 ${isUrgent ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mb-4 text-center leading-tight">
                {title}
            </h2>
            
            {subtitle && (
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-6 text-center font-medium">
                    {subtitle}
                </p>
            )}

            {symptoms && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-5 mb-8">
                    <ul className="space-y-3">
                        {symptoms.map((sym, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-red-700 dark:text-red-300 font-bold">
                                <span className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                {sym}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:gap-6 mt-4">
                <button 
                    onClick={onYes}
                    className={`py-4 px-6 rounded-xl text-lg font-bold shadow-lg transform active:scale-95 transition-all ${isUrgent ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30' : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                >
                    {yesLabel}
                </button>
                <button 
                    onClick={onNo}
                    className="py-4 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-lg font-bold shadow-sm transform active:scale-95 transition-all"
                >
                    {noLabel}
                </button>
            </div>
        </div>
    </div>
);

// Card de Resultado / Conduta
const ResultCard: React.FC<{
    title: string;
    items?: string[];
    children?: React.ReactNode;
    color: 'red' | 'orange' | 'blue' | 'green';
    followUp?: { question: string, onYes: () => void, onNo: () => void };
}> = ({ title, items, children, color, followUp }) => {
    
    const styles = {
        red: { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-900/10', title: 'text-red-700 dark:text-red-400' },
        orange: { border: 'border-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10', title: 'text-orange-700 dark:text-orange-400' },
        blue: { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', title: 'text-blue-700 dark:text-blue-400' },
        green: { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-900/10', title: 'text-green-700 dark:text-green-400' },
    };

    const s = styles[color];

    return (
        <div className="flex flex-col items-center animate-fade-in w-full max-w-3xl mx-auto pb-10">
            <div className={`w-full rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-slate-800 border-t-8 ${s.border}`}>
                <div className={`p-6 border-b border-slate-100 dark:border-slate-700 ${s.bg}`}>
                    <h2 className={`text-2xl font-black uppercase tracking-wide ${s.title}`}>
                        {title}
                    </h2>
                </div>
                
                <div className="p-6 md:p-8">
                    {items && (
                        <ul className="space-y-4 mb-6">
                            {items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-lg font-medium text-slate-700 dark:text-slate-300">
                                    <span className={`mt-2 w-2 h-2 rounded-full shrink-0 bg-current opacity-60`} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    {children}

                    {followUp && (
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-lg mb-4 text-center text-slate-800 dark:text-white">{followUp.question}</p>
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={followUp.onYes}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-colors"
                                >
                                    SIM
                                </button>
                                <button 
                                    onClick={followUp.onNo}
                                    className="px-8 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-lg shadow-md transition-colors"
                                >
                                    NÃO
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Card Específico para Amiodarona
const AmiodaroneProtocolCard: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-xl p-5">
            <h3 className="font-bold text-orange-800 dark:text-orange-200 uppercase text-sm mb-3">1. Dose de Ataque</h3>
            <p className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                Amiodarona 150 mg (1 amp) + 100 mL SG 5%
            </p>
            <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                Administrar EV em 10 minutos.
            </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 uppercase text-sm mb-4">2. Protocolo de Manutenção (24h)</h3>
            
            <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg font-mono text-sm border border-slate-200 dark:border-slate-600">
                <strong>Preparo da Solução:</strong><br/>
                900 mg (6 ampolas) + 482 mL SG 5% <br/>
                <span className="text-xs text-slate-500">(Volume total: 500 mL | Conc: 1,8 mg/mL)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                    <span className="block text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">Primeiras 6 horas</span>
                    <span className="block text-3xl font-extrabold text-slate-800 dark:text-white my-1">33,3 mL/h</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">(1 mg/min)</span>
                </div>
                <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-r-lg">
                    <span className="block text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase">Próximas 18 horas</span>
                    <span className="block text-3xl font-extrabold text-slate-800 dark:text-white my-1">16,6 mL/h</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">(0,5 mg/min)</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-700 dark:text-slate-200 mb-1">Ritmo Regular e Monomórfico?</strong>
                <span className="text-slate-600 dark:text-slate-400">Pode tentar <strong>Adenosina 6mg</strong> para diagnóstico/tratamento.</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-700 dark:text-slate-200 mb-1">Torsades de Pointes?</strong>
                <span className="text-slate-600 dark:text-slate-400">Fazer <strong>Sulfato de Magnésio 2g</strong> EV.</span>
            </div>
        </div>
    </div>
);

// --- Main Page Component ---

const TaquiarritmiasPage: React.FC = () => {
    const [history, setHistory] = useState<FlowStep[]>(['INITIAL']);
    const currentStep = history[history.length - 1];

    const navigateTo = (step: FlowStep) => {
        setHistory(prev => [...prev, step]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => {
        if (history.length > 1) {
            setHistory(prev => prev.slice(0, -1));
        }
    };

    const resetFlow = () => {
        setHistory(['INITIAL']);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 shadow-md">
                <div className="bg-red-600 text-white py-3 px-4 text-center">
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9v8l10-12h-9l9-8z"/></svg>
                        FC {'>'} 150 BPM
                    </h1>
                </div>
                {/* Mnemonic MOVE */}
                <div className="bg-slate-800 text-slate-200 py-2 px-4 text-xs md:text-sm font-mono font-bold text-center border-t border-red-700">
                    <span className="text-red-400">M</span>onitorização • <span className="text-red-400">O</span>xigênio (se Sat{'<'}90%) • <span className="text-red-400">V</span>eia • <span className="text-red-400">E</span>letrocardiograma
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 pt-6 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <BackButton onClick={goBack} isRoot={history.length === 1} />
                    {history.length > 1 && (
                        <button onClick={resetFlow} className="text-xs font-bold text-premium-teal uppercase tracking-wider hover:underline">
                            Reiniciar Fluxo
                        </button>
                    )}
                </div>

                {/* --- STATE MACHINE --- */}

                {/* PASSO 1: INSTABILIDADE */}
                {currentStep === 'INITIAL' && (
                    <QuestionCard
                        title="Instabilidade Hemodinâmica?"
                        subtitle="A taquiarritmia está causando algum dos sinais abaixo?"
                        symptoms={[
                            "Rebaixamento do nível de consciência",
                            "Sinais de Choque / Hipotensão aguda",
                            "Dor torácica anginosa",
                            "Insuficiência cardíaca aguda"
                        ]}
                        yesLabel="SIM (Instável)"
                        noLabel="NÃO (Estável)"
                        isUrgent={true}
                        onYes={() => navigateTo('UNSTABLE')}
                        onNo={() => navigateTo('STABLE_CHECK_QRS')}
                    />
                )}

                {/* PASSO 2A: INSTÁVEL (INICIAL) */}
                {currentStep === 'UNSTABLE' && (
                    <ResultCard
                        title="Cardioversão Elétrica Sincronizada"
                        color="red"
                        items={[
                            "Prepare o desfibrilador em modo SINCRONIZADO.",
                            "Considere sedação prévia (se não houver atraso ou deterioração).",
                            "Carga inicial: Bifásico 120-200J (ou conforme fabricante).",
                            "Nota: Se QRS estreito e regular, considere Adenosina 6mg enquanto prepara."
                        ]}
                        followUp={{
                            question: "Taquiarritmia resolvida?",
                            onYes: () => navigateTo('RESOLVED'),
                            onNo: () => navigateTo('UNSTABLE_FAILURE')
                        }}
                    />
                )}

                {/* PASSO 2A - FALHA (PERSISTÊNCIA) */}
                {currentStep === 'UNSTABLE_FAILURE' && (
                    <ResultCard
                        title="Cardioversão Elétrica Sincronizada"
                        color="red"
                        items={[
                            "Prepare o desfibrilador em modo SINCRONIZADO.",
                            "Considere sedação prévia (se não houver atraso ou deterioração).",
                            "Carga inicial: Bifásico 120-200J (ou conforme fabricante).",
                            "Nota: Se QRS estreito e regular, considere Adenosina 6mg enquanto prepara."
                        ]}
                        followUp={{
                            question: "Taquiarritmia resolvida?",
                            onYes: () => navigateTo('RESOLVED'),
                            onNo: () => alert("Mantenha o protocolo de falha e aguarde o especialista.")
                        }}
                    >
                        <div className="mt-6 p-5 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-lg animate-fade-in shadow-sm">
                            <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2 text-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Falha Terapêutica
                            </h3>
                            <ul className="list-disc list-inside text-orange-900 dark:text-orange-100 space-y-2 font-medium text-base">
                                <li>Tratar a causa subjacente.</li>
                                <li>Considere aumentar o nível de energia para a próxima cardioversão.</li>
                                <li>Considere infusão de antiarrítmico.</li>
                                <li>Avaliação de especialista.</li>
                            </ul>
                        </div>
                    </ResultCard>
                )}

                {/* PASSO 2B: LARGURA DO QRS */}
                {currentStep === 'STABLE_CHECK_QRS' && (
                    <QuestionCard
                        title="Duração do QRS"
                        subtitle="O complexo QRS é largo (≥ 0,12s)?"
                        yesLabel="SIM (Largo)"
                        noLabel="NÃO (Estreito)"
                        onYes={() => navigateTo('WIDE_QRS')}
                        onNo={() => navigateTo('NARROW_CHECK_RHYTHM')}
                    />
                )}

                {/* PASSO 3A: QRS LARGO (AMIODARONA) */}
                {currentStep === 'WIDE_QRS' && (
                    <ResultCard
                        title="Taquicardia de QRS Largo"
                        color="orange"
                    >
                        <AmiodaroneProtocolCard />
                    </ResultCard>
                )}

                {/* PASSO 3B: REGULARIDADE (ESTREITO) */}
                {currentStep === 'NARROW_CHECK_RHYTHM' && (
                    <QuestionCard
                        title="Regularidade do Ritmo"
                        subtitle="O ritmo cardíaco é regular?"
                        yesLabel="SIM (Regular)"
                        noLabel="NÃO (Irregular)"
                        onYes={() => navigateTo('NARROW_REGULAR')}
                        onNo={() => navigateTo('NARROW_IRREGULAR')}
                    />
                )}

                {/* PASSO 4A: TPSV (REGULAR) */}
                {currentStep === 'NARROW_REGULAR' && (
                    <ResultCard
                        title="Provável TPSV"
                        color="green"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                                <div className="text-3xl font-bold text-green-600 bg-green-100 w-12 h-12 flex items-center justify-center rounded-full">1</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">Manobra Vagal</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">Valsalva modificada (soprar seringa + elevação de MMII).</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                                <div className="text-3xl font-bold text-green-600 bg-green-100 w-12 h-12 flex items-center justify-center rounded-full">2</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">Adenosina 6 mg IV</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">Em bolus rápido (1-3 seg) seguido de Flush 20mL SF.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                                <div className="text-3xl font-bold text-green-600 bg-green-100 w-12 h-12 flex items-center justify-center rounded-full">3</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">Adenosina 12 mg IV</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">Se sem resposta em 1-2 minutos.</p>
                                </div>
                            </div>
                        </div>
                    </ResultCard>
                )}

                {/* PASSO 4B: FA / FLUTTER (IRREGULAR) */}
                {currentStep === 'NARROW_IRREGULAR' && (
                    <ResultCard
                        title="Controle de Frequência (FA / Flutter)"
                        color="blue"
                        items={[
                            "Betabloqueador: Metoprolol 5mg IV (repetir a cada 5 min, máx 15mg).",
                            "Ou Bloqueador de Canal de Cálcio: Diltiazem.",
                            "Lembretes: Avaliar Anticoagulação (CHA2DS2-VASc) e Ecocardiograma."
                        ]}
                    />
                )}

                {/* PASSO FINAL: RESOLVIDO */}
                {currentStep === 'RESOLVED' && (
                    <div className="flex flex-col items-center animate-fade-in w-full max-w-2xl mx-auto">
                        <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-2xl shadow-lg p-8 text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/50 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            
                            <h2 className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200 mb-4">
                                Taquiarritmia Resolvida
                            </h2>
                            
                            <p className="text-xl text-green-700 dark:text-green-300 font-medium mb-10 leading-relaxed">
                                Monitore o paciente, trate a causa base e chame o especialista.
                            </p>
                            
                            <button 
                                onClick={resetFlow}
                                className="px-8 py-3 border-2 border-green-600 text-green-700 dark:text-green-400 dark:border-green-500 font-bold rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors uppercase tracking-wide text-sm"
                            >
                                Reiniciar Fluxo
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TaquiarritmiasPage;
