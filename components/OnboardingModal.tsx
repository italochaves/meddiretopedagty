import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    bullets: string[];
    videoId: string;
}

const steps: OnboardingStep[] = [
    {
        id: 'boas-vindas',
        title: 'Bem-vindo à nova MedDireto',
        description: 'Sua conduta clínica resolvida em segundos. Veja como otimizar seu plantão:',
        bullets: [
            'O Dashboard é a sua central de controle segura.',
            'Acesse ferramentas como Ambulatório, Emergência e Pediatria.',
            'Cálculos automáticos e acesso instantâneo a protocolos.'
        ],
        videoId: 'MG8BnLZlEa4'
    },
    {
        id: 'busca',
        title: 'Busca Universal Ágil',
        description: 'Não perca tempo navegando por menus complexos.',
        bullets: [
            'Use a barra principal no topo do Dashboard.',
            'Encontre condutas exatas buscando sintomas, remédios ou patologias.',
            'Resultados tolerantes a pequenos erros de digitação.'
        ],
        videoId: 'nVbhlTi2UjM'
    },
    {
        id: 'ambulatorio',
        title: 'Fluxo Ambulatorial',
        description: 'Prescrições prontas agrupadas por rigor e especialidade.',
        bullets: [
            'Escolha a especialidade desejada na plataforma.',
            'Selecione a patologia e veja o protocolo consolidado.',
            'Ajuste dosagens facilmente e envie direto para prescrição.'
        ],
        videoId: 'dNBdTtF_3H0'
    },
    {
        id: 'pediatria',
        title: 'Calculadora Pediátrica',
        description: 'Ajuste doses por kg de forma perfeita sem pegar na calculadora.',
        bullets: [
            'Insira peso e idade precisos do paciente no painel lateral.',
            'Selecione a síndrome ou patologia pediátrica.',
            'As doses e mls são ajustadas em tempo real na tela.'
        ],
        videoId: '8GbMK89VSlQ'
    },
    {
        id: 'documentos',
        title: 'Documentos Médicos',
        description: 'Atestados, encaminhamentos e receitas em poucos cliques.',
        bullets: [
            'Campos integrados inteligentemente com a CID-10.',
            'Solicitações de exames agrupadas por classe laboratorial.',
            'Tudo customizado com os dados do seu perfil pré-preenchidos.'
        ],
        videoId: 'j7ibyNWdb_U'
    },
    {
        id: 'impressao',
        title: 'Fila de Impressão e Timbrado',
        description: 'Aglomerador de PDF que economiza tempo de formatação.',
        bullets: [
            'Acumule atestados, exames e receitas na PrintBar inferior.',
            'Faça o upload do seu recetário digital nas configurações.',
            'O layout alinha todos os textos magicamente dentro das margens.'
        ],
        videoId: '70H1SB4n3qg'
    },
    {
        id: 'emergencia',
        title: 'Urgência & Emergência',
        description: 'Apoio visual imersivo e certeiro sob alta pressão.',
        bullets: [
            'Acesse tabelas de intubação (IOT), sedação e anafilaxia críticas.',
            'Infográficos práticos e imediatos, sem leitura excessiva.',
            'Cálculos dinâmicos por peso na hora H que salvam vidas.'
        ],
        videoId: 'QaCzYUcw4dE'
    }
];

const OnboardingModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkViewingStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            setUserId(user.id);
            
            const hasViewed = localStorage.getItem(`meddireto_onboarding_hide_${user.id}`);
            if (!hasViewed) {
                setTimeout(() => setIsOpen(true), 800);
            }
        };

        checkViewingStatus();
    }, []);

    const closeOnboarding = () => {
        if (userId && dontShowAgain) {
            localStorage.setItem(`meddireto_onboarding_hide_${userId}`, 'true');
        }
        setIsOpen(false);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            closeOnboarding();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
        }
    };

    const navigateToTutorial = () => {
        closeOnboarding();
        navigate('/tutorial');
    };

    if (!isOpen) return null;

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-[1000px] h-full sm:h-auto max-h-[95vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-y-auto sm:overflow-hidden flex flex-col md:flex-row animate-fade-in border border-slate-200 dark:border-slate-800 relative">
                
                {/* Lado Esquerdo: Vídeo YouTube com Áudio */}
                <div className="w-full md:w-[45%] bg-slate-950 relative h-[300px] md:h-[600px] flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                    
                    {/* Embedded YouTube preview com áudio e controles. */}
                    <div className="absolute inset-0 scale-125 transform-origin-center">
                        <iframe 
                            className="w-full h-full object-cover"
                            src={`https://www.youtube.com/embed/${step.videoId}?autoplay=1&mute=0&controls=1&loop=1&playlist=${step.videoId}&modestbranding=1&showinfo=0&rel=0`}
                            title={step.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    </div>
                    
                    {/* Overlay protetor extra escuro para dar contraste */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent pointer-events-none"></div>
                    
                    {/* Selo Visual Inferior */}
                    <div className="absolute bottom-6 left-6 right-6 text-left z-10 pointer-events-none">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 mb-2">
                             <div className="w-2 h-2 rounded-full bg-premium-teal animate-pulse"></div>
                             <span className="text-xs font-bold text-white uppercase tracking-wider">Passo {currentStep + 1} de {steps.length}</span>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Conteúdo e Interação */}
                <div className="w-full md:w-[55%] flex flex-col relative bg-white dark:bg-slate-900 min-h-[350px]">
                    
                    {/* Fechar botão superior (X) */}
                    <button 
                        onClick={closeOnboarding}
                        className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-10"
                        aria-label="Fechar"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Corpo Principal */}
                    <div className="px-6 sm:px-12 pt-10 sm:pt-14 pb-6 flex-grow flex flex-col justify-center">
                        
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-3 sm:mb-4 tracking-tight leading-tight">
                            {step.title}
                        </h2>
                        
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                            {step.description}
                        </p>

                        <ul className="space-y-4 mb-2">
                            {step.bullets.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-sm sm:text-[15px] font-medium text-slate-700 dark:text-slate-400">
                                    <div className="w-6 h-6 rounded-full bg-premium-teal/10 dark:bg-premium-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-premium-teal">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="leading-snug">{bullet}</span>
                                </li>
                            ))}
                        </ul>
                        
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 sm:px-12 py-5 sm:py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-5 sm:mb-6">
                            <button 
                                onClick={navigateToTutorial}
                                className="text-xs sm:text-sm font-bold text-premium-teal hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors order-2 sm:order-1"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                Assista Completos na Ajuda
                            </button>

                            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                                {currentStep > 0 && (
                                    <button 
                                        onClick={prevStep}
                                        className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border shadow-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Voltar
                                    </button>
                                )}
                                <button 
                                    onClick={nextStep}
                                    className="h-10 sm:h-11 w-full sm:w-auto px-6 sm:px-8 rounded-xl font-bold text-white bg-premium-teal hover:bg-emerald-600 shadow-lg shadow-premium-teal/20 transition-all active:scale-95 flex-shrink-0"
                                >
                                    {currentStep === steps.length - 1 ? 'Ir para o Plantão' : 'Próximo'}
                                </button>
                            </div>
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-center justify-center sm:justify-start">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        className="peer sr-only"
                                        checked={dontShowAgain}
                                        onChange={(e) => setDontShowAgain(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-premium-teal peer-checked:border-premium-teal transition-all"></div>
                                    <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors select-none">
                                    Não exibir este onboarding novamente
                                </span>
                            </label>
                        </div>
                        
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OnboardingModal;
