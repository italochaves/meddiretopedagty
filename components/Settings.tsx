
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { usePrint } from '../contexts/PrintContext';
import { UserProfile, Letterhead } from '../types';

interface SettingsProps {
    profile: UserProfile | null;
    onProfileUpdate: () => void;
}

// --- Componente Interno de Cropper ---
interface ImageCropperProps {
    imageSrc: string;
    onCancel: () => void;
    onComplete: (blob: Blob) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCancel, onComplete }) => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0); // Novo estado de rotação
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Referência para o container visual (viewport)
    const viewportRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // --- CONFIGURAÇÃO A4 VERTICAL ---
    // A4 = 210mm (largura) x 297mm (altura)
    // Ratio = 0.707...
    const PAPER_WIDTH_MM = 210;
    const PAPER_HEIGHT_MM = 297;
    const ASPECT_RATIO = PAPER_WIDTH_MM / PAPER_HEIGHT_MM; 
    
    // Dimensões de Saída (Alta resolução para impressão)
    // Largura 1240px (~150dpi para A4, 150-200dpi é aceitável para este uso)
    const OUTPUT_WIDTH = 1240; 
    const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / ASPECT_RATIO); // ~1754px

    // Dimensões Visuais do Viewport (Tela)
    const VIEWPORT_WIDTH = 300; // Um pouco menor para caber em telas mobile pequenas
    const VIEWPORT_HEIGHT = Math.round(VIEWPORT_WIDTH / ASPECT_RATIO); // ~424px

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const generateCrop = async () => {
        if (!imageRef.current) return;
        
        // Safety check: ensure image has loaded
        if (imageRef.current.naturalWidth === 0 || imageRef.current.naturalHeight === 0) {
            console.warn("Imagem ainda não carregada ou inválida.");
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Limpa fundo branco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Lógica de mapeamento:
        // O Viewport na tela tem um tamanho fixo.
        // Precisamos saber a relação entre pixels da tela e pixels do canvas.
        
        // Escala entre o Canvas de Saída e o Viewport da Tela
        const scaleFactor = OUTPUT_WIDTH / VIEWPORT_WIDTH; 

        // Transforma o offset visual em offset do canvas
        const drawX = offset.x * scaleFactor;
        const drawY = offset.y * scaleFactor;
        
        // A largura desenhada no canvas baseada no Zoom
        // A imagem no DOM tem width="100%" do pai, então ela tem VIEWPORT_WIDTH visualmente (se zoom=1)
        // No canvas, isso equivale a OUTPUT_WIDTH.
        const finalWidth = OUTPUT_WIDTH * zoom;
        
        // Mantém o aspect ratio original da imagem para calcular a altura correta
        const imgAspectRatio = imageRef.current.naturalHeight / imageRef.current.naturalWidth;
        const finalHeight = finalWidth * imgAspectRatio;

        // --- APLICAÇÃO DA ROTAÇÃO ---
        // Para rotacionar a imagem corretamente no canvas:
        // 1. Salva o contexto
        // 2. Translada o ponto de origem (0,0) para o centro da imagem desenhada
        // 3. Rotaciona
        // 4. Desenha a imagem (agora centrada no 0,0 do contexto rotacionado)
        // 5. Restaura
        
        const centerX = drawX + finalWidth / 2;
        const centerY = drawY + finalHeight / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180); // Converte graus para radianos
        // Desenha a imagem centralizada no novo ponto de origem
        ctx.drawImage(imageRef.current, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);
        ctx.restore();

        canvas.toBlob((blob) => {
            if (blob) onComplete(blob);
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-slate-900/95 p-4">
            <h3 className="text-white text-xl font-bold mb-4">Ajustar Recorte (A4 Vertical)</h3>
            <p className="text-slate-400 text-sm mb-6">Arraste para posicionar, use zoom e rotação para ajustar.</p>

            {/* Container de Recorte */}
            <div 
                className="relative overflow-hidden bg-slate-800 shadow-2xl border-4 border-slate-700 rounded-lg cursor-move"
                style={{ 
                    width: `${VIEWPORT_WIDTH}px`, 
                    height: `${VIEWPORT_HEIGHT}px`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                ref={viewportRef}
            >
                <img 
                    ref={imageRef}
                    src={imageSrc}
                    alt="Crop target"
                    draggable={false}
                    className="absolute origin-top-left pointer-events-none select-none max-w-none"
                    style={{
                        width: '100%', // Base width matches viewport width
                        // Aplica transformações visuais: Translação -> Rotação -> Escala
                        // A ordem importa para o UX do drag
                        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`
                    }}
                />
                
                {/* Grid Overlay for Guide */}
                <div className="absolute inset-0 pointer-events-none border border-white/20">
                    <div className="absolute top-1/3 w-full h-px bg-white/20"></div>
                    <div className="absolute top-2/3 w-full h-px bg-white/20"></div>
                    <div className="absolute left-1/3 h-full w-px bg-white/20"></div>
                    <div className="absolute left-2/3 h-full w-px bg-white/20"></div>
                </div>
            </div>

            {/* Controles */}
            <div className="w-80 mt-6 space-y-4">
                {/* Zoom Control */}
                <div className="flex items-center gap-2">
                    <span className="text-white text-xs w-10">Zoom</span>
                    <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.05" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-premium-teal"
                    />
                </div>

                {/* Rotation Control */}
                <div className="flex items-center gap-2">
                    <span className="text-white text-xs w-10">Girar</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="360" 
                        step="1" 
                        value={rotation} 
                        onChange={(e) => setRotation(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-premium-teal"
                    />
                    <span className="text-white text-xs w-8 text-right">{rotation}°</span>
                </div>
                
                <div className="flex gap-3 pt-2">
                    <button onClick={onCancel} className="flex-1 py-3 text-white border border-slate-600 rounded-lg hover:bg-slate-800">Cancelar</button>
                    <button onClick={generateCrop} className="flex-1 py-3 font-bold text-white bg-premium-teal rounded-lg hover:bg-premium-teal/90 shadow-lg shadow-premium-teal/20">Confirmar</button>
                </div>
            </div>
        </div>
    );
};


const Settings: React.FC<SettingsProps> = ({ profile }) => {
    const { refreshLetterhead, activeLetterhead } = usePrint();
    const [letterheads, setLetterheads] = useState<Letterhead[]>([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    
    // Cropper State
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [cropOriginalFileName, setCropOriginalFileName] = useState('');
    
    // Adjustment Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLetterheadId, setEditingLetterheadId] = useState<string | null>(null);
    
    const [adjustmentData, setAdjustmentData] = useState({ 
        margin_top_px: 120, 
        text_height_vh: 60,
        date_offset_bottom_px: 32,
        side_margin_px: 48 
    });
    const [savingAdjustment, setSavingAdjustment] = useState(false);

    const fetchLetterheads = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('user_letterheads')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setLetterheads(data);
        }
    };

    useEffect(() => {
        fetchLetterheads();
    }, [activeLetterhead]); 

    // 1. Selecionar Arquivo -> Ler para Base64 -> Abrir Cropper
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            
            if (letterheads.length >= 3) {
                setMessage('Limite de 3 receituários atingido.');
                return;
            }

            setCropOriginalFileName(file.name);
            const reader = new FileReader();
            reader.onload = () => {
                setCropImageSrc(reader.result as string);
            };
            reader.readAsDataURL(file);
            
            // Reset input value to allow selecting same file again
            event.target.value = '';
        }
    };

    // 2. Receber Blob do Cropper -> Upload para Supabase
    const handleCropComplete = async (croppedBlob: Blob) => {
        // Fechar modal imediatamente para melhorar UX
        setCropImageSrc(null); 
        
        setUploading(true);
        setMessage('Iniciando envio...');

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error('Erro de autenticação: Usuário não identificado.');

            const fileExt = 'jpg'; // Cropper output is jpeg
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const cleanName = cropOriginalFileName.split('.').slice(0, -1).join('.') || 'Receituário';

            // Upload do Blob
            const { error: uploadError } = await supabase.storage
                .from('receituarios')
                .upload(fileName, croppedBlob, {
                    contentType: 'image/jpeg',
                    upsert: false
                });

            if (uploadError) throw new Error(`Erro no upload da imagem: ${uploadError.message}`);

            const { data: { publicUrl } } = supabase.storage
                .from('receituarios')
                .getPublicUrl(fileName);

            // Insert DB
            const { error: insertError } = await supabase
                .from('user_letterheads')
                .insert({
                    user_id: user.id,
                    nome: cleanName,
                    image_url: publicUrl,
                    margin_top_px: 120,
                    text_height_vh: 60,
                    date_offset_bottom_px: 32,
                    side_margin_px: 48,
                    active: letterheads.length === 0
                });

            if (insertError) throw new Error(`Erro ao salvar no banco de dados: ${insertError.message}`);

            setMessage('Receituário adicionado com sucesso!');
            await fetchLetterheads();
            await refreshLetterhead();

        } catch (error: any) {
            console.error("Upload Flow Error:", error);
            const errorMsg = error.message || 'Ocorreu um erro desconhecido.';
            setMessage('Falha: ' + errorMsg);
            alert('Não foi possível salvar o receituário: ' + errorMsg);
        } finally {
            // Garante que o loading para
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, url: string) => {
        if (!confirm('Deseja excluir este receituário?')) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('user_letterheads').delete().eq('id', id).eq('user_id', user.id);
        
        const fileName = url.split('/').pop();
        if (fileName) {
            await supabase.storage.from('receituarios').remove([fileName]);
        }

        fetchLetterheads();
        refreshLetterhead();
    };

    const handleSetActive = async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('user_letterheads').update({ active: false }).eq('user_id', user.id);
        await supabase.from('user_letterheads').update({ active: true }).eq('id', id);

        fetchLetterheads();
        refreshLetterhead();
    };

    const openAdjustmentModal = (lh: Letterhead) => {
        setEditingLetterheadId(lh.id);
        setAdjustmentData({
            margin_top_px: lh.margin_top_px,
            text_height_vh: lh.text_height_vh,
            date_offset_bottom_px: lh.date_offset_bottom_px || 32,
            side_margin_px: lh.side_margin_px || 48
        });
        setIsModalOpen(true);
    };

    const saveAdjustment = async () => {
        if (!editingLetterheadId) return;
        setSavingAdjustment(true);

        const { error } = await supabase
            .from('user_letterheads')
            .update({
                margin_top_px: Number(adjustmentData.margin_top_px),
                text_height_vh: Number(adjustmentData.text_height_vh),
                date_offset_bottom_px: Number(adjustmentData.date_offset_bottom_px),
                side_margin_px: Number(adjustmentData.side_margin_px)
            })
            .eq('id', editingLetterheadId);

        if (!error) {
            refreshLetterhead();
            setIsModalOpen(false);
            fetchLetterheads();
        } else {
            alert('Erro ao salvar ajuste. Verifique se a coluna side_margin_px existe no banco.');
            console.error(error);
        }
        setSavingAdjustment(false);
    };
    
    const editingLetterhead = letterheads.find(l => l.id === editingLetterheadId);

    return (
        <div className="container max-w-5xl mx-auto pb-20">
            {/* Cropper Modal */}
            {cropImageSrc && (
                <ImageCropper 
                    imageSrc={cropImageSrc} 
                    onCancel={() => setCropImageSrc(null)}
                    onComplete={handleCropComplete}
                />
            )}

            <h1 className="mb-8 text-3xl font-bold text-slate-800">Meus Receituários</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Upload Section */}
                <div className="lg:col-span-1">
                    <div className="p-6 bg-white rounded-2xl shadow-subtle">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">Adicionar Novo</h2>
                        <p className="mb-4 text-sm text-slate-600">
                            Envie uma imagem (JPG/PNG). O recorte será fixo no formato <strong>A4 Vertical</strong>.
                            <br /><strong>Limite: {letterheads.length}/3</strong>
                        </p>
                        
                        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${letterheads.length >= 3 ? 'bg-slate-100 border-slate-300 cursor-not-allowed' : 'border-premium-teal-300 bg-premium-teal-50 hover:bg-premium-teal-100'}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs text-slate-500">
                                    {letterheads.length >= 3 ? 'Limite atingido' : 'Clique para selecionar'}
                                </p>
                            </div>
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileSelect} 
                                disabled={uploading || letterheads.length >= 3} 
                            />
                        </label>
                        {uploading && <p className="mt-2 text-xs font-bold text-center text-blue-600 animate-pulse">Processando e enviando...</p>}
                        {message && <p className={`mt-2 text-xs text-center ${message.startsWith('Falha') ? 'text-red-600' : 'text-slate-600'}`}>{message}</p>}
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {letterheads.map((lh) => (
                            <div key={lh.id} className={`relative overflow-hidden border-2 rounded-xl transition-all ${lh.active ? 'border-premium-teal ring-2 ring-premium-teal ring-offset-2' : 'border-slate-200'}`}>
                                <div className="aspect-[210/297] bg-slate-100 relative group">
                                    <img src={lh.image_url} alt="Receituário" className="object-contain w-full h-full" />
                                    {lh.active && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="px-3 py-1 text-xs font-bold text-white bg-premium-teal shadow-lg rounded-full">ATIVO</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2">
                                    <div className="text-sm font-medium text-slate-700 truncate">
                                        {lh.nome || 'Sem nome'}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        {!lh.active ? (
                                            <button 
                                                onClick={() => handleSetActive(lh.id)}
                                                className="text-xs font-bold text-premium-teal hover:underline uppercase tracking-wide"
                                            >
                                                Usar este
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Selecionado</span>
                                        )}
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => openAdjustmentModal(lh)}
                                                className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wide"
                                            >
                                                Ajustar
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(lh.id, lh.image_url)}
                                                className="text-xs text-red-500 hover:text-red-700"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {letterheads.length === 0 && (
                            <div className="flex items-center justify-center h-48 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                Nenhum receituário configurado.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Visual Adjustment Modal (Mobile Refactored: Bottom Sheet) */}
            {isModalOpen && editingLetterhead && (
                <div className="fixed inset-0 z-[60] flex flex-col md:items-center md:justify-center bg-slate-900/95 backdrop-blur-sm md:p-4">
                    
                    {/* Inner Window Wrapper: Full Height on Mobile, Boxed on Desktop */}
                    <div className="bg-white w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
                        
                        {/* 1. Preview Area (Top 60% Mobile / Left Side Desktop) */}
                        <div className="flex-1 h-[60%] md:h-full bg-slate-200 relative overflow-hidden flex items-center justify-center p-4 md:p-8 border-b md:border-b-0 md:border-r border-slate-300">
                             {/* 
                                A4 Representation:
                                Using responsive scale to fit screen.
                                Mobile: scale ~0.4 to fit width.
                                Desktop: scale 0.6.
                             */}
                            <div 
                                className="relative bg-white shadow-2xl transition-transform origin-center duration-300 transform scale-[0.38] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.65]"
                                style={{ 
                                    width: '210mm', 
                                    height: '297mm',
                                    flexShrink: 0,
                                    backgroundImage: `url(${editingLetterhead.image_url})`,
                                    backgroundSize: '100% 100%',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {/* Margins Simulation */}
                                <div 
                                    className="absolute inset-0 flex flex-col"
                                    style={{
                                        boxSizing: 'border-box',
                                        paddingTop: `${adjustmentData.margin_top_px}px`,
                                        paddingLeft: `${adjustmentData.side_margin_px}px`,
                                        paddingRight: `${adjustmentData.side_margin_px}px`,
                                    }}
                                >
                                    <div className="mb-[15px] text-slate-900 border border-transparent hover:border-slate-300/50">
                                        <p style={{ fontFamily: '"Roboto", Arial, sans-serif', fontSize: '12pt', fontWeight: 'bold', margin: 0 }}>
                                            Para: <span style={{ fontWeight: 'normal', borderBottom: '1px solid #999', paddingLeft: '8px', minWidth: '200px', display: 'inline-block' }}>João da Silva (Exemplo)</span>
                                        </p>
                                    </div>

                                    {/* Text Area */}
                                    <div 
                                        className="border-2 border-dashed border-blue-400 bg-blue-400/10 relative overflow-hidden"
                                        style={{
                                            flexGrow: 1,
                                            maxHeight: `${adjustmentData.text_height_vh}%`
                                        }}
                                    >
                                        <div style={{ fontFamily: '"Roboto", Arial, sans-serif', fontSize: '10pt', lineHeight: '1.3' }} className="text-blue-900">
                                            <p><strong>USO ORAL</strong></p>
                                            <p>1. Medicamento Exemplo 500mg ................... 1 cx</p>
                                            <p style={{ paddingLeft: '20px' }}>Tomar 1 comprimido de 8 em 8 horas.</p>
                                            <p>2. Outro Medicamento ........................... 1 fr</p>
                                            <p style={{ paddingLeft: '20px' }}>Aplicar conforme orientação.</p>
                                            <p>...</p>
                                        </div>
                                        <div className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] px-1 rounded opacity-70">
                                            Área de Texto ({adjustmentData.text_height_vh}%)
                                        </div>
                                    </div>

                                    {/* Date Area */}
                                    <div 
                                        className="absolute text-slate-600 font-medium bg-white/50 border border-green-400 border-dashed px-1"
                                        style={{ 
                                            bottom: `${adjustmentData.date_offset_bottom_px}px`,
                                            left: `${adjustmentData.side_margin_px}px`,
                                            fontFamily: '"Roboto", Arial, sans-serif', 
                                            fontSize: '9pt'
                                        }}
                                    >
                                        Data: 01/01/2025
                                    </div>
                                    
                                    {/* Visual Margin Guides */}
                                    <div className="absolute top-0 left-0 w-full border-b border-red-500 border-dashed opacity-40 pointer-events-none" style={{ height: `${adjustmentData.margin_top_px}px` }}>
                                        <span className="absolute bottom-1 right-1 text-[10px] text-red-600 bg-white px-1">Margem Superior</span>
                                    </div>
                                    <div className="absolute top-0 left-0 h-full border-r border-red-500 border-dashed opacity-40 pointer-events-none" style={{ width: `${adjustmentData.side_margin_px}px` }}></div>
                                    <div className="absolute top-0 right-0 h-full border-l border-red-500 border-dashed opacity-40 pointer-events-none" style={{ width: `${adjustmentData.side_margin_px}px` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Controls Area (Bottom 40% Mobile / Right Side Desktop) */}
                        <div className="h-[40%] md:h-full w-full md:w-80 bg-white p-6 flex flex-col z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] md:shadow-none relative">
                            <div className="mb-4">
                                <h3 className="text-lg md:text-xl font-bold text-slate-800">Ajustar Layout</h3>
                                <p className="text-xs text-slate-500 hidden md:block">
                                    Ajuste as margens para alinhar com seu papel pré-impresso.
                                </p>
                            </div>
                            
                            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div>
                                    <label className="flex justify-between text-xs md:text-sm font-bold text-slate-700 mb-2">
                                        <span>Margem Superior (px)</span>
                                        <span className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">{adjustmentData.margin_top_px}</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="50" 
                                        max="600" 
                                        step="5"
                                        value={adjustmentData.margin_top_px} 
                                        onChange={(e) => setAdjustmentData({...adjustmentData, margin_top_px: Number(e.target.value)})}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-premium-teal"
                                    />
                                </div>

                                <div>
                                    <label className="flex justify-between text-xs md:text-sm font-bold text-slate-700 mb-2">
                                        <span>Margem Lateral (px)</span>
                                        <span className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">{adjustmentData.side_margin_px}</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="200" 
                                        step="2"
                                        value={adjustmentData.side_margin_px} 
                                        onChange={(e) => setAdjustmentData({...adjustmentData, side_margin_px: Number(e.target.value)})}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-premium-teal"
                                    />
                                </div>

                                <div>
                                    <label className="flex justify-between text-xs md:text-sm font-bold text-slate-700 mb-2">
                                        <span>Altura do Texto (%)</span>
                                        <span className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">{adjustmentData.text_height_vh}%</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="80" 
                                        step="1"
                                        value={adjustmentData.text_height_vh} 
                                        onChange={(e) => setAdjustmentData({...adjustmentData, text_height_vh: Number(e.target.value)})}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-premium-teal"
                                    />
                                </div>

                                <div>
                                    <label className="flex justify-between text-xs md:text-sm font-bold text-slate-700 mb-2">
                                        <span>Posição Data - Fundo (px)</span>
                                        <span className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">{adjustmentData.date_offset_bottom_px}</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="300" 
                                        step="2"
                                        value={adjustmentData.date_offset_bottom_px} 
                                        onChange={(e) => setAdjustmentData({...adjustmentData, date_offset_bottom_px: Number(e.target.value)})}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-premium-teal"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 mt-4">
                                <button 
                                    onClick={saveAdjustment}
                                    disabled={savingAdjustment}
                                    className="w-full py-3 px-4 bg-premium-teal text-white font-bold rounded-xl hover:bg-premium-teal-600 disabled:opacity-50 shadow-lg shadow-premium-teal/30 transition-all transform active:scale-95 text-sm md:text-base"
                                >
                                    {savingAdjustment ? 'Salvando...' : 'Salvar Ajustes'}
                                </button>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm md:text-base"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
