import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { ShopSettings } from '../types';

interface FooterProps {
  settings?: ShopSettings | null;
  onNavigate: (page: string, filter?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const wilayas = [
    'Nouakchott Ouest',
    'Nouakchott Nord',
    'Nouakchott Sud',
    'Dakhlet Nouadhibou',
    'Trarza',
    'Brakna',
    'Gorgol',
    'Assaba',
    'Guidimakha',
    'Hodh El Gharbi',
    'Hodh Ech Chargui',
    'Tagant',
    'Adrar',
    'Inchiri',
    'Tiris Zemmour',
  ];

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-amber-500/20">
      {/* Guarantees bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-stone-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4 p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Livraison Partout en Mauritanie</h4>
              <p className="text-xs text-stone-400 mt-1">
                Expédition rapide et soignée dans les 15 wilayas avec géolocalisation GPS directe.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Paiement Mobile Sécurisé</h4>
              <p className="text-xs text-stone-400 mt-1">
                Transfert simple et direct via Bankily, Masravi ou Seddad avec validation manuelle rapide.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Qualité & Authenticité</h4>
              <p className="text-xs text-stone-400 mt-1">
                Articles de mode, parfums d'exception et accessoires rigoureusement sélectionnés.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div>
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-3 cursor-pointer group mb-4"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
                <div className="w-full h-full bg-stone-950 rounded-[6px] flex items-center justify-center">
                  <span className="font-serif text-lg font-black gold-gradient-text">MG</span>
                </div>
              </div>
              <span className="font-brand text-xl font-bold tracking-wider text-white">
                MG <span className="gold-gradient-text">SHOPPING</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              Votre destination mode, parfumerie et maroquinerie haut de gamme en Mauritanie. Vêtements homme et femme, chaussures et montres livrés à domicile.
            </p>
            {/* Payment methods badges */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block">
                Moyens de paiement acceptés
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-stone-900 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold">
                  BANKILY
                </span>
                <span className="px-3 py-1 bg-stone-900 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold">
                  MASRAVI
                </span>
                <span className="px-3 py-1 bg-stone-900 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold">
                  SEDDAD
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Categories */}
          <div>
            <h4 className="font-brand text-white text-base font-semibold mb-4 tracking-wider uppercase border-b border-amber-500/30 pb-2 inline-block">
              Rayons & Collections
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('catalog', { genre: 'homme' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Mode Homme (Costumes, Chemises, T-shirts)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { genre: 'femme' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Mode Femme (Robes de soirée, Abayas, Plissés)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'parfums' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Parfumerie (Oud royal, Jasmin noir, Ambre)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'chaussures' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Chaussures & Escarpins
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'accessoires' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Accessoires (Montres, Lunettes UV, Sacs)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { promo: true })}
                  className="text-amber-400 font-medium hover:underline"
                >
                  Offres & Promotions Spéciales
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Wilayas Coverage */}
          <div>
            <h4 className="font-brand text-white text-base font-semibold mb-4 tracking-wider uppercase border-b border-amber-500/30 pb-2 inline-block">
              Livraison en Mauritanie
            </h4>
            <p className="text-xs text-stone-400 mb-3">
              Nous livrons dans l'ensemble des 15 wilayas de la République Islamique de Mauritanie :
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {wilayas.map((w, idx) => (
                <span
                  key={idx}
                  className="bg-stone-900/90 text-stone-300 border border-stone-800 px-2 py-0.5 rounded"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* Col 4: Contact & Service */}
          <div>
            <h4 className="font-brand text-white text-base font-semibold mb-4 tracking-wider uppercase border-b border-amber-500/30 pb-2 inline-block">
              Contact & Assistance
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <span className="text-xs text-stone-300">
                  {settings?.shop_address || 'Avenue Charles de Gaulle, Tevragh Zeina, Nouakchott'}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-stone-300">{settings?.shop_phone || '+222 22 24 93 77'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-stone-300">{settings?.shop_email || 'contact@mgshopping.mr'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-stone-300">7j/7 : 09h00 - 23h00</span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-stone-800 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('tracking')}
                className="text-xs text-left text-amber-400 hover:underline flex items-center gap-1"
              >
                → Suivre une commande existante
              </button>
              <button
                onClick={() => onNavigate('delivery-agent')}
                className="text-xs text-left text-stone-400 hover:text-stone-200"
              >
                → Espace Livreur
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs text-left text-stone-400 hover:text-stone-200"
              >
                → Espace Administration
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>© {new Date().getFullYear()} MG SHOPPING - Tous droits réservés. République Islamique de Mauritanie.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span>Devise : MRU (Ouguiya)</span>
            <span>Système MySQL / MySQLi & REST API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
