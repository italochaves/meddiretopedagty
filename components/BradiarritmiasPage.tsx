
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Types ---
type FlowStep = 
    | 'INITIAL' 
    | 'UNSTABLE' 
    | 'STABLE' 
    | 'REFRACTORY' 
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

const QuestionCard: React.FC<{ 
    title: string; 
    supportText?: string;
    symptoms?: string[];
    onYes: () => void; 
    onNo: () => void;
}> = ({ title, supportText, symptoms, onYes, onNo }) => (
    <div className="flex flex-col items-center animate-fade-in w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 w-full text-center border border-slate-200 dark:border-slate-700">
            {supportText && (
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                    {supportText}
                </p>
            )}

            {symptoms && (
                <div className="mb-8 flex flex-wrap justify-center gap-3">
                    {symptoms.map((s, idx) => (
                        <span key={idx} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium">
                            {s}
                        </span>
                    ))}
                </div>
            )}

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mb-8 leading-tight">
                {title}
            </h2>

            <div className="grid grid-cols-2 gap-6">
                <button 
                    onClick={onYes}
                    className="py-6 px-4 bg-red-600 hover:bg-red-700 text-white text-xl md:text-2xl font-bold rounded-xl shadow-lg hover:shadow-red-500/30 transform active:scale-95 transition-all"
                >
                    SIM
                </button>
                <button 
                    onClick={onNo}
                    className="py-6 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xl md:text-2xl font-bold rounded-xl shadow-md transform active:scale-95 transition-all"
                >
                    NÃO
                </button>
            </div>
        </div>
    </div>
);

const ResultCard: React.FC<{
    title: string;
    content: string[];
    color: 'red' | 'green' | 'gray';
    followUp?: { question: string, onYes: () => void, onNo: () => void };
}> = ({ title, content, color, followUp }) => {
    
    const colorStyles = {
        red: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100',
        green: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100',
        gray: 'border-slate-400 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
    };

    return (
        <div className="flex flex-col items-center animate-fade-in w-full max-w-2xl mx-auto pb-10">
            <div className={`w-full rounded-2xl border-l-8 shadow-lg p-6 md:p-8 ${colorStyles[color]}`}>
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
                
                <ul className="space-y-4 mb-6">
                    {content.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-lg font-medium leading-relaxed bg-white/40 dark:bg-slate-900/30 p-3 rounded-lg">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-current flex-shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>

                {followUp && (
                    <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
                        <p className="font-bold text-lg mb-4 text-center">{followUp.question}</p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={followUp.onYes}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition-colors min-w-[100px]"
                            >
                                SIM
                            </button>
                            <button 
                                onClick={followUp.onNo}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow transition-colors min-w-[100px]"
                            >
                                NÃO
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const RefractoryOptions: React.FC = () => (
    <div className="flex flex-col items-center animate-fade-in w-full max-w-4xl mx-auto pb-10">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">
            Atropina ineficaz. Considere as opções abaixo:
        </h2>

        <div className="grid md:grid-cols-3 gap-6 w-full">
            {/* Opção 1 - Marcapasso */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-t-4 border-blue-500 p-6 flex flex-col">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-4">1</div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Marcapasso Transcutâneo</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Prepare enquanto aguarda drogas ou se acesso venoso indisponível.
                </p>
            </div>

            {/* Opção 2 - Dopamina */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-t-4 border-orange-500 p-6 flex flex-col">
                <div className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold mb-4">2</div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Dopamina</h3>
                <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/20 mb-3">
                    <p className="font-mono text-sm font-bold text-orange-700 dark:text-orange-300">
                        5 ampolas + 200 mL SG 5%
                    </p>
                </div>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li><strong>Conc:</strong> 1.000 mcg/mL</li>
                    <li><strong>Dose:</strong> 5 a 20 mcg/kg/min</li>
                    <li className="italic">Titule conforme resposta.</li>
                </ul>
            </div>

            {/* Opção 3 - Adrenalina */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-t-4 border-red-500 p-6 flex flex-col">
                <div className="bg-red-100 dark:bg-red-900/30 w-10 h-10 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold mb-4">3</div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Adrenalina</h3>
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20 mb-3">
                    <p className="font-mono text-sm font-bold text-red-700 dark:text-red-300">
                        12 ampolas + 188 mL SG 5%
                    </p>
                </div>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li><strong>Conc:</strong> 60 mcg/mL</li>
                    <li><strong>Dose:</strong> 2 a 10 mcg/min</li>
                    <li className="italic">Titule conforme resposta.</li>
                </ul>
            </div>
        </div>

        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-slate-500 dark:text-slate-400 text-sm font-medium text-center border border-slate-200 dark:border-slate-700">
            Considere marcapasso transvenoso e avaliação de especialista.
        </div>
    </div>
);

// --- Main Page Component ---

const BradiarritmiasPage: React.FC = () => {
    // Stack-based navigation
    const [history, setHistory] = useState<FlowStep[]>(['INITIAL']);
    
    // Derived current step
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        FC {`<`} 50 bpm
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

                {/* State Machine Render */}
                
                {currentStep === 'INITIAL' && (
                    <QuestionCard
                        title="Rebaixamento do nível de consciência ou Sinais de Choque?"
                        supportText="Bradiarritmia persistente causando:"
                        symptoms={['Dispneia ou Síncope', 'Dor torácica anginosa ou Hipotensão']}
                        onYes={() => navigateTo('UNSTABLE')}
                        onNo={() => navigateTo('STABLE')}
                    />
                )}

                {currentStep === 'STABLE' && (
                    <ResultCard
                        title="Conduta"
                        color="gray"
                        content={[
                            "Monitore e observe.",
                            "Considere avaliação de especialista."
                        ]}
                    />
                )}

                {currentStep === 'UNSTABLE' && (
                    <ResultCard
                        title="Conduta Imediata"
                        color="red"
                        content={[
                            "Faça: Atropina 1 mg EV em bolus.",
                            "Repita a cada 3 a 5 min.",
                            "Dose máxima 3 mg (3 doses)."
                        ]}
                        followUp={{
                            question: "Bradiarritmia resolvida?",
                            onYes: () => navigateTo('RESOLVED'),
                            onNo: () => navigateTo('REFRACTORY')
                        }}
                    />
                )}

                {currentStep === 'RESOLVED' && (
                    <ResultCard
                        title="Estabilizado"
                        color="green"
                        content={[
                            "Monitore e observe.",
                            "Tratar causas reversíveis (H e T).",
                            "Solicitar avaliação do especialista."
                        ]}
                    />
                )}

                {currentStep === 'REFRACTORY' && (
                    <RefractoryOptions />
                )}
            </div>
        </div>
    );
};

export default BradiarritmiasPage;
