import React, { useState, useEffect } from 'react';
import { Search, Filter, X, SlidersHorizontal, RotateCcw, Package, Heart } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

interface CatalogPageProps {
  categories: Category[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onReloadDemo?: () => void;
  currency?: string;
  isFavorite?: (id: number) => boolean;
  onToggleFavorite?: (product: Product) => void;
  favoritesCount?: number;
  initialFilter?: {
    category?: string;
    genre?: string;
    promo?: boolean;
    featured?: boolean;
    q?: string;
  };
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  categories,
  products,
  onSelectProduct,
  onQuickAdd,
  onReloadDemo,
  currency = 'MRU',
  isFavorite,
  onToggleFavorite,
  favoritesCount = 0,
  initialFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilter?.q || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilter?.category || 'all');
  const [selectedGenre, setSelectedGenre] = useState(initialFilter?.genre || 'all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [onlyPromo, setOnlyPromo] = useState(!!initialFilter?.promo);
  const [onlyFeatured, setOnlyFeatured] = useState(!!initialFilter?.featured);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortBy, setSortBy] = useState('default');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Mettre à jour les filtres si initialFilter change
  useEffect(() => {
    if (initialFilter?.category !== undefined) setSelectedCategory(initialFilter.category || 'all');
    if (initialFilter?.genre !== undefined) setSelectedGenre(initialFilter.genre || 'all');
    if (initialFilter?.promo !== undefined) setOnlyPromo(!!initialFilter.promo);
    if (initialFilter?.featured !== undefined) setOnlyFeatured(!!initialFilter.featured);
    if (initialFilter?.q !== undefined) setSearchQuery(initialFilter.q || '');
  }, [initialFilter]);

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGenre('all');
    setSelectedSize('all');
    setOnlyPromo(false);
    setOnlyFeatured(false);
    setOnlyFavorites(false);
    setPriceRange(10000);
    setSortBy('default');
  };

  // Tailles disponibles déduites des produits
  const allSizes = Array.from(
    new Set(
      products.flatMap((p) => (p.tailles ? p.tailles.map((t) => t.taille) : []))
    )
  );

  // Filtrage côté client
  const filteredProducts = products.filter((p) => {
    if (p.statut !== 'actif') return false;

    // Favoris uniquement
    if (onlyFavorites && isFavorite && !isFavorite(p.id_produit)) return false;

    // Catégorie
    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategory || String(c.id_categorie) === selectedCategory);
      if (cat && p.id_categorie !== cat.id_categorie) return false;
    }

    // Genre
    if (selectedGenre !== 'all') {
      if (p.genre !== selectedGenre && p.genre !== 'unisexe') return false;
    }

    // Recherche globale
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.nom.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchBrand = p.marque.toLowerCase().includes(q);
      const matchCat = (p.categorie_nom || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchBrand && !matchCat) return false;
    }

    // Prix max
    if (p.prix > priceRange) return false;

    // Promo
    if (onlyPromo && (!p.ancien_prix || p.ancien_prix <= p.prix)) return false;

    // Vedette
    if (onlyFeatured && p.vedette !== 1) return false;

    // Taille
    if (selectedSize !== 'all') {
      const hasSize = p.tailles?.some((t) => t.taille.toLowerCase() === selectedSize.toLowerCase());
      if (!hasSize) return false;
    }

    return true;
  });

  // Tri
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.prix - b.prix;
    if (sortBy === 'price_desc') return b.prix - a.prix;
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return (b.vedette || 0) - (a.vedette || 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-950 font-brand">
              Catalogue & Collections
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Trouvez votre style parmi nos vêtements, parfums et souliers haut de gamme en Mauritanie.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher produit, marque, parfum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setOnlyFavorites(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all' && !onlyFavorites
                ? 'bg-stone-950 text-amber-400 border border-amber-400/40 shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Tous les articles
          </button>

          {/* Chip Mes Favoris */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              onlyFavorites
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : 'fill-rose-500 text-rose-500'}`} />
            <span>Mes Favoris ({favoritesCount})</span>
          </button>

          {categories.map((c) => (
            <button
              key={c.id_categorie}
              onClick={() => {
                setSelectedCategory(c.slug);
                setOnlyFavorites(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === c.slug && !onlyFavorites
                  ? 'bg-stone-950 text-amber-400 border border-amber-400/40 shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <span className="font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>Filtres de recherche</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser</span>
            </button>
          </div>

          {/* Genre */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-2">
              Genre
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Tous', val: 'all' },
                { label: 'Homme', val: 'homme' },
                { label: 'Femme', val: 'femme' },
              ].map((g) => (
                <button
                  key={g.val}
                  onClick={() => setSelectedGenre(g.val)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    selectedGenre === g.val
                      ? 'bg-stone-950 text-amber-400 border-stone-950'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prix Max */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              <span>Prix maximum</span>
              <span className="text-amber-700 font-serif">
                {priceRange.toLocaleString('fr-FR')} {currency}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>1 000 MRU</span>
              <span>10 000 MRU</span>
            </div>
          </div>

          {/* Tailles */}
          {allSizes.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-2">
                Taille / Format
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSize('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    selectedSize === 'all'
                      ? 'bg-stone-950 text-amber-400 border-stone-950'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  Toutes
                </button>
                {allSizes.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      selectedSize === s
                        ? 'bg-stone-950 text-amber-400 border-stone-950'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Checkboxes Promo & Vedette & Favoris */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-rose-700 font-semibold p-1.5 rounded-lg bg-rose-50 border border-rose-200">
              <input
                type="checkbox"
                checked={onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300"
              />
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Mes favoris uniquement ({favoritesCount})</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
              <input
                type="checkbox"
                checked={onlyPromo}
                onChange={(e) => setOnlyPromo(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span>Articles en promotion uniquement</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
              <input
                type="checkbox"
                checked={onlyFeatured}
                onChange={(e) => setOnlyFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span>Sélection Vedette</span>
            </label>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm text-xs">
            <span className="font-semibold text-stone-600">
              {sortedProducts.length} article{sortedProducts.length > 1 ? 's' : ''} trouvé
              {sortedProducts.length > 1 ? 's' : ''}
            </span>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 font-bold flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filtres</span>
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-stone-400 hidden sm:inline">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="default">Recommandés / Vedettes</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="newest">Nouveautés récentes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Le catalogue d’articles est actuellement vide</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Le contenu d’insertion a été vidé. Vous pouvez ajouter vos propres articles dans l’espace administration ou recharger les produits d’exemple à tout moment.
              </p>
              {onReloadDemo && (
                <div className="pt-2">
                  <button
                    onClick={onReloadDemo}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider shadow cursor-pointer"
                  >
                    Recharger les produits d'exemple
                  </button>
                </div>
              )}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Aucun produit ne correspond à ces critères</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Essayez d'ajuster votre budget ou de réinitialiser vos filtres de recherche.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-xl bg-stone-950 text-amber-400 text-xs font-bold uppercase tracking-wider"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {sortedProducts.map((p) => (
                <ProductCard
                  key={p.id_produit}
                  product={p}
                  onSelectProduct={onSelectProduct}
                  onQuickAdd={onQuickAdd}
                  currency={currency}
                  isFavorite={isFavorite ? isFavorite(p.id_produit) : false}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <span className="font-bold text-sm text-stone-900">Filtres</span>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Same controls */}
            <div>
              <label className="text-xs font-bold uppercase text-stone-800 block mb-2">Genre</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['all', 'homme', 'femme'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`py-1.5 text-xs font-medium rounded-lg border ${
                      selectedGenre === g ? 'bg-stone-950 text-amber-400' : 'bg-stone-50'
                    }`}
                  >
                    {g === 'all' ? 'Tous' : g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800 mb-2">
                <span>Prix max</span>
                <span className="text-amber-700 font-serif">{priceRange} {currency}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <label className="flex items-center gap-2 text-xs font-semibold text-rose-700 p-2 rounded-xl bg-rose-50 border border-rose-200">
                <input
                  type="checkbox"
                  checked={onlyFavorites}
                  onChange={(e) => setOnlyFavorites(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Mes favoris uniquement ({favoritesCount})</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={onlyPromo}
                  onChange={(e) => setOnlyPromo(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span>Promotions uniquement</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={onlyFeatured}
                  onChange={(e) => setOnlyFeatured(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span>Vedettes uniquement</span>
              </label>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-stone-950 text-amber-400 font-bold rounded-xl text-xs uppercase tracking-wider"
            >
              Appliquer les filtres ({sortedProducts.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
