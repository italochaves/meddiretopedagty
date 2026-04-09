
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
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    Syringe: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>
    ),
    Alert: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    )
};

// --- Reusable Accordion Component ---
interface AccordionItemProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    colorClass: string; // e.g. 'blue', 'yellow', 'orange', 'red'
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, subtitle, icon, children, isOpen, onToggle, colorClass }) => {
    // Dynamic Tailwind Classes map
    const styles = {
        blue: {
            border: 'border-blue-500',
            bgHeader: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-700 dark:text-blue-300',
            icon: 'text-blue-600 dark:text-blue-400'
        },
        yellow: {
            border: 'border-yellow-500',
            bgHeader: 'bg-yellow-50 dark:bg-yellow-900/20',
            text: 'text-yellow-700 dark:text-yellow-300',
            icon: 'text-yellow-600 dark:text-yellow-400'
        },
        orange: {
            border: 'border-orange-500',
            bgHeader: 'bg-orange-50 dark:bg-orange-900/20',
            text: 'text-orange-700 dark:text-orange-300',
            icon: 'text-orange-600 dark:text-orange-400'
        },
        red: {
            border: 'border-red-600',
            bgHeader: 'bg-red-50 dark:bg-red-900/20',
            text: 'text-red-700 dark:text-red-300',
            icon: 'text-red-600 dark:text-red-400'
        }
    };

    const style = styles[colorClass as keyof typeof styles] || styles.blue;

    return (
        <div className={`border-l-4 rounded-r-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 mb-4 ${style.border}`}>
            <button 
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isOpen ? style.bgHeader : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
                <div className="flex items-center gap-4">
                    {icon && <div className={`${style.icon}`}>{icon}</div>}
                    <div>
                        <h2 className={`text-lg font-bold ${style.text}`}>{title}</h2>
                        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
                    </div>
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

const ConvulsaoPage: React.FC = () => {
    const [weight, setWeight] = useState<string>('');
    const [openSection, setOpenSection] = useState<number | null>(1);

    const w = parseFloat(weight) || 0;

    const toggleSection = (idx: number) => setOpenSection(openSection === idx ? null : idx);

    // --- Calculations ---

    // 1st Line
    let diazepamDose = w * 0.15;
    if (diazepamDose > 10) diazepamDose = 10;
    const diazepamVol = diazepamDose / 5; // 5mg/mL

    let midazolamDose = w * 0.2;
    if (midazolamDose > 10) midazolamDose = 10;
    const midazolamVol = midazolamDose / 5; // 5mg/mL

    // 2nd Line
    const fenitoinaDose = w * 20;
    // Cap Fenitoina usually 1500-2000mg, but prompt says formula only. Keeping formula.
    const fenitoinaVol = fenitoinaDose / 50; // 50mg/mL
    const fenitoinaAmps = fenitoinaDose / 250; // 5mL amp = 250mg

    const fenobarbitalDose = w * 20; // Using 20 as standard loading

    return (
        <div className="container mx-auto max-w-3xl pb-20">
            
            {/* Header & Sticky Weight Input */}
            <div className="sticky top-16 z-30 -mt-6 sm:-mt-8 md:-mt-10 pt-6 sm:pt-8 md:pt-10 pb-4 mb-8 -mx-6 px-6 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center transition-all">
                <Link to="/emergencia" className="absolute left-6 top-8 sm:left-8 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Sair
                </Link>
                
                <h1 className="text-xl font-extrabold text-slate-800 dark:text-white uppercase tracking-tight mb-2">Crise Convulsiva</h1>
                
                <div className="relative w-40">
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="0"
                        className="w-full text-center text-4xl font-bold py-1 text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors placeholder-slate-300"
                    />
                    <span className="absolute right-2 bottom-3 text-slate-400 font-semibold text-lg">kg</span>
                </div>
            </div>

            <div className="space-y-4">
                
                {/* 1. INITIAL (0-5 min) */}
                <AccordionItem 
                    title="0 - 5 min" 
                    subtitle="Definição e Medidas Iniciais"
                    icon={<Icons.Clock />} 
                    isOpen={openSection === 1} 
                    onToggle={() => toggleSection(1)} 
                    colorClass="blue"
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-600">
                            <strong>Critérios:</strong> Crise contínua ≥ 5 min <u>OU</u> Duas crises sem recuperação da consciência (Status Epilepticus).
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase">Checklist Inicial</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <li><strong>A, B, C</strong> (Vias aéreas, Ventilação, Circulação).</li>
                                <li>Monitorização, O2 suplementar.</li>
                                <li>Acesso venoso (duas vias se possível).</li>
                                <li><strong>Glicemia Capilar (HGT).</strong></li>
                            </ul>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
                            <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm mb-2">Se Hipoglicemia Confirmada:</h4>
                            <ul className="text-sm text-yellow-800 dark:text-yellow-100 space-y-1">
                                <li>1) <strong>Tiamina 100 mg EV</strong> (Antes da glicose em alcoólatras/desnutridos).</li>
                                <li>2) <strong>Glicose 50% - 50 mL EV</strong> (Bolus).</li>
                            </ul>
                        </div>
                    </div>
                </AccordionItem>

                {/* 2. FIRST LINE (0-10 min) */}
                <AccordionItem 
                    title="0 - 10 min" 
                    subtitle="Primeira Linha: Benzodiazepínicos"
                    icon={<Icons.Syringe />} 
                    isOpen={openSection === 2} 
                    onToggle={() => toggleSection(2)} 
                    colorClass="yellow"
                >
                    <div className="space-y-6">
                        {/* Diazepam */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
                            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 text-lg mb-2">Diazepam EV (Padrão)</h3>
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Dose: 0,15 mg/kg (Máx 10mg)
                                    <br/>
                                    <span className="text-xs opacity-75">Ampola: 10mg/2mL (5mg/mL)</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-yellow-100 dark:border-yellow-900/50 text-center">
                                {w > 0 ? (
                                    <>
                                        <p className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-400">
                                            {diazepamVol.toFixed(1)} mL
                                        </p>
                                        <p className="text-sm font-medium text-slate-500">
                                            ({diazepamDose.toFixed(1)} mg)
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            EV direto em 2 min (sem diluir). Pode repetir 1x após 5 min.
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-400">Insira o peso acima.</p>
                                )}
                            </div>
                        </div>

                        {/* Alternatives */}
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                            <h4 className="font-bold text-slate-500 text-xs uppercase mb-3">Opções se sem acesso venoso</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Midazolam IM</p>
                                    <p className="text-xs text-slate-500 mb-2">0,2 mg/kg (Máx 10mg)</p>
                                    {w > 0 && (
                                        <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {midazolamVol.toFixed(1)} mL <span className="text-xs font-sans text-slate-400">(5mg/mL)</span>
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Diazepam Retal</p>
                                    <p className="text-xs text-slate-500 mb-2">0,2 mg/kg (Máx 20mg)</p>
                                    {w > 0 && (
                                        <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {(midazolamVol).toFixed(1)} mL <span className="text-xs font-sans text-slate-400">(usar sonda)</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                {/* 3. SECOND LINE (10-30 min) */}
                <AccordionItem 
                    title="10 - 30 min" 
                    subtitle="Segunda Linha: Hidantalização"
                    icon={<Icons.Alert />} 
                    isOpen={openSection === 3} 
                    onToggle={() => toggleSection(3)} 
                    colorClass="orange"
                >
                    <div className="space-y-8">
                        {/* Fenitoina */}
                        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-200 dark:border-orange-900/30">
                            <h3 className="font-bold text-orange-800 dark:text-orange-200 text-lg mb-2">Opção 1: Fenitoína (Padrão)</h3>
                            <div className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                                Dose Ataque: 20 mg/kg
                                <br/>
                                <span className="text-xs opacity-75">Ampola: 50 mg/mL (5 mL = 250 mg)</span>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 mb-4">
                                {w > 0 ? (
                                    <>
                                        <div className="flex justify-between items-end mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                            <span className="text-sm text-slate-500">Dose Total</span>
                                            <span className="text-xl font-bold text-slate-800 dark:text-white">{fenitoinaDose.toFixed(0)} mg</span>
                                        </div>
                                        <div className="flex justify-between items-end mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                            <span className="text-sm text-slate-500">Volume</span>
                                            <span className="text-xl font-bold text-slate-800 dark:text-white">{fenitoinaVol.toFixed(1)} mL</span>
                                        </div>
                                        <div className="flex justify-between items-end mb-4">
                                            <span className="text-sm text-slate-500">Ampolas</span>
                                            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">{fenitoinaAmps.toFixed(1)} amps</span>
                                        </div>
                                        
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/30 text-xs text-red-700 dark:text-red-300">
                                            <strong>ATENÇÃO:</strong> Diluir EXCLUSIVAMENTE em <strong>SF 0,9%</strong> (250-500 mL). <br/>
                                            Glicose precipita a droga! Correr em 20-30 min (Máx 50mg/min).
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-400 text-center">Insira o peso acima.</p>
                                )}
                            </div>

                            {/* MANUTENÇÃO FENITOÍNA */}
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2 uppercase tracking-wide">Dose de Manutenção</h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Iniciar 8 a 12 horas após o ataque.</p>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded border border-blue-200 dark:border-blue-700 shadow-sm">
                                    <p className="font-bold text-slate-800 dark:text-white text-sm">Fenitoína 100 mg VO ou EV de 8/8 horas.</p>
                                    <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                                        <strong>Nota (EV):</strong> Diluir 1 ampola (2mL) em 100 mL de SF 0,9%. Correr em 20 minutos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fenobarbital */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-2">Opção 2: Fenobarbital</h3>
                            <p className="text-xs text-slate-500 mb-2">Dose Ataque: 15-20 mg/kg</p>
                            {w > 0 && (
                                <p className="text-sm font-medium text-slate-800 dark:text-white mb-4">
                                    Dose Total: <span className="font-bold">{fenobarbitalDose.toFixed(0)} mg</span>
                                </p>
                            )}

                            {/* MANUTENÇÃO FENOBARBITAL */}
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2 uppercase tracking-wide">Dose de Manutenção</h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Iniciar 24 horas após o ataque.</p>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded border border-blue-200 dark:border-blue-700 shadow-sm">
                                    <p className="font-bold text-slate-800 dark:text-white text-sm">Fenobarbital 50 a 100 mg VO a cada 12 horas.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                {/* 4. THIRD LINE (>30 min) */}
                <AccordionItem 
                    title="> 30 min" 
                    subtitle="Estado de Mal Epiléptico Refratário"
                    icon={<Icons.Alert />} 
                    isOpen={openSection === 4} 
                    onToggle={() => toggleSection(4)} 
                    colorClass="red"
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-red-600 text-white rounded-xl shadow-md">
                            <h3 className="font-bold text-lg mb-2">Conduta Imediata</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm font-medium">
                                <li>Intubação Orotraqueal (IOT)</li>
                                <li>Admissão em UTI</li>
                                <li>Monitorização com EEG contínuo</li>
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-3">Drogas de Infusão Contínua (BIC)</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                                    <span className="font-medium">Midazolam</span>
                                    <span className="text-slate-500 dark:text-slate-400">Ataque 0.2mg/kg + 0.05-2 mg/kg/h</span>
                                </div>
                                <div className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                                    <span className="font-medium">Propofol</span>
                                    <span className="text-slate-500 dark:text-slate-400">Ataque 2mg/kg + 2-10 mg/kg/h</span>
                                </div>
                                <div className="text-center mt-2">
                                    <Link to="/emergencia/sedacao" className="text-xs font-bold text-blue-600 hover:underline">
                                        Ver Calculadora de Sedação &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

            </div>
        </div>
    );
};

export default ConvulsaoPage;
