import React from 'react';
import { ArrowRight, Sparkles, Shield, Truck, CreditCard, Flame, Gift, Star, Package, Heart } from 'lucide-react';
import { Category, Product, ShopSettings } from '../types';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  categories: Category[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onNavigate: (page: string, filter?: any) => void;
  onReloadDemo?: () => void;
  settings?: ShopSettings | null;
  currency?: string;
  isFavorite?: (id: number) => boolean;
  onToggleFavorite?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  products,
  onSelectProduct,
  onQuickAdd,
  onNavigate,
  onReloadDemo,
  settings,
  currency = 'MRU',
  isFavorite,
  onToggleFavorite,
}) => {
  const featuredProducts = products.filter((p) => p.vedette === 1).slice(0, 8);
  const promoProducts = products.filter((p) => p.ancien_prix && p.ancien_prix > p.prix).slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Grand Hero Banner */}
      <section className="relative bg-stone-950 text-white overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-stone-950 to-stone-950 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Boutique de Référence en Mauritanie</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-brand tracking-tight text-white leading-tight">
                Votre boutique en ligne en <span className="gold-gradient-text">Mauritanie</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
                Mode, parfums et accessoires pour hommes et femmes, livrés partout en Mauritanie. Paiement simple et direct par Bankily, Masravi et Seddad.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => onNavigate('catalog', {})}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <span>Découvrir les produits</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('catalog', { featured: true })}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-900 hover:bg-stone-850 text-stone-200 border border-stone-800 hover:border-amber-400/50 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Voir les nouveautés</span>
                </button>
              </div>

              {/* Payment Methods Badges */}
              <div className="pt-8 border-t border-stone-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-stone-400">
                <span className="font-semibold text-stone-300">Paiement Mobile accepté :</span>
                <span className="px-3 py-1 bg-stone-900 border border-blue-500/40 text-blue-400 rounded-lg font-bold">
                  BANKILY
                </span>
                <span className="px-3 py-1 bg-stone-900 border border-emerald-500/40 text-emerald-400 rounded-lg font-bold">
                  MASRAVI
                </span>
                <span className="px-3 py-1 bg-stone-900 border border-amber-500/40 text-amber-400 rounded-lg font-bold">
                  SEDDAD
                </span>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md">
                {/* Decorative border box */}
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-700/30 rounded-3xl blur-xl"></div>
                <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-stone-900 shadow-2xl aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
                    alt="MG SHOPPING Collection"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>

                  {/* Floating Highlight Card */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-stone-950/85 backdrop-blur-md border border-amber-500/40 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          Collection Prestige
                        </span>
                        <h4 className="text-sm font-bold">Costumes & Parfums Rares</h4>
                      </div>
                      <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg">
                        15 Wilayas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Catégories Principales */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-1">
              Explorer par univers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-brand">
              Nos Catégories Populaires
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog', {})}
            className="text-xs font-bold text-stone-900 hover:text-amber-600 uppercase tracking-wider flex items-center gap-1"
          >
            <span>Tout voir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id_categorie}
              onClick={() => onNavigate('catalog', { category: cat.slug })}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200"
            >
              <img
                src={cat.image}
                alt={cat.nom}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent group-hover:from-stone-950 transition-colors"></div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-brand text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {cat.nom}
                </h3>
                <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Produits Vedettes & Populaires */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Sélection Exclusivité</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-brand">
              Articles Vedettes & Les Plus Vendus
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog', { featured: true })}
            className="text-xs font-bold text-stone-900 hover:text-amber-600 uppercase tracking-wider flex items-center gap-1"
          >
            <span>Voir la collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Contenu d’insertion vidé</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Les articles et commandes d’exemple ont été vidés. La boutique est prête à recevoir vos propres articles.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="px-5 py-2.5 rounded-xl bg-stone-950 text-amber-400 font-bold text-xs uppercase shadow cursor-pointer"
              >
                Ajouter mes articles (Admin)
              </button>
              {onReloadDemo && (
                <button
                  onClick={onReloadDemo}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs uppercase shadow cursor-pointer"
                >
                  Recharger les articles d'exemple
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((p) => (
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
      </section>

      {/* 4. Promotion Banner */}
      {promoProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-8 sm:p-12 text-white border border-amber-500/30 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-3 text-center md:text-left">
                <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" /> Offres Spéciales
                </span>
                <h3 className="text-2xl sm:text-4xl font-bold font-brand">
                  Promotions Exceptionnelles MG SHOPPING
                </h3>
                <p className="text-sm text-stone-300 max-w-xl">
                  Profitez de réductions immédiates sur une sélection de vêtements, chaussures de prestige et montres. Stocks limités.
                </p>
              </div>

              <button
                onClick={() => onNavigate('catalog', { promo: true })}
                className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shrink-0 transition-transform hover:scale-105"
              >
                Découvrir toutes les promos
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-stone-800">
              {promoProducts.map((p) => {
                const fav = isFavorite ? isFavorite(p.id_produit) : false;
                return (
                  <div
                    key={p.id_produit}
                    onClick={() => onSelectProduct(p)}
                    className="relative bg-stone-900/80 p-3 rounded-2xl border border-stone-800 hover:border-amber-400/50 cursor-pointer transition-all group"
                  >
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(p);
                        }}
                        className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all shadow-md ${
                          fav
                            ? 'bg-white text-rose-600 scale-105'
                            : 'bg-stone-950/80 text-stone-400 hover:text-rose-500 hover:bg-stone-900'
                        }`}
                        title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    )}

                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-stone-950">
                      <img
                        src={p.image_principale || p.images?.[0]?.image}
                        alt={p.nom}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-white truncate">{p.nom}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-black text-amber-400">
                        {p.prix.toLocaleString('fr-FR')} {currency}
                      </span>
                      {p.ancien_prix && (
                        <span className="text-[10px] text-stone-500 line-through">
                          {p.ancien_prix.toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. Avis & Confiance Clients Mauritanie */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-1">
            Satisfaction garantie
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-brand">
            Pourquoi nos clients choisissent MG SHOPPING ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-3">
            <div className="flex text-amber-500 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              "J'ai commandé le T-Shirt en coton Pima et le parfum Oud Royal à Nouakchott (Tevragh Zeina). Livraison en moins de 3 heures avec la localisation GPS partagée. Paiement Bankily très fluide !"
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Sidi Mohamed O.</span>
              <span className="text-stone-400">Client Nouakchott</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-3">
            <div className="flex text-amber-500 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              "L'Abaya en soie de Médine et le sac en cuir sont d'une qualité remarquable. Expédition rapide vers Nouadhibou par Masravi. Je recommande vivement MG SHOPPING."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Mariem Mint K.</span>
              <span className="text-stone-400">Cliente Nouadhibou</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-3">
            <div className="flex text-amber-500 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              "Service client réactif sur WhatsApp. Ils m'ont confirmé la validation de mon reçu Seddad immédiatement et j'ai pu suivre l'avancement de la commande sur le site."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Ahmedou Salem</span>
              <span className="text-stone-400">Client Rosso (Trarza)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
