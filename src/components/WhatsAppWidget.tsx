import React, { useState } from 'react';
import { MessageSquare, Phone, X } from 'lucide-react';
import { ShopSettings } from '../types';

interface WhatsAppWidgetProps {
  settings?: ShopSettings | null;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);

  const phone = settings?.shop_whatsapp || '+222 22 24 93 77';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const quickMessages = [
    'Bonjour, je souhaite des informations sur un produit.',
    'Bonjour, comment se passe la livraison à Nouakchott / en région ?',
    'Bonjour, j’ai une question concernant le paiement Bankily / Masravi.',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                MG
              </div>
              <div>
                <h4 className="text-sm font-bold">Service Client MG</h4>
                <p className="text-[10px] text-emerald-100">En ligne · Réponse rapide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-2 bg-stone-50 text-xs">
            <p className="text-stone-600">
              Besoin d'aide pour votre commande ou question sur nos vêtements, parfums et souliers ?
            </p>

            <div className="space-y-1.5 pt-2">
              {quickMessages.map((msg, idx) => (
                <a
                  key={idx}
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors text-[11px]"
                >
                  "{msg}"
                </a>
              ))}
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center block shadow transition-colors"
              >
                Ouvrir discussion WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-500 flex items-center justify-center transition-transform hover:scale-105"
        title="Contacter le service client sur WhatsApp"
      >
        <MessageSquare className="w-7 h-7" />
      </button>
    </div>
  );
};
