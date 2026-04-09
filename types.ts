
export interface Category {
    id: string;
    nome: string;
    icone: string;
    created_at: string;
}

export interface Prescription {
    id: string;
    categoria_id: string;
    condicao: string;
    titulo: string;
    texto: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    categorias?: {
        nome: string;
    }
}

export interface MinhaPrescricao {
    id: string;
    user_id: string;
    titulo: string;
    texto: string;
    condicao: string;
    created_at: string;
}

export interface UserProfile {
    id: string;
    nome: string;
    role: 'medico' | 'admin';
    profissao?: string;
    sexo?: string;
    created_at: string;
    expires_at?: string; // Added field for subscription status
    // receituario_url is deprecated in favor of the new Letterhead system
    receituario_url?: string; 
}

export interface Letterhead {
    id: string;
    user_id: string;
    nome?: string;
    image_url: string;
    margin_top_px: number;
    text_height_vh: number;
    date_offset_bottom_px?: number;
    side_margin_px?: number; // Novo campo para margem lateral
    active: boolean;
    created_at?: string;
}

export interface PrintItem {
    id: string;
    titulo: string;
    texto: string;
    tipo: 'prescricao';
}

export interface HospitalProtocol {
    id: string;
    title: string;
    content: string;
    category: string;
    created_at?: string;
}