import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HelpTopic {
    id: string;
    icon: React.ReactNode;
    question: string;
    summary: string;
    steps: string[];
    observation?: string;
    videoTitle: string;
    videoId: string;
}

const TutorialPage: React.FC = () => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const topics: HelpTopic[] = [
        {
            id: 'boas-vindas',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
            question: "Boas-vindas e painel inicial",
            summary: "Como navegar no Dashboard e explorar o principal painel de decisões clínicas.",
            steps: [
                "O Dashboard é a sua central de controle. Tudo o que você precisa está a no máximo dois cliques.",
                "Utilize a barra de pesquisa rápida no topo para encontrar qualquer doença ou medicamento instantaneamente.",
                "Acesse seções como Ambulatório e Emergência pelas opções laterais ou botões de atalho principais.",
                "Suas ferramentas favoritas (receitas próprias, calculadoras) ficam fixadas para rápido uso."
            ],
            observation: "Sempre que se perder na plataforma, clique na Logo da MedDireto para retornar ao Dashboard.",
            videoTitle: "Boas-Vindas e Painel Inicial",
            videoId: "MG8BnLZlEa4"
        },
        {
            id: 'busca',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
            question: "Como usar a busca inteligente",
            summary: "Localize prescrições, patologias e medicamentos em milissegundos.",
            steps: [
                "Abra o campo central de pesquisa escrito 'O que vamos prescrever hoje?'.",
                "Digite palavras-chave, nomes comerciais ou genéricos de medicamentos.",
                "A ferramenta procurará resultados exatos também para nomes de doenças.",
                "Clique em cima do resultado sugerido e a prescrição se montará automaticamente na sua tela."
            ],
            observation: "Você pode buscar por termo parcial; a busca tolera alguns pequenos erros de digitação.",
            videoTitle: "Como realizar buscas eficientes",
            videoId: "nVbhlTi2UjM"
        },
        {
            id: 'ambulatorio',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
            question: "Como usar o Ambulatório",
            summary: "Prescrições validadas e organizadas por especialidade clínica para a rotina diária.",
            steps: [
                "Clique na seção 'Ambulatório' no menu esquerdo ou pelo botão no painel principal.",
                "Selecione uma especialidade (Ex: Cardiologia, Pneumologia, Dermatologia).",
                "Dentre as doenças daquela classe, escolha o protocolo desejado.",
                "Revise as dosagens exibidas que seguem a literatura médica vigente.",
                "Ajuste posologias se desejar antes de enviar para impressão."
            ],
            observation: "Cada prescrição possui orientações extras e lembretes para o preenchimento de atestados associados.",
            videoTitle: "Tutorial Rotina Ambulatorial",
            videoId: "dNBdTtF_3H0"
        },
        {
            id: 'pediatria',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            question: "Como usar a Pediatria",
            summary: "Cálculos automáticos de peso, idade e dosagens seguras para atendimento infantil.",
            steps: [
                "Ao entrar no ambiente de Pediatria, você encontra a Calculadora de Dose ativa à direita.",
                "Insira Peso (Kg) e Idade (anos ou meses) do paciente.",
                "Selecione a patologia no painel esquerdo ou utilize a pesquisa filtrada por pediatria.",
                "A dosagem das medicações prescritas em ml serão calculadas perfeitamente para aquele peso em tempo real."
            ],
            observation: "Nunca deixe de fornecer as casas decimais se o peso do infante não for inteiro redondo (ex: 7.5).",
            videoTitle: "Utilizando Módulo de Pediatria",
            videoId: "8GbMK89VSlQ"
        },
        {
            id: 'documentos',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            question: "Como gerar Documentos Médicos",
            summary: "Atestados, Encaminhamentos, Exames e Relatórios padronizados.",
            steps: [
                "No menu esquerdo, acesse a raiz de 'Documentos'.",
                "Escolha o tipo de documento que precisa expedir (Ex: Atestado Médico).",
                "Preencha as informações do formulário inteligente central.",
                "Em caso de solicitações de Exames, utilize blocos visuais e pesquisa via botão interativo.",
                "Ao finalizar, envie o documento para a sua Fila de Impressão."
            ],
            observation: "Você pode adicionar a CID-10 rapidamente dentro dos atestados utilizando o seletor.",
            videoTitle: "Geração de Atestados e Documentos",
            videoId: "j7ibyNWdb_U"
        },
        {
            id: 'impressao',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
            question: "Como usar a Fila de Impressão",
            summary: "Configure seu papel timbrado digital e aglomere diversas vias.",
            steps: [
                "À medida que envia prescrições ou documentos, eles se acumulam na 'PrintBar' (barra inferior do site).",
                "Clique nela e pressione 'IMPRIMIR' para abrir o Gerador Final de PDF.",
                "Para configurar as margens ou inserir Arte Digital de Recetário, vá até o menu 'Configurações'.",
                "O layout de impressão respeitará suas margens pré-estabelecidas e ajustará o texto para caber perfeitamente no controle de quebra de páginas."
            ],
            observation: "Verifique se a configuração do navegador está ajustada para imprimir colorida caso utilize logo / background digital.",
            videoTitle: "Configurando Recetário e Fila de Impressão",
            videoId: "70H1SB4n3qg"
        },
        {
            id: 'emergencia',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
            question: "Como usar a Emergência",
            summary: "Condutas essenciais e sensíveis ao tempo com apoio visual rápido.",
            steps: [
                "Na seção Emergência, o foco é apoio decisório visual em detrimento da prescrição longa impressa.",
                "Acesse os Cards vitais como Intubação, Sedação ou Anafilaxia.",
                "Cada sessão exibe infográficos, doses tabeladas por gravidade ou passo-a-passo e interações medicamentosas importantes.",
                "Calculadoras de peso guiadas também existem ali dentro para não perder tempo com dosimetria crítica."
            ],
            observation: "Ideal para usar as abas do celular quando estiver próximo ao paciente emergencial.",
            videoTitle: "Módulo de Urgência e Emergência",
            videoId: "QaCzYUcw4dE"
        }
    ];

    const filteredTopics = topics.filter(t => 
        t.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 max-w-5xl pb-24 animate-fade-in">
            {/* Header da Central de Ajuda */}
            <div className="text-center mt-12 mb-16">
                <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white mb-6 tracking-tight">
                    Ajuda
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    Encontre orientações rápidas e vídeos tutoriais para dominar a MedDireto e otimizar seus plantões.
                </p>
                
                {/* Search Bar central */}
                <div className="mt-12 max-w-2xl mx-auto relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-premium-teal transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text"
                        placeholder="Como podemos te ajudar hoje?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 pl-14 pr-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-4 focus:ring-premium-teal/10 focus:border-premium-teal transition-all text-lg font-bold placeholder-slate-400"
                    />
                </div>
            </div>

            {/* Grid de Tópicos */}
            <div className="grid grid-cols-1 gap-4">
                {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => (
                        <div 
                            key={topic.id}
                            className={`group bg-white dark:bg-slate-900 border-2 rounded-[2rem] transition-all duration-300 overflow-hidden ${
                                activeId === topic.id 
                                ? 'border-premium-teal shadow-xl shadow-premium-teal/5' 
                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg'
                            }`}
                        >
                            {/* Card Header (Clicável) */}
                            <button 
                                onClick={() => setActiveId(activeId === topic.id ? null : topic.id)}
                                className="w-full px-8 py-7 flex items-center justify-between text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                        activeId === topic.id 
                                        ? 'bg-premium-teal text-white' 
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-premium-teal'
                                    }`}>
                                        {topic.icon}
                                    </div>
                                    <div>
                                        <h3 className={`text-lg sm:text-xl font-extrabold transition-colors ${
                                            activeId === topic.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {topic.question}
                                        </h3>
                                        {activeId !== topic.id && (
                                            <p className="text-sm text-slate-400 font-medium mt-0.5 max-w-md hidden sm:block">
                                                {topic.summary}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className={`flex-shrink-0 transition-transform duration-300 ${activeId === topic.id ? 'rotate-180 text-premium-teal' : 'text-slate-300'}`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Conteúdo Expandido */}
                            {activeId === topic.id && (
                                <div className="px-8 pb-10 animate-fade-in border-t border-slate-50 dark:border-slate-800 mt-2 pt-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        
                                        {/* Lado Esquerdo: Instruções */}
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-black text-premium-teal uppercase tracking-widest mb-4">Passo a Passo</h4>
                                                <ul className="space-y-4">
                                                    {topic.steps.map((step, idx) => (
                                                        <li key={idx} className="flex gap-4 items-start text-[15px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[11px] font-bold flex items-center justify-center border border-slate-200/50 dark:border-slate-700">
                                                                {idx + 1}
                                                            </span>
                                                            {step}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {topic.observation && (
                                                <div className="bg-blue-50/50 dark:bg-slate-800/50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                                                    <div className="flex gap-3">
                                                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p className="text-[14px] font-bold text-blue-800 dark:text-blue-300 leading-snug">
                                                           Dica: <span className="font-medium">{topic.observation}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lado Direito: Vídeo Completo (YouTube Iframe) */}
                                        <div className="flex flex-col">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Assista o Passo a Passo</h4>
                                            
                                            {/* Container para manter aspecto ratio 16:9 */}
                                            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl group/video">
                                                
                                                {/* Aviso explicativo para inserção de vídeo (Caso videoId seja "COLE_ID_DO_YOUTUBE_AQUI") */}
                                                {(topic.videoId.includes('COLE_ID_')) ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/90 text-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.98]">
                                                        <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-slate-500 font-bold max-w-sm">
                                                            Abra o `TutorialPage.tsx` e cole o código do vídeo não listado no objeto `{topic.id}`.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <iframe 
                                                        className="absolute inset-0 w-full h-full"
                                                        src={`https://www.youtube.com/embed/${topic.videoId}?rel=0`} 
                                                        title={topic.videoTitle}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                                        allowFullScreen
                                                    ></iframe>
                                                )}
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-400 mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-slate-500">Tente buscar por termos mais genéricos ou navegue pelos tópicos acima.</p>
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-6 text-premium-teal font-extrabold text-[13px] uppercase tracking-widest hover:underline"
                        >
                            Limpar Busca
                        </button>
                    </div>
                )}
            </div>

            {/* Footer de Ajuda */}
            <div className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800 text-center">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                    Não encontrou o que precisava?
                </h3>
                <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto">
                    Nossa equipe clínica está pronta para responder suas dúvidas técnicas ou sugestões de melhoria.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                        href="https://api.whatsapp.com/send/?phone=5511970989846&text=Ol%C3%A1%2C%20tenho%20uma%20d%C3%BAvida.%20MedDireto&type=phone_number&app_absent=0" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 px-8 py-5 text-sm font-black text-white transition-all bg-[#25D366] rounded-2xl hover:bg-[#128C7E] shadow-xl hover:shadow-[#25D366]/20 hover:-translate-y-1 uppercase tracking-widest"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.617 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Falar no WhatsApp
                    </a>
                    <Link 
                        to="/dashboard"
                        className="inline-flex items-center justify-center gap-3 px-8 py-5 text-sm font-black text-slate-700 dark:text-slate-200 transition-all bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm hover:-translate-y-1 uppercase tracking-widest"
                    >
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TutorialPage;
