
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Types & Constants ---

type DrugCategory = 'analgesia' | 'sedacao' | 'bnm';

interface StandardSolution {
    label: string;
    detalhe: string;
    concentracao_final: string;
}

interface DrugData {
    droga: string;
    ampolas?: string[];
    solucoes_padrao: StandardSolution[];
    dose_usual: {
        min: number;
        max: number;
        unidade: string;
    };
    tipo?: string;
    nota?: string;
}

const DRUGS_DB: Record<DrugCategory, DrugData[]> = {
  analgesia: [
    {
      droga: "Fentanil",
      ampolas: ["50mcg/mL (2mL)", "50mcg/mL (10mL)"],
      solucoes_padrao: [
        { label: "Padrão 1", detalhe: "4 Ampolas (10mL) + 210mL SF", concentracao_final: "8 mcg/mL" },
        { label: "Padrão 2", detalhe: "4 Ampolas (10mL) + 160mL SF", concentracao_final: "10 mcg/mL" }
      ],
      dose_usual: { min: 0.7, max: 10, unidade: "mcg/kg/h" }
    },
    {
      droga: "Morfina",
      ampolas: ["10mg/mL (1mL)", "1mg/mL (2mL)"],
      solucoes_padrao: [
        { label: "Padrão", detalhe: "10 Ampolas (10mg/mL) + 90mL SG 5%", concentracao_final: "1 mg/mL" }
      ],
      dose_usual: { min: 0.07, max: 0.5, unidade: "mg/kg/h" }
    }
  ],
  sedacao: [
    {
      droga: "Midazolam",
      ampolas: ["5mg/mL (3mL)", "5mg/mL (10mL)"],
      solucoes_padrao: [
        { label: "Padrão 1", detalhe: "4 Ampolas (50mg/10mL) + 210mL SF", concentracao_final: "0.8 mg/mL" },
        { label: "Concentrada", detalhe: "4 Ampolas (50mg/10mL) + 60mL SF", concentracao_final: "2 mg/mL" }
      ],
      dose_usual: { min: 0.01, max: 0.1, unidade: "mg/kg/h" }
    },
    {
      droga: "Propofol",
      ampolas: ["10mg/mL (20mL)", "10mg/mL (50mL)", "20mg/mL (50mL)"],
      solucoes_padrao: [
        { label: "Puro 1%", detalhe: "Não diluir (Frasco 1%)", concentracao_final: "10 mg/mL" },
        { label: "Puro 2%", detalhe: "Não diluir (Frasco 2%)", concentracao_final: "20 mg/mL" }
      ],
      dose_usual: { min: 5, max: 50, unidade: "mcg/kg/min" },
      nota: "Atenção: Unidade em MINUTOS"
    },
    {
      droga: "Precedex (Dexmedetomidina)",
      ampolas: ["100mcg/mL (2mL)"],
      solucoes_padrao: [
        { label: "Padrão", detalhe: "2 Ampolas (2mL) + 46mL SF", concentracao_final: "4 mcg/mL" }
      ],
      dose_usual: { min: 0.2, max: 1.5, unidade: "mcg/kg/h" }
    },
    {
      droga: "Quetamina",
      ampolas: ["50mg/mL (10mL)"],
      solucoes_padrao: [
        { label: "Padrão", detalhe: "10mL (1 frasco) + 240mL SF", concentracao_final: "2 mg/mL" }
      ],
      dose_usual: { min: 0.2, max: 0.5, unidade: "mg/kg/h" }
    }
  ],
  bnm: [
    {
      droga: "Rocurônio",
      ampolas: ["10mg/mL (5mL)"],
      solucoes_padrao: [
        { label: "Padrão", detalhe: "5 ampolas (50mg) + 225mL SF", concentracao_final: "1 mg/mL" }
      ],
      dose_usual: { min: 3, max: 12, unidade: "mcg/kg/min" },
      nota: "Atenção: Unidade em MINUTOS"
    },
    {
      droga: "Atracúrio",
      ampolas: ["10mg/mL (2.5mL)", "10mg/mL (5mL)"],
      solucoes_padrao: [
        { label: "Padrão", detalhe: "2 ampolas (50mg) + 90mL SF", concentracao_final: "1 mg/mL" }
      ],
      dose_usual: { min: 4, max: 12, unidade: "mcg/kg/min" }
    },
    {
      droga: "Cisatracúrio",
      ampolas: ["2mg/mL (5mL)", "2mg/mL (10mL)"],
      solucoes_padrao: [
        { label: "Padrão", detalhe: "5 Ampolas (10mL) + 150mL SF", concentracao_final: "500 mcg/mL" }
      ],
      dose_usual: { min: 1, max: 2, unidade: "mcg/kg/min" }
    },
    {
      droga: "Pancurônio",
      ampolas: ["2mg/mL (2mL)"],
      solucoes_padrao: [
        { label: "Padrão", detalhe: "10 Ampolas (2mg/mL) + 80mL SF", concentracao_final: "400 mcg/mL" }
      ],
      dose_usual: { min: 0.02, max: 0.05, unidade: "mg/kg" },
      nota: "Dose intermitente (bolus). Cálculo abaixo mostra volume por dose."
    },
    {
      droga: "Vecurônio",
      tipo: "Po liofilizado",
      ampolas: ["10mg (Pó)", "4mg (Pó)"],
      solucoes_padrao: [
        { label: "Padrão", detalhe: "1 frasco (10mg) em 1mL AD + 49mL SF", concentracao_final: "200 mcg/mL" }
      ],
      dose_usual: { min: 0.8, max: 1.7, unidade: "mcg/kg/min" }
    }
  ]
};

// --- Helper Functions ---

const parseConcentration = (str: string): number => {
    // Extracts numeric value from strings like "8 mcg/mL" or "10 mg/mL"
    const match = str.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
};

const getUnitMass = (str: string): 'mg' | 'mcg' => {
    return str.includes('mcg') ? 'mcg' : 'mg';
};

const getUnitTime = (str: string): 'min' | 'h' | 'bolus' => {
    if (str.includes('/min')) return 'min';
    if (str.includes('/h')) return 'h';
    return 'bolus';
};

// --- Components ---

const DrugCard: React.FC<{ drug: DrugData; weight: number }> = ({ drug, weight }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dilutionMode, setDilutionMode] = useState<'standard' | 'custom'>('standard');
    const [selectedStdIndex, setSelectedStdIndex] = useState(0);
    
    // Custom Dilution State
    const [customAmpAmount, setCustomAmpAmount] = useState<string>(''); // mg or mcg per ampoule
    const [customNumAmps, setCustomNumAmps] = useState<string>('1');
    const [customDiluentVol, setCustomDiluentVol] = useState<string>('100');
    
    // Dose State
    const [targetDose, setTargetDose] = useState<number>(drug.dose_usual.min);

    // Derived Constants from Drug Data
    const doseUnitMass = getUnitMass(drug.dose_usual.unidade); // mg or mcg from DOSE
    const doseUnitTime = getUnitTime(drug.dose_usual.unidade); // min or h or bolus

    // --- Calculation Logic ---

    // 1. Determine Concentration (C)
    let concentration = 0;
    let concentrationUnit = '';

    if (dilutionMode === 'standard') {
        const std = drug.solucoes_padrao[selectedStdIndex];
        concentration = parseConcentration(std.concentracao_final);
        concentrationUnit = getUnitMass(std.concentracao_final);
    } else {
        // Custom Calculation
        const totalMass = (parseFloat(customAmpAmount) || 0) * (parseFloat(customNumAmps) || 0);
        const totalVol = parseFloat(customDiluentVol) || 0;
        // Assume custom input mass matches dose unit for simplicity, or we default to mg?
        // Let's assume user inputs in the same unit as the dose usually comes in ampoules
        // But for the calculation to work, C needs to match Dose Mass Unit.
        
        // Let's infer the unit from the first standard solution to guide the user label
        const refUnit = getUnitMass(drug.solucoes_padrao[0].concentracao_final);
        
        if (totalVol > 0) {
            concentration = totalMass / totalVol;
            concentrationUnit = refUnit;
        }
    }

    // 2. Normalize Units (Mass)
    // If Dose is in mcg but Concentration is in mg, convert C to mcg (x1000)
    let finalConcentration = concentration;
    if (doseUnitMass === 'mcg' && concentrationUnit === 'mg') {
        finalConcentration = concentration * 1000;
    } else if (doseUnitMass === 'mg' && concentrationUnit === 'mcg') {
        finalConcentration = concentration / 1000;
    }

    // 3. Calculate Rate
    // Flow = (Weight * Dose * TimeFactor) / Concentration
    let flowRate = 0;
    const timeFactor = doseUnitTime === 'min' ? 60 : 1;

    if (weight > 0 && finalConcentration > 0) {
        if (doseUnitTime === 'bolus') {
            // Volume = (Weight * Dose) / Concentration
            flowRate = (weight * targetDose) / finalConcentration;
        } else {
            flowRate = (weight * targetDose * timeFactor) / finalConcentration;
        }
    }

    // Reset dose when opening/closing just to be safe, or keep it.
    
    const isBolus = doseUnitTime === 'bolus';

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-md">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <div className="flex items-center gap-3">
                     <div className={`w-2 h-10 rounded-full ${isOpen ? 'bg-premium-teal' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                     <div className="text-left">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{drug.droga}</h3>
                        {!isOpen && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {drug.dose_usual.min} - {drug.dose_usual.max} {drug.dose_usual.unidade}
                            </p>
                        )}
                     </div>
                </div>
                <div className={`p-2 rounded-full text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </button>

            {isOpen && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-6">
                    {/* Warning Note */}
                    {drug.nota && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                             <span>⚠️</span>
                             <span>{drug.nota}</span>
                        </div>
                    )}

                    {/* Dilution Section */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">1. Diluição</h4>
                        <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700 mb-4 w-fit">
                            <button 
                                onClick={() => setDilutionMode('standard')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${dilutionMode === 'standard' ? 'bg-premium-teal text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                            >
                                Padrão
                            </button>
                            <button 
                                onClick={() => setDilutionMode('custom')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${dilutionMode === 'custom' ? 'bg-premium-teal text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                            >
                                Personalizada
                            </button>
                        </div>

                        {dilutionMode === 'standard' ? (
                            <div className="grid grid-cols-1 gap-2">
                                {drug.solucoes_padrao.map((sol, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedStdIndex(idx)}
                                        className={`text-left p-3 rounded-lg border-2 transition-all ${selectedStdIndex === idx ? 'border-premium-teal bg-premium-teal/5 dark:bg-premium-teal/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-premium-teal/50'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className={`font-bold ${selectedStdIndex === idx ? 'text-premium-teal' : 'text-slate-700 dark:text-slate-200'}`}>{sol.label}</span>
                                            <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{sol.concentracao_final}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{sol.detalhe}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                                <p className="text-xs text-slate-400 mb-2">Monte sua solução (ex: 2 ampolas em 100ml)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Qtd. droga por ampola ({getUnitMass(drug.solucoes_padrao[0].concentracao_final)})</label>
                                        <input 
                                            type="number" 
                                            value={customAmpAmount} 
                                            onChange={(e) => setCustomAmpAmount(e.target.value)} 
                                            className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-600"
                                            placeholder="Ex: 50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Nº de Ampolas</label>
                                        <input 
                                            type="number" 
                                            value={customNumAmps} 
                                            onChange={(e) => setCustomNumAmps(e.target.value)} 
                                            className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-600"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Volume Final (Solução + Diluente)</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={customDiluentVol} 
                                                onChange={(e) => setCustomDiluentVol(e.target.value)} 
                                                className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-600"
                                                placeholder="Ex: 100"
                                            />
                                            <span className="absolute right-3 top-2 text-sm text-slate-400">mL</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-right text-premium-teal font-mono mt-2">
                                    Conc. Final: {finalConcentration > 0 ? `${finalConcentration.toFixed(2)} ${doseUnitMass}/mL` : '---'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dose Section */}
                    <div>
                         <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">2. Dose Alvo</h4>
                         <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex-1">
                                <input 
                                    type="range"
                                    min={drug.dose_usual.min}
                                    max={drug.dose_usual.max}
                                    step={drug.dose_usual.max < 1 ? 0.01 : 0.1}
                                    value={targetDose}
                                    onChange={(e) => setTargetDose(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-premium-teal"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                                    <span>{drug.dose_usual.min}</span>
                                    <span>{drug.dose_usual.max}</span>
                                </div>
                            </div>
                            <div className="w-24">
                                <input 
                                    type="number" 
                                    value={targetDose}
                                    onChange={(e) => setTargetDose(parseFloat(e.target.value))}
                                    className="w-full p-2 text-center font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-800 focus:ring-2 focus:ring-premium-teal focus:outline-none"
                                />
                                <div className="text-[10px] text-center text-slate-500 mt-1">{drug.dose_usual.unidade}</div>
                            </div>
                         </div>
                    </div>

                    {/* Result Section */}
                    <div className={`p-6 rounded-xl text-center transition-all ${isBolus ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' } border`}>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {isBolus ? 'Volume do Bolus' : 'Vazão na Bomba'}
                        </p>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className={`text-4xl sm:text-5xl font-extrabold ${isBolus ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {weight > 0 && flowRate > 0 ? flowRate.toFixed(1) : '---'}
                            </span>
                            <span className="text-lg font-medium text-slate-500 dark:text-slate-400">
                                {isBolus ? 'mL' : 'mL/h'}
                            </span>
                        </div>
                         {weight <= 0 && (
                            <p className="text-xs text-red-500 mt-2 font-medium">Insira o peso do paciente acima</p>
                        )}
                        {weight > 0 && finalConcentration > 0 && (
                             <p className="text-xs text-slate-400 mt-2 font-mono">
                                 Conc: {finalConcentration.toFixed(2)} {doseUnitMass}/mL 
                                 {isBolus ? '' : ` • Dose: ${targetDose} ${drug.dose_usual.unidade}`}
                             </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const SedacaoPage: React.FC = () => {
    const [weight, setWeight] = useState<string>('');
    const [activeTab, setActiveTab] = useState<DrugCategory>('analgesia');

    const w = parseFloat(weight) || 0;

    return (
        <div className="container mx-auto max-w-4xl pb-20">
             {/* Sticky Weight Input Bar */}
            <div className="sticky top-16 z-30 -mt-6 sm:-mt-8 md:-mt-10 pt-6 sm:pt-8 md:pt-10 pb-4 mb-8 -mx-6 px-6 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center transition-all">
                <label className="text-xs font-bold text-slate-500 text-center uppercase tracking-wider mb-2">Peso do Paciente</label>
                <div className="relative w-40">
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="0"
                        className="w-full text-center text-4xl font-bold py-1 text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-300 focus:border-premium-teal focus:outline-none transition-colors placeholder-slate-300"
                        autoFocus
                    />
                    <span className="absolute right-2 bottom-3 text-slate-400 font-semibold text-lg">kg</span>
                </div>
            </div>

            {/* Header / Nav */}
            <div className="mb-8 text-center px-4">
                <Link to="/emergencia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar
                </Link>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Sedação & Manutenção (BIC)</h1>
                <p className="text-sm text-slate-500 mt-2">Calculadora de infusão contínua pós-intubação</p>
            </div>

            {/* Category Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8 mx-4 sm:mx-0 overflow-x-auto">
                {(['analgesia', 'sedacao', 'bnm'] as DrugCategory[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === tab
                            ? 'bg-white dark:bg-slate-700 text-premium-teal shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {tab === 'analgesia' ? 'Analgesia' : tab === 'sedacao' ? 'Sedação' : 'Bloqueador NM'}
                    </button>
                ))}
            </div>

            {/* Drug List */}
            <div className="space-y-4">
                {DRUGS_DB[activeTab].map((drug, idx) => (
                    <DrugCard key={idx} drug={drug} weight={w} />
                ))}
            </div>
            
            <div className="mt-12 text-center">
                 <p className="text-xs text-slate-400 max-w-lg mx-auto">
                     *BIC: Bomba de Infusão Contínua. Sempre confira a concentração final da sua instituição, pois diluições podem variar.
                 </p>
            </div>
        </div>
    );
};

export default SedacaoPage;
