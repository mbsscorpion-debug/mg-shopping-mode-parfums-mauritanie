import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Zap, ShieldCheck, Truck, ArrowLeft, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size: string, color: string) => void;
  onDirectCheckout: (product: Product, quantity: number, size: string, color: string) => void;
  currency?: string;
  similarProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onDirectCheckout,
  currency = 'MRU',
  similarProducts = [],
  onSelectProduct,
  isFavorite = false,
  onToggleFavorite,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAlert, setAddedAlert] = useState(false);

  useEffect(() => {
    if (product) {
      const defaultImg =
        product.image_principale ||
        product.images?.[0]?.image ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
      setSelectedImage(defaultImg);

      if (product.tailles && product.tailles.length > 0) {
        setSelectedSize(product.tailles[0].taille);
      } else {
        setSelectedSize('Standard');
      }

      if (product.couleurs && product.couleurs.length > 0) {
        setSelectedColor(product.couleurs[0]);
      } else {
        setSelectedColor('Standard');
      }

      setQuantity(1);
      setAddedAlert(false);
    }
  }, [product]);

  const discountPercent =
    product.ancien_prix && product.ancien_prix > product.prix
      ? Math.round(((product.ancien_prix - product.prix) / product.ancien_prix) * 100)
      : null;

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2500);
  };

  const handleDirectBuy = () => {
    onDirectCheckout(product, quantity, selectedSize, selectedColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
        {/* Top Action Buttons (Favorite + Close) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(product)}
              className={`p-2.5 rounded-full transition-all cursor-pointer shadow-md ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-stone-100 text-stone-700 hover:text-rose-600 hover:bg-white'
              }`}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart
                className={`w-5 h-5 transition-transform ${
                  isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'fill-none'
                }`}
              />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-950 hover:text-white transition-colors cursor-pointer shadow-md"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Left: Images */}
          <div className="p-6 bg-stone-50 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-stone-200/80 shadow-inner">
              <img
                src={selectedImage}
                alt={product.nom}
                className="w-full h-full object-cover object-center"
              />
              {discountPercent && (
                <span className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg uppercase shadow">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id_image}
                    onClick={() => setSelectedImage(img.image)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img.image ? 'border-amber-500 scale-105' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Brand */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-wider font-semibold text-amber-600">
                  {product.categorie_nom || product.genre}
                </span>
                <span className="font-medium text-stone-400">Marque : {product.marque}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-stone-950 font-brand mb-3">
                {product.nom}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black text-stone-950 font-serif">
                  {product.prix.toLocaleString('fr-FR')} {currency}
                </span>
                {product.ancien_prix && (
                  <span className="text-sm text-stone-400 line-through">
                    {product.ancien_prix.toLocaleString('fr-FR')} {currency}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Économie de {(product.ancien_prix! - product.prix).toLocaleString('fr-FR')} {currency}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Sizes */}
              {product.tailles && product.tailles.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Taille / Format :
                    </label>
                    <span className="text-xs text-stone-500 font-medium">Sélectionné : {selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.tailles.map((t) => (
                      <button
                        key={t.id_taille}
                        onClick={() => setSelectedSize(t.taille)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === t.taille
                            ? 'bg-stone-950 text-amber-400 border-amber-400 shadow-sm'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {t.taille}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.couleurs && product.couleurs.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Couleur / Teinte :
                    </label>
                    <span className="text-xs text-stone-500 font-medium">Sélectionné : {selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.couleurs.map((col, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          selectedColor === col
                            ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6 flex items-center gap-4">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Quantité :
                </label>
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-500">
                  {product.stock > 0 ? `${product.stock} articles disponibles` : 'Rupture temporaire'}
                </span>
              </div>
            </div>

            {/* Feedback alert */}
            {addedAlert && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Article ajouté au panier avec succès !</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3.5 px-3 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 border border-amber-400/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ajouter au panier</span>
                </button>

                <button
                  onClick={handleDirectBuy}
                  className="flex-1 py-3.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Commander</span>
                </button>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(product)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer shrink-0 shadow-sm ${
                      isFavorite
                        ? 'bg-rose-50 text-rose-600 border-rose-300 ring-2 ring-rose-500/20'
                        : 'bg-stone-100 text-stone-700 hover:text-rose-600 hover:bg-stone-200 border-stone-200'
                    }`}
                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                )}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Bankily / Masravi / Seddad</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Livraison GPS Mauritanie</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="p-6 bg-stone-50 border-t border-stone-200">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
              Articles similaires recommandés
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {similarProducts.map((sp) => (
                <div
                  key={sp.id_produit}
                  onClick={() => onSelectProduct && onSelectProduct(sp)}
                  className="bg-white p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 cursor-pointer transition-all flex items-center gap-2.5 group"
                >
                  <img
                    src={sp.image_principale || sp.images?.[0]?.image}
                    alt={sp.nom}
                    className="w-12 h-12 object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-stone-900 truncate">{sp.nom}</p>
                    <p className="text-xs font-bold text-amber-700">
                      {sp.prix.toLocaleString('fr-FR')} {currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
