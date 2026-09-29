import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Product } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (product: Product) => void;
  onClearFavorites: () => void;
  onAddToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCatalog: () => void;
  currency?: string;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onClearFavorites,
  onAddToCart,
  onSelectProduct,
  onNavigateToCatalog,
  currency = 'MRU',
}) => {
  if (!isOpen) return null;

  const handleAddAllToCart = () => {
    favorites.forEach((p) => {
      onAddToCart(p, 1, p.tailles?.[0]?.taille || 'Standard', p.couleurs?.[0] || 'Standard');
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-950 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h2 className="font-brand text-lg font-bold">Mes Favoris</h2>
                <span className="text-xs text-stone-400">
                  {favorites.length} {favorites.length > 1 ? 'articles enregistrés' : 'article enregistré'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-850 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List or Empty State */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {favorites.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shadow-inner">
                  <Heart className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-900 text-lg">Votre liste de favoris est vide</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Sauvegardez vos articles préférés en cliquant sur le cœur afin de les retrouver rapidement et les commander quand vous le souhaitez.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToCatalog();
                  }}
                  className="mt-2 px-6 py-3 bg-stone-950 text-amber-400 hover:bg-stone-900 border border-amber-400/40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow cursor-pointer transition-all"
                >
                  <span>Découvrir la boutique</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((product) => {
                  const imageSrc =
                    product.image_principale ||
                    product.images?.[0]?.image ||
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

                  return (
                    <div
                      key={product.id_produit}
                      className="group p-3.5 rounded-2xl border border-stone-200 hover:border-amber-400/60 bg-white hover:bg-stone-50/50 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      {/* Image & info */}
                      <div
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          <img
                            src={imageSrc}
                            alt={product.nom}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="overflow-hidden space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">
                            {product.categorie_nom || product.genre}
                          </span>
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {product.nom}
                          </h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-black text-stone-950 font-serif">
                              {product.prix.toLocaleString('fr-FR')} {currency}
                            </span>
                            {product.ancien_prix && (
                              <span className="text-[10px] text-stone-400 line-through">
                                {product.ancien_prix.toLocaleString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onAddToCart(
                              product,
                              1,
                              product.tailles?.[0]?.taille || 'Standard',
                              product.couleurs?.[0] || 'Standard'
                            );
                          }}
                          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all shadow-xs cursor-pointer"
                          title="Ajouter au panier"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onRemoveFavorite(product)}
                          className="p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Retirer des favoris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {favorites.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-3">
              <button
                onClick={handleAddAllToCart}
                className="w-full py-3.5 px-4 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 border border-amber-400/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tout ajouter au panier ({favorites.length})</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={onClearFavorites}
                  className="text-[11px] text-stone-500 hover:text-rose-600 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vider tous les favoris</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateToCatalog();
                  }}
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Continuer mes achats</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
