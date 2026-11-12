import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle, ShieldCheck, Phone } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();

  const cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');

  return (
    <div className="bg-slate-50 border-b border-slate-200 text-xs py-2 px-4 text-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-medium text-slate-800">
            {settings.announcement || 'Welcome to SAAD TRADING COMPANY – Mobile LCDs, LEDs, OLED Screens & Accessories.'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="hidden md:inline-flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Advance Payment Only: EasyPaisa • JazzCash • Bank Transfer
          </span>
          <a
            href={`https://wa.me/${cleanPhone.startsWith('03') ? '92' + cleanPhone.slice(1) : cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-semibold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp: <strong className="text-slate-900">{settings.whatsappNumber || '03330916398'}</strong></span>
          </a>
        </div>
      </div>
    </div>
  );
};
