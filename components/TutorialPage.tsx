import React from 'react';
import { Link } from 'react-router-dom';

const TutorialPage: React.FC = () => {
    return (
        <div className="container mx-auto max-w-4xl pb-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4">Bem-vindo ao MedDireto!</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400">
                    Aprenda a utilizar nossas ferramentas para agilizar seus atendimentos e criar rotinas eficientes.
                </p>
            </div>

            <div className="space-y-12">
                {/* Section 1 */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">1. Prescrições e Protocolos</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        Nossa barra de busca na página inicial é o coração do MedDireto. Você pode buscar não apenas por nomes de doenças ou protocolos, mas também por <strong className="text-premium-teal">princípios ativos e medicamentos</strong>. Explore as categorias ou digite o que precisa diretamente.
                    </p>
                    {/* Video Placeholder */}
                    <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <div className="text-center">
                            <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Vídeo Tutorial 1: Buscas Avançadas</span>
                        </div>
                    </div>
                </section>

                {/* Section 2 */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">2. Criando Receitas Próprias</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        Acesse a aba <strong>"Minhas Receitas"</strong> para criar e salvar seus próprios textos, orientações e prescrições de consultório. Suas receitas ficam salvas com segurança na nuvem e podem ser impressas com um clique através do nosso sistema formatação automática.
                    </p>
                    {/* Video Placeholder */}
                    <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <div className="text-center">
                            <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Vídeo Tutorial 2: Minhas Receitas</span>
                        </div>
                    </div>
                </section>
                
                {/* Section 3 */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">3. Calculadoras e Favoritos</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        Dentro de qualquer receita você pode marcar a estrela (⭐) para favorita-la e vê-la rapidamente no seu Dashboard. Utilize a aba de <strong>Calculadoras</strong> para ter acesso a pontuações clínicas e escores médicos de rotina.
                    </p>
                    {/* Video Placeholder */}
                    <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <div className="text-center">
                            <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Vídeo Tutorial 3: Favoritos e Acessibilidade</span>
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-16 text-center">
                <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-premium-teal rounded-xl hover:bg-premium-teal-700 shadow-xl hover:shadow-premium-teal/30 hover:-translate-y-1">
                    Ir para o Dashboard
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default TutorialPage;
