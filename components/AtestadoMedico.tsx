import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrint } from '../contexts/PrintContext';

interface CidRecord {
    codigo: string;
    nome: string;
}

const AtestadoMedico: React.FC = () => {
    const navigate = useNavigate();
    const { addToQueue } = usePrint();
    
    // Form fields
    const [dias, setDias] = useState<string>('1');
    const [cidSearch, setCidSearch] = useState('');
    const [selectedCid, setSelectedCid] = useState<CidRecord | null>(null);
    const [semCid, setSemCid] = useState(false);
    const [printTwoCopies, setPrintTwoCopies] = useState(false);
    
    // Cid Database
    const [cidDatabase, setCidDatabase] = useState<CidRecord[]>([]);
    const [searchResults, setSearchResults] = useState<CidRecord[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Feebdack state
    const [addedToQueue, setAddedToQueue] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fetch CID-10 JSON on mount
    useEffect(() => {
        fetch('/cid10.json')
            .then(res => res.json())
            .then(data => {
                setCidDatabase(data);
            })
            .catch(err => {
                console.error("Falha ao carregar dicionário de CID-10:", err);
            });
    }, []);

    // Autocomplete filter
    useEffect(() => {
        if (!cidSearch.trim()) {
            setSearchResults([]);
            return;
        }

        const term = cidSearch.toLowerCase().trim();
        const results = cidDatabase.filter(item => 
            item.codigo.toLowerCase().includes(term) || 
            item.nome.toLowerCase().includes(term)
        ).slice(0, 50); // Limit exactly to first 50 hits for speed
        
        setSearchResults(results);
    }, [cidSearch, cidDatabase]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelectCid = (cid: CidRecord) => {
        setSelectedCid(cid);
        setCidSearch('');
        setIsDropdownOpen(false);
    };

    // Text generation logic
    const generateHtml = () => {
        const diasStr = parseInt(dias) > 0 ? dias : '____';
        
        let cidStr = '';
        if (!semCid && selectedCid) {
            cidStr = `CID-10: ${selectedCid.codigo} &nbsp; &nbsp; &nbsp; Autorizado pelo paciente.`;
        }

        return `
            <div style="font-family: 'Roboto', Arial, sans-serif; font-size: 14pt; line-height: 1.6; text-align: justify;">
                <p style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 16pt; text-decoration: underline;">ATESTADO MÉDICO</p>
                <p style="margin-bottom: 20px;">
                    Atesto, para os devidos fins, que o(a) paciente supracitado, foi atendido(a) por mim nesta data, encontrando-se comprovadamente impossibilitado(a) de realizar suas atividades habituais, laborais e escolares, necessitando de <strong>${diasStr}</strong> dias de afastamento, a contar da presente data.
                </p>
                ${cidStr ? `<p style="margin-bottom: 20px;">${cidStr}</p>` : ''}
                <p style="margin-bottom: 20px; font-size: 13pt;">
                    Paciente encontra-se orientado(a) quanto às condutas terapêuticas e sinais de alerta.
                </p>
            </div>
        `;
    };

    const handleAddToQueue = () => {
        const html = generateHtml();
        const docId = 'atestado_' + Date.now();
        
        addToQueue({
            id: docId,
            titulo: 'Atestado Médico',
            texto: html,
            tipo: 'documento'
        });

        if (printTwoCopies) {
            addToQueue({
                id: docId + '_via2',
                titulo: 'Atestado Médico',
                texto: html,
                tipo: 'documento'
            });
        }

        setAddedToQueue(true);
        setTimeout(() => setAddedToQueue(false), 2000);
    };

    return (
        <div className="container mx-auto px-4 max-w-4xl my-8 mb-24 animate-in fade-in duration-500">
            {/* Header com Navegação Histórica */}
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Atestado Médico</h1>
                    <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-1">Prencha os dados para gerar um documento formatado e pronto para impressão.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* COMANDOS E INPUTS */}
                <div className="bg-white dark:bg-slate-900 border-[1.5px] border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-7">
                    
                    {/* Campo Dias */}
                    <div>
                        <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Dias de Afastamento</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="1"
                                value={dias}
                                onChange={(e) => setDias(e.target.value)}
                                className="w-full h-[60px] pl-5 pr-16 text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">dias</div>
                        </div>
                    </div>

                    {/* Campo CID-10 Autocomplete */}
                    <div ref={wrapperRef} className="relative z-50 mb-2">
                        <label className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                            <span>CID-10 do Diagnóstico</span>
                            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tracking-wider">OPCIONAL</span>
                        </label>
                        
                        {selectedCid ? (
                            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl mb-4">
                                <div className="flex flex-col">
                                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-lg tracking-tight">{selectedCid.codigo}</span>
                                    <span className="text-emerald-600/80 dark:text-emerald-400/80 text-sm font-medium line-clamp-1">{selectedCid.nome}</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedCid(null)}
                                    className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-lg transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        ) : (
                        
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px] text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                </div>
                                <input 
                                    type="text"
                                    disabled={semCid}
                                    placeholder={semCid ? "Sem CID no atestado" : "Buscar código (ex: J06) ou doença..."}
                                    value={cidSearch}
                                    onChange={(e) => {
                                        setCidSearch(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className="w-full h-[60px] pl-[52px] pr-5 text-[15px] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:ring-4 focus:ring-premium-teal/20 focus:border-premium-teal outline-none transition-all placeholder-slate-400 font-bold"
                                />

                                {/* DROPDOWN RESULTS */}
                                {isDropdownOpen && searchResults.length > 0 && (
                                    <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] max-h-60 overflow-auto custom-scrollbar list-none p-2">
                                        {searchResults.map(res => (
                                            <li 
                                                key={res.codigo} 
                                                onClick={() => handleSelectCid(res)}
                                                className="flex flex-col p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <span className="font-extrabold text-slate-800 dark:text-slate-200">{res.codigo}</span>
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{res.nome}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {isDropdownOpen && cidSearch.trim().length > 0 && searchResults.length === 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4 text-center">
                                        <p className="text-slate-500 text-sm font-medium">Nenhum CID encontrado. Verifique os termos.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                            <label className="flex items-center gap-2 text-[14px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300 transition-colors w-fit">
                                <input 
                                    type="checkbox" 
                                    checked={semCid}
                                    onChange={(e) => {
                                        setSemCid(e.target.checked);
                                        if(e.target.checked) {
                                            setSelectedCid(null);
                                            setCidSearch('');
                                        }
                                    }}
                                    className="w-5 h-5 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded focus:ring-slate-800 transition-colors bg-white dark:bg-slate-800 cursor-pointer"
                                />
                                Sem CID
                            </label>
                            
                            <p className="text-xs text-slate-400">Apenas o código sairá impresso para preservar sigilo diagnóstico.</p>
                        </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 relative z-0">
                        {/* Print Block (Mirrors PrescriptionPage style) */}
                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={handleAddToQueue}
                                className={`flex items-center justify-center w-full px-4 py-4 font-extrabold tracking-wide text-white transition-all duration-200 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${addedToQueue ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                            >
                                {addedToQueue ? (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                        {printTwoCopies ? 'ADICIONADAS 2 VIAS' : 'ADICIONADO!'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                        ENVIAR PARA IMPRESSÃO
                                    </>
                                )}
                            </button>
                            
                            <label className="flex items-center justify-center gap-2 text-[14px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={printTwoCopies}
                                    onChange={(e) => setPrintTwoCopies(e.target.checked)}
                                    className="w-4 h-4 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded focus:ring-slate-800 transition-colors bg-white dark:bg-slate-800 cursor-pointer"
                                />
                                Imprimir em 2 vias
                            </label>
                        </div>
                    </div>
                </div>

                {/* PREVIEW DO ATESTADO */}
                <div className="bg-white dark:bg-slate-50 border border-slate-200 dark:border-slate-300 rounded-[2px] p-10 lg:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden min-h-[500px]">
                     {/* Watermark/Texture */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[220px] text-slate-50 dark:text-slate-200/50 font-serif font-black select-none pointer-events-none z-0">
                         A
                     </div>
                     
                     <div className="relative z-10 text-slate-800 dark:text-slate-800" dangerouslySetInnerHTML={{ __html: generateHtml() }} />
                </div>
            </div>
        </div>
    );
};

export default AtestadoMedico;
