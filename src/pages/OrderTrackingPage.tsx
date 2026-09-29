import React, { useState } from 'react';
import {
  Search,
  Compass,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  XCircle,
  MapPin,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';

interface OrderTrackingPageProps {
  currency?: string;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ currency = 'MRU' }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setErrorMsg('Veuillez renseigner le numéro de commande et votre numéro de téléphone.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const data = await api.trackOrder(orderNumber.trim(), phone.trim());
      setOrder(data);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Impossible de trouver cette commande. Vérifiez vos identifiants.');
    }
  };

  // Les 7 étapes canoniques de suivi
  const timelineSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'en_attente_paiement', label: 'Commande reçue', desc: 'Commande enregistrée dans le système' },
    { key: 'paiement_a_verifier', label: 'Paiement à vérifier', desc: 'Preuve de paiement reçue, en attente d’audit' },
    { key: 'paiement_confirme', label: 'Paiement confirmé', desc: 'Virement validé par l’administration' },
    { key: 'en_preparation', label: 'Préparation', desc: 'Colis en cours d’emballage' },
    { key: 'prete_a_livrer', label: 'Prête à livrer', desc: 'Colis confié au service de livraison' },
    { key: 'en_livraison', label: 'En livraison', desc: 'Le livreur est en route vers votre adresse' },
    { key: 'livree', label: 'Livrée', desc: 'Colis remis en main propre' },
  ];

  // Calculer l'indice de progression
  const getStepIndex = (status: OrderStatus): number => {
    if (status === 'confirmee') return 2;
    const idx = timelineSteps.findIndex((s) => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentStepIdx = order ? getStepIndex(order.statut_commande) : -1;
  const isFailed = order?.statut_commande === 'paiement_refuse' || order?.statut_commande === 'annulee';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
          <Compass className="w-3.5 h-3.5" />
          <span>Suivi en temps réel</span>
        </div>
        <h1 className="text-3xl font-black text-stone-950 font-brand">
          Suivre ma commande
        </h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Consultez l'avancement de votre commande, la vérification de votre virement Bankily/Masravi/Seddad et l'état de votre livraison.
        </p>
      </div>

      {/* Formulaire de recherche */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-md">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Numéro de commande *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: MG-2026-000001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full text-xs font-mono uppercase bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Numéro de téléphone utilisé *
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: 36 12 34 56 / 46 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Recherche en cours...' : 'Rechercher la commande'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Résultat & Timeline */}
      {order && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-lg overflow-hidden animate-in fade-in duration-300">
          {/* Top Banner */}
          <div className="p-6 bg-stone-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-500/30">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-0.5">
                Commande Mauritanie
              </span>
              <h2 className="text-xl font-bold font-mono text-white">
                {order.numero_commande}
              </h2>
              <p className="text-xs text-stone-400">
                Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-400 block">Montant Total :</span>
              <span className="text-xl font-black text-amber-400 font-serif">
                {order.total.toLocaleString('fr-FR')} {currency}
              </span>
            </div>
          </div>

          {/* Special Failed Alert */}
          {isFailed && (
            <div className="m-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">
                  {order.statut_commande === 'paiement_refuse' ? 'Paiement non validé' : 'Commande annulée'}
                </h4>
                <p className="text-xs mt-1">
                  {order.paiement?.raison_refus ||
                    'La preuve de paiement fournie n’a pas pu être validée par l’administration. Veuillez contacter notre service client sur WhatsApp avec votre reçu.'}
                </p>
              </div>
            </div>
          )}

          {/* Timeline Visual Progress */}
          <div className="p-6 sm:p-8 border-b border-stone-100">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-6">
              Progression de la commande
            </h3>

            <div className="space-y-6">
              {timelineSteps.map((s, idx) => {
                const isPassed = !isFailed && idx <= currentStepIdx;
                const isCurrent = !isFailed && idx === currentStepIdx;

                return (
                  <div key={s.key} className="flex items-start gap-4 relative">
                    {/* Connecting vertical line */}
                    {idx < timelineSteps.length - 1 && (
                      <div
                        className={`absolute left-4 top-8 -bottom-4 w-0.5 ${
                          !isFailed && idx < currentStepIdx ? 'bg-amber-500' : 'bg-stone-200'
                        }`}
                      ></div>
                    )}

                    {/* Step Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                        isPassed
                          ? 'bg-amber-500 text-stone-950 font-bold shadow'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isCurrent ? 'text-amber-700' : isPassed ? 'text-stone-900' : 'text-stone-400'
                          }`}
                        >
                          {s.label}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold animate-pulse">
                            Étape en cours
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details & Delivery Info */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-stone-50">
            {/* Delivery address & GPS */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Adresse de livraison</span>
              </h4>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                <p className="font-bold text-stone-900">Numéro d'appel : {order.client?.telephone}</p>
                <p className="text-emerald-700 font-semibold">WhatsApp : {order.client?.whatsapp || order.client?.telephone}</p>
                <p className="text-stone-600 font-semibold text-amber-800">
                  Wilaya de livraison : {order.adresse?.wilaya}
                </p>
                {order.adresse?.quartier && (
                  <p className="text-stone-600">Quartier : {order.adresse?.quartier}</p>
                )}
                {order.adresse?.point_repere && (
                  <p className="text-stone-600">Repère : {order.adresse?.point_repere}</p>
                )}

                {order.adresse?.latitude && order.adresse?.longitude && (
                  <div className="pt-2 mt-2 border-t border-stone-100">
                    <a
                      href={`https://www.google.com/maps?q=${order.adresse.latitude},${order.adresse.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-amber-600 hover:underline font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Voir la position GPS exacte</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Articles Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Articles commandés ({order.items?.length || 0})</span>
              </h4>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs space-y-2">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-stone-100 last:border-0">
                    <div>
                      <span className="font-semibold text-stone-900 block truncate max-w-[200px]">
                        {it.nom_produit}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Qté: {it.quantite} {it.taille ? `· Taille: ${it.taille}` : ''}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900 font-serif">
                      {it.total.toLocaleString('fr-FR')} {currency}
                    </span>
                  </div>
                ))}

                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold">
                  <span>Frais de livraison :</span>
                  <span>{order.frais_livraison} {currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
