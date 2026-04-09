
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Icons ---
const ChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

const ChevronUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6"/>
    </svg>
);

// --- Types & Data ---

interface Drug {
    name: string;
    presentation: string;
    concentration: number; // mg/mL
    doseMin: number; // mg/kg
    doseMax: number; // mg/kg
    doseText: string;
    notes?: string;
}

const DRUGS_PRE_MED: Drug[] = [
    { 
        name: 'Fentanil', 
        presentation: 'Ampola 50mcg/mL', 
        concentration: 0.05, // 50mcg = 0.05mg
        doseMin: 0.001, // 1mcg = 0.001mg
        doseMax: 0.003, // 3mcg = 0.003mg
        doseText: '1 a 3 mcg/kg',
        notes: 'Opioide de curta duração. Analgesia potente.'
    },
    { 
        name: 'Lidocaína 2% (sem vaso)', 
        presentation: 'Ampola 20mg/mL', 
        concentration: 20, 
        doseMin: 1.5, 
        doseMax: 1.5, 
        doseText: '1.5 mg/kg',
        notes: 'Reduz reatividade de vias aéreas (asma/HIC).'
    }
];

const DRUGS_INDUCTION: Drug[] = [
    { 
        name: 'Etomidato', 
        presentation: 'Ampola 2mg/mL', 
        concentration: 2, 
        doseMin: 0.3, 
        doseMax: 0.3, 
        doseText: '0.3 mg/kg',
        notes: 'Estabilidade hemodinâmica. Cuidado em sepse.'
    },
    { 
        name: 'Propofol', 
        presentation: 'Ampola 10mg/mL', 
        concentration: 10, 
        doseMin: 1.5, 
        doseMax: 2.0, 
        doseText: '1.5 a 2 mg/kg',
        notes: 'Hipotensor potente. Broncodilatador.'
    },
    { 
        name: 'Midazolam', 
        presentation: 'Ampola 5mg/mL', 
        concentration: 5, 
        doseMin: 0.1, 
        doseMax: 0.3, 
        doseText: '0.1 a 0.3 mg/kg',
        notes: 'Início de ação mais lento que propofol/etomidato.'
    },
    { 
        name: 'Quetamina', 
        presentation: 'Ampola 50mg/mL', 
        concentration: 50, 
        doseMin: 1.0, 
        doseMax: 2.0, 
        doseText: '1 a 2 mg/kg',
        notes: 'Broncodilatador. Aumenta FC e PA. Dissociativo.'
    }
];

const DRUGS_BLOCKERS: Drug[] = [
    { 
        name: 'Succinilcolina', 
        presentation: 'Frasco-ampola 100mg (Pó)', 
        concentration: 10, 
        doseMin: 1.0, 
        doseMax: 1.5, 
        doseText: '1 a 1.5 mg/kg',
        notes: 'Diluir frasco 100mg em 10mL de AD (Conc. Final: 10mg/mL). Despolarizante.'
    },
    { 
        name: 'Rocurônio', 
        presentation: 'Ampola 10mg/mL', 
        concentration: 10, 
        doseMin: 1.2, 
        doseMax: 1.2, 
        doseText: '1.2 mg/kg',
        notes: 'Não despolarizante. Alternativa à Succinilcolina.'
    }
];

// --- Components ---

const DrugCard: React.FC<{ drug: Drug; weight: number }> = ({ drug, weight }) => {
    let resultText = '---';
    
    if (weight > 0) {
        const minVol = (weight * drug.doseMin) / drug.concentration;
        const maxVol = (weight * drug.doseMax) / drug.concentration;
        
        // Formatting function to avoid ".0" and limit decimals
        const fmt = (n: number) => parseFloat(n.toFixed(1)).toString();

        if (drug.doseMin === drug.doseMax) {
            resultText = `Faça ${fmt(minVol)} mL EV`;
        } else {
            resultText = `Faça ${fmt(minVol)} mL a ${fmt(maxVol)} mL EV`;
        }
    }

    return (
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-1">{drug.name}</h3>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Apresentação:</span> {drug.presentation}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Dose:</span> {drug.doseText}
                    </div>
                    {drug.notes && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-700/50">
                            ℹ️ {drug.notes}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col justify-center items-end min-w-[180px] text-right">
                    <div className="text-xs uppercase tracking-wide font-bold text-slate-400 mb-1">Volume a Administrar</div>
                    <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                        {resultText}
                    </div>
                    {weight > 0 && (
                        <div className="text-xs text-emerald-700/70 dark:text-emerald-500/70 font-medium mt-1">
                            em bolus
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-subtle mb-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
                <div className={`p-2 rounded-full bg-white dark:bg-slate-700 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>
            
            {isOpen && (
                <div className="p-5 space-y-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    {children}
                </div>
            )}
        </div>
    );
};

const IntubacaoPage: React.FC = () => {
    const [weight, setWeight] = useState<string>('');
    const w = parseFloat(weight) || 0;

    return (
        <div className="container mx-auto max-w-4xl pb-20">
             {/* Sticky Weight Input Bar 
                 We use negative margins to break out of the parent container padding,
                 creating a full-width bar effect that sticks right below the header.
             */}
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
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Intubação Sequência Rápida</h1>
            </div>

            {/* Accordions */}
            <div className="space-y-6">
                
                {/* 1. Pre-medication */}
                <AccordionSection title="A. Pré-Medicação / Analgesia" defaultOpen={true}>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 italic">Opcional. Considere Fentanil para simpatólise e Lidocaína para broncoespasmo/HIC.</p>
                    {DRUGS_PRE_MED.map((drug, idx) => (
                        <DrugCard key={idx} drug={drug} weight={w} />
                    ))}
                </AccordionSection>

                {/* 2. Induction */}
                <AccordionSection title="B. Sedação / Indução" defaultOpen={true}>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 italic">Escolha UM agente. Administre em bolus rápido.</p>
                    {DRUGS_INDUCTION.map((drug, idx) => (
                        <DrugCard key={idx} drug={drug} weight={w} />
                    ))}
                </AccordionSection>

                {/* 3. Blockers */}
                <AccordionSection title="C. Bloqueador Neuromuscular" defaultOpen={true}>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 italic">Administre IMEDIATAMENTE após o sedativo.</p>
                    {DRUGS_BLOCKERS.map((drug, idx) => (
                        <DrugCard key={idx} drug={drug} weight={w} />
                    ))}
                </AccordionSection>

            </div>
            
            {/* Footer Disclaimer */}
            <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30 text-center">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Atenção:</strong> Os cálculos são auxiliares. Sempre confira a dose e a apresentação da ampola antes de administrar. Considere comorbidades e estabilidade hemodinâmica do paciente.
                </p>
            </div>
        </div>
    );
};

export default IntubacaoPage;
