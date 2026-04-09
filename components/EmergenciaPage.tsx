
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Icons (Inline SVGs) ---
const Icons = {
    Tube: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 13.5a4 4 0 1 1-2.6-6.4" />
            <path d="M15 10.5a4 4 0 1 1 2.6 6.4" />
            <path d="M12 5v14" />
            <path d="M12 19a4 4 0 0 0 5-2.8" />
        </svg>
    ),
    HeartPulse: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    ),
    Droplet: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
    ),
    Brain: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
    ),
    Flask: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.31" />
            <path d="M14 2v7.31" />
            <path d="M8.5 2h7" />
            <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
        </svg>
    ),
    ShieldAlert: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    ActivityWave: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h5l3-5 5 10 3-5h4" />
        </svg>
    ),
    Zap: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    Syringe: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 2 4 4" />
            <path d="m17 7 3-3" />
            <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
            <path d="m9 11 4 4" />
            <path d="m5 19-3 3" />
            <path d="m14 4 6 6" />
        </svg>
    ),
    Moon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    ),
    Pill: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
        </svg>
    )
};

interface EmergencyItem {
    id: string;
    title: string;
    link: string;
    icon: React.ReactNode;
    colorClass: string;
    highlight?: boolean;
}

const MENU_DATA = {
    urgencias: [
        { id: 'iot', title: 'Intubação (IOT)', link: '/emergencia/intubacao', icon: <Icons.Tube />, colorClass: 'text-blue-600', highlight: true },
        { id: 'sedacao', title: 'Sedação Contínua', link: '/emergencia/sedacao', icon: <Icons.Moon />, colorClass: 'text-violet-600', highlight: false },
        { id: 'taquiarritmias', title: 'Taquiarritmias', link: '/emergencia/taquiarritmias', icon: <Icons.Zap />, colorClass: 'text-yellow-600', highlight: false },
        { id: 'bradiarritmias', title: 'Bradiarritmias', link: '/emergencia/bradiarritmias', icon: <Icons.HeartPulse />, colorClass: 'text-rose-600', highlight: false },
        { id: 'disturbios', title: 'Distúrbios Hidroeletrolíticos', link: '/emergencia/hidroeletrolitico', icon: <Icons.Droplet />, colorClass: 'text-cyan-600', highlight: false },
        { id: 'cetoacidose', title: 'Cetoacidose Diabética', link: '/emergencia/cetoacidose', icon: <Icons.Flask />, colorClass: 'text-orange-500', highlight: false },
        { id: 'anafilaxia', title: 'Anafilaxia', link: '/emergencia/anafilaxia', icon: <Icons.ShieldAlert />, colorClass: 'text-pink-600', highlight: false },
        { id: 'convulsao', title: 'Crise Convulsiva', link: '/emergencia/convulsao', icon: <Icons.ActivityWave />, colorClass: 'text-indigo-600', highlight: false },
    ] as EmergencyItem[],
    
    doses: [
        { id: 'vasoativas', title: 'Drogas Vasoativas', link: '/emergencia/drogas-vasoativas', icon: <Icons.Syringe />, colorClass: 'text-emerald-600', highlight: false },
    ] as EmergencyItem[]
};

const EmergenciaPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filterItems = (items: EmergencyItem[]) => {
        return items.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const filteredUrgencias = filterItems(MENU_DATA.urgencias);
    const filteredDoses = filterItems(MENU_DATA.doses);

    return (
        <div className="container mx-auto max-w-7xl pb-10">
            {/* Header Section */}
            <div className="mb-10 text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 mb-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 2h4" /><path d="M12 14v-4" /><path d="M4 13a8 8 0 0 1 16 0" /><circle cx="12" cy="13" r="2" /><path d="M5.6 6.6 4 5" /><path d="M18.4 6.6 20 5" />
                    </svg>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Emergência e Plantão</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Acesso rápido a protocolos críticos, doses de emergência e condutas de urgência.
                </p>

                {/* Search Bar */}
                <div className="relative max-w-xl mx-auto mt-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar protocolo (ex: PCR, Intubação, Sedação)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-4 pl-12 pr-4 text-slate-900 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-base"
                    />
                </div>
            </div>

            {/* Section 1: Urgências */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 px-2">
                    <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                    Protocolos de Urgência
                </h2>
                
                {filteredUrgencias.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredUrgencias.map((item) => (
                            <Link
                                key={item.id}
                                to={item.link}
                                className={`
                                    group relative flex flex-col items-start p-6 bg-white dark:bg-slate-800 
                                    border rounded-2xl transition-all duration-200 
                                    hover:shadow-lg hover:-translate-y-1 
                                    ${item.highlight 
                                        ? 'border-blue-200 ring-1 ring-blue-100 dark:border-blue-900/50 dark:ring-blue-900/30' 
                                        : 'border-slate-100 dark:border-slate-700'
                                    }
                                `}
                            >
                                <div className={`p-3 mb-4 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${item.colorClass.replace('text-', 'bg-')} ${item.colorClass}`}>
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-premium-teal transition-colors">
                                    {item.title}
                                </h3>
                                {item.highlight && (
                                    <span className="absolute top-4 right-4 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        Nenhum protocolo encontrado.
                    </div>
                )}
            </div>

            {/* Section 2: Diluições e Doses */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 px-2">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                    Diluições e Doses
                </h2>

                {filteredDoses.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredDoses.map((item) => (
                            <Link
                                key={item.id}
                                to={item.link}
                                className="group flex flex-col items-start p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className={`p-3 mb-4 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${item.colorClass.replace('text-', 'bg-')} ${item.colorClass}`}>
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-premium-teal transition-colors">
                                    {item.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        Nenhum item encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergenciaPage;
