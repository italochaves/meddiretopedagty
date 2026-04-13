
import React, { useState, useEffect, useCallback } from 'react';

// =============================================
// TIPOS & INTERFACES
// =============================================
interface CalculatorDef {
    id: string;
    name: string;
    description: string;
    shortName: string;
    category: string;
}

interface CalcResult {
    value: string;
    detail: string;
    color?: 'premium-teal' | 'green' | 'yellow' | 'orange' | 'red';
    raw: string;
}

// =============================================
// CATÁLOGO COM CATEGORIAS
// =============================================
const CATEGORIES = [
    { id: 'nefro',    label: 'Nefrologia e Metabólico',         icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: 'cardio',   label: 'Cardiologia e Anticoagulação',     icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { id: 'trombo',   label: 'Tromboembolismo',                  icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'sepse',    label: 'Sepse e UTI',                      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'pneumo',   label: 'Pneumologia',                      icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
    { id: 'neuro',    label: 'Neurologia',                       icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'gastro',   label: 'Gastro e Hepatologia',             icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: 'profilax', label: 'Profilaxia e Risco Hospitalar',   icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'geral',    label: 'Escalas Gerais',                   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const CALCULATORS: CalculatorDef[] = [
    // Nefrologia e Metabólico
    { id: 'ckd',      name: 'Filtro Glomerular (CKD-EPI 2021)',  description: 'Estima a TFG baseada em creatinina, idade e sexo.',              shortName: 'CKD-EPI',         category: 'nefro' },
    { id: 'sodio',    name: 'Sódio Corrigido pela Glicemia',     description: 'Calcula o sódio verdadeiro em hiperglicemia.',                    shortName: 'Sódio Corrigido', category: 'nefro' },
    { id: 'osmol',    name: 'Osmolaridade Efetiva',              description: 'Avalia a tonicidade plasmática.',                                 shortName: 'Osmolaridade',    category: 'nefro' },
    { id: 'kfre',     name: 'KFRE (Risco de Falência Renal)',    description: 'Estima risco de progressão para falência renal em 2 e 5 anos.',   shortName: 'KFRE',            category: 'nefro' },
    { id: 'imc',      name: 'IMC (Índice de Massa Corporal)',     description: 'Avaliação nutricional baseada em peso e altura.',                 shortName: 'IMC',             category: 'nefro' },
    // Cardiologia
    { id: 'chadsvasc',name: 'CHADS-VASc',                        description: 'Risco de AVC em pacientes com Fibrilação Atrial.',               shortName: 'CHADS-VASc',      category: 'cardio' },
    { id: 'hasbled',  name: 'HAS-BLED',                          description: 'Risco de sangramento em uso de anticoagulantes.',                 shortName: 'HAS-BLED',        category: 'cardio' },
    { id: 'heart',    name: 'HEART Score',                       description: 'Estratificação de risco de MACE em dor torácica.',               shortName: 'HEART Score',     category: 'cardio' },
    { id: 'rcri',     name: 'RCRI (Risco Cardíaco Cirúrgico)',   description: 'Risco de complicação cardíaca em cirurgia não-cardíaca.',        shortName: 'RCRI',            category: 'cardio' },
    // Tromboembolismo
    { id: 'wellstep', name: 'Wells TEP',                         description: 'Probabilidade clínica de TEP (Tromboembolismo Pulmonar).',       shortName: 'Wells TEP',       category: 'trombo' },
    { id: 'wellstvp', name: 'Wells TVP',                         description: 'Probabilidade clínica de TVP (Trombose Venosa Profunda).',       shortName: 'Wells TVP',       category: 'trombo' },
    { id: 'perc',     name: 'PERC Rule',                         description: 'Exclui TEP sem necessidade de D-dímero.',                        shortName: 'PERC',            category: 'trombo' },
    // Sepse e UTI
    { id: 'qsofa',    name: 'qSOFA',                             description: 'Identificação rápida de pacientes com risco de Sepse.',          shortName: 'qSOFA',           category: 'sepse' },
    { id: 'sofa',     name: 'SOFA Score',                        description: 'Avaliação sequencial de falência orgânica.',                      shortName: 'SOFA',            category: 'sepse' },
    { id: 'news2',    name: 'NEWS2',                             description: 'Score de deterioração clínica para triagem hospitalar.',          shortName: 'NEWS2',           category: 'sepse' },
    // Pneumologia
    { id: 'curb65',   name: 'CURB-65',                           description: 'Estratificação de risco em Pneumonia Adquirida na Comunidade.',  shortName: 'CURB-65',         category: 'pneumo' },
    { id: 'psiport',  name: 'PSI / PORT',                        description: 'Estratificação avançada de risco em Pneumonia.',                 shortName: 'PSI / PORT',      category: 'pneumo' },
    // Neurologia
    { id: 'glasgow',  name: 'Escala de Coma de Glasgow',         description: 'Avaliação do nível de consciência após trauma cerebral.',        shortName: 'Glasgow',         category: 'neuro' },
    { id: 'nihss',    name: 'NIHSS',                             description: 'Quantifica déficit neurológico no AVC isquêmico.',               shortName: 'NIHSS',           category: 'neuro' },
    // Gastro e Hepatologia
    { id: 'blatchford',name: 'Glasgow-Blatchford',              description: 'Risco de sangramento gastrointestinal alto.',                     shortName: 'Glasgow-Blatchford', category: 'gastro' },
    { id: 'meldna',   name: 'MELD-Na',                           description: 'Gravidade da doença hepática; prioridade em transplante.',       shortName: 'MELD-Na',         category: 'gastro' },
    { id: 'childpugh',name: 'Child-Pugh',                        description: 'Reserva funcional hepática em cirrose.',                          shortName: 'Child-Pugh',      category: 'gastro' },
    // Profilaxia
    { id: 'padua',    name: 'Padua Prediction Score',            description: 'Risco de TEV em pacientes clínicos hospitalizados.',             shortName: 'Padua',           category: 'profilax' },
    { id: 'caprini',  name: 'Caprini Score',                     description: 'Risco de TEV em pacientes cirúrgicos.',                          shortName: 'Caprini',         category: 'profilax' },
    { id: 'stopbang', name: 'STOP-BANG',                         description: 'Triagem para Apneia Obstrutiva do Sono.',                        shortName: 'STOP-BANG',       category: 'profilax' },
];

// =============================================
// COMPONENTES REUTILIZÁVEIS DE UI (MANTIDOS DO REDESIGN ANTERIOR)
// =============================================
const InputNumber = ({ label, value, onChange, placeholder = '', step = 'any', suffix = '' }: any) => (
    <div className="mb-5">
        <label className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
        <div className="relative group">
            <input
                type="number" step={step} value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-premium-teal/10 focus:border-premium-teal transition-all placeholder-slate-400 dark:placeholder-slate-600"
            />
            {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase tracking-widest">{suffix}</span>}
        </div>
    </div>
);

const Select = ({ label, value, onChange, options }: any) => (
    <div className="mb-5">
        <label className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
        <div className="relative">
            <select value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full h-12 pl-4 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-premium-teal/10 focus:border-premium-teal transition-all appearance-none cursor-pointer">
                {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    </div>
);

const Checkbox = ({ label, checked, onChange, points }: any) => (
    <div
        className={`flex items-center mb-3 p-4 border-[1.5px] rounded-2xl transition-all cursor-pointer group ${checked ? 'bg-premium-teal/[0.03] border-premium-teal shadow-sm' : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-premium-teal/30 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        onClick={() => onChange(!checked)}
    >
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${checked ? 'bg-premium-teal border-premium-teal' : 'border-slate-300 dark:border-slate-600'}`}>
            {checked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <label className="ml-4 text-[14px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex-1">{label}</label>
        {points !== undefined && <span className={`text-xs font-black ml-2 shrink-0 ${checked ? 'text-premium-teal' : 'text-slate-400'}`}>+{points}pt</span>}
    </div>
);

const ResultCard = ({ title, value, detail, color = 'premium-teal' }: any) => {
    if (!value) return null;
    const colorVariants: Record<string, string> = {
        'premium-teal': 'bg-premium-teal/[0.03] border-premium-teal text-premium-teal',
        'green':  'bg-green-50  dark:bg-green-900/10  border-green-500  text-green-600  dark:text-green-400',
        'yellow': 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500 text-yellow-600 dark:text-yellow-400',
        'orange': 'bg-orange-50 dark:bg-orange-900/10 border-orange-500 text-orange-600 dark:text-orange-400',
        'red':    'bg-red-50    dark:bg-red-900/10    border-red-500    text-red-600    dark:text-red-400',
    };
    return (
        <div className={`mt-8 p-6 sm:p-8 rounded-[2rem] border-[1.5px] shadow-sm animate-fade-in ${colorVariants[color] || colorVariants['premium-teal']}`}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border border-current/10 shrink-0">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.15em] opacity-70 mb-1">{title}</h3>
                    <div className="text-3xl sm:text-4xl font-black tracking-tight">{value}</div>
                    {detail && <div className="mt-3 text-[15px] font-bold opacity-90 leading-relaxed max-w-xl">{detail}</div>}
                </div>
            </div>
        </div>
    );
};

// =============================================
// CALCULADORAS — LÓGICA
// =============================================

// --- Nefrologia ---
const CalcCKD = ({ setResult }: any) => {
    const [cr, setCr] = useState(''); const [age, setAge] = useState(''); const [gender, setGender] = useState('female');
    useEffect(() => {
        if (!cr || !age) { setResult(null); return; }
        const c = parseFloat(cr); const a = parseFloat(age);
        if (isNaN(c) || isNaN(a)) return;
        let egfr = 0;
        if (gender === 'female') { egfr = c <= 0.7 ? 142 * Math.pow(c / 0.7, -0.241) * Math.pow(0.9938, a) * 1.012 : 142 * Math.pow(c / 0.7, -1.2) * Math.pow(0.9938, a) * 1.012; }
        else { egfr = c <= 0.9 ? 142 * Math.pow(c / 0.9, -0.302) * Math.pow(0.9938, a) : 142 * Math.pow(c / 0.9, -1.2) * Math.pow(0.9938, a); }
        const score = egfr.toFixed(1);
        let cl = ''; let color: any = 'green';
        if (egfr >= 90) { cl = 'G1 — Normal ou Alto'; color = 'green'; }
        else if (egfr >= 60) { cl = 'G2 — Levemente diminuído'; color = 'green'; }
        else if (egfr >= 45) { cl = 'G3a — Leve a moderadamente diminuído'; color = 'yellow'; }
        else if (egfr >= 30) { cl = 'G3b — Moderada a gravemente diminuído'; color = 'orange'; }
        else if (egfr >= 15) { cl = 'G4 — Gravemente diminuído'; color = 'red'; }
        else { cl = 'G5 — Falência Renal'; color = 'red'; }
        setResult({ value: `${score} mL/min/1.73m²`, detail: cl, color, raw: `eGFR CKD-EPI: ${score} mL/min/1.73m²\nClassificação: ${cl}` });
    }, [cr, age, gender, setResult]);
    return (<div><div className="grid grid-cols-2 gap-4"><Select label="Sexo" value={gender} onChange={setGender} options={[{ value: 'female', label: 'Feminino' }, { value: 'male', label: 'Masculino' }]} /><InputNumber label="Idade" value={age} onChange={setAge} placeholder="anos" suffix="anos" /></div><InputNumber label="Creatinina Sérica" value={cr} onChange={setCr} placeholder="0.0" suffix="mg/dL" /></div>);
};

const CalcSodioCorrigido = ({ setResult }: any) => {
    const [na, setNa] = useState(''); const [glicose, setGlicose] = useState('');
    useEffect(() => {
        if (!na || !glicose) { setResult(null); return; }
        const naVal = parseFloat(na); const gVal = parseFloat(glicose);
        if (isNaN(naVal) || isNaN(gVal)) return;
        const corrigido = naVal + 1.6 * ((gVal - 100) / 100);
        const color: any = corrigido > 145 ? 'red' : corrigido < 135 ? 'yellow' : 'green';
        setResult({ value: `${corrigido.toFixed(1)} mEq/L`, detail: `Sódio corrigido pela hiperglicemia. Valor na faixa ${corrigido < 135 ? 'hiponatrêmico' : corrigido > 145 ? 'hipernatrêmico' : 'normal'} após correção.`, color, raw: `Sódio corrigido: ${corrigido.toFixed(1)} mEq/L` });
    }, [na, glicose, setResult]);
    return (<div className="grid grid-cols-2 gap-4"><InputNumber label="Sódio medido" value={na} onChange={setNa} placeholder="136" suffix="mEq/L" /><InputNumber label="Glicemia" value={glicose} onChange={setGlicose} placeholder="100" suffix="mg/dL" /></div>);
};

const CalcOsmolaridade = ({ setResult }: any) => {
    const [na, setNa] = useState(''); const [glicose, setGlicose] = useState(''); const [ureia, setUreia] = useState('');
    useEffect(() => {
        if (!na || !glicose) { setResult(null); return; }
        const naVal = parseFloat(na); const gVal = parseFloat(glicose); const uVal = parseFloat(ureia) || 0;
        if (isNaN(naVal) || isNaN(gVal)) return;
        const osm = 2 * naVal + gVal / 18;
        const osmTotal = osm + uVal / 2.8;
        const color: any = osm > 320 ? 'red' : osm < 275 ? 'yellow' : 'green';
        setResult({ value: `${osmTotal.toFixed(0)} mOsm/kg`, detail: `Osmolaridade efetiva (sem ureia): ${osm.toFixed(0)} mOsm/kg. ${osm > 320 ? 'Hipertônico.' : osm < 275 ? 'Hipotônico.' : 'Isotônico.'}`, color, raw: `Osmolaridade efetiva: ${osm.toFixed(0)} mOsm/kg\nOsmolaridade total: ${osmTotal.toFixed(0)} mOsm/kg` });
    }, [na, glicose, ureia, setResult]);
    return (<div><div className="grid grid-cols-2 gap-4"><InputNumber label="Sódio" value={na} onChange={setNa} placeholder="140" suffix="mEq/L" /><InputNumber label="Glicemia" value={glicose} onChange={setGlicose} placeholder="90" suffix="mg/dL" /></div><InputNumber label="Ureia (opcional)" value={ureia} onChange={setUreia} placeholder="40" suffix="mg/dL" /></div>);
};

const CalcKFRE = ({ setResult }: any) => {
    const [age, setAge] = useState(''); const [gender, setGender] = useState('male'); const [egfr, setEgfr] = useState(''); const [acr, setAcr] = useState('');
    useEffect(() => {
        if (!age || !egfr || !acr) { setResult(null); return; }
        const a = parseFloat(age); const e = parseFloat(egfr); const ac = parseFloat(acr);
        if (isNaN(a) || isNaN(e) || isNaN(ac)) return;
        const sexAdj = gender === 'female' ? -0.209 : 0;
        const lp = -0.2201 * (e - 7.222) - 0.2467 * (Math.log(ac) - 5.137) + sexAdj - 0.1475 * (a - 66);
        const risk2 = (1 - Math.pow(0.9365, Math.exp(lp))) * 100;
        const risk5 = (1 - Math.pow(0.7418, Math.exp(lp))) * 100;
        const color: any = risk5 > 40 ? 'red' : risk5 > 20 ? 'orange' : risk5 > 5 ? 'yellow' : 'green';
        setResult({ value: `${risk2.toFixed(1)}% (2a) / ${risk5.toFixed(1)}% (5a)`, detail: `Risco estimado de falência renal em 2 e 5 anos.`, color, raw: `KFRE 2 anos: ${risk2.toFixed(1)}%\nKFRE 5 anos: ${risk5.toFixed(1)}%` });
    }, [age, gender, egfr, acr, setResult]);
    return (<div><div className="grid grid-cols-2 gap-4"><Select label="Sexo" value={gender} onChange={setGender} options={[{ value: 'male', label: 'Masculino' }, { value: 'female', label: 'Feminino' }]} /><InputNumber label="Idade" value={age} onChange={setAge} placeholder="anos" suffix="anos" /></div><div className="grid grid-cols-2 gap-4"><InputNumber label="TFG (eGFR)" value={egfr} onChange={setEgfr} placeholder="mL/min/1.73m²" suffix="mL/min" /><InputNumber label="Albuminúria (ACR)" value={acr} onChange={setAcr} placeholder="mg/g" suffix="mg/g" /></div></div>);
};

const CalcIMC = ({ setResult }: any) => {
    const [weight, setWeight] = useState(''); const [height, setHeight] = useState('');
    useEffect(() => {
        if (!weight || !height) { setResult(null); return; }
        const w = parseFloat(weight); const h = parseFloat(height) / 100;
        if (isNaN(w) || isNaN(h) || h <= 0) return;
        const imc = w / (h * h); const score = imc.toFixed(1);
        let cl = ''; let color: any = 'green';
        if (imc < 18.5) { cl = 'Baixo peso'; color = 'yellow'; }
        else if (imc < 25) { cl = 'Eutrófico'; color = 'green'; }
        else if (imc < 30) { cl = 'Sobrepeso'; color = 'yellow'; }
        else if (imc < 35) { cl = 'Obesidade Grau I'; color = 'orange'; }
        else if (imc < 40) { cl = 'Obesidade Grau II'; color = 'red'; }
        else { cl = 'Obesidade Grau III'; color = 'red'; }
        setResult({ value: `${score} kg/m²`, detail: cl, color, raw: `IMC: ${score} kg/m²\nClassificação: ${cl}` });
    }, [weight, height, setResult]);
    return (<div className="grid grid-cols-2 gap-4"><InputNumber label="Peso" value={weight} onChange={setWeight} placeholder="70" suffix="kg" /><InputNumber label="Altura" value={height} onChange={setHeight} placeholder="170" suffix="cm" /></div>);
};

// --- Cardiologia ---
const CalcCHADSVASc = ({ setResult }: any) => {
    const [chf, setChf] = useState(false); const [htn, setHtn] = useState(false); const [age, setAge] = useState('0');
    const [diabetes, setDiabetes] = useState(false); const [stroke, setStroke] = useState(false); const [vasc, setVasc] = useState(false); const [sex, setSex] = useState('male');
    useEffect(() => {
        let s = 0;
        if (chf) s += 1; if (htn) s += 1; if (age === '2') s += 2; else if (age === '1') s += 1;
        if (diabetes) s += 1; if (stroke) s += 2; if (vasc) s += 1; if (sex === 'female') s += 1;
        let risk = ''; let color: any = 'green';
        if (s === 0) { risk = 'Baixo risco. Anticoagulação geralmente não indicada.'; color = 'green'; }
        else if (s === 1 && sex === 'female') { risk = 'Risco intermediário. Reavaliar individualmente.'; color = 'yellow'; }
        else if (s >= 2 || (s === 1 && sex === 'male')) { risk = 'Alto risco. Anticoagulação oral indicada.'; color = 'red'; }
        setResult({ value: `${s} pontos`, detail: risk, color, raw: `CHADS-VASc: ${s} pontos\n${risk}` });
    }, [chf, htn, age, diabetes, stroke, vasc, sex, setResult]);
    return (<div><div className="grid grid-cols-2 gap-4 mb-2"><Select label="Faixa etária" value={age} onChange={setAge} options={[{ value: '0', label: '< 65 anos' }, { value: '1', label: '65–74 anos (+1)' }, { value: '2', label: '≥ 75 anos (+2)' }]} /><Select label="Sexo" value={sex} onChange={setSex} options={[{ value: 'male', label: 'Masculino' }, { value: 'female', label: 'Feminino (+1)' }]} /></div><Checkbox label="ICC / Disfunção VE" checked={chf} onChange={setChf} points={1} /><Checkbox label="Hipertensão Arterial" checked={htn} onChange={setHtn} points={1} /><Checkbox label="Diabetes Mellitus" checked={diabetes} onChange={setDiabetes} points={1} /><Checkbox label="AVC / AIT / Tromboembolismo prévio" checked={stroke} onChange={setStroke} points={2} /><Checkbox label="Doença vascular (IAM, DAOP, placa aórtica)" checked={vasc} onChange={setVasc} points={1} /></div>);
};

const CalcHASBLED = ({ setResult }: any) => {
    const [h, setH] = useState(false); const [a1, setA1] = useState(false); const [a2, setA2] = useState(false);
    const [s, setS] = useState(false); const [b, setB] = useState(false); const [l, setL] = useState(false);
    const [e, setE] = useState(false); const [d1, setD1] = useState(false); const [d2, setD2] = useState(false);
    useEffect(() => {
        const sc = [h, a1, a2, s, b, l, e, d1, d2].filter(Boolean).length;
        let risk = ''; let color: any = 'green';
        if (sc >= 3) { risk = 'Alto risco (≥3%). Cautela no uso de anticoagulante. Monitorizar de perto.'; color = 'red'; }
        else if (sc === 2) { risk = 'Risco moderado. Acompanhar.'; color = 'yellow'; }
        else { risk = 'Baixo risco. Anticoagulação segura.'; color = 'green'; }
        setResult({ value: `${sc} pontos`, detail: risk, color, raw: `HAS-BLED: ${sc} pontos\n${risk}` });
    }, [h, a1, a2, s, b, l, e, d1, d2, setResult]);
    return (<div className="grid md:grid-cols-2 gap-x-4"><Checkbox label="HAS: Hipertensão (PAS > 160)" checked={h} onChange={setH} points={1} /><Checkbox label="A: Função Renal Anormal" checked={a1} onChange={setA1} points={1} /><Checkbox label="A: Função Hepática Anormal" checked={a2} onChange={setA2} points={1} /><Checkbox label="S: AVC Prévio" checked={s} onChange={setS} points={1} /><Checkbox label="B: Sangramento / Predisposição" checked={b} onChange={setB} points={1} /><Checkbox label="L: Labilidade do INR" checked={l} onChange={setL} points={1} /><Checkbox label="E: Idade > 65 anos" checked={e} onChange={setE} points={1} /><Checkbox label="D: AINE ou Antiplaquetário" checked={d1} onChange={setD1} points={1} /><Checkbox label="D: Uso excessivo de Álcool" checked={d2} onChange={setD2} points={1} /></div>);
};

const CalcHEART = ({ setResult }: any) => {
    const [hist, setHist] = useState('0'); const [ecg, setEcg] = useState('0'); const [age, setAge] = useState('0');
    const [risk, setRisk] = useState('0'); const [trop, setTrop] = useState('0');
    useEffect(() => {
        const sc = parseInt(hist) + parseInt(ecg) + parseInt(age) + parseInt(risk) + parseInt(trop);
        let det = ''; let color: any = 'green';
        if (sc <= 3) { det = 'Baixo risco de MACE. Alta precoce pode ser considerada.'; color = 'green'; }
        else if (sc <= 6) { det = 'Risco intermediário. Monitorização e investigação adicionais.'; color = 'yellow'; }
        else { det = 'Alto risco de MACE. Avaliação invasiva precoce recomendada.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `HEART Score: ${sc} pontos\n${det}` });
    }, [hist, ecg, age, risk, trop, setResult]);
    return (<div className="grid md:grid-cols-2 gap-x-4">
        <Select label="Histórico (H)" value={hist} onChange={setHist} options={[{ value: '0', label: '0 — Levemente suspeito' }, { value: '1', label: '1 — Moderadamente suspeito' }, { value: '2', label: '2 — Altamente suspeito' }]} />
        <Select label="ECG (E)" value={ecg} onChange={setEcg} options={[{ value: '0', label: '0 — Normal' }, { value: '1', label: '1 — Anormal inespecífico' }, { value: '2', label: '2 — Depressão ST / BRE' }]} />
        <Select label="Idade (A)" value={age} onChange={setAge} options={[{ value: '0', label: '0 — < 45 anos' }, { value: '1', label: '1 — 45–64 anos' }, { value: '2', label: '2 — ≥ 65 anos' }]} />
        <Select label="Fatores de risco (R)" value={risk} onChange={setRisk} options={[{ value: '0', label: '0 — Nenhum' }, { value: '1', label: '1 — 1–2 fatores ou obesidade' }, { value: '2', label: '2 — Doença aterosclerótica conhecida' }]} />
        <Select label="Troponina (T)" value={trop} onChange={setTrop} options={[{ value: '0', label: '0 — ≤ LSN' }, { value: '1', label: '1 — 1–3× LSN' }, { value: '2', label: '2 — > 3× LSN' }]} />
    </div>);
};

const CalcRCRI = ({ setResult }: any) => {
    const [hf, setHf] = useState(false); const [cva, setCva] = useState(false); const [dm, setDm] = useState(false);
    const [cr, setCr] = useState(false); const [ihd, setIhd] = useState(false); const [high, setHigh] = useState(false);
    useEffect(() => {
        const sc = [hf, cva, dm, cr, ihd, high].filter(Boolean).length;
        let det = ''; let color: any = 'green';
        if (sc === 0) { det = 'Risco cardíaco muito baixo (< 0.5%).'; color = 'green'; }
        else if (sc === 1) { det = 'Risco cardíaco baixo (≈ 1%).'; color = 'green'; }
        else if (sc === 2) { det = 'Risco cardíaco intermediário (≈ 2.5%).'; color = 'yellow'; }
        else { det = 'Risco cardíaco alto (> 5%). Considerar avaliação cardiológica.'; color = 'red'; }
        setResult({ value: `${sc} fatores`, detail: det, color, raw: `RCRI: ${sc} fatores\n${det}` });
    }, [hf, cva, dm, cr, ihd, high, setResult]);
    return (<div><Checkbox label="Cirurgia de alto risco (suprainguinal, intratorácica, intraperitoneal)" checked={high} onChange={setHigh} points={1} /><Checkbox label="Cardiopatia isquêmica (IAM, uso de nitrato, ECG com isquemia, angioplastia/revascularização)" checked={ihd} onChange={setIhd} points={1} /><Checkbox label="Insuficiência Cardíaca Congestiva" checked={hf} onChange={setHf} points={1} /><Checkbox label="Doença cerebrovascular (AVC ou AIT prévio)" checked={cva} onChange={setCva} points={1} /><Checkbox label="Diabetes Mellitus insulino-dependente" checked={dm} onChange={setDm} points={1} /><Checkbox label="Creatinina pré-operatória > 2.0 mg/dL" checked={cr} onChange={setCr} points={1} /></div>);
};

// --- TEP/TVP ---
const CalcWellsTEP = ({ setResult }: any) => {
    const [dvt, setDvt] = useState(false); const [altDx, setAltDx] = useState(false); const [hr, setHr] = useState(false);
    const [immob, setImmob] = useState(false); const [prevDvt, setPrevDvt] = useState(false); const [hemopt, setHemopt] = useState(false); const [cancer, setCancer] = useState(false);
    useEffect(() => {
        const sc = (dvt ? 3 : 0) + (altDx ? 3 : 0) + (hr ? 1.5 : 0) + (immob ? 1.5 : 0) + (prevDvt ? 1.5 : 0) + (hemopt ? 1 : 0) + (cancer ? 1 : 0);
        let det = ''; let color: any = 'green';
        if (sc <= 1) { det = 'Probabilidade baixa (≈ 2%). D-dímero pode excluir TEP.'; color = 'green'; }
        else if (sc <= 6) { det = 'Probabilidade intermediária (≈ 17%). Solicitar D-dímero ou angiotomografia.'; color = 'yellow'; }
        else { det = 'Probabilidade alta (≈ 65%). Angiotomografia indicada.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `Wells TEP: ${sc} pontos\n${det}` });
    }, [dvt, altDx, hr, immob, prevDvt, hemopt, cancer, setResult]);
    return (<div>
        <Checkbox label="Sinais/sintomas clínicos de TVP" checked={dvt} onChange={setDvt} points={3} />
        <Checkbox label="TEP como diagnóstico mais provável" checked={altDx} onChange={setAltDx} points={3} />
        <Checkbox label="FC > 100 bpm" checked={hr} onChange={setHr} points={1} />
        <Checkbox label="Imobilização ≥ 3 dias ou cirurgia nas últimas 4 semanas" checked={immob} onChange={setImmob} points={1} />
        <Checkbox label="TVP ou TEP prévio" checked={prevDvt} onChange={setPrevDvt} points={1} />
        <Checkbox label="Hemoptise" checked={hemopt} onChange={setHemopt} points={1} />
        <Checkbox label="Neoplasia ativa (tratamento 6m ou paliativo)" checked={cancer} onChange={setCancer} points={1} />
    </div>);
};

const CalcWellsTVP = ({ setResult }: any) => {
    const [cancer, setCancer] = useState(false); const [paralysis, setParalysis] = useState(false); const [immob, setImmob] = useState(false);
    const [tender, setTender] = useState(false); const [leg, setLeg] = useState(false); const [edema, setEdema] = useState(false);
    const [engorged, setEngorged] = useState(false); const [prevDvt, setPrevDvt] = useState(false); const [altDx, setAltDx] = useState(false);
    useEffect(() => {
        const sc = [cancer, paralysis, immob, tender, leg, edema, engorged, prevDvt].filter(Boolean).length - (altDx ? 2 : 0);
        let det = ''; let color: any = 'green';
        if (sc <= 0) { det = 'Baixa probabilidade (< 5%). D-dímero negativo exclui TVP.'; color = 'green'; }
        else if (sc <= 2) { det = 'Probabilidade moderada. Solicitar ultrassonografia.'; color = 'yellow'; }
        else { det = 'Alta probabilidade de TVP. Ultrassonografia e anticoagulação precoce.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `Wells TVP: ${sc} pontos\n${det}` });
    }, [cancer, paralysis, immob, tender, leg, edema, engorged, prevDvt, altDx, setResult]);
    return (<div>
        <Checkbox label="Câncer ativo" checked={cancer} onChange={setCancer} points={1} />
        <Checkbox label="Paralisia, paresia ou imobilização recente dos MMII" checked={paralysis} onChange={setParalysis} points={1} />
        <Checkbox label="Acamado > 3 dias ou cirurgia recente" checked={immob} onChange={setImmob} points={1} />
        <Checkbox label="Dor à palpação ao longo das veias profundas" checked={tender} onChange={setTender} points={1} />
        <Checkbox label="Panturrilha inchada > 3 cm em comparação com a outra" checked={leg} onChange={setLeg} points={1} />
        <Checkbox label="Edema com cacifo unilateral" checked={edema} onChange={setEdema} points={1} />
        <Checkbox label="Veias superficiais colaterais" checked={engorged} onChange={setEngorged} points={1} />
        <Checkbox label="TVP prévia documentada" checked={prevDvt} onChange={setPrevDvt} points={1} />
        <Checkbox label="Diagnóstico alternativo pelo menos tão provável quanto TVP" checked={altDx} onChange={setAltDx} />
        <p className="text-xs text-slate-400 ml-1 -mt-1 mb-3">* Este item subtrai 2 pontos do total</p>
    </div>);
};

const CalcPERC = ({ setResult }: any) => {
    const [age, setAge] = useState(false); const [hr, setHr] = useState(false); const [o2, setO2] = useState(false);
    const [dvt, setDvt] = useState(false); const [hemopt, setHemopt] = useState(false); const [surgery, setSurgery] = useState(false);
    const [cancer, setCancer] = useState(false); const [prevDvt, setPrevDvt] = useState(false);
    useEffect(() => {
        const anyPositive = [age, hr, o2, dvt, hemopt, surgery, cancer, prevDvt].some(Boolean);
        if (!anyPositive) {
            setResult({ value: 'PERC Negativo', detail: 'Nenhum critério positivo. TEP pode ser excluído sem exames adicionais (em paciente de baixa probabilidade pré-teste).', color: 'green', raw: 'PERC Negativo — TEP excluído clinicamente' });
        } else {
            const count = [age, hr, o2, dvt, hemopt, surgery, cancer, prevDvt].filter(Boolean).length;
            setResult({ value: `PERC Positivo (${count} critério${count > 1 ? 's' : ''})`, detail: 'Critério(s) positivo(s). PERC não exclui TEP. Solicitar D-dímero ou avaliação adicional.', color: 'red', raw: `PERC Positivo — ${count} critério(s) presente(s)` });
        }
    }, [age, hr, o2, dvt, hemopt, surgery, cancer, prevDvt, setResult]);
    return (<div>
        <Checkbox label="Idade ≥ 50 anos" checked={age} onChange={setAge} />
        <Checkbox label="FC ≥ 100 bpm" checked={hr} onChange={setHr} />
        <Checkbox label="SpO2 < 95% (ar ambiente)" checked={o2} onChange={setO2} />
        <Checkbox label="Edema assimétrico de MMII" checked={dvt} onChange={setDvt} />
        <Checkbox label="Hemoptise" checked={hemopt} onChange={setHemopt} />
        <Checkbox label="Trauma recente ou cirurgia (≤ 4 semanas)" checked={surgery} onChange={setSurgery} />
        <Checkbox label="Neoplasia ativa ou em tratamento" checked={cancer} onChange={setCancer} />
        <Checkbox label="TVP ou TEP prévio" checked={prevDvt} onChange={setPrevDvt} />
    </div>);
};

// --- Sepse ---
const CalcQSOFA = ({ setResult }: any) => {
    const [mental, setMental] = useState(false); const [bp, setBp] = useState(false); const [resp, setResp] = useState(false);
    useEffect(() => {
        const sc = [mental, bp, resp].filter(Boolean).length;
        let det = ''; let color: any = 'green';
        if (sc >= 2) { det = 'qSOFA positivo — Alto risco de desfecho ruim / Sepse. Avaliar SOFA completo.'; color = 'red'; }
        else { det = 'Baixo risco (não exclui sepse). Monitorizar.'; color = sc === 1 ? 'yellow' : 'green'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `qSOFA: ${sc} pontos\n${det}` });
    }, [mental, bp, resp, setResult]);
    return (<div><Checkbox label="Alteração do estado mental (Glasgow < 15)" checked={mental} onChange={setMental} points={1} /><Checkbox label="PAS ≤ 100 mmHg" checked={bp} onChange={setBp} points={1} /><Checkbox label="FR ≥ 22/min" checked={resp} onChange={setResp} points={1} /></div>);
};

const CalcSOFA = ({ setResult }: any) => {
    const [resp, setResp] = useState('0'); const [coag, setCoag] = useState('0'); const [liver, setLiver] = useState('0');
    const [cardio, setCardio] = useState('0'); const [cns, setCns] = useState('0'); const [renal, setRenal] = useState('0');
    useEffect(() => {
        const sc = [resp, coag, liver, cardio, cns, renal].reduce((a, b) => a + parseInt(b), 0);
        let det = sc >= 2 ? 'Aumento ≥ 2 pontos: disfunção orgânica / sepse.' : 'Monitorizar evolução diária.';
        const color: any = sc >= 11 ? 'red' : sc >= 7 ? 'orange' : sc >= 2 ? 'yellow' : 'green';
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `SOFA Score: ${sc} pontos\n${det}` });
    }, [resp, coag, liver, cardio, cns, renal, setResult]);
    return (<div className="grid md:grid-cols-2 gap-4">
        <Select label="Respiração (PaO2/FiO2)" value={resp} onChange={setResp} options={[{ value: '0', label: '≥ 400 (0)' }, { value: '1', label: '< 400 (1)' }, { value: '2', label: '< 300 (2)' }, { value: '3', label: '< 200 c/ suporte (3)' }, { value: '4', label: '< 100 c/ suporte (4)' }]} />
        <Select label="Coagulação (PLT ×10³/μL)" value={coag} onChange={setCoag} options={[{ value: '0', label: '≥ 150 (0)' }, { value: '1', label: '< 150 (1)' }, { value: '2', label: '< 100 (2)' }, { value: '3', label: '< 50 (3)' }, { value: '4', label: '< 20 (4)' }]} />
        <Select label="Fígado (Bilirrubina mg/dL)" value={liver} onChange={setLiver} options={[{ value: '0', label: '< 1.2 (0)' }, { value: '1', label: '1.2–1.9 (1)' }, { value: '2', label: '2.0–5.9 (2)' }, { value: '3', label: '6.0–11.9 (3)' }, { value: '4', label: '> 12.0 (4)' }]} />
        <Select label="Cardiovascular (PAM / Drogas)" value={cardio} onChange={setCardio} options={[{ value: '0', label: 'PAM ≥ 70 (0)' }, { value: '1', label: 'PAM < 70 (1)' }, { value: '2', label: 'Dopamina ≤ 5 (2)' }, { value: '3', label: 'Dopamina > 5 ou Epi ≤ 0.1 (3)' }, { value: '4', label: 'Dopamina > 15 ou Epi > 0.1 (4)' }]} />
        <Select label="SNC (Glasgow)" value={cns} onChange={setCns} options={[{ value: '0', label: '15 (0)' }, { value: '1', label: '13–14 (1)' }, { value: '2', label: '10–12 (2)' }, { value: '3', label: '6–9 (3)' }, { value: '4', label: '< 6 (4)' }]} />
        <Select label="Renal (Creatinina mg/dL)" value={renal} onChange={setRenal} options={[{ value: '0', label: '< 1.2 (0)' }, { value: '1', label: '1.2–1.9 (1)' }, { value: '2', label: '2.0–3.4 (2)' }, { value: '3', label: '3.5–4.9 (3)' }, { value: '4', label: '> 5.0 (4)' }]} />
    </div>);
};

const CalcNEWS2 = ({ setResult }: any) => {
    const [rr, setRr] = useState('0'); const [o2, setO2] = useState('0'); const [o2supp, setO2supp] = useState(false);
    const [bp, setBp] = useState('0'); const [hr, setHr] = useState('0'); const [temp, setTemp] = useState('0'); const [cons, setCons] = useState('0');
    useEffect(() => {
        const sc = [rr, o2, o2supp ? 2 : 0, bp, hr, temp, cons].reduce((a: number, b) => a + (typeof b === 'number' ? b : parseInt(b as string)), 0);
        let det = ''; let color: any = 'green';
        if (sc <= 4) { det = 'Baixo risco. Monitorização de rotina.'; color = 'green'; }
        else if (sc <= 6) { det = 'Risco intermediário. Avaliação médica urgente.'; color = 'yellow'; }
        else { det = 'Alto risco. Cuidados escalados e avaliação médica imediata.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `NEWS2: ${sc} pontos\n${det}` });
    }, [rr, o2, o2supp, bp, hr, temp, cons, setResult]);
    return (<div className="grid md:grid-cols-2 gap-x-4">
        <Select label="FR (irpm)" value={rr} onChange={setRr} options={[{ value: '3', label: '≤ 8 (3)' }, { value: '0', label: '9–11 (0)' }, { value: '1', label: '12—20 (0)' }, { value: '0', label: '21–24 (2)' }, { value: '2', label: '>24 (3)' }]} />
        <Select label="SpO2 (ar ambiente) — Escala 1" value={o2} onChange={setO2} options={[{ value: '3', label: '≤ 91% (3)' }, { value: '2', label: '92–93% (2)' }, { value: '1', label: '94–95% (1)' }, { value: '0', label: '≥ 96% (0)' }]} />
        <Select label="PA Sistólica (mmHg)" value={bp} onChange={setBp} options={[{ value: '3', label: '≤ 90 (3)' }, { value: '2', label: '91–100 (2)' }, { value: '1', label: '101–110 (1)' }, { value: '0', label: '111–219 (0)' }, { value: '3', label: '≥ 220 (3)' }]} />
        <Select label="FC (bpm)" value={hr} onChange={setHr} options={[{ value: '3', label: '≤ 40 (3)' }, { value: '1', label: '41–50 (1)' }, { value: '0', label: '51–90 (0)' }, { value: '1', label: '91–110 (1)' }, { value: '2', label: '111–130 (2)' }, { value: '3', label: '≥ 131 (3)' }]} />
        <Select label="Temperatura (°C)" value={temp} onChange={setTemp} options={[{ value: '3', label: '≤ 35.0 (3)' }, { value: '1', label: '35.1–36.0 (1)' }, { value: '0', label: '36.1–38.0 (0)' }, { value: '1', label: '38.1–39.0 (1)' }, { value: '2', label: '≥ 39.1 (2)' }]} />
        <Select label="Consciência (AVPU)" value={cons} onChange={setCons} options={[{ value: '0', label: 'Alert (A) (0)' }, { value: '3', label: 'Voice/Pain/Unresponsive (3)' }]} />
        <div className="col-span-2 mt-1"><Checkbox label="Em uso de oxigênio suplementar" checked={o2supp} onChange={setO2supp} points={2} /></div>
    </div>);
};

// --- Pneumologia ---
const CalcCURB65 = ({ setResult }: any) => {
    const [confusion, setConfusion] = useState(false); const [urea, setUrea] = useState(false); const [resp, setResp] = useState(false);
    const [bp, setBp] = useState(false); const [age, setAge] = useState(false);
    useEffect(() => {
        const sc = [confusion, urea, resp, bp, age].filter(Boolean).length;
        let det = ''; let color: any = 'green';
        if (sc <= 1) { det = 'Baixo risco (mortalidade < 1.5%). Tratamento ambulatorial.'; color = 'green'; }
        else if (sc === 2) { det = 'Risco moderado (mortalidade ≈ 9.2%). Considerar internação.'; color = 'yellow'; }
        else { det = 'Alto risco (mortalidade > 22%). Considerar UTI.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `CURB-65: ${sc} pontos\n${det}` });
    }, [confusion, urea, resp, bp, age, setResult]);
    return (<div><Checkbox label="Confusão Mental (C)" checked={confusion} onChange={setConfusion} points={1} /><Checkbox label="Ureia > 50 mg/dL (U)" checked={urea} onChange={setUrea} points={1} /><Checkbox label="FR ≥ 30/min (R)" checked={resp} onChange={setResp} points={1} /><Checkbox label="PAS < 90 ou PAD ≤ 60 mmHg (B)" checked={bp} onChange={setBp} points={1} /><Checkbox label="Idade ≥ 65 anos (65)" checked={age} onChange={setAge} points={1} /></div>);
};

const CalcPSIPORT = ({ setResult }: any) => {
    const [age, setAge] = useState(''); const [female, setFemale] = useState(false); const [nh, setNh] = useState(false);
    const [cancer, setCancer] = useState(false); const [liver, setLiver] = useState(false); const [hf, setHf] = useState(false);
    const [cva, setCva] = useState(false); const [renal, setRenal] = useState(false); const [altered, setAltered] = useState(false);
    const [rr, setRr] = useState(false); const [sbp, setSbp] = useState(false); const [temp, setTemp] = useState(false);
    const [pulse, setPulse] = useState(false); const [ph, setPh] = useState(false);
    const [bun, setBun] = useState(false); const [na, setNa] = useState(false); const [glucose, setGlucose] = useState(false);
    const [hct, setHct] = useState(false); const [po2, setPo2] = useState(false); const [pe, setPe] = useState(false);
    useEffect(() => {
        if (!age) { setResult(null); return; }
        const a = parseFloat(age); if (isNaN(a)) return;
        let sc = a - (female ? 10 : 0) + (nh ? 10 : 0) + (cancer ? 30 : 0) + (liver ? 20 : 0) + (hf ? 10 : 0) + (cva ? 10 : 0) + (renal ? 10 : 0)
            + (altered ? 20 : 0) + (rr ? 20 : 0) + (sbp ? 20 : 0) + (temp ? 15 : 0) + (pulse ? 10 : 0) + (ph ? 30 : 0)
            + (bun ? 20 : 0) + (na ? 20 : 0) + (glucose ? 10 : 0) + (hct ? 10 : 0) + (po2 ? 10 : 0) + (pe ? 10 : 0);
        let cl = ''; let color: any = 'green';
        if (sc <= 70) { cl = 'Classe II (≤ 70 pts) — Risco baixo. Ambulatorial.'; color = 'green'; }
        else if (sc <= 90) { cl = 'Classe III (71–90 pts) — Risco baixo a moderado. Internação breve.'; color = 'yellow'; }
        else if (sc <= 130) { cl = 'Classe IV (91–130 pts) — Risco moderado. Internação.'; color = 'orange'; }
        else { cl = 'Classe V (> 130 pts) — Risco alto. UTI.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: cl, color, raw: `PSI/PORT: ${sc} pontos\n${cl}` });
    }, [age, female, nh, cancer, liver, hf, cva, renal, altered, rr, sbp, temp, pulse, ph, bun, na, glucose, hct, po2, pe, setResult]);
    return (<div>
        <div className="grid grid-cols-2 gap-4 mb-2"><InputNumber label="Idade" value={age} onChange={setAge} placeholder="anos" suffix="anos" /></div>
        <div className="grid md:grid-cols-2 gap-x-4">
            <Checkbox label="Sexo feminino" checked={female} onChange={setFemale} />
            <Checkbox label="Residente em asilo/instituição" checked={nh} onChange={setNh} points={10} />
            <Checkbox label="Neoplasia ativa" checked={cancer} onChange={setCancer} points={30} />
            <Checkbox label="Doença hepática" checked={liver} onChange={setLiver} points={20} />
            <Checkbox label="Insuficiência Cardíaca" checked={hf} onChange={setHf} points={10} />
            <Checkbox label="Doença cerebrovascular (AVC)" checked={cva} onChange={setCva} points={10} />
            <Checkbox label="DRC" checked={renal} onChange={setRenal} points={10} />
            <Checkbox label="Estado mental alterado" checked={altered} onChange={setAltered} points={20} />
            <Checkbox label="FR ≥ 30/min" checked={rr} onChange={setRr} points={20} />
            <Checkbox label="PAS < 90 mmHg" checked={sbp} onChange={setSbp} points={20} />
            <Checkbox label="T < 35°C ou ≥ 40°C" checked={temp} onChange={setTemp} points={15} />
            <Checkbox label="Pulso ≥ 125 bpm" checked={pulse} onChange={setPulse} points={10} />
            <Checkbox label="pH arterial < 7.35" checked={ph} onChange={setPh} points={30} />
            <Checkbox label="BUN ≥ 30 mg/dL" checked={bun} onChange={setBun} points={20} />
            <Checkbox label="Na < 130 mEq/L" checked={na} onChange={setNa} points={20} />
            <Checkbox label="Glicemia ≥ 250 mg/dL" checked={glucose} onChange={setGlucose} points={10} />
            <Checkbox label="Ht < 30%" checked={hct} onChange={setHct} points={10} />
            <Checkbox label="PO2 < 60 mmHg (ar ambiente)" checked={po2} onChange={setPo2} points={10} />
            <Checkbox label="Derrame Pleural" checked={pe} onChange={setPe} points={10} />
        </div>
    </div>);
};

// --- Neurologia ---
const CalcGlasgow = ({ setResult }: any) => {
    const [eye, setEye] = useState('4'); const [verbal, setVerbal] = useState('5'); const [motor, setMotor] = useState('6');
    useEffect(() => {
        const sc = parseInt(eye) + parseInt(verbal) + parseInt(motor);
        let det = ''; let color: any = 'green';
        if (sc <= 8) { det = 'Coma / Trauma Grave — Considerar Via Aérea Definitiva.'; color = 'red'; }
        else if (sc <= 12) { det = 'Trauma Moderado.'; color = 'yellow'; }
        else { det = 'Trauma Leve.'; color = 'green'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `Glasgow: ${sc}\n${det}` });
    }, [eye, verbal, motor, setResult]);
    return (<div>
        <Select label="Abertura Ocular" value={eye} onChange={setEye} options={[{ value: '4', label: '4 — Espontânea' }, { value: '3', label: '3 — Ao comando verbal' }, { value: '2', label: '2 — À dor' }, { value: '1', label: '1 — Ausente' }]} />
        <Select label="Resposta Verbal" value={verbal} onChange={setVerbal} options={[{ value: '5', label: '5 — Orientado' }, { value: '4', label: '4 — Confuso' }, { value: '3', label: '3 — Palavras inapropriadas' }, { value: '2', label: '2 — Sons incompreensíveis' }, { value: '1', label: '1 — Ausente' }]} />
        <Select label="Resposta Motora" value={motor} onChange={setMotor} options={[{ value: '6', label: '6 — Obedece comandos' }, { value: '5', label: '5 — Localiza dor' }, { value: '4', label: '4 — Flexão normal (retirada)' }, { value: '3', label: '3 — Flexão anormal (decorticação)' }, { value: '2', label: '2 — Extensão (descerebração)' }, { value: '1', label: '1 — Ausente' }]} />
    </div>);
};

const CalcNIHSS = ({ setResult }: any) => {
    const fields = [
        { label: '1a. Nível de consciência', opts: [{ value: '0', label: '0 — Alerta' }, { value: '1', label: '1 — Sonolento' }, { value: '2', label: '2 — Estuporoso' }, { value: '3', label: '3 — Coma' }] },
        { label: '1b. Perguntas de orientação', opts: [{ value: '0', label: '0 — Ambas corretas' }, { value: '1', label: '1 — Uma correta' }, { value: '2', label: '2 — Nenhuma' }] },
        { label: '1c. Comandos motores', opts: [{ value: '0', label: '0 — Ambos corretos' }, { value: '1', label: '1 — Um correto' }, { value: '2', label: '2 — Nenhum' }] },
        { label: '2. Olhar conjugado', opts: [{ value: '0', label: '0 — Normal' }, { value: '1', label: '1 — Paresia parcial' }, { value: '2', label: '2 — Desvio forçado' }] },
        { label: '3. Campos visuais', opts: [{ value: '0', label: '0 — Sem perda' }, { value: '1', label: '1 — Hemianopsia parcial' }, { value: '2', label: '2 — Hemianopsia completa' }, { value: '3', label: '3 — Cegueira bilateral' }] },
        { label: '4. Paresia facial', opts: [{ value: '0', label: '0 — Normal' }, { value: '1', label: '1 — Paresia menor' }, { value: '2', label: '2 — Paresia parcial' }, { value: '3', label: '3 — Paralisia completa' }] },
        { label: '5a. Motor membro superior esquerdo', opts: [{ value: '0', label: '0 — Sem queda' }, { value: '1', label: '1 — Queda < 10s' }, { value: '2', label: '2 — Algum esforço vs gravidade' }, { value: '3', label: '3 — Sem esforço vs gravidade' }, { value: '4', label: '4 — Sem movimento' }] },
        { label: '5b. Motor membro superior direito', opts: [{ value: '0', label: '0 — Sem queda' }, { value: '1', label: '1 — Queda < 10s' }, { value: '2', label: '2 — Algum esforço vs gravidade' }, { value: '3', label: '3 — Sem esforço vs gravidade' }, { value: '4', label: '4 — Sem movimento' }] },
        { label: '6a. Motor membro inferior esquerdo', opts: [{ value: '0', label: '0 — Sem queda' }, { value: '1', label: '1 — Queda < 5s' }, { value: '2', label: '2 — Algum esforço vs gravidade' }, { value: '3', label: '3 — Sem esforço vs gravidade' }, { value: '4', label: '4 — Sem movimento' }] },
        { label: '6b. Motor membro inferior direito', opts: [{ value: '0', label: '0 — Sem queda' }, { value: '1', label: '1 — Queda < 5s' }, { value: '2', label: '2 — Algum esforço vs gravidade' }, { value: '3', label: '3 — Sem esforço vs gravidade' }, { value: '4', label: '4 — Sem movimento' }] },
        { label: '7. Ataxia de membros', opts: [{ value: '0', label: '0 — Ausente' }, { value: '1', label: '1 — Um membro' }, { value: '2', label: '2 — Dois membros' }] },
        { label: '8. Sensibilidade', opts: [{ value: '0', label: '0 — Normal' }, { value: '1', label: '1 — Déficit leve' }, { value: '2', label: '2 — Déficit grave' }] },
        { label: '9. Linguagem / afasia', opts: [{ value: '0', label: '0 — Normal' }, { value: '1', label: '1 — Afasia leve' }, { value: '2', label: '2 — Afasia grave' }, { value: '3', label: '3 — Mutismo / Afasia global' }] },
        { label: '10. Disartria', opts: [{ value: '0', label: '0 — Normal' }, { value: '1', label: '1 — Leve' }, { value: '2', label: '2 — Grave / Incompreensível' }] },
        { label: '11. Extinção / inatenção', opts: [{ value: '0', label: '0 — Normal' }, { value: '1', label: '1 — Inatenção leve' }, { value: '2', label: '2 — Extinção grave' }] },
    ];
    const [values, setValues] = useState<Record<string, string>>({});
    const updateVal = (idx: number, val: string) => setValues(prev => ({ ...prev, [idx]: val }));
    useEffect(() => {
        const sc = fields.reduce((sum, _, i) => sum + parseInt(values[i] || '0'), 0);
        let det = ''; let color: any = 'green';
        if (sc === 0) { det = 'Sem déficit.'; color = 'green'; }
        else if (sc <= 4) { det = 'AVC menor.'; color = 'green'; }
        else if (sc <= 15) { det = 'AVC moderado.'; color = 'yellow'; }
        else if (sc <= 24) { det = 'AVC moderado a grave.'; color = 'orange'; }
        else { det = 'AVC grave.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `NIHSS: ${sc} pontos\n${det}` });
    }, [values, setResult]);
    return (<div className="grid md:grid-cols-2 gap-x-4">{fields.map((f, i) => <Select key={i} label={f.label} value={values[i] || '0'} onChange={(v: string) => updateVal(i, v)} options={f.opts} />)}</div>);
};

// --- Gastro ---
const CalcBlatchford = ({ setResult }: any) => {
    const [bun, setBun] = useState('0'); const [hb, setHb] = useState('0'); const [sbp, setSbp] = useState('0');
    const [pulse, setPulse] = useState(false); const [melena, setMelena] = useState(false); const [syncope, setSyncope] = useState(false);
    const [liver, setLiver] = useState(false); const [hf, setHf] = useState(false);
    useEffect(() => {
        const sc = parseInt(bun) + parseInt(hb) + parseInt(sbp) + (pulse ? 1 : 0) + (melena ? 1 : 0) + (syncope ? 2 : 0) + (liver ? 2 : 0) + (hf ? 2 : 0);
        let det = ''; let color: any = 'green';
        if (sc === 0) { det = 'Risco muito baixo — Alta precoce com seguimento ambulatorial possível.'; color = 'green'; }
        else if (sc <= 5) { det = 'Risco moderado — Internação recomendada.'; color = 'yellow'; }
        else { det = 'Alto risco — Endoscopia urgente ou internação em UTI.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `Glasgow-Blatchford: ${sc} pontos\n${det}` });
    }, [bun, hb, sbp, pulse, melena, syncope, liver, hf, setResult]);
    return (<div>
        <div className="grid md:grid-cols-2 gap-x-4">
            <Select label="BUN (mg/dL)" value={bun} onChange={setBun} options={[{ value: '0', label: '< 18.2 (0)' }, { value: '2', label: '18.2–22.3 (2)' }, { value: '3', label: '22.4–28.0 (3)' }, { value: '4', label: '28.1–70.0 (4)' }, { value: '6', label: '≥ 70.1 (6)' }]} />
            <Select label="Hemoglobina (g/dL) — Homens" value={hb} onChange={setHb} options={[{ value: '0', label: '≥ 13.0 (0)' }, { value: '1', label: '12.0–12.9 (1)' }, { value: '3', label: '10.0–11.9 (3)' }, { value: '6', label: '< 10.0 (6)' }]} />
            <Select label="PAS (mmHg)" value={sbp} onChange={setSbp} options={[{ value: '0', label: '≥ 110 (0)' }, { value: '1', label: '100–109 (1)' }, { value: '2', label: '90–99 (2)' }, { value: '3', label: '< 90 (3)' }]} />
        </div>
        <Checkbox label="FC ≥ 100 bpm" checked={pulse} onChange={setPulse} points={1} />
        <Checkbox label="Melena" checked={melena} onChange={setMelena} points={1} />
        <Checkbox label="Síncope" checked={syncope} onChange={setSyncope} points={2} />
        <Checkbox label="Doença hepática" checked={liver} onChange={setLiver} points={2} />
        <Checkbox label="Insuficiência Cardíaca" checked={hf} onChange={setHf} points={2} />
    </div>);
};

const CalcMELDNa = ({ setResult }: any) => {
    const [bili, setBili] = useState(''); const [inr, setInr] = useState(''); const [cr, setCr] = useState(''); const [na, setNa] = useState('');
    useEffect(() => {
        if (!bili || !inr || !cr) { setResult(null); return; }
        const b = Math.max(1, parseFloat(bili)); const i = Math.max(1, parseFloat(inr)); const c = Math.max(1, Math.min(4, parseFloat(cr)));
        if (isNaN(b) || isNaN(i) || isNaN(c)) return;
        const meld = 9.57 * Math.log(i) + 3.78 * Math.log(b) + 11.2 * Math.log(c) + 6.43;
        const naVal = parseFloat(na) || 137;
        const meldNa = meld - naVal - 0.025 * meld * (140 - naVal) + 140;
        const sc = Math.round(Math.min(40, Math.max(6, meldNa)));
        let det = ''; let color: any = 'green';
        if (sc < 10) { det = 'Mortalidade em 90 dias < 2%. Aguarda transplante.'; color = 'green'; }
        else if (sc < 20) { det = 'Mortalidade em 90 dias ≈ 6%. Avaliação para transplante.'; color = 'yellow'; }
        else if (sc < 30) { det = 'Mortalidade em 90 dias ≈ 20%.'; color = 'orange'; }
        else { det = 'Mortalidade em 90 dias > 50%. Alta prioridade em transplante.'; color = 'red'; }
        setResult({ value: `MELD-Na: ${sc}`, detail: det, color, raw: `MELD-Na: ${sc}\n${det}` });
    }, [bili, inr, cr, na, setResult]);
    return (<div className="grid grid-cols-2 gap-4"><InputNumber label="Bilirrubina total" value={bili} onChange={setBili} placeholder="1.0" suffix="mg/dL" /><InputNumber label="INR" value={inr} onChange={setInr} placeholder="1.0" /><InputNumber label="Creatinina" value={cr} onChange={setCr} placeholder="1.0" suffix="mg/dL" /><InputNumber label="Sódio" value={na} onChange={setNa} placeholder="137" suffix="mEq/L" /></div>);
};

const CalcChildPugh = ({ setResult }: any) => {
    const [bili, setBili] = useState('1'); const [alb, setAlb] = useState('1'); const [pt, setPt] = useState('1');
    const [ascites, setAscites] = useState('1'); const [enceph, setEnceph] = useState('1');
    useEffect(() => {
        const sc = [bili, alb, pt, ascites, enceph].reduce((a, b) => a + parseInt(b), 0);
        let cl = ''; let color: any = 'green';
        if (sc <= 6) { cl = 'Classe A (5–6 pts) — Disfunção bem compensada. Sobrevida 1a ≈ 100%.'; color = 'green'; }
        else if (sc <= 9) { cl = 'Classe B (7–9 pts) — Disfunção significativa. Sobrevida 1a ≈ 80%.'; color = 'yellow'; }
        else { cl = 'Classe C (10–15 pts) — Disfunção descompensada. Sobrevida 1a ≈ 45%.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: cl, color, raw: `Child-Pugh: ${sc} pontos\n${cl}` });
    }, [bili, alb, pt, ascites, enceph, setResult]);
    return (<div>
        <Select label="Bilirrubina total (mg/dL)" value={bili} onChange={setBili} options={[{ value: '1', label: '< 2.0 (1)' }, { value: '2', label: '2.0–3.0 (2)' }, { value: '3', label: '> 3.0 (3)' }]} />
        <Select label="Albumina (g/dL)" value={alb} onChange={setAlb} options={[{ value: '1', label: '> 3.5 (1)' }, { value: '2', label: '2.8–3.5 (2)' }, { value: '3', label: '< 2.8 (3)' }]} />
        <Select label="Tempo de Protrombina (segundos acima do controle)" value={pt} onChange={setPt} options={[{ value: '1', label: '< 4s (1)' }, { value: '2', label: '4–6s (2)' }, { value: '3', label: '> 6s (3)' }]} />
        <Select label="Ascite" value={ascites} onChange={setAscites} options={[{ value: '1', label: 'Ausente (1)' }, { value: '2', label: 'Leve (2)' }, { value: '3', label: 'Moderada a grave (3)' }]} />
        <Select label="Encefalopatia" value={enceph} onChange={setEnceph} options={[{ value: '1', label: 'Ausente (1)' }, { value: '2', label: 'Grau I–II (2)' }, { value: '3', label: 'Grau III–IV (3)' }]} />
    </div>);
};

// --- Profilaxia ---
const CalcPadua = ({ setResult }: any) => {
    const items = [
        { label: 'Câncer ativo (metastático, quimio/radioterapia recente)', pts: 3 },
        { label: 'TVP/TEP prévio (exceto trombose superficial)', pts: 3 },
        { label: 'Mobilidade reduzida (repouso ≥ 3 dias)', pts: 3 },
        { label: 'Trombofilia conhecida', pts: 3 },
        { label: 'Trauma ou cirurgia no último mês', pts: 2 },
        { label: 'Idade ≥ 70 anos', pts: 1 },
        { label: 'ICC ou insuficiência respiratória', pts: 1 },
        { label: 'IAM ou AVC nos últimos 6 meses', pts: 1 },
        { label: 'Obesidade (IMC ≥ 30)', pts: 1 },
        { label: 'Uso de hormônios (ACO, TRH)', pts: 1 },
    ];
    const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));
    const toggle = (i: number) => setChecked(prev => { const next = [...prev]; next[i] = !next[i]; return next; });
    useEffect(() => {
        const sc = items.reduce((sum, item, i) => sum + (checked[i] ? item.pts : 0), 0);
        let det = ''; let color: any = 'green';
        if (sc < 4) { det = 'Risco baixo (< 0.3%). Profilaxia mecânica. Deambulação precoce.'; color = 'green'; }
        else { det = 'Alto risco (≈ 11%). Profilaxia farmacológica indicada (HBPM ou HNF).'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `Padua: ${sc} pontos\n${det}` });
    }, [checked]);
    return (<div>{items.map((item, i) => <Checkbox key={i} label={item.label} checked={checked[i]} onChange={() => toggle(i)} points={item.pts} />)}</div>);
};

const CalcCaprini = ({ setResult }: any) => {
    const groups = [
        { pts: 1, items: ['Idade 41–60 anos', 'Cirurgia de pequeno porte planejada', 'Varizes', 'Doença inflamatória intestinal', 'Edema de MMI atual', 'Obesidade (IMC > 25)', 'IAM no último mês', 'Sepse no último mês', 'Pneumonia no último mês', 'Gravidez ou pós-parto (< 1 mês)'] },
        { pts: 2, items: ['Idade 61–74 anos', 'Artroscopia', 'Neoplasia maligna (atual ou prévia)', 'Cirurgia laparoscópica > 45 min', 'Acamado > 72h', 'Gesso ou órtese em MMI', 'Acesso venoso central'] },
        { pts: 3, items: ['Idade ≥ 75 anos', 'TVP ou TEP prévio', 'História familiar de TEV', 'Fator V de Leiden', 'Protrombina 20210A', 'Anticorpo antifosfolípide elevado', 'Homocisteína elevada', 'Heparina-induzida (TIH)', 'Outra trombofilia congênita ou adquirida'] },
        { pts: 5, items: ['AVC < 1 mês', 'Artroplastia eletiva de joelho/quadril', 'Fratura quadril, pelve ou perna < 1 mês', 'Trauma múltiplo < 1 mês', 'Lesão medular aguda < 1 mês'] },
    ];
    const totalItems = groups.flatMap(g => g.items);
    const [checked, setChecked] = useState<boolean[]>(new Array(totalItems.length).fill(false));
    const toggle = (idx: number) => setChecked(prev => { const next = [...prev]; next[idx] = !next[idx]; return next; });
    let itemIdx = 0;
    useEffect(() => {
        let sc = 0; let idx = 0;
        groups.forEach(g => g.items.forEach(() => { if (checked[idx]) sc += g.pts; idx++; }));
        let det = ''; let color: any = 'green';
        if (sc <= 1) { det = 'Risco muito baixo (< 0.5%). Deambulação precoce.'; color = 'green'; }
        else if (sc <= 2) { det = 'Risco baixo (≈ 1.5%). Profilaxia mecânica.'; color = 'green'; }
        else if (sc <= 4) { det = 'Risco moderado (≈ 3%). Profilaxia farmacológica ou mecânica.'; color = 'yellow'; }
        else { det = 'Risco alto (≈ 6%). Profilaxia farmacológica recomendada.'; color = 'red'; }
        setResult({ value: `${sc} pontos`, detail: det, color, raw: `Caprini: ${sc} pontos\n${det}` });
    }, [checked]);
    return (<div>{groups.flatMap((g, gi) => g.items.map((item) => { const ci = itemIdx++; return <Checkbox key={ci} label={item} checked={checked[ci]} onChange={() => toggle(ci)} points={g.pts} />; }))}</div>);
};

const CalcSTOPBANG = ({ setResult }: any) => {
    const items = ['Ronco alto (audível pela porta fechada)', 'Sensação de cansaço, fadiga ou sonolência durante o dia', 'Alguém observou apneias durante o sono', 'Hipertensão arterial em tratamento', 'IMC > 35', 'Idade > 50 anos', 'Circunferência cervical > 40 cm', 'Sexo masculino'];
    const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));
    const toggle = (i: number) => setChecked(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
    useEffect(() => {
        const sc = checked.filter(Boolean).length;
        let det = ''; let color: any = 'green';
        if (sc <= 2) { det = 'Baixo risco de SAOS grave.'; color = 'green'; }
        else if (sc <= 4) { det = 'Risco intermediário de SAOS. Considerar polissonografia.'; color = 'yellow'; }
        else { det = 'Alto risco de SAOS grave. Encaminhar para polissonografia.'; color = 'red'; }
        setResult({ value: `${sc} / 8`, detail: det, color, raw: `STOP-BANG: ${sc}/8\n${det}` });
    }, [checked]);
    return (<div>{items.map((item, i) => <Checkbox key={i} label={item} checked={checked[i]} onChange={() => toggle(i)} points={1} />)}</div>);
};


// =============================================
// COMPONENTE PRINCIPAL
// =============================================
const Calculadoras: React.FC = () => {
    const [selectedId, setSelectedId] = useState('ckd');
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState<CalcResult | null>(null);
    const [copyFeedback, setCopyFeedback] = useState('');
    const [resetKey, setResetKey] = useState(0);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['nefro']));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSelect = useCallback((id: string) => {
        setSelectedId(id);
        setResult(null);
        setResetKey(prev => prev + 1);
        setMobileOpen(false);
        const cat = CALCULATORS.find(c => c.id === id)?.category || '';
        setExpandedCategories(prev => new Set([...prev, cat]));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleCopy = () => {
        if (!result?.raw) return;
        navigator.clipboard.writeText(result.raw);
        setCopyFeedback('Copiado!');
        setTimeout(() => setCopyFeedback(''), 2000);
    };

    const handleClear = () => { setResult(null); setResetKey(prev => prev + 1); };

    const toggleCategory = (catId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId); else next.add(catId);
            return next;
        });
    };

    const filteredBySearch = searchTerm.trim().length >= 2
        ? CALCULATORS.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.shortName.toLowerCase().includes(searchTerm.toLowerCase()))
        : null;

    const renderCalculator = () => {
        const props = { setResult };
        const key = `${selectedId}-${resetKey}`;
        const map: Record<string, React.ReactElement> = {
            ckd: <CalcCKD key={key} {...props} />,
            sodio: <CalcSodioCorrigido key={key} {...props} />,
            osmol: <CalcOsmolaridade key={key} {...props} />,
            kfre: <CalcKFRE key={key} {...props} />,
            imc: <CalcIMC key={key} {...props} />,
            chadsvasc: <CalcCHADSVASc key={key} {...props} />,
            hasbled: <CalcHASBLED key={key} {...props} />,
            heart: <CalcHEART key={key} {...props} />,
            rcri: <CalcRCRI key={key} {...props} />,
            wellstep: <CalcWellsTEP key={key} {...props} />,
            wellstvp: <CalcWellsTVP key={key} {...props} />,
            perc: <CalcPERC key={key} {...props} />,
            qsofa: <CalcQSOFA key={key} {...props} />,
            sofa: <CalcSOFA key={key} {...props} />,
            news2: <CalcNEWS2 key={key} {...props} />,
            curb65: <CalcCURB65 key={key} {...props} />,
            psiport: <CalcPSIPORT key={key} {...props} />,
            glasgow: <CalcGlasgow key={key} {...props} />,
            nihss: <CalcNIHSS key={key} {...props} />,
            blatchford: <CalcBlatchford key={key} {...props} />,
            meldna: <CalcMELDNa key={key} {...props} />,
            childpugh: <CalcChildPugh key={key} {...props} />,
            padua: <CalcPadua key={key} {...props} />,
            caprini: <CalcCaprini key={key} {...props} />,
            stopbang: <CalcSTOPBANG key={key} {...props} />,
        };
        return map[selectedId] ?? <div className="text-slate-400 text-center py-12">Calculadora não encontrada.</div>;
    };

    const activeCalc = CALCULATORS.find(c => c.id === selectedId);

    const SidebarContent = () => (
        <>
            {/* Busca */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="relative group">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-premium-teal transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text" value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar calculadora..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-premium-teal/10 focus:border-premium-teal transition-all placeholder-slate-400 font-medium"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Lista */}
            <div className="overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar p-2">
                {filteredBySearch ? (
                    <div>
                        {filteredBySearch.length === 0 && <p className="text-sm text-slate-400 text-center py-8 font-medium">Nenhuma calculadora encontrada.</p>}
                        {filteredBySearch.map(calc => (
                            <button key={calc.id} onClick={() => handleSelect(calc.id)}
                                className={`w-full text-left px-3 py-3 text-[13.5px] font-bold rounded-xl transition-all mb-1 flex items-center justify-between group ${selectedId === calc.id ? 'bg-premium-teal text-white shadow-sm shadow-premium-teal/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                                <span>{calc.shortName}</span>
                                <svg className={`w-3.5 h-3.5 shrink-0 ${selectedId === calc.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        ))}
                    </div>
                ) : (
                    CATEGORIES.map(cat => {
                        const catCalcs = CALCULATORS.filter(c => c.category === cat.id);
                        if (catCalcs.length === 0) return null;
                        const isOpen = expandedCategories.has(cat.id);
                        const hasActive = catCalcs.some(c => c.id === selectedId);
                        return (
                            <div key={cat.id} className="mb-1">
                                <button onClick={() => toggleCategory(cat.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${hasActive ? 'bg-premium-teal/5 text-premium-teal dark:text-premium-teal' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} /></svg>
                                        <span>{cat.label}</span>
                                    </div>
                                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                                {isOpen && (
                                    <div className="pl-3 py-1 space-y-0.5">
                                        {catCalcs.map(calc => (
                                            <button key={calc.id} onClick={() => handleSelect(calc.id)}
                                                className={`w-full text-left px-3 py-2.5 text-[13.5px] font-bold rounded-xl transition-all flex items-center justify-between group ${selectedId === calc.id ? 'bg-premium-teal text-white shadow-sm shadow-premium-teal/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                                                <span>{calc.shortName}</span>
                                                <svg className={`w-3.5 h-3.5 shrink-0 ${selectedId === calc.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );

    return (
        <div className="container mx-auto max-w-[1400px] pb-10 animate-fade-in">
            {/* Cabeçalho da Página */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Calculadoras Médicas</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Suporte à decisão clínica — {CALCULATORS.length} ferramentas organizadas por área.</p>
            </div>

            {/* Botão mobile para abrir sidebar */}
            <div className="md:hidden mb-4">
                <button onClick={() => setMobileOpen(o => !o)}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm font-bold text-slate-700 dark:text-slate-200">
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-premium-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        {activeCalc?.shortName}
                    </span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {mobileOpen && (
                    <div className="mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                        <SidebarContent />
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Sidebar desktop */}
                <aside className="hidden md:block w-[280px] lg:w-[300px] shrink-0 sticky top-24">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <SidebarContent />
                    </div>
                </aside>

                {/* Painel principal */}
                <main className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 min-h-[600px] flex flex-col relative overflow-hidden">
                        {/* Decoração de fundo */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-premium-teal/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

                        {/* Cabeçalho da calculadora */}
                        <div className="mb-8 pb-8 border-b border-slate-100/80 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start gap-4 relative z-10">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        {CATEGORIES.find(c => c.id === activeCalc?.category)?.label}
                                    </span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{activeCalc?.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 text-base font-medium leading-relaxed">{activeCalc?.description}</p>
                            </div>
                            <button onClick={handleClear}
                                className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all border border-slate-100 dark:border-slate-800 hover:border-red-200">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Limpar
                            </button>
                        </div>

                        {/* Formulário */}
                        <div className="flex-grow relative z-10 max-w-3xl">
                            {renderCalculator()}
                        </div>

                        {/* Resultado */}
                        <div className="relative z-10">
                            {result ? (
                                <div className="mt-10 border-t border-slate-100/80 dark:border-slate-800/50 pt-8">
                                    <ResultCard title="Resultado Clínico" value={result.value} detail={result.detail} color={result.color || 'premium-teal'} />
                                    <div className="mt-6 flex justify-center sm:justify-end">
                                        <button onClick={handleCopy}
                                            className="group flex items-center gap-2.5 px-6 py-3.5 text-[15px] font-black text-white bg-slate-900 dark:bg-slate-700 rounded-2xl hover:bg-black dark:hover:bg-slate-600 shadow-lg shadow-slate-200 dark:shadow-none transition-all hover:-translate-y-0.5">
                                            {copyFeedback ? (
                                                <span className="text-teal-400 flex items-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{copyFeedback}</span>
                                            ) : (
                                                <><svg className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>Copiar para Prontuário</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-10 p-10 sm:p-14 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                        <svg className="w-8 h-8 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-tight">Aguardando dados...</h3>
                                    <p className="text-[14px] text-slate-400 font-medium max-w-xs leading-relaxed">Preencha os parâmetros acima para calcular o suporte à decisão clínica.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Calculadoras;
