
import React from 'react';
import { Link } from 'react-router-dom';

// Ícone de Cone/Construção (Estilo Lucide/Tailwind)
const ConstructionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
        <path d="M22 22H2" />
        <path d="M12 2L4.5 22h15L12 2z" />
        <path d="M10 16h4" />
        <path d="M10 10h4" />
    </svg>
);

const UnderConstruction: React.FC = () => {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-16 flex flex-col items-center justify-center text-center min-h-[60vh] animate-fade-in">
            {/* Ícone com Background Suave */}
            <div className="p-8 mb-8 bg-amber-50 dark:bg-amber-900/20 rounded-full ring-1 ring-amber-100 dark:ring-amber-900/30 shadow-sm">
                <ConstructionIcon />
            </div>

            {/* Textos */}
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
                Protocolo em Construção 🚧
            </h1>
            
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-md leading-relaxed">
                Estamos trabalhando com especialistas para trazer este conteúdo com a máxima precisão clínica. <br/>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Logo, logo estará disponível.</span>
            </p>

            {/* Botão de Voltar */}
            <Link 
                to="/emergencia" 
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold text-white transition-all transform bg-premium-teal rounded-xl hover:bg-premium-teal-600 shadow-lg shadow-premium-teal/20 hover:-translate-y-1 active:translate-y-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                </svg>
                Voltar para Emergência
            </Link>
        </div>
    );
};

export default UnderConstruction;
