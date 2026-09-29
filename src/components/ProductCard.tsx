import React from 'react';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  currency?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onQuickAdd,
  currency = 'MRU',
  isFavorite = false,
  onToggleFavorite,
}) => {
  const discountPercent =
    product.ancien_prix && product.ancien_prix > product.prix
      ? Math.round(((product.ancien_prix - product.prix) / product.ancien_prix) * 100)
      : null;

  const displayImage =
    product.image_principale ||
    product.images?.[0]?.image ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Container */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square w-full overflow-hidden bg-stone-100 cursor-pointer"
      >
        <img
          src={displayImage}
          alt={product.nom}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product);
            }}
            className={`absolute top-3 right-3 z-20 p-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-md ${
              isFavorite
                ? 'bg-white text-rose-600 scale-105 ring-2 ring-rose-500/20'
                : 'bg-white/90 text-stone-600 hover:text-rose-600 hover:scale-110 hover:bg-white backdrop-blur-xs'
            }`}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                isFavorite
                  ? 'fill-rose-500 text-rose-500 scale-110'
                  : 'fill-none hover:text-rose-500'
              }`}
            />
          </button>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {discountPercent && (
            <span className="px-2.5 py-1 bg-rose-600 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider shadow">
              -{discountPercent}%
            </span>
          )}
          {product.vedette === 1 && (
            <span className="px-2.5 py-1 bg-stone-950 text-amber-400 border border-amber-400/40 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow">
              Vedette
            </span>
          )}
        </div>

        {/* Quick View Overlay on hover */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="p-3 rounded-full bg-white text-stone-900 shadow-lg hover:bg-amber-400 hover:text-stone-950 transition-colors"
            title="Aperçu rapide"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="uppercase tracking-wider font-semibold text-amber-700">
              {product.categorie_nom || product.genre}
            </span>
            <span>{product.marque}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-stone-900 font-semibold text-sm line-clamp-2 hover:text-amber-600 cursor-pointer transition-colors mb-2"
          >
            {product.nom}
          </h3>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-stone-950 font-serif">
                {product.prix.toLocaleString('fr-FR')} {currency}
              </span>
              {product.ancien_prix && (
                <span className="text-xs text-stone-400 line-through">
                  {product.ancien_prix.toLocaleString('fr-FR')}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] text-amber-600 font-medium block">
                Plus que {product.stock} en stock !
              </span>
            )}
          </div>

          <button
            onClick={() => onQuickAdd(product)}
            className="p-2.5 rounded-xl bg-stone-950 text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-all shadow-sm cursor-pointer"
            title="Ajouter au panier"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
