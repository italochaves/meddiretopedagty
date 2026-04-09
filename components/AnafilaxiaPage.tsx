
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Icons
const Icons = {
    Star: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    Syringe: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 2 4 4" />
            <path d="m17 7 3-3" />
            <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
            <path d="m9 11 4 4" />
            <path d="m5 19-3 3" />
            <path d="m14 4 6 6" />
        </svg>
    ),
    AlertTriangle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    ),
    Drip: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
    )
};

const BackButton: React.FC<{ onClick?: () => void, to?: string }> = ({ onClick, to }) => {
    if (to) {
        return (
            <Link to={to} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar para Emergência
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

// ----------------------------------------------------------------------
// CARD 1: ADRENALINA IM
// ----------------------------------------------------------------------
const AdrenalineIMCard: React.FC = () => {
    const [patientType, setPatientType] = useState<'adult' | 'child'>('adult');
    const [weight, setWeight] = useState<string>('');

    // Logic for Child Dose
    let childDose = 0;
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0) {
        childDose = w * 0.01;
        if (childDose > 0.5) childDose = 0.5; // Max dose cap
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-l-4 border-red-500 shadow-lg overflow-hidden animate-fade-in mb-8">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Icons.Star />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                        1. Anafilaxia - Adrenalina (IM)
                    </h2>
                </div>

                {/* Patient Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-6 w-fit">
                    <button
                        onClick={() => setPatientType('adult')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            patientType === 'adult'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'text-slate-500 dark:text-slate-300 hover:text-slate-800'
                        }`}
                    >
                        Adulto
                    </button>
                    <button
                        onClick={() => setPatientType('child')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            patientType === 'child'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'text-slate-500 dark:text-slate-300 hover:text-slate-800'
                        }`}
                    >
                        Criança
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    
                    {patientType === 'child' && (
                        <div className="mb-6 max-w-xs">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                                Peso da Criança (kg)
                            </label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Ex: 20"
                                className="w-full text-2xl font-bold p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="flex items-start gap-4">
                        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex-shrink-0">
                            <Icons.Syringe />
                        </div>
                        
                        <div className="flex-1">
                            {patientType === 'adult' ? (
                                <div>
                                    <p className="text-lg text-slate-700 dark:text-slate-300 mb-2 font-medium">
                                        Adrenalina (1 mg/mL)
                                    </p>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 mb-2">
                                        Fazer 0,3 a 0,5 mg (0,3 a 0,5 mL) IM
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Preferencialmente no vasto lateral da coxa.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg text-slate-700 dark:text-slate-300 mb-2 font-medium">
                                        Adrenalina (1 mg/mL) - Criança
                                    </p>
                                    {w > 0 ? (
                                        <>
                                            <div className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 mb-2">
                                                Fazer {childDose.toFixed(2)} mg ({childDose.toFixed(2)} mL) IM
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Dose calculada (0,01 mg/kg) no vasto lateral. Máximo de 0,5 mg.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-lg text-slate-400 italic">
                                            Insira o peso para calcular a dose.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                    <Icons.AlertTriangle />
                    <span>Pode ser repetida a cada 5 a 15 minutos conforme necessidade clínica.</span>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// CARD 2: CHOQUE ANAFILÁTICO (BIC)
// ----------------------------------------------------------------------
const AnaphylaxisShockCard: React.FC = () => {
    const [weight, setWeight] = useState<string>('');
    const [targetDose, setTargetDose] = useState<string>('0.1');

    const w = parseFloat(weight);
    const d = parseFloat(targetDose);

    // Math Explanation:
    // Solution: 12mg in 200mL = 0.06 mg/mL = 60 mcg/mL.
    // Formula: Flow (mL/h) = (Weight * Dose_mcg_kg_min * 60) / Concentration_mcg_mL
    // Flow = (W * D * 60) / 60
    // Flow = W * D
    
    let flowRate = 0;
    if (!isNaN(w) && !isNaN(d) && w > 0) {
        flowRate = w * d;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-l-4 border-orange-500 shadow-lg overflow-hidden animate-fade-in">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Icons.Star />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                        2. Choque Anafilático - Falha ao uso IM
                    </h2>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Indicado para hipotensão refratária a volume e adrenalina IM repetida.
                </p>

                {/* Hardcoded Recipe - High Visibility */}
                <div className="mb-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 rounded-xl p-5 text-center">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Diluição Padrão</p>
                    <p className="text-lg md:text-xl font-bold text-red-700 dark:text-red-300 font-mono">
                        Adrenalina (1 mg/mL) – 12 ampolas + 188 mL SG 5%
                    </p>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1 font-medium">
                        Solução final: 200 mL (Concentração 60 mcg/mL)
                    </p>
                </div>

                {/* Calculator Inputs */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                            Peso (kg)
                        </label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Ex: 70"
                            className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                            Dose Alvo (mcg/kg/min)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={targetDose}
                            onChange={(e) => setTargetDose(e.target.value)}
                            placeholder="0.1"
                            className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Dose usual: 0,1 a 1 mcg/kg/min
                        </p>
                    </div>
                </div>

                {/* Result */}
                {flowRate > 0 ? (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 text-center border border-orange-200 dark:border-orange-900/30">
                        <div className="flex items-center justify-center gap-2 mb-2">
                             <Icons.Drip />
                             <span className="font-bold text-orange-800 dark:text-orange-200 uppercase text-sm">Vazão da Bomba (BIC)</span>
                        </div>
                        <div className="text-3xl md:text-4xl font-extrabold text-orange-600 dark:text-orange-400">
                            Iniciar a {flowRate.toFixed(1)} mL/h
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-2 font-medium">
                            Titule conforme resposta clínica.
                        </p>
                    </div>
                ) : (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        Preencha o peso e a dose para calcular a vazão.
                    </div>
                )}
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 text-center border-t border-slate-100 dark:border-slate-700">
                 <Link to="/emergencia/drogas-vasoativas" className="text-xs text-slate-500 hover:text-premium-teal underline decoration-slate-300 hover:decoration-premium-teal transition-all">
                     Para auxílio com a prescrição, acesse: Drogas Vasoativas &gt; Adrenalina
                 </Link>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
const AnafilaxiaPage: React.FC = () => {
    return (
        <div className="container mx-auto max-w-4xl pb-20">
            <BackButton to="/emergencia" />
            
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Protocolo de Anafilaxia
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
                    Conduta imediata para reações alérgicas graves e choque anafilático.
                </p>
            </div>

            <div className="space-y-8">
                <AdrenalineIMCard />
                <AnaphylaxisShockCard />
            </div>
        </div>
    );
};

export default AnafilaxiaPage;
