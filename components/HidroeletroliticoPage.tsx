
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import UnderConstruction from './UnderConstruction';

// --- Types ---
type ScreenType = 'menu' | 'sodium' | 'potassium' | 'bicarb' | 'magnesium' | 'na_corr' | 'ca_corr' | 'calcium';

// --- Icons & UI Components ---

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        onClick={onClick}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-4"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar ao Menu
    </button>
);

const ElementIcon: React.FC<{ symbol: string, charge: string, colorClass: string }> = ({ symbol, charge, colorClass }) => (
    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
        <div className="font-bold text-lg leading-none">
            {symbol}<sup className="text-xs">{charge}</sup>
        </div>
    </div>
);

// --- Sub-Components: Logic Screens ---

// 1. Sodium Calculator (Adrogue-Madias)
const SodiumScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [currentNa, setCurrentNa] = useState<string>('');
    const [targetNa, setTargetNa] = useState<string>('140');
    const [weight, setWeight] = useState<string>('');
    const [sex, setSex] = useState<'male' | 'female'>('male');
    const [ageGroup, setAgeGroup] = useState<'young' | 'elderly'>('young');
    const [selectedSolution, setSelectedSolution] = useState<string>('');

    // Full Solution Data
    const ALL_SOLUTIONS = useMemo(() => [
        { id: 'sf09', label: 'SF 0,9%', na: 154, recipe: 'Soro fisiológico 0,9% (Puro)' },
        { id: 'sal3', label: 'Salina 3%', na: 513, recipe: 'Soro fisiológico 0,9% 450 mL + NaCl 20% 50 mL' },
        { id: 'sal045', label: 'Salina 0,45%', na: 77, recipe: 'Água Destilada 490 mL + NaCl 20% 10 mL' },
        { id: 'sg5', label: 'SG 5%', na: 0, recipe: 'Soro Glicosado 5% (Puro)' },
    ], []);

    // Safety Filter Logic
    const { availableSolutions, contextMessage, contextColor } = useMemo(() => {
        const na = parseFloat(currentNa);
        
        if (isNaN(na)) {
            return { availableSolutions: ALL_SOLUTIONS, contextMessage: '', contextColor: 'gray' };
        }

        if (na < 135) {
            // Hiponatremia: Apenas soluções isotônicas ou hipertônicas
            return {
                availableSolutions: ALL_SOLUTIONS.filter(s => s.id === 'sal3' || s.id === 'sf09'),
                contextMessage: 'Hiponatremia: Mostrando apenas soluções para aumentar o Sódio.',
                contextColor: 'text-orange-600 bg-orange-50 border-orange-200'
            };
        } else if (na > 145) {
            // Hipernatremia: Apenas soluções hipotônicas ou água livre
            return {
                availableSolutions: ALL_SOLUTIONS.filter(s => s.id === 'sg5' || s.id === 'sal045'),
                contextMessage: 'Hipernatremia: Mostrando apenas soluções para baixar o Sódio.',
                contextColor: 'text-blue-600 bg-blue-50 border-blue-200'
            };
        } else {
            // Normonatremia
            return {
                availableSolutions: ALL_SOLUTIONS,
                contextMessage: 'Sódio dentro da normalidade (135-145).',
                contextColor: 'text-green-600 bg-green-50 border-green-200'
            };
        }
    }, [currentNa, ALL_SOLUTIONS]);

    // Auto-Reset Selection if it becomes invalid due to filter change
    useEffect(() => {
        const isValid = availableSolutions.find(s => s.id === selectedSolution);
        if (!isValid && availableSolutions.length > 0) {
            setSelectedSolution(availableSolutions[0].id);
        }
    }, [availableSolutions, selectedSolution]);

    const calculate = () => {
        const naCurr = parseFloat(currentNa);
        const naTarg = parseFloat(targetNa);
        const w = parseFloat(weight);
        
        if (!naCurr || !naTarg || !w || !selectedSolution) return null;

        // 1. Calculate TBW (Total Body Water)
        let tbwFactor = 0.6;
        if (sex === 'male') {
            tbwFactor = ageGroup === 'young' ? 0.6 : 0.5;
        } else {
            tbwFactor = ageGroup === 'young' ? 0.5 : 0.45;
        }
        const tbw = w * tbwFactor;

        // 2. Identify Infusate Na
        const solution = ALL_SOLUTIONS.find(s => s.id === selectedSolution);
        if (!solution) return null;
        const naInfusate = solution.na;

        // 3. Adrogue-Madias Formula (Change in Serum Na per Liter of Infusate)
        // Delta Na = (Na_infusate - Na_serum) / (TBW + 1)
        const deltaNaPerLiter = (naInfusate - naCurr) / (tbw + 1);

        // 4. Calculate Volume Needed
        const totalDeltaNeeded = naTarg - naCurr;
        
        if (deltaNaPerLiter === 0) return { flowRate: 0, recipe: solution.recipe, deltaNaPerLiter: "0", direction: 'manter' }; // Avoid division by zero

        const litersNeeded = totalDeltaNeeded / deltaNaPerLiter;
        const millilitersNeeded = litersNeeded * 1000;

        // 5. Flow Rate (mL/h) for 24h
        const flowRate = millilitersNeeded / 24;

        return {
            flowRate: Math.abs(flowRate).toFixed(1), // Use absolute to handle correction in both directions
            recipe: solution.recipe,
            direction: totalDeltaNeeded > 0 ? 'aumentar' : 'reduzir',
            deltaNaPerLiter: deltaNaPerLiter.toFixed(2)
        };
    };

    const result = calculate();

    return (
        <div>
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6">Correção de Sódio (Adrogue-Madias)</h2>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Dados do Paciente</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Na+ Atual</label>
                                <input type="number" value={currentNa} onChange={e => setCurrentNa(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="mEq/L" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Na+ Alvo</label>
                                <input type="number" value={targetNa} onChange={e => setTargetNa(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Default 140" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Peso (kg)</label>
                                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Idade / Sexo</label>
                                <div className="flex gap-2">
                                    <select value={sex} onChange={(e: any) => setSex(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm">
                                        <option value="male">Homem</option>
                                        <option value="female">Mulher</option>
                                    </select>
                                    <select value={ageGroup} onChange={(e: any) => setAgeGroup(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm">
                                        <option value="young">{'< 65'}</option>
                                        <option value="elderly">{'≥ 65'}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">Solução Disponível</h3>
                        </div>
                        
                        {contextMessage && (
                            <div className={`mb-3 p-2 text-xs font-bold rounded border ${contextColor}`}>
                                {contextMessage}
                            </div>
                        )}

                        <div className="space-y-2">
                            {availableSolutions.map(sol => (
                                <button
                                    key={sol.id}
                                    onClick={() => setSelectedSolution(sol.id)}
                                    className={`w-full text-left p-3 rounded-lg border flex justify-between items-center transition-all ${selectedSolution === sol.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700'}`}
                                >
                                    <span className="font-medium text-slate-800 dark:text-white">{sol.label}</span>
                                    <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">Na: {sol.na}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-3 italic">
                            {ALL_SOLUTIONS.find(s => s.id === selectedSolution)?.recipe || 'Selecione uma solução'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col">
                    {result ? (
                        <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>
                            </div>
                            
                            <h3 className="text-blue-100 uppercase tracking-wider text-sm font-bold mb-2">Prescrição Sugerida</h3>
                            <div className="text-xl md:text-2xl font-bold leading-relaxed mb-6">
                                Prescreva: <br/>
                                <span className="text-yellow-300 border-b-2 border-yellow-300/50 pb-1">{result.recipe}</span>
                                <br/> EV em Bomba de Infusão Contínua (BIC) a:
                            </div>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl font-extrabold">{result.flowRate}</span>
                                <span className="text-xl">mL/h</span>
                            </div>
                            <div className="text-sm bg-white/20 p-3 rounded-lg">
                                Estimativa: Cada litro desta solução altera o Na+ sérico em aprox. <strong>{result.deltaNaPerLiter} mEq/L</strong>.
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 p-8 text-center">
                            Preencha os dados do paciente para calcular.
                        </div>
                    )}
                    
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg">
                        <h4 className="text-red-700 dark:text-red-400 font-bold text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Alerta de Segurança
                        </h4>
                        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                            A correção rápida de hiponatremia crônica pode causar <strong>Mielinólise Pontina Central</strong>. 
                            Recomendação: Não exceder correção de 8-10 mEq/L nas primeiras 24 horas. Recalcule e monitore o Na+ seriado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Potassium Protocol
const PotassiumScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [kValue, setKValue] = useState<string>('');
    const [veinType, setVeinType] = useState<'peripheral' | 'central'>('peripheral');
    
    const k = parseFloat(kValue);

    return (
        <div>
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-bold text-violet-700 dark:text-violet-400 mb-6">Distúrbios do Potássio (K+)</h2>

            <div className="mb-8 max-w-xl mx-auto">
                <label className="block text-center text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Valor do K+ SÉRICO</label>
                <div className="relative">
                    <input 
                        type="number" 
                        step="0.1"
                        value={kValue}
                        onChange={e => setKValue(e.target.value)}
                        placeholder="Ex: 2.5"
                        className="w-full text-center text-4xl font-bold py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-0 dark:bg-slate-800 dark:text-white transition-all shadow-sm placeholder-slate-300"
                        autoFocus
                    />
                    <span className="absolute right-4 bottom-6 text-slate-400 font-medium">mEq/L</span>
                </div>
            </div>

            {!isNaN(k) && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* HIPOCALEMIA GRAVE (< 3.0) */}
                    {k < 3.0 && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                <span className="bg-red-100 dark:bg-red-900 p-1 rounded">📉</span> Hipocalemia Grave
                            </h3>
                            
                            <div className="flex justify-center mb-6">
                                <div className="bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 inline-flex">
                                    <button 
                                        onClick={() => setVeinType('peripheral')}
                                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${veinType === 'peripheral' ? 'bg-violet-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Veia Periférica
                                    </button>
                                    <button 
                                        onClick={() => setVeinType('central')}
                                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${veinType === 'central' ? 'bg-violet-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Veia Central
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {veinType === 'peripheral' ? (
                                    <>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-violet-500">
                                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Opção A (Lenta)</h4>
                                            <p className="text-lg font-mono text-violet-700 dark:text-violet-300">KCl 10% 30mL + 470mL SF 0,9%</p>
                                            <p className="text-sm text-slate-500 mt-1">Correr em 4 horas.</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-violet-500">
                                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Opção B (Concentrada)</h4>
                                            <p className="text-lg font-mono text-violet-700 dark:text-violet-300">KCl 19,1% 15mL + 485mL SF 0,9%</p>
                                            <p className="text-sm text-slate-500 mt-1">Correr em 4 horas.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-violet-500">
                                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Opção Central A</h4>
                                            <p className="text-lg font-mono text-violet-700 dark:text-violet-300">KCl 10% 20mL + 230mL SF 0,9%</p>
                                            <p className="text-sm text-slate-500 mt-1">Correr em 2 horas.</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-violet-500">
                                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Opção Central B</h4>
                                            <p className="text-lg font-mono text-violet-700 dark:text-violet-300">KCl 19,1% 10mL + 240mL SF 0,9%</p>
                                            <p className="text-sm text-slate-500 mt-1">Correr em 2 horas.</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* HIPOCALEMIA LEVE/MODERADA (3.0 - 3.4) */}
                    {k >= 3.0 && k <= 3.4 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-400 mb-4">Hipocalemia Leve</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                                    <div className="font-mono text-xl text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 rounded">1</div>
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-white">KCl 600mg (Comprimido)</div>
                                        <div className="text-sm text-slate-500">Administrar 1 a 2 comprimidos VO após as refeições.</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                                    <div className="font-mono text-xl text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 rounded">2</div>
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-white">KCl Xarope 6%</div>
                                        <div className="text-sm text-slate-500">10 a 20 mL VO (Diluir em suco/água).</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                                    <div className="font-mono text-xl text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 rounded">3</div>
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-white">Citrato de Potássio</div>
                                        <div className="text-sm text-slate-500">1 Comprimido VO (Opção se intolerância gástrica ao KCl).</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* POTASSIO NORMAL (3.5 - 5.5) */}
                    {k > 3.4 && k <= 5.5 && (
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-2xl p-8 text-center">
                            <div className="inline-block p-4 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Potássio dentro da normalidade</h3>
                        </div>
                    )}

                    {/* HIPERCALEMIA (> 5.5) */}
                    {k > 5.5 && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                <span className="bg-red-100 dark:bg-red-900 p-1 rounded">📈</span> Hipercalemia
                            </h3>
                            
                            <div className="mb-6 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg text-red-800 dark:text-red-200 text-sm font-semibold border-l-4 border-red-500">
                                🛑 Suspender: IECA, BRA, Espironolactona, AINEs e Suplementos de K+.
                            </div>

                            {(k > 6.5) && (
                                <div className="mb-6 bg-white dark:bg-slate-800 border-2 border-red-500 p-4 rounded-xl shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg uppercase">Emergência</div>
                                    <h4 className="font-bold text-red-600 mb-2">1. Proteção Cardíaca (Estabilização de Membrana)</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Indicação: K {'>'} 6.5 ou Alterações no ECG (Onda T apiculada, QRS largo).</p>
                                    <p className="text-lg font-mono font-bold text-slate-800 dark:text-white bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                        Gluconato de Cálcio 10% 10 mL + 100 mL SG 5% EV em BIC - correr em 10 minutos (pode ser repetido 3x ou até normalizar ECG).
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Pode repetir em 5 min se ECG não normalizar.</p>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-sm uppercase text-blue-600">2. Translocação (Shift)</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                                            <strong>Solução Polarizante:</strong><br/> 
                                            Insulina Regular 10 UI + 50g de Glicose (100mL G50%) IV em 15-30 min.
                                        </li>
                                        <li className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                                            <strong>Beta-2 Agonista:</strong><br/> 
                                            Salbutamol (Nebulização) 10-20mg (2.5-5mL) em SF.
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-sm uppercase text-orange-600">3. Expoliação (Remoção)</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                                            <strong>Diurético de Alça:</strong><br/> 
                                            Furosemida 40-80mg IV.
                                        </li>
                                        <li className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                                            <strong>Resina de Troca:</strong><br/> 
                                            Poliestirenossulfonato de Cálcio - Sorcal® (30 g/envelope) - 15g + 100 mL água VO de 6/6 horas.
                                        </li>
                                        <li className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-red-200">
                                            <strong>Hemodiálise:</strong><br/> 
                                            Definitivo se refratário ou anúrico.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 3. Magnesium Module
const MagnesiumScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    // Flow state:
    // Step 1: Torsades (Yes/No)
    // Step 2: (If No) Severe Symptoms (Yes/No)
    const [isTorsades, setIsTorsades] = useState<boolean | null>(null);
    const [isSevere, setIsSevere] = useState<boolean | null>(null);
    const [ampouleStrength, setAmpouleStrength] = useState<10 | 50>(10);

    const resetFlow = () => {
        setIsTorsades(null);
        setIsSevere(null);
    };

    // Determine Logic Scenario
    // Scenario A: Torsades = YES
    // Scenario B: Torsades = NO, Severe = YES
    // Scenario C: Torsades = NO, Severe = NO
    let scenario: 'A' | 'B' | 'C' | null = null;
    if (isTorsades === true) scenario = 'A';
    else if (isTorsades === false) {
        if (isSevere === true) scenario = 'B';
        else if (isSevere === false) scenario = 'C';
    }

    // Helper for rendering the recipe based on ampoule
    const getAttackRecipe = () => {
        if (ampouleStrength === 10) return '20 mL (10%) + 100 mL SG 5%'; // 2g
        return '4 mL (50%) + 100 mL SG 5%'; // 2g
    };

    const getMaintenanceRecipe = () => {
        if (ampouleStrength === 10) return '40 mL (10%) + 460 mL SG 5% (ou SF 0,9%)'; // 4g
        return '8 mL (50%) + 492 mL SG 5% (ou SF 0,9%)'; // 4g
    };

    return (
        <div className="animate-fade-in">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-6">Distúrbios do Magnésio (Mg2+)</h2>

            {/* Ampoule Selector */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-bold text-slate-700 dark:text-slate-300">Ampola disponível:</span>
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button 
                        onClick={() => setAmpouleStrength(10)}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${ampouleStrength === 10 ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Sulfato de Mg 10%
                    </button>
                    <button 
                        onClick={() => setAmpouleStrength(50)}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${ampouleStrength === 50 ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Sulfato de Mg 50%
                    </button>
                </div>
            </div>

            {/* Decision Flow */}
            <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-l-4 border-emerald-500 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">1. É um caso de Torsade de Pointes?</h3>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => { setIsTorsades(true); setIsSevere(null); }}
                            className={`px-6 py-2 rounded-lg font-bold border transition-all ${isTorsades === true ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                        >
                            SIM
                        </button>
                        <button 
                            onClick={() => { setIsTorsades(false); }}
                            className={`px-6 py-2 rounded-lg font-bold border transition-all ${isTorsades === false ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                        >
                            NÃO
                        </button>
                    </div>
                </div>

                {/* Step 2 (Only if Torsades is NO) */}
                {isTorsades === false && (
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-l-4 border-emerald-500 shadow-sm animate-fade-in">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">2. Sintomas graves (tetania, arritmia, convulsão)?</h3>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsSevere(true)}
                                className={`px-6 py-2 rounded-lg font-bold border transition-all ${isSevere === true ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                            >
                                SIM
                            </button>
                            <button 
                                onClick={() => setIsSevere(false)}
                                className={`px-6 py-2 rounded-lg font-bold border transition-all ${isSevere === false ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                            >
                                NÃO
                            </button>
                        </div>
                    </div>
                )}

                {/* Result Cards */}
                {scenario && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6 animate-fade-in">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Conduta Sugerida</h3>
                            <button onClick={resetFlow} className="text-xs text-emerald-600 underline">Reiniciar</button>
                        </div>
                        
                        {scenario === 'A' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border-l-4 border-red-500">
                                    <h4 className="font-bold text-red-600 uppercase text-xs mb-1">Dose de Ataque (Emergência)</h4>
                                    <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
                                        {getAttackRecipe()}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">Correr em <span className="font-bold text-slate-700 dark:text-slate-300">2 a 15 minutos</span>.</p>
                                </div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400 italic">Nota: Repetir bolus se arritmia persistir.</p>
                            </div>
                        )}

                        {scenario === 'B' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border-l-4 border-orange-500">
                                    <h4 className="font-bold text-orange-600 uppercase text-xs mb-1">1. Dose de Ataque</h4>
                                    <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
                                        {getAttackRecipe()}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">Correr em <span className="font-bold text-slate-700 dark:text-slate-300">5 a 60 minutos</span>.</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border-l-4 border-emerald-500">
                                    <h4 className="font-bold text-emerald-600 uppercase text-xs mb-1">2. Dose de Manutenção (Na sequência)</h4>
                                    <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
                                        {getMaintenanceRecipe()}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">Correr em <span className="font-bold text-slate-700 dark:text-slate-300">12 a 24 horas</span>.</p>
                                </div>
                            </div>
                        )}

                        {scenario === 'C' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border-l-4 border-emerald-500">
                                    <h4 className="font-bold text-emerald-600 uppercase text-xs mb-1">Reposição Lenta</h4>
                                    <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
                                        {getMaintenanceRecipe()}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">Correr em <span className="font-bold text-slate-700 dark:text-slate-300">12 a 24 horas</span>.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// 4. Bicarbonate Module
const BicarbonateScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [weight, setWeight] = useState<string>('');
    const [currentHco3, setCurrentHco3] = useState<string>('');
    const [targetHco3, setTargetHco3] = useState<string>('');
    
    // Formula: Deficit = 0.5 * Weight * (Target - Current)
    // Ampoule 8.4% = 1 mEq/mL.
    // So Volume (mL) = Deficit (mEq).
    
    let result = null;
    const w = parseFloat(weight);
    const curr = parseFloat(currentHco3);
    const targ = parseFloat(targetHco3);

    if (w > 0 && curr > 0 && targ > 0 && targ > curr) {
        const deficit = 0.5 * w * (targ - curr);
        const volumeBicarb = deficit; // 1 mEq = 1 mL for 8.4%
        const volumeSG = deficit; // 1:1 dilution
        const totalVolume = volumeBicarb + volumeSG;
        // Adjusted per user request to 2 hours
        const timeHours = 2; 
        const flowRate = totalVolume / timeHours; 
        
        result = {
            volumeBicarb: volumeBicarb.toFixed(0),
            volumeSG: volumeSG.toFixed(0),
            totalVolume: totalVolume.toFixed(0),
            flowRate: flowRate.toFixed(0)
        };
    }

    return (
        <div className="animate-fade-in">
             <BackButton onClick={onBack} />
             <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-6">Bicarbonato de Sódio (HCO3-)</h2>

             <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg mb-8">
                <h4 className="font-bold text-red-700 dark:text-red-300 uppercase text-xs mb-1">Indicação Estrita</h4>
                <p className="text-sm text-red-600 dark:text-red-200">
                    Geralmente reservado para acidose metabólica aguda grave com <strong>pH &lt; 7,1</strong> ou instabilidade hemodinâmica severa refratária.
                </p>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Dados para Cálculo</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Peso (kg)</label>
                                <input 
                                    type="number" 
                                    value={weight} 
                                    onChange={e => setWeight(e.target.value)} 
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                                    placeholder="Ex: 70"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">HCO3 Atual</label>
                                    <input 
                                        type="number" 
                                        value={currentHco3} 
                                        onChange={e => setCurrentHco3(e.target.value)} 
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                                        placeholder="Ex: 8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">HCO3 Alvo</label>
                                    <input 
                                        type="number" 
                                        value={targetHco3} 
                                        onChange={e => setTargetHco3(e.target.value)} 
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                                        placeholder="Ex: 12"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    {result ? (
                        <div className="bg-cyan-600 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                            <h3 className="text-cyan-100 uppercase tracking-wider text-sm font-bold mb-4">Prescrição de Reposição</h3>
                            
                            <div className="mb-6 space-y-4 font-mono text-lg">
                                <div className="bg-white/10 p-4 rounded-lg">
                                    <p className="font-bold mb-2">Preparo:</p>
                                    <p>
                                        <span className="font-bold text-2xl">{result.volumeBicarb} mL</span> de Bicarbonato 8,4% <br/>
                                        + <span className="font-bold text-2xl">{result.volumeSG} mL</span> de SG 5% EV
                                    </p>
                                </div>

                                <div className="bg-white/20 p-4 rounded-lg border border-white/30">
                                    <p className="font-bold mb-1">Velocidade (Bomba):</p>
                                    <p className="text-xl">
                                        Correr a <span className="text-4xl font-extrabold">{result.flowRate}</span> mL/h
                                    </p>
                                    <p className="text-sm opacity-80 mt-1">(Tempo estimado: 2 horas)</p>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-red-500/20 border border-red-200/30 rounded-lg flex items-center gap-2 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Monitorar Sódio e Potássio durante a infusão.
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 p-8 text-center">
                            Preencha os valores para calcular o déficit.
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

// 5. Calcium Correction Calculator (Albumin)
const CalciumCorrectionScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [measuredCa, setMeasuredCa] = useState<string>('');
    const [albumin, setAlbumin] = useState<string>('');
    const [albuminRef, setAlbuminRef] = useState<string>('4.0');

    let correctedCa: string | null = null;
    const ca = parseFloat(measuredCa);
    const alb = parseFloat(albumin);
    const ref = parseFloat(albuminRef);

    if (!isNaN(ca) && !isNaN(alb) && !isNaN(ref)) {
        // Corrected Ca = Measured Ca + 0.8 * (Normal Albumin - Patient Albumin)
        const result = ca + 0.8 * (ref - alb);
        correctedCa = result.toFixed(2);
    }

    return (
        <div className="animate-fade-in">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-6">Cálcio Corrigido pela Albumina</h2>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cálcio Sérico (mg/dL)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={measuredCa}
                            onChange={(e) => setMeasuredCa(e.target.value)}
                            placeholder="Ex: 7.8"
                            className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Albumina (g/dL)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={albumin}
                            onChange={(e) => setAlbumin(e.target.value)}
                            placeholder="Ex: 2.5"
                            className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Referência da Albumina</label>
                    <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600 flex-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <input
                                type="radio"
                                name="albuminRef"
                                value="4.0"
                                checked={albuminRef === '4.0'}
                                onChange={(e) => setAlbuminRef(e.target.value)}
                                className="w-5 h-5 text-pink-600 focus:ring-pink-500"
                            />
                            <span className="ml-2 font-medium text-slate-700 dark:text-slate-200">4.0 g/dL</span>
                        </label>
                        <label className="flex items-center cursor-pointer bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600 flex-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <input
                                type="radio"
                                name="albuminRef"
                                value="4.4"
                                checked={albuminRef === '4.4'}
                                onChange={(e) => setAlbuminRef(e.target.value)}
                                className="w-5 h-5 text-pink-600 focus:ring-pink-500"
                            />
                            <span className="ml-2 font-medium text-slate-700 dark:text-slate-200">4.4 g/dL</span>
                        </label>
                    </div>
                </div>

                {correctedCa ? (
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-900/30 rounded-xl p-6 text-center animate-fade-in">
                        <p className="text-sm text-pink-700 dark:text-pink-300 font-semibold uppercase tracking-wide mb-2">Resultado</p>
                        <p className="text-3xl font-extrabold text-pink-600 dark:text-pink-400">
                            Cálcio corrigido {correctedCa} mg/dL
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Fórmula: Ca + 0.8 × (Ref - Albumina)
                        </p>
                    </div>
                ) : (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                        Preencha os campos para calcular.
                    </div>
                )}
            </div>
        </div>
    );
};

// 6. Sodium Correction Calculator (Glucose)
const SodiumCorrectionScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [measuredNa, setMeasuredNa] = useState<string>('');
    const [glucose, setGlucose] = useState<string>('');

    let correctedNa: string | null = null;
    const na = parseFloat(measuredNa);
    const glu = parseFloat(glucose);

    if (!isNaN(na) && !isNaN(glu)) {
        if (glu <= 100) {
            correctedNa = na.toFixed(1);
        } else {
            // NaCorrigido = NaMedido + 0.016 * (Glicose - 100)
            const result = na + 0.016 * (glu - 100);
            correctedNa = result.toFixed(1);
        }
    }

    return (
        <div className="animate-fade-in">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-6">Sódio Corrigido pela Glicemia</h2>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sódio Medido (mEq/L)</label>
                        <input
                            type="number"
                            step="1"
                            value={measuredNa}
                            onChange={(e) => setMeasuredNa(e.target.value)}
                            placeholder="Ex: 128"
                            className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Glicose (mg/dL)</label>
                        <input
                            type="number"
                            step="1"
                            value={glucose}
                            onChange={(e) => setGlucose(e.target.value)}
                            placeholder="Ex: 450"
                            className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                    </div>
                </div>

                {correctedNa ? (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-6 text-center animate-fade-in">
                        <p className="text-sm text-orange-700 dark:text-orange-300 font-semibold uppercase tracking-wide mb-2">Resultado</p>
                        <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
                            O Sódio corrigido é de {correctedNa} mEq/L
                        </p>
                        {glu > 100 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                +1.6 mEq para cada 100mg de glicose acima de 100mg/dL.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                        Preencha os campos para calcular.
                    </div>
                )}
            </div>
        </div>
    );
};

// 7. Hypocalcemia Protocol
const HypocalcemiaScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'severe' | 'mild'>('severe');

    return (
        <div className="animate-fade-in pb-10">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-6">Protocolo de Hipocalcemia</h2>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6 max-w-md mx-auto">
                <button
                    onClick={() => setActiveTab('severe')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'severe'
                        ? 'bg-white dark:bg-slate-600 text-red-600 shadow-sm'
                        : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100'
                    }`}
                >
                    Hipocalcemia GRAVE
                </button>
                <button
                    onClick={() => setActiveTab('mild')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'mild'
                        ? 'bg-white dark:bg-slate-600 text-green-600 shadow-sm'
                        : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100'
                    }`}
                >
                    Leve / Assintomática
                </button>
            </div>

            {/* Content */}
            {activeTab === 'severe' ? (
                <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
                    {/* Criteria Box */}
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm">
                        <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Critérios de Gravidade
                        </h3>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                            <li><strong>Sintomas graves:</strong> convulsões, laringoespasmo, arritmias, aumento do intervalo QT.</li>
                            <li><strong>Laboratório:</strong> Cálcio Corrigido ≤ 7,5 mg/dL OU Cálcio iônico ≤ 3 mg/dL.</li>
                        </ul>
                    </div>

                    {/* Attack Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                        <div className="bg-red-600 text-white px-6 py-3 font-bold text-sm uppercase tracking-wider">
                            1. Dose de Ataque (Emergência)
                        </div>
                        <div className="p-6">
                            <p className="text-xl font-mono font-bold text-slate-800 dark:text-white mb-2">
                                Gluconato de Cálcio 10% - 10 a 20 mL + 50 mL de SG 5% (ou SF 0,9%)
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                ⏱️ Correr EV em 20 minutos.
                            </p>
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm text-red-600 dark:text-red-300">
                                <strong>Nota:</strong> Repetir após 10 a 60 minutos, se necessário, até desaparecimento dos sintomas.
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                        <div className="bg-slate-700 text-white px-6 py-3 font-bold text-sm uppercase tracking-wider">
                            2. Manutenção (Se hipocalcemia persistente)
                        </div>
                        <div className="p-6">
                            <p className="text-xl font-mono font-bold text-slate-800 dark:text-white mb-2">
                                Gluconato de Cálcio 10% - 110 mL + 890 mL de SG 5% (ou SF 0,9%)
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                💧 EV em BIC a <span className="text-blue-600 dark:text-blue-400 font-bold">50 mL/h</span> durante 24 horas.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
                    {/* Criteria Box */}
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-r-xl shadow-sm">
                        <h3 className="text-lg font-bold text-green-700 dark:text-green-300 mb-2">
                            Quadro Clínico
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300">
                            Assintomático ou sintomas leves (parestesias periorais ou de extremidades, sinal de Chvostek/Trousseau leve).
                        </p>
                    </div>

                    {/* Oral Treatment */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            💊 Tratamento Inicial (VO)
                        </h4>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
                                Carbonato de Cálcio 500mg
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 mt-1">
                                2 a 8 comprimidos/dia, fracionado em 3 a 4 doses (preferencialmente junto às refeições).
                            </p>
                        </div>
                    </div>

                    {/* Fallback IV */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            💉 Se Falha do tratamento oral (Sintomático)
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            Associar dose de ataque endovenosa:
                        </p>
                        <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded border border-red-100 dark:border-red-900/20">
                             <p className="font-mono text-sm font-bold text-red-700 dark:text-red-300">
                                Gluconato de Cálcio 10% 10-20mL + 50mL Soro (EV em 20 min).
                             </p>
                        </div>
                    </div>

                    {/* Vitamin D */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                         <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            ☀️ Se Deficiência de Vitamina D
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex gap-3 items-start">
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded mt-0.5">Ataque</span>
                                <span className="text-slate-700 dark:text-slate-300 text-sm">Colecalciferol 50.000 UI, VO 1x/semana (6 a 12 semanas).</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded mt-0.5">Manutenção</span>
                                <span className="text-slate-700 dark:text-slate-300 text-sm">1.000 UI/dia ou 7.000 UI/semana.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

const HidroeletroliticoPage: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<ScreenType>('menu');

    // Menu Item Component
    const MenuItem = ({ id, symbol, charge, color, label }: { id: ScreenType, symbol: string, charge: string, color: string, label: string }) => (
        <button
            onClick={() => setActiveScreen(id)}
            className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:-translate-y-1"
        >
            <ElementIcon symbol={symbol} charge={charge} colorClass={`text-${color}-600 border-${color}-200 bg-${color}-50`} />
            <span className="mt-4 font-bold text-slate-700 dark:text-slate-200 group-hover:text-premium-teal transition-colors text-center">
                {label}
            </span>
        </button>
    );

    // Render Logic
    if (activeScreen === 'sodium') return <SodiumScreen onBack={() => setActiveScreen('menu')} />;
    if (activeScreen === 'potassium') return <PotassiumScreen onBack={() => setActiveScreen('menu')} />;
    if (activeScreen === 'magnesium') return <MagnesiumScreen onBack={() => setActiveScreen('menu')} />;
    if (activeScreen === 'bicarb') return <BicarbonateScreen onBack={() => setActiveScreen('menu')} />;
    if (activeScreen === 'ca_corr') return <CalciumCorrectionScreen onBack={() => setActiveScreen('menu')} />;
    if (activeScreen === 'na_corr') return <SodiumCorrectionScreen onBack={() => setActiveScreen('menu')} />;
    if (activeScreen === 'calcium') return <HypocalcemiaScreen onBack={() => setActiveScreen('menu')} />;

    // Default: Menu Grid
    return (
        <div className="container mx-auto max-w-4xl pb-20">
            <Link to="/emergencia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar para Emergência
            </Link>

            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Hub Hidroeletrolítico</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Calculadoras e protocolos para correção de distúrbios.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <MenuItem id="potassium" symbol="K" charge="+" color="violet" label="Distúrbios do Potássio" />
                <MenuItem id="sodium" symbol="Na" charge="+" color="blue" label="Distúrbios do Sódio" />
                <MenuItem id="bicarb" symbol="HCO" charge="3-" color="cyan" label="Bicarbonato (pH)" />
                <MenuItem id="magnesium" symbol="Mg" charge="2+" color="emerald" label="Distúrbios do Magnésio" />
                <MenuItem id="na_corr" symbol="Na" charge="Corr." color="orange" label="Na+ Corrigido (Glicemia)" />
                <MenuItem id="calcium" symbol="Ca" charge="2+" color="pink" label="Distúrbios do Cálcio" />
                <MenuItem id="ca_corr" symbol="Ca" charge="Corr." color="red" label="Cálcio Corrigido (Alb.)" />
            </div>
        </div>
    );
};

export default HidroeletroliticoPage;
