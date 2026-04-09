
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- ICONS ---
const Icons = {
    Syringe: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>
        </svg>
    ),
    Vial: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20"/><path d="M8 2h8"/><path d="M8 22h8"/><path d="M7 6h10"/><path d="M7 18h10"/>
        </svg>
    ),
    ChevronLeft: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    )
};

// --- TYPES ---
interface Solution {
    label: string;
    amps: number;
    diluentName: string;
    diluentVol: number;
    totalVol: number;
    conc: string; // "64 mcg/mL"
}

interface DrugConfig {
    name: string;
    presentation: string;
    useWeight: boolean;
    isHybrid?: boolean; // For Adrenaline
    solutions: Solution[];
    doseRange: string;
}

// --- DATA SOURCE ---
const DRUGS_DB: Record<string, DrugConfig> = {
  noradrenalina: {
    name: 'Noradrenalina',
    presentation: '4 mg/4 mL',
    useWeight: true,
    solutions: [
      { label: 'Padrão (64mcg)', amps: 4, diluentName: 'SG 5%', diluentVol: 234, totalVol: 250, conc: '64 mcg/mL' },
      { label: 'Concentrada (100mcg)', amps: 5, diluentName: 'SG 5%', diluentVol: 180, totalVol: 200, conc: '100 mcg/mL' },
      { label: 'Máxima (128mcg)', amps: 8, diluentName: 'SG 5%', diluentVol: 218, totalVol: 250, conc: '128 mcg/mL' }
    ],
    doseRange: '0.05 - 3.3 mcg/kg/min'
  },
  vasopressina: {
    name: 'Vasopressina',
    presentation: '20 U/mL',
    useWeight: false,
    solutions: [
      { label: 'Padrão (0.2 U/mL)', amps: 1, diluentName: 'SF 0,9%', diluentVol: 99, totalVol: 100, conc: '0.2 U/mL' },
      { label: 'Concentrada (0.4 U/mL)', amps: 2, diluentName: 'SF 0,9%', diluentVol: 98, totalVol: 100, conc: '0.4 U/mL' }
    ],
    doseRange: '0.01 - 0.04 U/min'
  },
  adrenalina: {
    name: 'Adrenalina',
    presentation: '1 mg/mL',
    isHybrid: true,
    useWeight: true, // Default to true, but togglable via isHybrid logic
    solutions: [
      { label: 'Padrão', amps: 12, diluentName: 'SG 5%', diluentVol: 188, totalVol: 200, conc: '60 mcg/mL' }
    ],
    doseRange: '2-10 mcg/min (Bradi) ou 0.01-0.5 mcg/kg/min (Choque)'
  },
  dobutamina: {
    name: 'Dobutamina',
    presentation: '250 mg/20 mL',
    useWeight: true,
    solutions: [
      { label: 'Padrão 1', amps: 4, diluentName: 'SF 0,9% ou SG 5%', diluentVol: 170, totalVol: 250, conc: '4000 mcg/mL' },
      { label: 'Padrão 2', amps: 2, diluentName: 'SF 0,9% ou SG 5%', diluentVol: 210, totalVol: 250, conc: '2000 mcg/mL' }
    ],
    doseRange: '2 - 20 mcg/kg/min'
  },
  nitroprussiato: {
    name: 'Nitroprussiato (Nipride)',
    presentation: '50 mg/2 mL',
    useWeight: true,
    solutions: [
      { label: 'Padrão 1', amps: 1, diluentName: 'SG 5%', diluentVol: 248, totalVol: 250, conc: '200 mcg/mL' },
      { label: 'Padrão 2', amps: 2, diluentName: 'SG 5%', diluentVol: 246, totalVol: 250, conc: '400 mcg/mL' }
    ],
    doseRange: '0.25 - 10 mcg/kg/min'
  },
  nitroglicerina: {
    name: 'Nitroglicerina (Tridil)',
    presentation: '5 mg/mL (10mL)',
    useWeight: false,
    solutions: [
      { label: 'Padrão 1', amps: 1, diluentName: 'SG 5%', diluentVol: 240, totalVol: 250, conc: '200 mcg/mL' },
      { label: 'Padrão 2', amps: 2, diluentName: 'SG 5%', diluentVol: 230, totalVol: 250, conc: '400 mcg/mL' }
    ],
    doseRange: '5 - 200 mcg/min'
  },
  dopamina: {
    name: 'Dopamina',
    presentation: '5 mg/mL (10mL)',
    useWeight: true,
    solutions: [
      { label: 'Padrão', amps: 5, diluentName: 'SG 5%', diluentVol: 200, totalVol: 250, conc: '1000 mcg/mL' }
    ],
    doseRange: '5 - 20 mcg/kg/min'
  }
};

// List items for the menu
const DRUG_LIST = [
    { id: 'noradrenalina', name: 'Noradrenalina' },
    { id: 'vasopressina', name: 'Vasopressina' },
    { id: 'adrenalina', name: 'Adrenalina' },
    { id: 'dobutamina', name: 'Dobutamina' },
    { id: 'nitroprussiato', name: 'Nitroprussiato' },
    { id: 'nitroglicerina', name: 'Nitroglicerina' },
    { id: 'dopamina', name: 'Dopamina' },
    { id: 'levosimendan', name: 'Levosimendan', disabled: true },
    { id: 'milrinona', name: 'Milrinona', disabled: true },
    { id: 'azul', name: 'Azul de Metileno', disabled: true },
];

// --- HELPER FUNCTIONS ---

const parseConcentration = (str: string): number => {
    // "64 mcg/mL" -> 64
    const match = str.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
};

// --- COMPONENTS ---

const DrogasVasoativasPage: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Detail View State ---
    const [weight, setWeight] = useState<string>('');
    const [targetDose, setTargetDose] = useState<string>('');
    const [solutionIdx, setSolutionIdx] = useState<number>(0);
    const [isCustomSolution, setIsCustomSolution] = useState(false);
    
    // Custom Solution State
    const [customDrugAmount, setCustomDrugAmount] = useState(''); // Total mg/mcg/U
    const [customTotalVol, setCustomTotalVol] = useState('');
    
    // Adrenaline Mode
    const [adrMode, setAdrMode] = useState<'choque' | 'bradi'>('choque');

    const drug = selectedId ? DRUGS_DB[selectedId] : null;

    // Reset state when drug changes
    useEffect(() => {
        setWeight('');
        setTargetDose('');
        setSolutionIdx(0);
        setIsCustomSolution(false);
        setCustomDrugAmount('');
        setCustomTotalVol('');
        setAdrMode('choque');
        window.scrollTo(0,0);
    }, [selectedId]);

    // Calculation Logic
    const calculate = () => {
        if (!drug) return { flow: 0, concDisplay: '' };

        let conc = 0;
        let concUnit = '';

        if (isCustomSolution) {
            const amt = parseFloat(customDrugAmount);
            const vol = parseFloat(customTotalVol);
            if (amt > 0 && vol > 0) {
                conc = amt / vol;
                // Infer unit from first solution as fallback for custom
                const parts = drug.solutions[0].conc.split(' ');
                concUnit = parts.length > 1 ? parts[1] : ''; 
            }
        } else {
            const sol = drug.solutions[solutionIdx];
            conc = parseConcentration(sol.conc);
            const parts = sol.conc.split(' ');
            concUnit = parts.length > 1 ? parts[1] : ''; 
        }

        const dose = parseFloat(targetDose);
        const w = parseFloat(weight);

        // Determine calculation mode
        let flowRate = 0;
        
        // Flags
        const isAdrenaline = drug.name === 'Adrenalina';
        const useWeight = isAdrenaline ? (adrMode === 'choque') : drug.useWeight;

        if (conc > 0 && dose > 0) {
            if (useWeight) {
                if (w > 0) {
                    // Formula: (Dose * Weight * 60) / Conc
                    flowRate = (dose * w * 60) / conc;
                }
            } else {
                // Formula: (Dose * 60) / Conc
                flowRate = (dose * 60) / conc;
            }
        }

        return { 
            flow: flowRate, 
            concDisplay: conc > 0 ? `${conc.toFixed(conc < 1 ? 2 : 0)} ${concUnit}` : '---' 
        };
    };

    const { flow, concDisplay } = calculate();

    // Render Logic
    if (!selectedId) {
        // --- LIST VIEW ---
        const filteredList = DRUG_LIST.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div className="container mx-auto max-w-4xl pb-20">
                <Link to="/emergencia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6">
                    <Icons.ChevronLeft /> Voltar
                </Link>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Drogas Vasoativas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Calculadora de infusão contínua e diluições.</p>
                </div>

                <div className="relative mb-8">
                    <input 
                        type="text" 
                        placeholder="Buscar droga..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-premium-teal transition-all"
                    />
                    <div className="absolute left-4 top-4 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredList.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => !item.disabled && setSelectedId(item.id)}
                            disabled={item.disabled}
                            className={`flex items-center gap-4 p-5 rounded-xl border transition-all text-left group
                                ${item.disabled 
                                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-60 cursor-not-allowed' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-premium-teal hover:shadow-md'
                                }
                            `}
                        >
                            <div className={`p-3 rounded-full ${item.disabled ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' : 'bg-premium-teal/10 text-premium-teal group-hover:bg-premium-teal group-hover:text-white transition-colors'}`}>
                                <Icons.Syringe />
                            </div>
                            <div>
                                <span className="block font-bold text-lg text-slate-800 dark:text-white">{item.name}</span>
                                {item.disabled && <span className="text-xs text-slate-400 font-medium">Em breve</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (!drug) return null;

    // Determine current dilution info for display
    const currentSol = drug.solutions[solutionIdx];
    const isAdrenaline = drug.name === 'Adrenalina';
    const showWeight = isAdrenaline ? (adrMode === 'choque') : drug.useWeight;

    // --- DETAIL VIEW ---
    return (
        <div className="container mx-auto max-w-3xl pb-20 animate-fade-in">
            <button onClick={() => setSelectedId(null)} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6">
                <Icons.ChevronLeft /> Voltar para Lista
            </button>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">{drug.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Apresentação: {drug.presentation}</p>
                    </div>
                    <div className="p-3 bg-premium-teal/10 rounded-full text-premium-teal">
                        <Icons.Vial />
                    </div>
                </div>

                {/* Hybrid Toggle for Adrenaline */}
                {drug.isHybrid && (
                    <div className="mt-6 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg flex">
                        <button 
                            onClick={() => setAdrMode('choque')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${adrMode === 'choque' ? 'bg-white dark:bg-slate-600 shadow text-premium-teal' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Choque (mcg/kg/min)
                        </button>
                        <button 
                            onClick={() => setAdrMode('bradi')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${adrMode === 'bradi' ? 'bg-white dark:bg-slate-600 shadow text-premium-teal' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Bradicardia (mcg/min)
                        </button>
                    </div>
                )}
            </div>

            {/* Step 1: Solution */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">1. Solução / Diluição</h3>
                
                <div className="flex gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={!isCustomSolution} onChange={() => setIsCustomSolution(false)} className="w-4 h-4 text-premium-teal focus:ring-premium-teal" />
                        <span className={`font-medium ${!isCustomSolution ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>Padrão</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={isCustomSolution} onChange={() => setIsCustomSolution(true)} className="w-4 h-4 text-premium-teal focus:ring-premium-teal" />
                        <span className={`font-medium ${isCustomSolution ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>Personalizada</span>
                    </label>
                </div>

                {!isCustomSolution ? (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {drug.solutions.map((sol, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSolutionIdx(idx)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                                        solutionIdx === idx 
                                        ? 'bg-premium-teal text-white border-premium-teal ring-2 ring-premium-teal/20' 
                                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-premium-teal'
                                    }`}
                                >
                                    {sol.label}
                                </button>
                            ))}
                        </div>

                        {/* RECIPE BOX - CRITICAL */}
                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 rounded-r-lg">
                            <p className="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase mb-1">Receita da Diluição</p>
                            <p className="text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                <span className="font-bold">{currentSol.amps} ampolas</span> ({drug.presentation}) <br/>
                                + <span className="font-bold">{currentSol.diluentVol} mL</span> de <span className="font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1 rounded">{currentSol.diluentName}</span>
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 border-t border-yellow-200 dark:border-yellow-900/30 pt-2">
                                Concentração Final: <strong>{currentSol.conc}</strong>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Qtd. Total Droga</label>
                            <input type="number" placeholder="mg ou U" value={customDrugAmount} onChange={e => setCustomDrugAmount(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:border-premium-teal" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Volume Final (mL)</label>
                            <input type="number" placeholder="mL" value={customTotalVol} onChange={e => setCustomTotalVol(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:border-premium-teal" />
                        </div>
                    </div>
                )}
            </div>

            {/* Step 2 & 3: Inputs */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {showWeight && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Peso (kg)</label>
                        <input 
                            type="number" 
                            value={weight} 
                            onChange={e => setWeight(e.target.value)} 
                            placeholder="70"
                            className="w-full text-3xl font-bold p-3 border-b-2 border-slate-200 focus:border-premium-teal focus:outline-none bg-transparent dark:text-white transition-colors placeholder-slate-300"
                        />
                    </div>
                )}

                <div className={`${!showWeight ? 'md:col-span-2' : ''} bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6`}>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                        Dose Alvo ({isAdrenaline ? (adrMode === 'bradi' ? 'mcg/min' : 'mcg/kg/min') : (drug.name === 'Vasopressina' ? 'U/min' : (drug.name === 'Nitroglicerina' ? 'mcg/min' : 'mcg/kg/min'))})
                    </label>
                    <input 
                        type="number" 
                        value={targetDose} 
                        onChange={e => setTargetDose(e.target.value)} 
                        placeholder="0.0"
                        step="0.01"
                        className="w-full text-3xl font-bold p-3 border-b-2 border-slate-200 focus:border-premium-teal focus:outline-none bg-transparent dark:text-white transition-colors placeholder-slate-300"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                        Dose usual: {drug.doseRange}
                    </p>
                </div>
            </div>

            {/* Step 4: Result */}
            <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 text-center">
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">Vazão da Bomba (BIC)</p>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-6xl font-extrabold text-premium-teal-400">
                            {flow > 0 ? flow.toFixed(1) : '---'}
                        </span>
                        <span className="text-xl font-medium text-slate-400">mL/h</span>
                    </div>
                    {flow > 0 && (
                        <div className="mt-6 flex flex-col items-center gap-3">
                            <div className="inline-block bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                                <span className="text-sm text-slate-300">Conc. Final: <span className="text-white font-bold">{concDisplay}</span></span>
                            </div>
                            
                            {!isCustomSolution && (
                                <div className="text-xs text-slate-400 mt-2 bg-slate-800/50 p-3 rounded border border-slate-700 w-full max-w-sm">
                                    <p className="font-bold text-slate-300 mb-1">PRESCRIÇÃO:</p>
                                    <p>{currentSol.amps} ampolas ({drug.presentation})</p>
                                    <p>+ {currentSol.diluentVol} mL de {currentSol.diluentName}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Footer Warnings */}
                <div className="bg-slate-950 p-4 text-center border-t border-slate-800">
                    <p className="text-xs text-slate-500">
                        Titule a dose conforme resposta hemodinâmica. Troque a solução a cada 24h.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DrogasVasoativasPage;
