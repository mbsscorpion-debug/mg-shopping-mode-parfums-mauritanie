import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DeliveryPortal } from './pages/DeliveryPortal';
import { api } from './services/api';
import { Product, Category, DeliveryZone, ShopSettings, CartItem, Order } from './types';
import { Search, X, Home, Compass, ShoppingBag, Shield, Heart } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'catalog' | 'tracking' | 'admin' | 'delivery-agent'>('home');
  const [catalogFilter, setCatalogFilter] = useState<{
    category?: string;
    genre?: string;
    promo?: boolean;
    featured?: boolean;
    q?: string;
  }>({});

  // Données de base
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  // Panier
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mg_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Favoris (Persistance dans le localStorage)
  const [favorites, setFavorites] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('mg_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favoriteToast, setFavoriteToast] = useState<{ message: string; visible: boolean; isAdded: boolean } | null>(null);

  const [selectedWilaya, setSelectedWilaya] = useState<string>('Nouakchott Ouest');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchModalQuery, setSearchModalQuery] = useState('');

  // Sauvegarder panier localement
  useEffect(() => {
    try {
      localStorage.setItem('mg_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Sauvegarder favoris localement
  useEffect(() => {
    try {
      localStorage.setItem('mg_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const showFavoriteToast = (message: string, isAdded: boolean) => {
    setFavoriteToast({ message, visible: true, isAdded });
    setTimeout(() => {
      setFavoriteToast(null);
    }, 2800);
  };

  const handleToggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id_produit === product.id_produit);
      if (exists) {
        showFavoriteToast(`"${product.nom}" a été retiré de vos favoris`, false);
        return prev.filter((p) => p.id_produit !== product.id_produit);
      } else {
        showFavoriteToast(`"${product.nom}" a été ajouté à vos favoris ❤️`, true);
        return [product, ...prev];
      }
    });
  };

  const handleRemoveFavorite = (product: Product) => {
    setFavorites((prev) => prev.filter((p) => p.id_produit !== product.id_produit));
    showFavoriteToast(`"${product.nom}" a été retiré de vos favoris`, false);
  };

  const handleClearFavorites = () => {
    setFavorites([]);
    showFavoriteToast('Tous les favoris ont été retirés', false);
  };

  const isFavorite = (productId: number) => {
    return favorites.some((p) => p.id_produit === productId);
  };

  // Charger les données au démarrage
  const loadInitialData = async () => {
    try {
      const [prods, cats, zns, sets] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getDeliveryZones(),
        api.getSettings(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setZones(zns);
      setSettings(sets);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Actions Panier
  const handleAddToCart = (product: Product, quantity = 1, size = 'Standard', color = 'Standard') => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id_produit === product.id_produit && i.size === size && i.color === color
      );
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      }
      return [...prev, { product, quantity, size, color }];
    });
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setCartItems((prev) => {
      const copy = [...prev];
      if (quantity <= 0) {
        copy.splice(index, 1);
      } else {
        copy[index].quantity = quantity;
      }
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Navigation
  const handleNavigate = (page: string, filter?: any) => {
    if (page === 'home' || page === 'catalog' || page === 'tracking' || page === 'admin' || page === 'delivery-agent') {
      setCurrentPage(page);
    }
    if (filter) {
      setCatalogFilter(filter);
    } else {
      setCatalogFilter({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct buy from product detail modal
  const handleDirectCheckout = (product: Product, quantity: number, size: string, color: string) => {
    handleAddToCart(product, quantity, size, color);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    // Vider le panier après commande réussie
    setCartItems([]);
  };

  const handleReloadDemo = async () => {
    try {
      await api.seedDemoData();
      await loadInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  // Quick search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchModalQuery.trim()) {
      handleNavigate('catalog', { q: searchModalQuery.trim() });
      setSearchModalOpen(false);
      setSearchModalQuery('');
    }
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Header (sauf en espace livreur dédié si souhaité, mais présent partout pour une navigation uniforme) */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        settings={settings}
        onSearchOpen={() => setSearchModalOpen(true)}
      />

      {/* Main Pages Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            categories={categories}
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onQuickAdd={(p) => handleAddToCart(p, 1, p.tailles?.[0]?.taille || 'Standard', p.couleurs?.[0] || 'Standard')}
            onNavigate={handleNavigate}
            settings={settings}
            currency={settings?.currency || 'MRU'}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentPage === 'catalog' && (
          <CatalogPage
            categories={categories}
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onQuickAdd={(p) => handleAddToCart(p, 1, p.tailles?.[0]?.taille || 'Standard', p.couleurs?.[0] || 'Standard')}
            currency={settings?.currency || 'MRU'}
            initialFilter={catalogFilter}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            favoritesCount={favorites.length}
          />
        )}

        {currentPage === 'tracking' && (
          <OrderTrackingPage currency={settings?.currency || 'MRU'} />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard currency={settings?.currency || 'MRU'} />
        )}

        {currentPage === 'delivery-agent' && (
          <DeliveryPortal currency={settings?.currency || 'MRU'} />
        )}
      </main>

      {/* Footer */}
      <Footer settings={settings} onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-stone-950/95 backdrop-blur-md border-t border-amber-500/20 py-2 px-4 flex items-center justify-around text-stone-400 text-[10px] font-bold">
        <button
          onClick={() => handleNavigate('home')}
          className={`flex flex-col items-center gap-1 ${currentPage === 'home' ? 'text-amber-400' : 'hover:text-white'}`}
        >
          <Home className="w-5 h-5" />
          <span>Accueil</span>
        </button>

        <button
          onClick={() => handleNavigate('catalog')}
          className={`flex flex-col items-center gap-1 ${currentPage === 'catalog' ? 'text-amber-400' : 'hover:text-white'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Boutique</span>
        </button>

        <button
          onClick={() => setIsFavoritesOpen(true)}
          className="relative flex flex-col items-center gap-1 hover:text-white cursor-pointer"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {favorites.length}
              </span>
            )}
          </div>
          <span>Favoris</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 hover:text-white cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-stone-950 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalCartCount}
              </span>
            )}
          </div>
          <span>Panier</span>
        </button>

        <button
          onClick={() => handleNavigate('tracking')}
          className={`flex flex-col items-center gap-1 ${currentPage === 'tracking' ? 'text-amber-400' : 'hover:text-white'}`}
        >
          <Compass className="w-5 h-5" />
          <span>Suivi</span>
        </button>
      </div>

      {/* Slide-in Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        zones={zones}
        selectedWilaya={selectedWilaya}
        onSelectWilaya={setSelectedWilaya}
        currency={settings?.currency || 'MRU'}
      />

      {/* Slide-in Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        onClearFavorites={handleClearFavorites}
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsFavoritesOpen(false);
        }}
        onNavigateToCatalog={() => {
          setIsFavoritesOpen(false);
          handleNavigate('catalog');
        }}
        currency={settings?.currency || 'MRU'}
      />

      {/* Checkout Modal (Guest checkout with Geolocation & Payment Proof upload) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        zones={zones}
        settings={settings}
        selectedWilaya={selectedWilaya}
        onSelectWilaya={setSelectedWilaya}
        onOrderSuccess={handleOrderSuccess}
        currency={settings?.currency || 'MRU'}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onDirectCheckout={handleDirectCheckout}
        currency={settings?.currency || 'MRU'}
        similarProducts={products
          .filter((p) => selectedProduct && p.id_produit !== selectedProduct.id_produit && p.id_categorie === selectedProduct.id_categorie)
          .slice(0, 4)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        isFavorite={selectedProduct ? isFavorite(selectedProduct.id_produit) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Toast Notification Favoris */}
      {favoriteToast?.visible && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-stone-950 text-white border border-amber-400/40 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-200">
          <Heart className={`w-4 h-4 ${favoriteToast.isAdded ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
          <span className="text-xs font-semibold text-stone-100">{favoriteToast.message}</span>
        </div>
      )}

      {/* Floating WhatsApp Support Button */}
      <WhatsAppWidget settings={settings} />

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="font-bold text-xs uppercase tracking-wider text-stone-900 font-brand">
                Recherche dans la boutique
              </span>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Rechercher par nom, marque, parfum, tissu..."
                  value={searchModalQuery}
                  onChange={(e) => setSearchModalQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Exemples : T-shirt, Oud royal, Abaya, Mocassins, Montre</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-950 text-amber-400 font-bold rounded-xl text-xs uppercase"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
