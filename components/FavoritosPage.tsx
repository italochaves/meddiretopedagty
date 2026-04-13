import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Prescription } from '../types';

const FavoritosPage: React.FC = () => {
    const [favorites, setFavorites] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('user_favoritos')
                    .select('prescricoes(*)')
                    .eq('user_id', user.id);

                if (!error && data) {
                    const favs = data.map((fav: any) => fav.prescricoes).filter(Boolean);
                    setFavorites(favs);
                }
            } catch (err) {
                console.error('Erro ao carregar favoritos:', err);
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, []);

    return (
        <div className="container mx-auto px-4 sm:px-6 max-w-[1240px] mt-6 sm:mt-10 mb-24">

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-8">
                <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Início
                </Link>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">Meus Favoritos</span>
            </div>

            <div className="mb-8">
                <h1 className="text-[26px] sm:text-[30px] font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    Meus Favoritos
                </h1>
                <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium">
                    Prescrições do banco que você marcou com estrela para acesso rápido.
                </p>
            </div>

            {/* GRID DE FAVORITOS */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-[110px] bg-slate-50 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : favorites.length > 0 ? (
                <>
                    <p className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 mb-5 uppercase tracking-widest">
                        {favorites.length} {favorites.length === 1 ? 'item favoritado' : 'itens favoritados'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {favorites.map((fav) => (
                            <Link
                                key={fav.id}
                                to={`/prescricao/${fav.id}`}
                                className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-amber-300/60 dark:hover:border-amber-700/40 transition-all duration-300"
                            >
                                <div className="flex-1 min-w-0 mb-3">
                                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 tracking-tight pr-5 mb-2">
                                        {fav.titulo}
                                    </h3>
                                    {fav.condicao && (
                                        <span className="inline-block text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            {fav.condicao}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500">
                                        Ver prescrição
                                    </span>
                                    <svg className="w-4 h-4 text-amber-400 group-hover:text-amber-500 fill-current transition-colors" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                    </div>
                    <p className="text-[18px] font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhum favorito ainda</p>
                    <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                        Dentro de qualquer prescrição, toque na estrela para salvá-la aqui para acesso rápido.
                    </p>
                    <Link
                        to="/dashboard"
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[13px] font-bold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors"
                    >
                        Explorar prescrições
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FavoritosPage;
