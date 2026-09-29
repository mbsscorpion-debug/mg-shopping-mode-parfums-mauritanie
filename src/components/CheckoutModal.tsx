import React, { useState } from 'react';
import {
  X,
  MapPin,
  Compass,
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { CartItem, DeliveryZone, ShopSettings, Order } from '../types';
import { api } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  zones: DeliveryZone[];
  settings?: ShopSettings | null;
  selectedWilaya: string;
  onSelectWilaya: (wilaya: string) => void;
  onOrderSuccess: (order: Order) => void;
  currency?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  zones,
  settings,
  selectedWilaya,
  onSelectWilaya,
  onOrderSuccess,
  currency = 'MRU',
}) => {
  if (!isOpen) return null;

  // Étapes : 1 = Coordonnées (Appel, WhatsApp, Géolocalisation), 2 = Choix Paiement (22249377), 3 = Capture Paiement, 4 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Formulaire Client : Numéro Appel, Numéro WhatsApp, Quartier, Géolocalisation
  const [telephone, setTelephone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [quartier, setQuartier] = useState('');
  const [wilaya, setWilaya] = useState(selectedWilaya || 'Nouakchott Ouest');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');

  // Paiement & Capture (Numéro de paiement officiel : 22249377)
  const officialPaymentNumber = settings?.bankily_number || '22 24 93 77';
  const [selectedMethod, setSelectedMethod] = useState<'bankily' | 'masravi' | 'seddad'>('bankily');
  const [senderNumber, setSenderNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // États de soumission
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Calculs
  const subtotal = items.reduce((sum, item) => sum + item.product.prix * item.quantity, 0);
  const activeZone = zones.find((z) => z.wilaya.toLowerCase() === wilaya.toLowerCase() && z.statut === 'active');
  const deliveryFee = activeZone ? activeZone.frais : 150;
  const grandTotal = subtotal + deliveryFee;

  // Synchroniser WhatsApp si la case est cochée
  const handlePhoneChange = (val: string) => {
    setTelephone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  // Localisation GPS via navigateur
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage('La géolocalisation n’est pas supportée par votre appareil.');
      return;
    }

    setGpsLoading(true);
    setGpsMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsLoading(false);
        setGpsMessage(`Position GPS enregistrée : ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      },
      (err) => {
        setGpsLoading(false);
        setGpsMessage(`Impossible de détecter la position automatique (${err.message}).`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Gestion du fichier de preuve
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Le fichier est trop volumineux (maximum 5 Mo)');
        return;
      }
      setErrorMsg('');
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation Étape 1 : Numéro Appel, Numéro WhatsApp, Quartier, Géolocalisation
  const handleValidateStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telephone.trim()) {
      setErrorMsg('Veuillez renseigner votre numéro d’appel.');
      return;
    }
    const finalWhatsApp = sameAsPhone ? telephone.trim() : whatsapp.trim();
    if (!finalWhatsApp) {
      setErrorMsg('Veuillez renseigner votre numéro WhatsApp.');
      return;
    }
    if (!quartier.trim()) {
      setErrorMsg('Veuillez renseigner votre quartier de livraison.');
      return;
    }
    setErrorMsg('');
    onSelectWilaya(wilaya);
    setStep(2);
  };

  // Création de la commande puis passage au téléversement de preuve
  const handleCreateOrderAndProceedToProof = async () => {
    try {
      setSubmitting(true);
      setErrorMsg('');

      const cleanPhone = telephone.trim();
      const cleanWa = sameAsPhone ? cleanPhone : (whatsapp.trim() || cleanPhone);
      const cleanQuartier = quartier.trim();

      const orderPayload = {
        customer: {
          nom_complet: `Client (${cleanPhone})`,
          telephone: cleanPhone,
          whatsapp: cleanWa,
        },
        delivery: {
          wilaya,
          commune: cleanQuartier,
          quartier: cleanQuartier,
          adresse: `${cleanQuartier}, ${wilaya}${latitude && longitude ? ` (GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)})` : ''}`,
          point_repere: '',
          latitude,
          longitude,
        },
        items: items.map((i) => ({
          id_produit: i.product.id_produit,
          nom_produit: i.product.nom,
          prix_unitaire: i.product.prix,
          quantite: i.quantity,
          taille: i.size,
          couleur: i.color,
        })),
        notes: `Paiement vers 22249377`,
      };

      const result = await api.createOrder(orderPayload);
      setCreatedOrder(result.order);
      setSenderNumber(cleanPhone);
      setSubmitting(false);
      setStep(3); // Étape Capture Paiement
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Erreur lors de la création de la commande');
    }
  };

  // Soumission finale de la preuve de paiement
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) {
      setErrorMsg('Commande manquante');
      return;
    }

    if (!proofFile) {
      setErrorMsg('Veuillez sélectionner la capture d’écran de votre virement au 22249377.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('id_commande', String(createdOrder.id_commande));
      formData.append('methode', selectedMethod);
      formData.append('montant', String(createdOrder.total));
      formData.append('numero_utilise', senderNumber || telephone);
      formData.append('capture', proofFile);

      await api.uploadPaymentProof(formData);

      setSubmitting(false);
      setStep(4); // Confirmation finale
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Erreur lors de l’envoi de la capture');
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('22249377');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const getMethodInfo = () => {
    switch (selectedMethod) {
      case 'bankily':
        return {
          name: 'Bankily (BPM)',
          number: '22 24 93 77',
          rawNumber: '22249377',
          beneficiary: 'MG SHOPPING',
        };
      case 'masravi':
        return {
          name: 'Masravi (Chinguitti Bank)',
          number: '22 24 93 77',
          rawNumber: '22249377',
          beneficiary: 'MG SHOPPING',
        };
      case 'seddad':
        return {
          name: 'Seddad (Banque Populaire)',
          number: '22 24 93 77',
          rawNumber: '22249377',
          beneficiary: 'MG SHOPPING',
        };
    }
  };

  const methodInfo = getMethodInfo();

  // Message WhatsApp prérempli
  const getWhatsAppMessage = () => {
    if (!createdOrder) return '';
    const cleanWaNumber = (settings?.shop_whatsapp || '22249377').replace(/[^0-9]/g, '');
    const text = `Bonjour MG SHOPPING,\nJe viens d'effectuer le paiement de ma commande *${createdOrder.numero_commande}* pour un montant de *${createdOrder.total} MRU* vers le *22249377*.\nNuméro d'appel: ${telephone}\nNuméro WhatsApp: ${sameAsPhone ? telephone : whatsapp}\nWilaya: ${wilaya}\nQuartier: ${quartier}\n${latitude && longitude ? `Position GPS: ${latitude}, ${longitude}\n` : ''}Voici ma capture d'écran !`;
    return `https://wa.me/${cleanWaNumber.startsWith('222') ? cleanWaNumber : '222' + cleanWaNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[94vh]">
        {/* Header with Steps */}
        <div className="p-5 sm:p-6 bg-stone-950 text-white border-b border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
              Commande Express · Mauritanie
            </span>
            <h2 className="text-base sm:text-lg font-bold font-brand tracking-wider">
              {step === 1 && '1. Numéro d’appel, WhatsApp & Géolocalisation'}
              {step === 2 && '2. Paiement vers 22249377 (Bankily / Masravi / Seddad)'}
              {step === 3 && '3. Capture Paiement 22249377'}
              {step === 4 && '4. Commande Confirmée'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ================= STEP 1: SEULEMENT NUMÉRO APPEL, NUMÉRO WHATSAPP ET GÉOLOCALISATION ================= */}
          {step === 1 && (
            <form onSubmit={handleValidateStep1} className="space-y-5">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs text-stone-800">
                <span className="font-bold block text-stone-950 mb-0.5">Commande simplifiée sans compte :</span>
                Indiquez simplement votre numéro d'appel, votre WhatsApp et partagez votre localisation pour la livraison.
              </div>

              {/* 1. Numéro d'appel */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>Numéro d'appel *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 22 24 93 77 / 36 00 00 00 / 46 00 00 00"
                  value={telephone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* 2. Numéro WhatsApp */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Numéro WhatsApp *</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) setWhatsapp(telephone);
                      }}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Même que l'appel</span>
                  </label>
                </div>

                {!sameAsPhone ? (
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 22 24 93 77"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <span>WhatsApp synchronisé : <strong>{telephone || 'En attente du numéro d’appel'}</strong></span>
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
              </div>

              {/* 3. Quartier (au lieu de Moughataa) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Quartier *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tevragh Zeina, Soukouk, Ilot C, Carrefour BMD, Ksar, Cansado..."
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  className="w-full text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* 4. Géolocalisation & Wilaya */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>Géolocalisation & Wilaya de livraison *</span>
                </label>

                {/* Bouton Partager ma localisation */}
                <div className="p-4 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white">Position GPS</span>
                      <span className="text-[11px] text-stone-400 block">
                        {latitude && longitude
                          ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                          : 'Cliquez pour partager vos coordonnées exactes'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gpsLoading}
                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>{gpsLoading ? 'Détection GPS...' : latitude ? 'Mettre à jour GPS' : 'Partager ma localisation'}</span>
                  </button>
                </div>

                {gpsMessage && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    latitude ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {latitude ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                    <span>{gpsMessage}</span>
                  </div>
                )}

                {/* Sélecteur de Wilaya pour le tarif */}
                <div className="pt-1">
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                    Wilaya pour le calcul des frais :
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => {
                      setWilaya(e.target.value);
                      onSelectWilaya(e.target.value);
                    }}
                    className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {zones.map((z) => (
                      <option key={z.id_zone} value={z.wilaya}>
                        {z.wilaya} — Frais de livraison : {z.frais} {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total Recap */}
              <div className="p-3.5 bg-stone-100 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-stone-600">Total commande ({items.length} articles + livraison) :</span>
                <span className="text-lg font-black text-stone-950 font-serif">
                  {grandTotal.toLocaleString('fr-FR')} {currency}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 border border-amber-400/40 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <span>Continuer vers le paiement</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2: PAIEMENT VERS 22249377 ================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-3">
                  Choisissez votre méthode de transfert :
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('bankily')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      selectedMethod === 'bankily'
                        ? 'border-blue-600 bg-blue-50/50 shadow-md font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="block text-sm font-black text-blue-700">BANKILY</span>
                    <span className="text-[10px] text-stone-500">BPM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('masravi')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      selectedMethod === 'masravi'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-md font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="block text-sm font-black text-emerald-700">MASRAVI</span>
                    <span className="text-[10px] text-stone-500">Chinguitti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('seddad')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      selectedMethod === 'seddad'
                        ? 'border-amber-600 bg-amber-50/50 shadow-md font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="block text-sm font-black text-amber-700">SEDDAD</span>
                    <span className="text-[10px] text-stone-500">BMS</span>
                  </button>
                </div>
              </div>

              {/* Instructions de transfert : 22249377 */}
              <div className="p-6 rounded-3xl bg-stone-950 text-white border border-amber-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    Paiement {methodInfo.name}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Bénéficiaire : MG SHOPPING</span>
                </div>

                <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                      Numéro de paiement officiel :
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-widest">
                      22 24 93 77
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center gap-1.5 text-xs font-bold"
                    title="Copier le numéro"
                  >
                    {copiedNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNumber ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-stone-300">Montant exact à transférer :</span>
                  <span className="text-2xl font-black text-white font-serif">
                    {grandTotal.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>

                <p className="text-xs text-stone-400 pt-2 border-t border-stone-800">
                  Ouvrez votre application <strong>{selectedMethod.toUpperCase()}</strong>, envoyez{' '}
                  <strong className="text-amber-400">{grandTotal} {currency}</strong> au numéro{' '}
                  <strong className="text-white">22 24 93 77</strong>, puis effectuez une capture d'écran du reçu.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  ← Retour coordonnées
                </button>

                <button
                  type="button"
                  onClick={handleCreateOrderAndProceedToProof}
                  disabled={submitting}
                  className="px-6 py-3.5 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 border border-amber-400/40 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>{submitting ? 'Préparation...' : 'J’ai payé, envoyer la capture'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: CAPTURE PAIEMENT 22249377 ================= */}
          {step === 3 && (
            <form onSubmit={handleSubmitProof} className="space-y-5">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-500 block">N° Commande :</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {createdOrder?.numero_commande}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block">Virement vers :</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">
                    22 24 93 77
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                  Numéro ayant effectué le paiement (Bankily / Masravi / Seddad) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 36 12 34 56 ou 22 24 93 77"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Upload area : CAPTURE PAIEMENT 22249377 */}
              <div>
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>CAPTURE PAIEMENT 22249377 ({selectedMethod.toUpperCase()}) *</span>
                </label>

                <div className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-6 text-center bg-stone-50 transition-colors">
                  <input
                    type="file"
                    id="capture-file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {proofPreview ? (
                    <div className="flex flex-col items-center space-y-3">
                      <img
                        src={proofPreview}
                        alt="Aperçu reçu"
                        className="max-h-52 rounded-xl object-contain border border-stone-200 shadow-md"
                      />
                      <label
                        htmlFor="capture-file"
                        className="text-xs text-amber-600 font-bold hover:underline cursor-pointer"
                      >
                        Changer la capture d'écran
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="capture-file" className="cursor-pointer block space-y-2">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-stone-900 block">
                        Cliquez ici pour sélectionner votre capture de paiement (22249377)
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Formats acceptés : JPG, PNG, WEBP (Maximum 5 Mo)
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !proofFile}
                  className="w-full py-4 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 border border-amber-400/40 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{submitting ? 'Envoi en cours...' : 'Valider et envoyer la capture de paiement'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 4: CONFIRMATION ================= */}
          {step === 4 && createdOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-950 font-brand">
                  Commande transmise avec succès !
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Votre capture de paiement vers le <strong>22249377</strong> a été reçue et est en cours de vérification.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-100 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Numéro de commande :</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {createdOrder.numero_commande}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Numéro d'appel :</span>
                  <span className="font-semibold text-stone-900">{telephone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Numéro WhatsApp :</span>
                  <span className="font-semibold text-stone-900">{sameAsPhone ? telephone : whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Wilaya de livraison :</span>
                  <span className="font-semibold text-stone-900">{wilaya}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Quartier :</span>
                  <span className="font-semibold text-stone-900">{quartier}</span>
                </div>
                {latitude && longitude && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Géolocalisation GPS :</span>
                    <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Montant total :</span>
                  <span className="font-bold text-stone-950 font-serif">
                    {createdOrder.total.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>
              </div>

              {/* Bouton WhatsApp direct */}
              <div className="pt-2 max-w-md mx-auto">
                <a
                  href={getWhatsAppMessage()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Envoyer la confirmation sur WhatsApp (22249377)</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50"
                >
                  Retourner à la boutique
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
