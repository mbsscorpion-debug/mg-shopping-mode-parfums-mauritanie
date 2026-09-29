import React, { useState } from 'react';
import { ShoppingBag, Search, Compass, Menu, X, ShieldCheck, Phone, Heart } from 'lucide-react';
import { ShopSettings } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
  onNavigate: (page: string, filter?: { category?: string; genre?: string; promo?: boolean; featured?: boolean }) => void;
  currentPage: string;
  settings?: ShopSettings | null;
  onSearchOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  favoritesCount = 0,
  onOpenFavorites,
  onNavigate,
  currentPage,
  settings,
  onSearchOpen,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Accueil', page: 'home', filter: {} },
    { label: 'Hommes', page: 'catalog', filter: { genre: 'homme' } },
    { label: 'Femmes', page: 'catalog', filter: { genre: 'femme' } },
    { label: 'Parfums', page: 'catalog', filter: { category: 'parfums' } },
    { label: 'Chaussures', page: 'catalog', filter: { category: 'chaussures' } },
    { label: 'Accessoires', page: 'catalog', filter: { category: 'accessoires' } },
    { label: 'Promotions', page: 'catalog', filter: { promo: true } },
    { label: 'Nouveautés', page: 'catalog', filter: { featured: true } },
  ];

  const handleLinkClick = (page: string, filter: any) => {
    onNavigate(page, filter);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950 text-white border-b border-amber-500/20 shadow-xl">
      {/* Top Banner Mauritanie */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-stone-950 text-xs font-semibold py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
            <span>Livraison rapide dans les 15 Wilayas en Mauritanie</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Paiement Bankily, Masravi, Seddad
            </span>
            {settings?.shop_whatsapp && (
              <a
                href={`https://wa.me/${settings.shop_whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline font-bold"
              >
                <Phone className="w-3.5 h-3.5" /> WhatsApp : {settings.shop_whatsapp}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => handleLinkClick('home', {})}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            {/* Monogram MG */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center border border-amber-500/30">
                <span className="font-serif text-2xl font-black tracking-tighter gold-gradient-text">
                  MG
                </span>
              </div>
            </div>

            {/* Brand Title */}
            <div className="flex flex-col">
              <span className="font-brand text-xl sm:text-2xl font-bold tracking-widest text-white group-hover:text-amber-400 transition-colors">
                MG <span className="gold-gradient-text">SHOPPING</span>
              </span>
              <span className="text-[10px] tracking-widest text-stone-400 uppercase -mt-1">
                Mauritanie · Luxe & Mode
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleLinkClick(item.page, item.filter)}
                className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer rounded-lg hover:text-amber-400 hover:bg-stone-900 ${
                  currentPage === item.page ? 'text-amber-400' : 'text-stone-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Global Search */}
            <button
              onClick={onSearchOpen}
              className="p-2.5 rounded-xl text-stone-300 hover:text-amber-400 hover:bg-stone-900 transition-colors cursor-pointer"
              title="Rechercher un produit"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Favoris */}
            {onOpenFavorites && (
              <button
                onClick={onOpenFavorites}
                className="relative p-2.5 rounded-xl text-stone-300 hover:text-rose-400 hover:bg-stone-900 transition-colors cursor-pointer"
                title="Mes favoris"
                aria-label="Mes favoris"
              >
                <Heart className={`w-5 h-5 transition-transform ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500 scale-105' : ''}`} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

            {/* Suivre ma commande */}
            <button
              onClick={() => handleLinkClick('tracking', {})}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-amber-300 border border-amber-500/40 rounded-xl hover:bg-amber-500/10 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Suivre commande</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all shadow-md hover:shadow-amber-500/30 font-bold flex items-center gap-2 cursor-pointer"
              title="Voir mon panier"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-stone-950 text-amber-400 border border-amber-400 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-900 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-950 border-t border-amber-500/20 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleLinkClick(item.page, item.filter)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium bg-stone-900 text-stone-200 hover:text-amber-400 hover:bg-stone-850 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-800 flex flex-col gap-2">
            {onOpenFavorites && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenFavorites();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-400 border border-rose-500/40 rounded-xl bg-rose-500/10 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>Mes Favoris ({favoritesCount})</span>
              </button>
            )}

            <button
              onClick={() => handleLinkClick('tracking', {})}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-400 border border-amber-500/40 rounded-xl bg-amber-500/10"
            >
              <Compass className="w-4 h-4" /> Suivre ma commande
            </button>

            <button
              onClick={() => handleLinkClick('admin', {})}
              className="w-full text-center text-xs text-stone-400 hover:text-stone-200 py-1"
            >
              Administration MG SHOPPING
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
