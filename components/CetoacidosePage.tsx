
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Icons ---
const Icons = {
    ChevronDown: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    ),
    ChevronUp: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
    ),
    Flask: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>
    ),
    Activity: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    ),
    Calculator: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
    ),
    CheckCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    )
};

// --- Reusable Accordion Component ---
interface AccordionItemProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    accentColor?: string;
    headerBg?: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, children, isOpen, onToggle, accentColor = 'blue', headerBg }) => {
    return (
        <div className={`border rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 ${isOpen ? `ring-2 ring-${accentColor}-500/50 border-${accentColor}-500` : 'border-slate-200 dark:border-slate-700'}`}>
            <button 
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isOpen ? (headerBg || `bg-${accentColor}-50 dark:bg-${accentColor}-900/10`) : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
                <div className="flex items-center gap-3">
                    {icon && <div className={`text-${accentColor}-600 dark:text-${accentColor}-400`}>{icon}</div>}
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
                </div>
                <div className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    {isOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                </div>
            </button>
            
            {isOpen && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
};

// --- Section 3: Sodium Calculator ---
const SodiumCalculator: React.FC = () => {
    const [sodium, setSodium] = useState('');
    const [glucose, setGlucose] = useState('');

    const na = parseFloat(sodium);
    const glu = parseFloat(glucose);
    let correctedNa = null;
    
    if (!isNaN(na) && !isNaN(glu)) {
        correctedNa = na + 1.6 * ((glu - 100) / 100);
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sódio Medido</label>
                    <input 
                        type="number" 
                        value={sodium} 
                        onChange={(e) => setSodium(e.target.value)} 
                        className="w-full p-3 border rounded-xl text-lg font-bold dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Ex: 130"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Glicose</label>
                    <input 
                        type="number" 
                        value={glucose} 
                        onChange={(e) => setGlucose(e.target.value)} 
                        className="w-full p-3 border rounded-xl text-lg font-bold dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Ex: 500"
                    />
                </div>
            </div>

            {correctedNa !== null && (
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600 text-center">
                    <div className="text-sm text-slate-500 uppercase font-semibold">Sódio Corrigido</div>
                    <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 my-2">
                        {correctedNa.toFixed(1)} mEq/L
                    </div>
                    
                    <div className={`mt-3 p-3 rounded-lg text-sm font-bold ${correctedNa < 135 ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                        Conduta: {correctedNa < 135 ? 'Usar SF 0,9%' : 'Usar Salina 0,45% (NaCl 0,45%)'}
                    </div>
                </div>
            )}
            
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30 text-xs text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
                <span>⚠️</span> Se pH {'<'} 6.9 ou 7.0, repor Bicarbonato (100mL 8,4% + 400mL AD).
            </div>
        </div>
    );
};

// --- Section 4: Potassium Logic ---
const PotassiumLogic: React.FC = () => {
    const [potassium, setPotassium] = useState('');
    const k = parseFloat(potassium);

    return (
        <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Potássio Sérico (K+)</label>
                <input 
                    type="number" 
                    step="0.1"
                    value={potassium} 
                    onChange={(e) => setPotassium(e.target.value)} 
                    className="w-full p-3 border rounded-xl text-lg font-bold dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Ex: 3.5"
                />
            </div>

            {!isNaN(k) && (
                <div>
                    {k < 3.3 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-xl shadow-sm">
                            <h4 className="font-bold text-red-700 dark:text-red-300 text-lg mb-1">NÃO INICIE INSULINA 🛑</h4>
                            <p className="text-red-600 dark:text-red-200 font-medium">Risco de arritmia fatal.</p>
                            <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-100">
                                <li>• Repor KCl (20-30 mEq/h).</li>
                                <li>• Aguardar K {'>'} 3.3 para iniciar insulina.</li>
                            </ul>
                        </div>
                    )}
                    {k >= 3.3 && k <= 5.2 && (
                        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 rounded-r-xl shadow-sm">
                            <h4 className="font-bold text-green-700 dark:text-green-300 text-lg mb-1">Pode Iniciar Insulina ✅</h4>
                            <p className="text-green-600 dark:text-green-200">
                                Adicionar 20-30 mEq de K+ por litro de soro para manutenção.
                            </p>
                        </div>
                    )}
                    {k > 5.2 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-xl shadow-sm">
                            <h4 className="font-bold text-yellow-700 dark:text-yellow-300 text-lg mb-1">Não Repor Potássio ⚠️</h4>
                            <p className="text-yellow-700 dark:text-yellow-200">
                                Iniciar insulina e checar K+ em 2 horas.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Section 5: Insulin Calculator ---
const InsulinCalculator: React.FC = () => {
    const [weight, setWeight] = useState('');
    const [isHighHgt, setIsHighHgt] = useState(true);

    const w = parseFloat(weight);
    let rate = 0;
    if (!isNaN(w) && w > 0) {
        rate = isHighHgt ? w * 0.1 : w * 0.05;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso (kg)</label>
                    <input 
                        type="number" 
                        value={weight} 
                        onChange={(e) => setWeight(e.target.value)} 
                        className="w-full p-3 border rounded-xl text-lg font-bold dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Ex: 70"
                    />
                </div>
                <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HGT Atual</label>
                     <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button 
                            onClick={() => setIsHighHgt(false)}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${!isHighHgt ? 'bg-orange-500 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {'<'} 250
                        </button>
                        <button 
                            onClick={() => setIsHighHgt(true)}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${isHighHgt ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            ≥ 250
                        </button>
                     </div>
                </div>
            </div>

            {rate > 0 && (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase">Bomba de Infusão (BIC)</span>
                        <span className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">Diluição 1:1 (100UI em 100mL)</span>
                    </div>
                    <div className="p-6 text-center">
                        <div className="text-sm text-slate-500 mb-1">Solução: 100mL SF 0.9% + 100UI Insulina Regular</div>
                        <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">
                            {rate.toFixed(1)} mL/h
                        </div>
                        <div className="text-sm font-semibold text-slate-400">
                            ({isHighHgt ? '0.1' : '0.05'} UI/kg/h)
                        </div>
                        
                        {!isHighHgt && (
                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm font-bold rounded-lg border border-orange-100 dark:border-orange-900/30">
                                ⚠️ Associar Dextrose (SG 5% ou 10%) para evitar hipoglicemia.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Section 6: Reassessment (Safety Logic Refactored) ---
const ReassessmentLogic: React.FC = () => {
    const [hgtPrev, setHgtPrev] = useState('');
    const [hgtCurr, setHgtCurr] = useState('');
    const [currentRate, setCurrentRate] = useState('');

    const prev = parseFloat(hgtPrev);
    const curr = parseFloat(hgtCurr);
    const rate = parseFloat(currentRate);
    
    let advice = '';
    let subAdvice: string[] = [];
    let newRate: number | null = null;
    let color = 'slate';

    if (!isNaN(prev) && !isNaN(curr) && !isNaN(rate)) {
        const drop = prev - curr;
        
        // 1. CENÁRIO DE EMERGÊNCIA (HGT < 70)
        if (curr < 70) {
            color = 'emergency-red';
            advice = 'HIPOGLICEMIA GRAVE! SUSPENDER INSULINA IMEDIATAMENTE.';
            subAdvice = [
                'Fazer 4 ampolas (40mL) de Glicose 50% EV em bolus.',
                'Repetir HGT em 15 min.'
            ];
        } 
        // 2. CENÁRIO DE TRANSIÇÃO (HGT 70 a 200)
        else if (curr <= 200) {
            color = 'yellow';
            advice = 'HGT atingiu a meta (< 200 mg/dL).';
            subAdvice = [
                '1. Reduzir insulina para 0.05 UI/kg/h (metade da dose inicial).',
                '2. Adicionar SG 5% na hidratação venosa.',
                'Manter HGT entre 150-200 até compensação da acidose.'
            ];
            newRate = rate * 0.5;
        }
        // 3. CENÁRIO DE QUEDA EXCESSIVA (Queda > 100 mg/dL/h)
        else if (drop > 100) {
            color = 'orange';
            advice = `Queda muito rápida (${drop} mg/dL).`;
            subAdvice = [
                'Risco de Edema Cerebral.',
                'Reduzir a vazão da insulina em 50%.'
            ];
            newRate = rate * 0.5;
        }
        // 4. CENÁRIO DE QUEDA INSUFICIENTE (Queda < 50 mg/dL/h)
        else if (drop < 50) {
            color = 'purple';
            advice = `Queda insuficiente (${drop} mg/dL).`;
            subAdvice = [
                'Aumentar a vazão da insulina em 50% (x 1.5).'
            ];
            newRate = rate * 1.5;
        }
        // 5. CENÁRIO IDEAL (Queda 50 a 75 mg/dL/h)
        else {
            color = 'green';
            advice = 'Queda adequada. Manter conduta atual.';
            newRate = rate;
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">HGT Anterior</label>
                    <input 
                        type="number" 
                        value={hgtPrev} 
                        onChange={(e) => setHgtPrev(e.target.value)} 
                        className="w-full p-2 border rounded-lg font-bold dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:border-indigo-500 outline-none"
                        placeholder="1h atrás"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">HGT Atual</label>
                    <input 
                        type="number" 
                        value={hgtCurr} 
                        onChange={(e) => setHgtCurr(e.target.value)} 
                        className="w-full p-2 border rounded-lg font-bold dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:border-indigo-500 outline-none"
                        placeholder="Agora"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vazão (mL/h)</label>
                    <input 
                        type="number" 
                        value={currentRate} 
                        onChange={(e) => setCurrentRate(e.target.value)} 
                        className="w-full p-2 border rounded-lg font-bold dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:border-indigo-500 outline-none"
                        placeholder="Atual"
                    />
                </div>
            </div>

            {advice && (
                <div className={`p-5 rounded-2xl border-l-8 shadow-md animate-fade-in ${
                    color === 'emergency-red' ? 'bg-red-600 text-white animate-pulse border-red-800' :
                    color === 'yellow' ? 'bg-yellow-50 border-yellow-400 text-yellow-900' :
                    color === 'orange' ? 'bg-orange-50 border-orange-400 text-orange-900' :
                    color === 'purple' ? 'bg-purple-50 border-purple-400 text-purple-900' :
                    'bg-green-50 border-green-400 text-green-900'
                }`}>
                    <h4 className="font-black text-lg mb-2 flex items-center gap-2 uppercase tracking-tight">
                        {color === 'emergency-red' && <span className="text-2xl">🚨</span>}
                        {advice}
                    </h4>
                    
                    {subAdvice.length > 0 && (
                        <ul className="space-y-1 mb-3">
                            {subAdvice.map((s, i) => (
                                <li key={i} className={`flex items-start gap-2 text-sm font-bold ${color === 'emergency-red' ? 'text-white' : 'opacity-80'}`}>
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}

                    {newRate !== null && color !== 'emergency-red' && (
                        <div className="mt-4 pt-3 border-t border-current/10">
                            <span className="text-[10px] uppercase font-black opacity-60">Nova Vazão Sugerida:</span>
                            <div className="text-3xl font-black mt-0.5">
                                {newRate.toFixed(1)} <span className="text-xl font-medium">mL/h</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
const CetoacidosePage: React.FC = () => {
    // Accordion State
    const [openSection, setOpenSection] = useState<number | null>(1); // Default open first

    const toggleSection = (index: number) => {
        setOpenSection(openSection === index ? null : index);
    };

    return (
        <div className="container mx-auto max-w-3xl pb-20">
            {/* Header */}
             <Link to="/emergencia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
            </Link>

            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                    <Icons.Flask />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Cetoacidose Diabética (CAD)</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Protocolo de manejo e tratamento intensivo.</p>
            </div>

            {/* Accordion Steps */}
            <div className="space-y-4">
                
                {/* 1. Diagnóstico */}
                <AccordionItem 
                    title="1. Critérios Diagnósticos" 
                    icon={<Icons.Activity />} 
                    isOpen={openSection === 1} 
                    onToggle={() => toggleSection(1)}
                    accentColor="blue"
                >
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">Glicemia ≥ 200 mg/dL</span>
                        </li>
                        <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">Acidose metabólica (pH {'<'} 7,3 ou HCO3 {'<'} 15)</span>
                        </li>
                        <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">Cetose (Cetonúria ≥ 2+ ou Cetonemia ≥ 3 mmol/L)</span>
                        </li>
                    </ul>
                </AccordionItem>

                {/* 2. Manejo Inicial */}
                <AccordionItem 
                    title="2. Manejo Inicial (1ª Hora)" 
                    icon={<Icons.Flask />} 
                    isOpen={openSection === 2} 
                    onToggle={() => toggleSection(2)}
                    accentColor="indigo"
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border-l-4 border-indigo-500">
                            <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-1">Hidratação Vigorosa</h4>
                            <p className="text-indigo-700 dark:text-indigo-200 text-sm">
                                Se HGT {'>'} 250: <strong>SF 0,9% 15-20 mL/kg</strong> na 1ª hora.
                            </p>
                            <p className="text-indigo-700 dark:text-indigo-200 text-sm mt-1">
                                Se HGT {'<'} 250: <strong>SG 5% + NaCl 20%</strong> (Manter glicemia).
                            </p>
                        </div>
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm">
                            <strong>Solicitar Exames:</strong> Gasometria, Eletrólitos (Na, K, Mg, P), Cetona, ECG, Função Renal.
                        </div>
                    </div>
                </AccordionItem>

                {/* 3. Sódio */}
                <AccordionItem 
                    title="3. Correção de Sódio" 
                    icon={<Icons.Calculator />} 
                    isOpen={openSection === 3} 
                    onToggle={() => toggleSection(3)}
                    accentColor="cyan"
                >
                    <SodiumCalculator />
                </AccordionItem>

                {/* 4. Potássio */}
                <AccordionItem 
                    title="4. Potássio (Trava de Segurança)" 
                    icon={<span className="text-lg font-bold">K+</span>} 
                    isOpen={openSection === 4} 
                    onToggle={() => toggleSection(4)}
                    accentColor="purple"
                >
                    <PotassiumLogic />
                </AccordionItem>

                {/* 5. Insulina */}
                <AccordionItem 
                    title="5. Iniciar Insulina" 
                    icon={<span className="text-lg">💉</span>} 
                    isOpen={openSection === 5} 
                    onToggle={() => toggleSection(5)}
                    accentColor="emerald"
                >
                    <InsulinCalculator />
                </AccordionItem>

                {/* 6. Reavaliação */}
                <AccordionItem 
                    title="6. Reavaliação Horária" 
                    icon={<span className="text-lg">⏱️</span>} 
                    isOpen={openSection === 6} 
                    onToggle={() => toggleSection(6)}
                    accentColor="orange"
                >
                    <ReassessmentLogic />
                </AccordionItem>

                {/* 7. Resolução */}
                <AccordionItem 
                    title="7. Critérios de Resolução" 
                    icon={<Icons.CheckCircle />} 
                    isOpen={openSection === 7} 
                    onToggle={() => toggleSection(7)}
                    accentColor="green"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {['HGT < 200', 'HCO3 ≥ 15', 'pH > 7.3', 'Gap ≤ 12'].map((crit, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-800 dark:text-green-200 font-bold text-sm">
                                    <Icons.CheckCircle /> {crit}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
                            <h4 className="font-bold text-yellow-800 dark:text-yellow-300 uppercase text-xs mb-1">Transição (Overlap)</h4>
                            <p className="text-yellow-900 dark:text-yellow-100 text-sm">
                                Aplicar insulina Basal (NPH/Glargina) SC <strong>2 horas antes</strong> de desligar a Bomba.
                            </p>
                        </div>
                    </div>
                </AccordionItem>
            </div>
        </div>
    );
};

export default CetoacidosePage;
