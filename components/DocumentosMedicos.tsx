import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DocumentosMedicos: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 max-w-5xl my-8 mb-24 animate-in fade-in duration-500">
            {/* Header com Navegação Histórica */}
            <div className="flex items-center gap-4 mb-10">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Documentos Médicos</h1>
                    <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 mt-1">Gere rapidamente os principais documentos médicos com modelos padronizados.</p>
                </div>
            </div>

            {/* Grid de Cartões de Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* ATESTADO MÉDICO - Ativo */}
                <Link to="/documentos/atestado" className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-premium-teal/30 dark:hover:border-premium-teal/30 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">Atestado Médico</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        Atestado padronizado com dias de afastamento e busca opcional de CID-10.
                    </p>
                </Link>

                {/* DECLARAÇÃO DE COMPARECIMENTO - Ativo */}
                <Link to="/documentos/comparecimento" className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-premium-teal/30 dark:hover:border-premium-teal/30 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                       <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">Comparecimento</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        Comprove a presença do paciente ou do acompanhante no atendimento.
                    </p>
                </Link>

                {/* ENCAMINHAMENTO - Ativo */}
                <Link to="/documentos/encaminhamento" className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-premium-teal/30 dark:hover:border-premium-teal/30 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 16 4-4-4-4"/><path d="M8 12h8"/></svg>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 group-hover:text-amber-500 transition-colors">Encaminhamento</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        Modelo rápido para encaminhar a especialista ou serviço referenciado.
                    </p>
                </Link>

                {/* RELATORIO MEDICO - Ativo */}
                <Link to="/documentos/relatorio" className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-premium-teal/30 dark:hover:border-premium-teal/30 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 group-hover:text-rose-600 transition-colors">Relatório</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        Texto estruturado em blocos para relatórios clínicos extensos.
                    </p>
                </Link>

                {/* SOLICITACAO DE EXAMES - Ativo */}
                <Link to="/documentos/exames" className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-premium-teal/30 dark:hover:border-premium-teal/30 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                       <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 group-hover:text-sky-600 transition-colors">Solicitação Exames</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        Pedido padronizado com justificativas para exames laboratoriais e imagem.
                    </p>
                </Link>

            </div>
        </div>
    );
};

export default DocumentosMedicos;
