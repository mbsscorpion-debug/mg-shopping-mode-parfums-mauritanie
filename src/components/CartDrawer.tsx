import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import { CartItem, DeliveryZone } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  zones: DeliveryZone[];
  selectedWilaya: string;
  onSelectWilaya: (wilaya: string) => void;
  currency?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  zones,
  selectedWilaya,
  onSelectWilaya,
  currency = 'MRU',
}) => {
  if (!isOpen) return null;

  // Calcul du sous-total
  const subtotal = items.reduce((sum, item) => sum + item.product.prix * item.quantity, 0);

  // Frais de livraison dynamiques depuis la zone BDD
  const activeZone = zones.find(
    (z) => z.wilaya.toLowerCase() === selectedWilaya.toLowerCase() && z.statut === 'active'
  );
  const deliveryFee = items.length > 0 && selectedWilaya ? (activeZone ? activeZone.frais : 150) : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 bg-stone-950 text-white flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-brand tracking-wider">
                Mon Panier ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-stone-900 font-bold text-lg mb-1">Votre panier est vide</h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Découvrez nos collections pour hommes, femmes, parfums d'exception et accessoires en Mauritanie.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 font-bold text-xs uppercase tracking-wider shadow"
                >
                  Découvrir les articles
                </button>
              </div>
            ) : (
              items.map((item, idx) => {
                const itemImg =
                  item.product.image_principale ||
                  item.product.images?.[0]?.image ||
                  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80 transition-all hover:border-amber-400/50"
                  >
                    <img
                      src={itemImg}
                      alt={item.product.nom}
                      className="w-20 h-20 rounded-xl object-cover bg-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-semibold text-stone-900 truncate">
                            {item.product.nom}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                          {item.size && (
                            <span className="bg-stone-200/70 px-1.5 py-0.5 rounded">
                              Taille : {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="bg-stone-200/70 px-1.5 py-0.5 rounded">
                              {item.color}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/50">
                        {/* Quantity modifier */}
                        <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden text-xs">
                          <button
                            onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-bold text-stone-900">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                          >
                            +
                          </button>
                        </div>

                        {/* Line total */}
                        <span className="text-xs font-black text-stone-950 font-serif">
                          {(item.product.prix * item.quantity).toLocaleString('fr-FR')} {currency}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Calculations */}
          {items.length > 0 && (
            <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-4">
              {/* Delivery Zone Selector */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Wilaya de livraison (Mauritanie) :</span>
                </label>
                <select
                  value={selectedWilaya}
                  onChange={(e) => onSelectWilaya(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Choisir une wilaya pour calculer les frais --</option>
                  {zones.map((z) => (
                    <option key={z.id_zone} value={z.wilaya}>
                      {z.wilaya} (+{z.frais} {currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Sous-total articles</span>
                  <span className="font-semibold text-stone-900">
                    {subtotal.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-1">
                    <span>Frais de livraison</span>
                    {selectedWilaya && <span className="text-[10px] text-stone-400">({selectedWilaya})</span>}
                  </span>
                  <span className="font-semibold text-stone-900">
                    {selectedWilaya ? `${deliveryFee.toLocaleString('fr-FR')} ${currency}` : 'À définir'}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-950 uppercase tracking-wider">
                    Total TTC
                  </span>
                  <span className="text-xl font-black text-stone-950 font-serif">
                    {grandTotal.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 border border-amber-400/40 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer group"
              >
                <span>Passer la commande</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paiement par Bankily, Masravi ou Seddad</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
