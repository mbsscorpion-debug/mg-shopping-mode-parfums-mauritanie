import React, { useState, useEffect } from 'react';
import { Truck, Phone, MessageSquare, MapPin, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

interface DeliveryPortalProps {
  currency?: string;
}

export const DeliveryPortal: React.FC<DeliveryPortalProps> = ({ currency = 'MRU' }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getDeliveryAgentOrders();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleMarkDelivered = async (id: number) => {
    if (!confirm('Confirmez-vous avoir remis ce colis au client en main propre ?')) return;
    try {
      await api.markOrderDelivered(id);
      await loadOrders();
      alert('Colis marqué comme livré avec succès !');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-stone-950 text-white p-6 rounded-3xl border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-brand tracking-wider">
              Espace Livreur MG SHOPPING
            </h1>
            <p className="text-xs text-stone-400">
              Tournée de livraison Mauritanie · {orders.length} colis assigné(s)
            </p>
          </div>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 rounded-xl bg-stone-900 text-stone-300 hover:text-white"
          title="Actualiser"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-2">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-stone-900">Aucune livraison en attente</h3>
          <p className="text-xs text-stone-500">Toutes les commandes assignées ont été traitées.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const cleanPhone = (ord.client?.telephone || '').replace(/[^0-9]/g, '');
            const cleanWa = (ord.client?.whatsapp || ord.client?.telephone || '').replace(/[^0-9]/g, '');

            return (
              <div
                key={ord.id_commande}
                className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {ord.numero_commande}
                    </span>
                    <span className="block text-[11px] text-stone-400">
                      Montant : <strong className="text-stone-900">{ord.total} {currency}</strong>
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    ord.statut_commande === 'livree'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {ord.statut_commande === 'livree' ? 'Livrée' : 'En cours de livraison'}
                  </span>
                </div>

                {/* Client info & actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 uppercase font-bold text-[10px] block mb-1">
                      Destinataire
                    </span>
                    <p className="font-bold text-stone-900 text-sm">{ord.client?.nom_complet}</p>
                    <p className="text-stone-600 mt-0.5">{ord.client?.telephone}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="px-3 py-1.5 rounded-xl bg-stone-950 text-white font-bold text-[11px] flex items-center gap-1.5 shadow"
                      >
                        <Phone className="w-3 h-3 text-amber-400" />
                        <span>Appeler</span>
                      </a>

                      <a
                        href={`https://wa.me/${cleanWa}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1.5 shadow"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div>
                    <span className="text-stone-400 uppercase font-bold text-[10px] block mb-1">
                      Adresse de livraison
                    </span>
                    <p className="font-bold text-amber-700">
                      Wilaya : {ord.adresse?.wilaya}
                    </p>
                    <p className="text-stone-900 font-semibold text-xs mt-0.5">
                      Quartier : {ord.adresse?.quartier || ord.adresse?.commune || '-'}
                    </p>

                    {ord.adresse?.latitude && ord.adresse?.longitude && (
                      <div className="mt-3">
                        <a
                          href={`https://www.google.com/maps?q=${ord.adresse.latitude},${ord.adresse.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Itinéraire Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mark as delivered action */}
                {ord.statut_commande !== 'livree' && (
                  <div className="pt-3 border-t border-stone-100 flex justify-end">
                    <button
                      onClick={() => handleMarkDelivered(ord.id_commande)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Marquer comme livrée</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
