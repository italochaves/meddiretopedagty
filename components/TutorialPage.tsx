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
}

const TutorialPage: React.FC = () => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const topics: HelpTopic[] = [
        {
            id: 'search',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
            question: "Como buscar protocolos e prescrições",
            summary: "Localize rapidamente condutas clínicas por diagnóstico, sintoma ou nome do medicamento.",
            steps: [
                "Acesse o Dashboard principal.",
                "Utilize a barra de busca central clicando em 'O que vamos prescrever hoje?'.",
                "Digite o diagnóstico (ex: 'Pneumonia') ou o medicamento (ex: 'Amoxicilina').",
                "Os resultados aparecerão instantaneamente abaixo da busca.",
                "Clique no item desejado para abrir a prescrição completa."
            ],
            observation: "Você também pode navegar pelas categorias clínicas (Ambulatório, Emergência, etc.) para ver listas organizadas por área.",
            videoTitle: "Tutorial: Buscas Rápidas e Inteligentes"
        },
        {
            id: 'custom-recipes',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
            question: "Como criar receitas próprias",
            summary: "Crie e gerencie sua própria base de prescrições personalizadas.",
            steps: [
                "No menu lateral ou Dashboard, clique em 'Minhas Receitas'.",
                "Clique no botão 'Nova Receita'.",
                "Preencha o título (nome da conduta) e a condição clínica.",
                "Escreva o texto da prescrição no editor rico.",
                "Salve a receita para que ela apareça na sua lista pessoal e nas buscas."
            ],
            observation: "Suas receitas são individuais e ficam salvas com segurança na sua conta MedDireto.",
            videoTitle: "Tutorial: Gestão de Receitas Personalizadas"
        },
        {
            id: 'print-tool',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
            question: "Como usar a ferramenta de impressão",
            summary: "Agrupe várias prescrições em uma única folha e configure a fila de saída.",
            steps: [
                "Ao abrir qualquer prescrição, clique em 'Adicionar à Impressão'.",
                "A barra inferior (PrintBar) mostrará quantos itens estão na fila.",
                "Você pode adicionar múltiplos itens (ex: Receita + Atestado + Exames).",
                "Clique no botão 'IMPRIMIR' na barra inferior para gerar o PDF final."
            ],
            observation: "A MedDireto organiza automaticamente os documentos para otimizar o espaço no papel.",
            videoTitle: "Tutorial: Fluxo de Impressão e Fila de Documentos"
        },
        {
            id: 'print-layout',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
            question: "Como configurar o layout de impressão",
            summary: "Ajuste margens e use papéis timbrados personalizados.",
            steps: [
                "Clique em 'Configurações' no menu superior ou lateral.",
                "Role até a seção 'Impressão'.",
                "Aqui você pode definir margens superiores para papel timbrado físico.",
                "Ou carregar uma imagem de papel timbrado digital para ser usada de fundo.",
                "Ative ou desative a opção 'Usar papel timbrado digital' conforme sua necessidade."
            ],
            observation: "Recomendamos margens de 40mm a 60mm para papéis timbrados que possuam cabeçalho grande.",
            videoTitle: "Tutorial: Configuração de Margens e Papel Timbrado"
        },
        {
            id: 'calculators',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
            question: "Como usar calculadoras médicas",
            summary: "Acesse scores e calculadoras automáticas para apoio à decisão clínica.",
            steps: [
                "Acesse o menu 'Calculadoras'.",
                "Escolha a categoria (Nefrologia, Cardiologia, etc) na barra lateral.",
                "Selecione a calculadora desejada.",
                "Insira os dados solicitados nos campos de entrada.",
                "O resultado aparecerá automaticamente no painel de destaque."
            ],
            observation: "Os resultados incluem interpretações clínicas baseadas em evidências.",
            videoTitle: "Tutorial: Calculadoras e Scores Médicos"
        },
        {
            id: 'favorites',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
            question: "Como favoritar conteúdos para acesso rápido",
            summary: "Mantenha seus protocolos mais usados sempre à mão.",
            steps: [
                "Abra a página de qualquer protocolo ou prescrição.",
                "Clique no botão de estrela 'Favoritar' localizado ao lado do título.",
                "O item agora aparecerá na seção 'Favoritos' do seu Dashboard.",
                "Para remover, basta clicar novamente na estrela dentro da prescrição."
            ],
            observation: "Seu Dashboard exibe os últimos favoritos salvos para agilizar o início do atendimento.",
            videoTitle: "Tutorial: Organizandao seu Dashboard com Favoritos"
        },
        {
            id: 'iphone',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
            question: "Como adicionar a MedDireto no iPhone (iOS)",
            summary: "Tenha a experiência de um aplicativo nativo no seu iPhone.",
            steps: [
                "Abra o navegador Safari.",
                "Acesse meddireto.com e faça seu login.",
                "Toque no ícone de 'Compartilhar' (o quadrado com uma seta para cima na barra inferior).",
                "Role para baixo e selecione 'Adicionar à Tela de Início'.",
                "Confirme o nome do atalho e toque em 'Adicionar'."
            ],
            observation: "O ícone da MedDireto aparecerá na sua tela inicial como um aplicativo comum.",
            videoTitle: "Tutorial: Instalando MedDireto no iOS"
        },
        {
            id: 'android',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
            question: "Como adicionar a MedDireto no Android",
            summary: "Instale a MedDireto no seu Android para acesso instantâneo.",
            steps: [
                "Abra o Google Chrome no seu dispositivo.",
                "Acesse meddireto.com e entre na sua conta.",
                "Toque nos três pontos no canto superior direito.",
                "Selecione 'Adicionar à tela inicial' ou 'Instalar aplicativo'.",
                "Siga as instruções na tela para confirmar a instalação."
            ],
            observation: "A MedDireto passará a ocupar menos espaço e carregar mais rápido do que a versão do navegador.",
            videoTitle: "Tutorial: Instalando MedDireto no Android"
        },
        {
            id: 'dashboard',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
            question: "Como acessar o dashboard",
            summary: "Sua central de operações e resumo do plantão.",
            steps: [
                "O Dashboard é a página carregada logo após o login.",
                "Lá você encontra a busca rápida no topo (Seção Hero).",
                "Abaixo, os cards de 'Ações Rápidas' levam para Ambulatório, Emergência, etc.",
                "Você também tem acesso imediato aos seus Favoritos e Recentemente Acessados.",
                "No lado direito (desktop), você tem o bloco de Anotações Pessoais."
            ],
            observation: "O Dashboard foi projetado para ser o ponto mais rápido de acesso a qualquer função da plataforma.",
            videoTitle: "Tutorial: Visão Geral do Dashboard"
        },
        {
            id: 'navigation',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>,
            question: "Como resolver dúvidas comuns de navegação",
            summary: "Dicas de atalhos e caminhos rápidos na plataforma.",
            steps: [
                "Use a logo da MedDireto no topo para voltar sempre ao Dashboard.",
                "Em qualquer página de protocolo, você verá o caminho (breadcrumbs) no topo para voltar um nível.",
                "O botão 'Voltar' posicionado acima dos títulos também ajuda na navegação.",
                "Mantenha uma única aba aberta para que sua fila de impressão seja consistente."
            ],
            observation: "Se a página parecer travada, utilize o comando de atualização (F5) no seu navegador.",
            videoTitle: "Tutorial: Dicas de Navegação e Atalhos"
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

                                        {/* Lado Direito: Vídeo Placeholder */}
                                        <div>
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Vídeo Tutorial</h4>
                                            <div className="aspect-video bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center group/video cursor-pointer hover:border-premium-teal/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all shadow-inner">
                                                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center mb-4 transition-transform group-hover/video:scale-110">
                                                    <svg className="w-7 h-7 text-premium-teal ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-bold text-slate-400 group-hover/video:text-premium-teal transition-colors">
                                                    {topic.videoTitle}
                                                </p>
                                                <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-1 uppercase font-black tracking-widest">
                                                    Espaço reservado para vídeo
                                                </p>
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
