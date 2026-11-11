import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();

  let cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Assalam-o-Alaikum SAAD TRADING COMPANY! I am inquiring about product availability.')}`;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3.5 sm:p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white"
        aria-label="WhatsApp Owner"
        title="Chat with SAAD TRADING COMPANY Owner on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>
    </div>
  );
};
