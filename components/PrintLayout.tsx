
import React from 'react';
import { usePrint } from '../contexts/PrintContext';
import { PrintItem } from '../types';

const PrintLayout: React.FC = () => {
    const { printQueue, patientName, activeLetterhead, setIsBackgroundLoaded, printFormat } = usePrint();

    // Se não tiver nada na fila, não renderiza nada no DOM
    if (printQueue.length === 0) return null;

    const currentDate = new Date().toLocaleDateString('pt-BR');

    // Default margins from settings or fallbacks
    const marginTop = activeLetterhead?.margin_top_px ?? 120;
    const contentHeightPercent = activeLetterhead?.text_height_vh ?? 60; 
    const dateOffsetBottom = activeLetterhead?.date_offset_bottom_px ?? 32;
    const sideMargin = activeLetterhead?.side_margin_px ?? 48;

    // Chunk formatting
    const chunks: PrintItem[][] = [];
    if (printFormat === 'A5_DUAL') {
        // Group by 2
        for (let i = 0; i < printQueue.length; i += 2) {
            chunks.push(printQueue.slice(i, i + 2));
        }
    } else {
        // Group by 1
        printQueue.forEach(item => chunks.push([item]));
    }

    return (
        <div id="print-content" className="hidden print:block">
            {chunks.map((chunk, chunkIndex) => (
                <div 
                    key={`chunk-${chunkIndex}`} 
                    className="print-page-container"
                    style={{ 
                        width: printFormat === 'A5_DUAL' ? '297mm' : '210mm', 
                        height: printFormat === 'A5_DUAL' ? '210mm' : '297mm',
                        pageBreakAfter: 'always',
                        position: 'relative',
                        overflow: 'hidden',
                        margin: '0',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: printFormat === 'A5_DUAL' ? 'row' : 'column'
                    }}
                >
                    {chunk.map((item, itemIndex) => (
                         <div 
                            key={`${item.id}-${itemIndex}`}
                            style={{
                                width: printFormat === 'A5_DUAL' ? '148.5mm' : '210mm',
                                height: printFormat === 'A5_DUAL' ? '210mm' : '297mm',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                         >
                            {/* Inner Scaled Canvas (Sempre A4, sofrendo zoom se A5) */}
                            <div
                                style={{
                                    width: '210mm',
                                    height: '297mm',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    transform: printFormat === 'A5_DUAL' ? 'scale(0.7071)' : 'none',
                                    transformOrigin: 'top left'
                                }}
                            >
                                {/* CAMADA 1: O Fundo (Imagem do Receituário) */}
                                {activeLetterhead && (
                                    <img 
                                        src={activeLetterhead.image_url}
                                        alt="Fundo Receituário"
                                        onLoad={() => setIsBackgroundLoaded(true)}
                                        onError={() => setIsBackgroundLoaded(true)}
                                        style={{ 
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'fill', // Força preencher o A4
                                            zIndex: 0, // Fica atrás
                                            pointerEvents: 'none'
                                        }}
                                    />
                                )}

                                {/* CAMADA 2: O Conteúdo (Texto da Prescrição) */}
                                <div 
                                    className="conteudo-texto"
                                    style={{
                                        position: 'relative',
                                        zIndex: 10, // Fica na frente da imagem
                                        width: '100%',
                                        height: '100%',
                                        paddingTop: `${marginTop}px`,
                                        paddingLeft: `${sideMargin}px`,
                                        paddingRight: `${sideMargin}px`,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    {/* Cabeçalho com Nome do Paciente */}
                                    {patientName && (
                                        <div style={{ marginBottom: '15px', flexShrink: 0 }}>
                                            <p style={{ 
                                                fontFamily: '"Roboto", Arial, sans-serif',
                                                fontSize: '14pt',
                                                fontWeight: 'bold',
                                                color: '#000',
                                                margin: 0
                                            }}>
                                                Para: <span style={{ fontWeight: 'normal', borderBottom: '1px solid #999', paddingLeft: '8px', minWidth: '200px', display: 'inline-block' }}>{patientName}</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Corpo do Texto da Prescrição */}
                                    <div 
                                        style={{ 
                                            flexGrow: 1,
                                            maxHeight: `${contentHeightPercent}%`, 
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div 
                                            style={{
                                                fontFamily: '"Roboto", Arial, sans-serif',
                                                fontSize: '14pt',
                                                lineHeight: '1.3',
                                                color: '#000', // Força preto
                                                whiteSpace: 'pre-wrap',
                                                textAlign: 'justify'
                                            }}
                                            className="print-body-text"
                                            dangerouslySetInnerHTML={{ __html: item.texto }}
                                        />
                                    </div>

                                    {/* Data no Rodapé */}
                                    <div 
                                        style={{ 
                                            position: 'absolute',
                                            bottom: `${dateOffsetBottom}px`,
                                            left: `${sideMargin}px`,
                                            fontFamily: '"Roboto", Arial, sans-serif',
                                            fontSize: '14pt',
                                            color: '#000',
                                            padding: '2px 0',
                                        }}
                                    >
                                        {currentDate}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
            
            <style>{`
                @media print {
                    @page { margin: 0; size: A4 ${printFormat === 'A5_DUAL' ? 'landscape' : 'portrait'}; }
                    
                    /* ESCONDE TUDO DO SITE */
                    body * {
                        visibility: hidden;
                    }

                    /* MOSTRA SÓ O RECEITUÁRIO */
                    #print-content, #print-content * {
                        visibility: visible !important;
                    }

                    /* POSICIONA O RECEITUÁRIO NO TOPO DA FOLHA */
                    #print-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        z-index: 9999; /* Garante que fique por cima de tudo */
                    }

                    /* FORÇA CORES EXATAS (IMAGENS E TEXTOS) */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* GARANTE QUE O TEXTO SEJA PRETO (IGNORA DARK MODE) */
                    .print-body-text, .print-body-text * {
                        color: #000 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintLayout;
