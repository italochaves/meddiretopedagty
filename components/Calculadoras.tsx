
import React, { useState, useEffect } from 'react';

// --- Tipos & Interfaces ---

interface CalculatorDef {
    id: string;
    name: string;
    description: string;
    shortName: string;
}

const CALCULATORS: CalculatorDef[] = [
    { id: 'ckd', name: 'Filtro Glomerular (CKD-EPI 2021)', description: 'Estima a TFG baseada em creatinina, idade e sexo.', shortName: 'CKD-EPI' },
    { id: 'imc', name: 'IMC (Índice de Massa Corporal)', description: 'Avaliação nutricional simples baseada em peso e altura.', shortName: 'IMC' },
    { id: 'curb65', name: 'CURB-65 (Pneumonia)', description: 'Estratificação de risco para Pneumonia Adquirida na Comunidade.', shortName: 'CURB-65' },
    { id: 'chadsvasc', name: 'CHADS-VASc', description: 'Risco de AVC em pacientes com Fibrilação Atrial.', shortName: 'CHADS-VASc' },
    { id: 'hasbled', name: 'HAS-BLED', description: 'Risco de sangramento em uso de anticoagulantes.', shortName: 'HAS-BLED' },
    { id: 'glasgow', name: 'Escala de Coma de Glasgow', description: 'Avaliação do nível de consciência após trauma cerebral.', shortName: 'Glasgow' },
    { id: 'qsofa', name: 'qSOFA (Sepsis)', description: 'Identificação rápida de pacientes com risco de Sepsis.', shortName: 'qSOFA' },
    { id: 'sofa', name: 'SOFA Score', description: 'Avaliação sequencial de falência orgânica.', shortName: 'SOFA' },
];

// --- Componentes Reutilizáveis de UI ---

const InputNumber = ({ label, value, onChange, placeholder = "", step = "any", suffix = "" }: any) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <div className="relative">
            <input
                type="number"
                step={step}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-premium-teal focus:border-premium-teal transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            {suffix && <span className="absolute right-3 top-3 text-slate-400 text-sm">{suffix}</span>}
        </div>
    </div>
);

const Select = ({ label, value, onChange, options }: any) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-premium-teal focus:border-premium-teal bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <div className="flex items-center mb-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="w-5 h-5 text-premium-teal border-gray-300 dark:border-slate-600 rounded focus:ring-premium-teal"
        />
        <label className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">{label}</label>
    </div>
);

const ResultCard = ({ title, value, detail, color = "premium-teal" }: any) => {
    if (!value) return null;

    // Map colors to explicit tailwind classes to ensure they work with CDNs
    const colorMap: Record<string, { border: string, text: string }> = {
        'premium-teal': { border: 'border-premium-teal', text: 'text-premium-teal' },
        'green': { border: 'border-green-500', text: 'text-green-600 dark:text-green-400' },
        'yellow': { border: 'border-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
        'red': { border: 'border-red-500', text: 'text-red-600 dark:text-red-400' },
    };

    const styles = colorMap[color] || colorMap['premium-teal'];

    return (
        <div className={`mt-6 p-6 rounded-xl border-l-4 shadow-sm bg-white dark:bg-slate-800 ${styles.border} animate-fade-in`}>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{title}</h3>
            <div className={`text-3xl font-bold ${styles.text}`}>{value}</div>
            {detail && <div className="mt-2 text-slate-600 dark:text-slate-300 font-medium">{detail}</div>}
        </div>
    );
};

// --- Lógica das Calculadoras ---

const CalcCKD = ({ setResult }: any) => {
    const [cr, setCr] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('female');

    useEffect(() => {
        if (!cr || !age) { setResult(null); return; }
        const c = parseFloat(cr);
        const a = parseFloat(age);
        if (isNaN(c) || isNaN(a)) return;

        let egfr = 0;
        // CKD-EPI 2021 Formula
        if (gender === 'female') {
            if (c <= 0.7) {
                egfr = 142 * Math.pow((c / 0.7), -0.241) * Math.pow(0.9938, a) * 1.012;
            } else {
                egfr = 142 * Math.pow((c / 0.7), -1.2) * Math.pow(0.9938, a) * 1.012;
            }
        } else {
            if (c <= 0.9) {
                egfr = 142 * Math.pow((c / 0.9), -0.302) * Math.pow(0.9938, a);
            } else {
                egfr = 142 * Math.pow((c / 0.9), -1.2) * Math.pow(0.9938, a);
            }
        }

        const score = egfr.toFixed(1);
        let classification = '';
        if (egfr >= 90) classification = 'G1 - Normal ou Alto';
        else if (egfr >= 60) classification = 'G2 - Levemente diminuído';
        else if (egfr >= 45) classification = 'G3a - Leve a moderadamente diminuído';
        else if (egfr >= 30) classification = 'G3b - Moderada a gravemente diminuído';
        else if (egfr >= 15) classification = 'G4 - Gravemente diminuído';
        else classification = 'G5 - Falência Renal';

        setResult({
            value: `${score} mL/min/1.73m²`,
            detail: classification,
            raw: `eGFR (CKD-EPI 2021): ${score} mL/min/1.73m²\nClassificação: ${classification}`
        });
    }, [cr, age, gender, setResult]);

    return (
        <div>
            <div className="grid grid-cols-2 gap-4">
                <Select label="Sexo" value={gender} onChange={setGender} options={[{ value: 'female', label: 'Feminino' }, { value: 'male', label: 'Masculino' }]} />
                <InputNumber label="Idade" value={age} onChange={setAge} placeholder="Anos" />
            </div>
            <InputNumber label="Creatinina Sérica" value={cr} onChange={setCr} placeholder="mg/dL" suffix="mg/dL" />
        </div>
    );
};

const CalcIMC = ({ setResult }: any) => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    useEffect(() => {
        if (!weight || !height) { setResult(null); return; }
        const w = parseFloat(weight);
        const h = parseFloat(height); // Assumindo cm para UX melhor, converto pra m
        if (isNaN(w) || isNaN(h)) return;

        const hMeters = h / 100;
        const imc = w / (hMeters * hMeters);
        const score = imc.toFixed(1);

        let classification = '';
        if (imc < 18.5) classification = 'Baixo peso';
        else if (imc < 24.9) classification = 'Peso normal';
        else if (imc < 29.9) classification = 'Sobrepeso';
        else if (imc < 34.9) classification = 'Obesidade Grau I';
        else if (imc < 39.9) classification = 'Obesidade Grau II';
        else classification = 'Obesidade Grau III';

        setResult({
            value: `${score} kg/m²`,
            detail: classification,
            raw: `IMC: ${score} kg/m²\nClassificação: ${classification}`
        });
    }, [weight, height, setResult]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <InputNumber label="Peso" value={weight} onChange={setWeight} placeholder="kg" suffix="kg" />
            <InputNumber label="Altura" value={height} onChange={setHeight} placeholder="cm" suffix="cm" />
        </div>
    );
};

const CalcCURB65 = ({ setResult }: any) => {
    const [confusion, setConfusion] = useState(false);
    const [urea, setUrea] = useState(false);
    const [respRate, setRespRate] = useState(false);
    const [bp, setBp] = useState(false);
    const [age, setAge] = useState(false);

    useEffect(() => {
        const score = [confusion, urea, respRate, bp, age].filter(Boolean).length;
        
        let risk = '';
        let color = 'premium-teal'; // Default blue
        
        if (score <= 1) { risk = 'Baixo Risco (Mortalidade <1.5%). Considerar tratamento ambulatorial.'; color = 'green'; }
        else if (score === 2) { risk = 'Risco Moderado (Mortalidade ~9%). Considerar internação.'; color = 'yellow'; }
        else { risk = 'Alto Risco (Mortalidade >22%). Considerar UTI.'; color = 'red'; }

        setResult({
            value: `${score} Pontos`,
            detail: risk,
            color: color,
            raw: `CURB-65: ${score} Pontos\n${risk}`
        });
    }, [confusion, urea, respRate, bp, age, setResult]);

    return (
        <div>
            <Checkbox label="Confusão Mental (C)" checked={confusion} onChange={setConfusion} />
            <Checkbox label="Ureia > 50 mg/dL (U)" checked={urea} onChange={setUrea} />
            <Checkbox label="Frequência Respiratória ≥ 30/min (R)" checked={respRate} onChange={setRespRate} />
            <Checkbox label="PAS < 90 ou PAD ≤ 60 mmHg (B)" checked={bp} onChange={setBp} />
            <Checkbox label="Idade ≥ 65 anos (65)" checked={age} onChange={setAge} />
        </div>
    );
};

const CalcCHADSVASc = ({ setResult }: any) => {
    const [chf, setChf] = useState(false);
    const [htn, setHtn] = useState(false);
    const [age, setAge] = useState('0'); // 0 = <65, 1 = 65-74, 2 = >=75
    const [diabetes, setDiabetes] = useState(false);
    const [stroke, setStroke] = useState(false);
    const [vasc, setVasc] = useState(false);
    const [sex, setSex] = useState('male'); // female = 1 point

    useEffect(() => {
        let score = 0;
        if (chf) score += 1;
        if (htn) score += 1;
        if (age === '2') score += 2; // >= 75
        else if (age === '1') score += 1; // 65-74
        if (diabetes) score += 1;
        if (stroke) score += 2;
        if (vasc) score += 1;
        if (sex === 'female') score += 1;

        let risk = '';
        if (score === 0) risk = 'Baixo risco. Anticoagulação geralmente não indicada.';
        else if (score === 1) risk = 'Risco intermediário. Considerar anticoagulação oral.';
        else risk = 'Alto risco. Anticoagulação oral recomendada.';

        setResult({
            value: `${score} Pontos`,
            detail: risk,
            raw: `CHADS-VASc: ${score} Pontos\n${risk}`
        });
    }, [chf, htn, age, diabetes, stroke, vasc, sex, setResult]);

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                 <Select label="Idade" value={age} onChange={setAge} options={[
                    { value: '0', label: '< 65 anos' },
                    { value: '1', label: '65 - 74 anos (+1)' },
                    { value: '2', label: '≥ 75 anos (+2)' }
                ]} />
                <Select label="Sexo" value={sex} onChange={setSex} options={[{ value: 'male', label: 'Masculino' }, { value: 'female', label: 'Feminino (+1)' }]} />
            </div>
            <Checkbox label="Insuficiência Cardíaca Congestiva / Disfunção VE (+1)" checked={chf} onChange={setChf} />
            <Checkbox label="Hipertensão Arterial (+1)" checked={htn} onChange={setHtn} />
            <Checkbox label="Diabetes Mellitus (+1)" checked={diabetes} onChange={setDiabetes} />
            <Checkbox label="AVC / AIT / Tromboembolismo prévio (+2)" checked={stroke} onChange={setStroke} />
            <Checkbox label="Doença Vascular (IAM, DAOP, Placa aórtica) (+1)" checked={vasc} onChange={setVasc} />
        </div>
    );
};

const CalcHASBLED = ({ setResult }: any) => {
    const [h, setH] = useState(false);
    const [a1, setA1] = useState(false); // Renal
    const [a2, setA2] = useState(false); // Hepatico
    const [s, setS] = useState(false);
    const [b, setB] = useState(false);
    const [l, setL] = useState(false);
    const [e, setE] = useState(false);
    const [d1, setD1] = useState(false); // Drugs
    const [d2, setD2] = useState(false); // Alcohol

    useEffect(() => {
        const score = [h, a1, a2, s, b, l, e, d1, d2].filter(Boolean).length;
        
        let risk = '';
        let color = 'premium-teal';
        
        if (score >= 3) {
            risk = 'Alto risco de sangramento. Requer cautela e revisão frequente.';
            color = 'red';
        } else {
            risk = 'Baixo a moderado risco de sangramento.';
        }

        setResult({
            value: `${score} Pontos`,
            detail: risk,
            color: color,
            raw: `HAS-BLED: ${score} Pontos\n${risk}`
        });
    }, [h, a1, a2, s, b, l, e, d1, d2, setResult]);

    return (
        <div className="grid md:grid-cols-2 gap-x-4">
            <Checkbox label="Hipertensão (PAS > 160) (H)" checked={h} onChange={setH} />
            <Checkbox label="Função Renal Anormal (A)" checked={a1} onChange={setA1} />
            <Checkbox label="Função Hepática Anormal (A)" checked={a2} onChange={setA2} />
            <Checkbox label="AVC Prévio (S)" checked={s} onChange={setS} />
            <Checkbox label="História de Sangramento ou Predisposição (B)" checked={b} onChange={setB} />
            <Checkbox label="Labilidade do INR (L)" checked={l} onChange={setL} />
            <Checkbox label="Idade > 65 anos (E)" checked={e} onChange={setE} />
            <Checkbox label="Uso de Medicamentos (AINES/Antiplaquetários) (D)" checked={d1} onChange={setD1} />
            <Checkbox label="Uso de Álcool (D)" checked={d2} onChange={setD2} />
        </div>
    );
};

const CalcGlasgow = ({ setResult }: any) => {
    const [eye, setEye] = useState('4');
    const [verbal, setVerbal] = useState('5');
    const [motor, setMotor] = useState('6');

    useEffect(() => {
        const score = parseInt(eye) + parseInt(verbal) + parseInt(motor);
        let desc = '';
        if (score <= 8) desc = 'Coma / Trauma Grave - Considerar Via Aérea Definitiva';
        else if (score <= 12) desc = 'Trauma Moderado';
        else desc = 'Trauma Leve';

        setResult({
            value: `${score} Pontos`,
            detail: desc,
            color: score <= 8 ? 'red' : 'premium-teal',
            raw: `Glasgow: ${score}\n${desc}`
        });
    }, [eye, verbal, motor, setResult]);

    return (
        <div>
            <Select label="Abertura Ocular" value={eye} onChange={setEye} options={[
                { value: '4', label: '4 - Espontânea' },
                { value: '3', label: '3 - Ao comando verbal' },
                { value: '2', label: '2 - À dor' },
                { value: '1', label: '1 - Ausente' },
            ]} />
            <Select label="Resposta Verbal" value={verbal} onChange={setVerbal} options={[
                { value: '5', label: '5 - Orientado' },
                { value: '4', label: '4 - Confuso' },
                { value: '3', label: '3 - Palavras inapropriadas' },
                { value: '2', label: '2 - Sons incompreensíveis' },
                { value: '1', label: '1 - Ausente' },
            ]} />
            <Select label="Resposta Motora" value={motor} onChange={setMotor} options={[
                { value: '6', label: '6 - Obedece comandos' },
                { value: '5', label: '5 - Localiza dor' },
                { value: '4', label: '4 - Flexão normal (retirada)' },
                { value: '3', label: '3 - Flexão anormal (decorticação)' },
                { value: '2', label: '2 - Extensão (descerebração)' },
                { value: '1', label: '1 - Ausente' },
            ]} />
        </div>
    );
};

const CalcQSOFA = ({ setResult }: any) => {
    const [mental, setMental] = useState(false);
    const [bp, setBp] = useState(false);
    const [resp, setResp] = useState(false);

    useEffect(() => {
        const score = [mental, bp, resp].filter(Boolean).length;
        
        let risk = '';
        let color = 'premium-teal';
        
        if (score >= 2) {
            risk = 'qSOFA Positivo. Alto risco de desfecho clínico ruim / Sepsis. Avaliar SOFA completo.';
            color = 'red';
        } else {
            risk = 'Baixo risco (não exclui sepsis).';
        }

        setResult({
            value: `${score} Pontos`,
            detail: risk,
            color: color,
            raw: `qSOFA: ${score} Pontos\n${risk}`
        });
    }, [mental, bp, resp, setResult]);

    return (
        <div>
            <Checkbox label="Alteração do Estado Mental (Glasgow < 15)" checked={mental} onChange={setMental} />
            <Checkbox label="Pressão Sistólica ≤ 100 mmHg" checked={bp} onChange={setBp} />
            <Checkbox label="Frequência Respiratória ≥ 22/min" checked={resp} onChange={setResp} />
        </div>
    );
};

const CalcSOFA = ({ setResult }: any) => {
    const [resp, setResp] = useState('0');
    const [coag, setCoag] = useState('0');
    const [liver, setLiver] = useState('0');
    const [cardio, setCardio] = useState('0');
    const [cns, setCns] = useState('0');
    const [renal, setRenal] = useState('0');

    useEffect(() => {
        const score = parseInt(resp) + parseInt(coag) + parseInt(liver) + parseInt(cardio) + parseInt(cns) + parseInt(renal);
        
        let desc = 'Monitorar evolução diária.';
        if(score >= 2) desc = 'Aumento de ≥2 pontos sugere disfunção orgânica/sepse.';

        setResult({
            value: `${score} Pontos`,
            detail: desc,
            raw: `SOFA Score: ${score}\n${desc}`
        });
    }, [resp, coag, liver, cardio, cns, renal, setResult]);

    return (
        <div className="grid md:grid-cols-2 gap-4">
            <Select label="Respiração (PaO2/FiO2)" value={resp} onChange={setResp} options={[
                { value: '0', label: '≥ 400 (0)' },
                { value: '1', label: '< 400 (1)' },
                { value: '2', label: '< 300 (2)' },
                { value: '3', label: '< 200 c/ suporte (3)' },
                { value: '4', label: '< 100 c/ suporte (4)' },
            ]} />
            <Select label="Coagulação (Plaquetas x10³)" value={coag} onChange={setCoag} options={[
                { value: '0', label: '≥ 150 (0)' },
                { value: '1', label: '< 150 (1)' },
                { value: '2', label: '< 100 (2)' },
                { value: '3', label: '< 50 (3)' },
                { value: '4', label: '< 20 (4)' },
            ]} />
             <Select label="Fígado (Bilirrubina mg/dL)" value={liver} onChange={setLiver} options={[
                { value: '0', label: '< 1.2 (0)' },
                { value: '1', label: '1.2 - 1.9 (1)' },
                { value: '2', label: '2.0 - 5.9 (2)' },
                { value: '3', label: '6.0 - 11.9 (3)' },
                { value: '4', label: '> 12.0 (4)' },
            ]} />
             <Select label="Cardiovascular (PAM ou Drogas)" value={cardio} onChange={setCardio} options={[
                { value: '0', label: 'PAM ≥ 70 (0)' },
                { value: '1', label: 'PAM < 70 (1)' },
                { value: '2', label: 'Dopamina < 5 (2)' },
                { value: '3', label: 'Dopamina > 5 ou Epinefrina <= 0.1 (3)' },
                { value: '4', label: 'Dopamina > 15 ou Epinefrina > 0.1 (4)' },
            ]} />
             <Select label="SNC (Glasgow)" value={cns} onChange={setCns} options={[
                { value: '0', label: '15 (0)' },
                { value: '1', label: '13 - 14 (1)' },
                { value: '2', label: '10 - 12 (2)' },
                { value: '3', label: '6 - 9 (3)' },
                { value: '4', label: '< 6 (4)' },
            ]} />
             <Select label="Renal (Creatinina mg/dL)" value={renal} onChange={setRenal} options={[
                { value: '0', label: '< 1.2 (0)' },
                { value: '1', label: '1.2 - 1.9 (1)' },
                { value: '2', label: '2.0 - 3.4 (2)' },
                { value: '3', label: '3.5 - 4.9 (3)' },
                { value: '4', label: '> 5.0 (4)' },
            ]} />
        </div>
    );
};


// --- Componente Principal ---

const Calculadoras: React.FC = () => {
    const [selectedId, setSelectedId] = useState('ckd');
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState<any>(null);
    const [copyFeedback, setCopyFeedback] = useState('');
    
    // Key utilizada para forçar o reset dos estados internos das calculadoras
    const [resetKey, setResetKey] = useState(0);

    const filteredCalculators = CALCULATORS.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.shortName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (id: string) => {
        setSelectedId(id);
        setResult(null);
        setResetKey(prev => prev + 1); // Força reset dos inputs
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCopy = () => {
        if (!result?.raw) return;
        navigator.clipboard.writeText(result.raw);
        setCopyFeedback('Copiado!');
        setTimeout(() => setCopyFeedback(''), 2000);
    };

    const handleClear = () => {
        setResult(null);
        setResetKey(prev => prev + 1);
    };

    const renderCalculator = () => {
        const props = { setResult };
        // Usando a key para resetar o componente quando mudar a aba ou clicar em limpar
        const key = `${selectedId}-${resetKey}`;
        
        switch (selectedId) {
            case 'ckd': return <CalcCKD key={key} {...props} />;
            case 'imc': return <CalcIMC key={key} {...props} />;
            case 'curb65': return <CalcCURB65 key={key} {...props} />;
            case 'chadsvasc': return <CalcCHADSVASc key={key} {...props} />;
            case 'hasbled': return <CalcHASBLED key={key} {...props} />;
            case 'glasgow': return <CalcGlasgow key={key} {...props} />;
            case 'qsofa': return <CalcQSOFA key={key} {...props} />;
            case 'sofa': return <CalcSOFA key={key} {...props} />;
            default: return <div>Selecione uma calculadora</div>;
        }
    };

    const activeCalc = CALCULATORS.find(c => c.id === selectedId);

    return (
        <div className="container mx-auto max-w-6xl pb-10">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Calculadoras Médicas</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Ferramentas essenciais para suporte à decisão clínica.</p>

            <div className="flex flex-col md:flex-row gap-6">
                
                {/* Sidebar */}
                <aside className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-24">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <input 
                                type="text" 
                                placeholder="Buscar calculadora..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:border-premium-teal placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>
                        <div className="max-h-[60vh] md:max-h-[calc(100vh-200px)] overflow-y-auto">
                            {filteredCalculators.map(calc => (
                                <button
                                    key={calc.id}
                                    onClick={() => handleSelect(calc.id)}
                                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
                                        selectedId === calc.id 
                                        ? 'bg-premium-teal/5 dark:bg-premium-teal/20 border-premium-teal text-premium-teal dark:text-premium-teal-300' 
                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {calc.shortName}
                                </button>
                            ))}
                            {filteredCalculators.length === 0 && (
                                <div className="p-4 text-sm text-slate-400 text-center">Nenhuma calculadora encontrada.</div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 min-h-[500px]">
                        
                        {/* Header da Calculadora */}
                        <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{activeCalc?.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">{activeCalc?.description}</p>
                            </div>
                            <button 
                                onClick={handleClear}
                                className="text-sm text-slate-400 hover:text-premium-teal transition-colors"
                            >
                                Limpar
                            </button>
                        </div>

                        {/* Área de Inputs */}
                        <div className="max-w-3xl">
                            {renderCalculator()}
                        </div>

                        {/* Área de Resultado */}
                        {result && (
                            <div className="mt-8 border-t border-slate-100 dark:border-slate-700 pt-6">
                                <ResultCard 
                                    title="Resultado" 
                                    value={result.value} 
                                    detail={result.detail} 
                                    color={result.color || 'premium-teal'} 
                                />
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {copyFeedback ? (
                                            <span className="text-green-600 dark:text-green-400 font-bold">{copyFeedback}</span>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                Copiar Resultado
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                        {!result && (
                            <div className="mt-12 p-8 text-center bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500">
                                Preencha os campos acima para ver o resultado.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Calculadoras;
