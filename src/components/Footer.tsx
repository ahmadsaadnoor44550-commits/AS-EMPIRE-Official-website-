import React from 'react';
import { useStore } from '../context/StoreContext';
import { Crown, MessageCircle, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenOwnerPortal: () => void;
  onSelectCategory: (cat: string) => void;
  onOpenTracking: () => void;
  onOpenCustomerAuth: (mode?: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenOwnerPortal,
  onSelectCategory,
  onOpenTracking,
  onOpenCustomerAuth,
}) => {
  const { settings } = useStore();

  let cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);

  const categories = settings.categories || ['Mobile LCDs', 'Mobile LEDs', 'OLED Screens', 'Mobile Accessories'];

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700">
                <Crown className="w-4 h-4" />
              </div>
              <span className="font-empire text-lg font-black text-slate-900 tracking-wide">
                {settings.storeName || 'SAAD TRADING COMPANY'}
              </span>
            </div>

            <p className="text-slate-500 leading-relaxed text-xs">
              {settings.aboutText ||
                'SAAD TRADING COMPANY provides tested Mobile LCDs, LEDs, OLED Screens, and mobile accessories across Pakistan. Order directly with personalized WhatsApp verification.'}
            </p>

            <div className="pt-1 space-y-1.5 text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>WhatsApp: <strong>{settings.whatsappNumber || '03330916398'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{settings.contactEmail || 'ahmadsaadnoor44550@gmail.com'}</span>
              </div>
              {settings.businessAddress && (
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{settings.businessAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-900 text-xs">
              Business Categories
            </h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-700 transition-colors text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-900 text-xs">
              Customer Services
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-amber-700 transition-colors"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCustomerAuth('register')}
                  className="hover:text-amber-700 transition-colors"
                >
                  Create Customer Account
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 transition-colors"
                >
                  WhatsApp Inquiries & Orders
                </a>
              </li>
              <li>
                <span className="text-slate-500">Nationwide TCS / Leopards Courier</span>
              </li>
            </ul>
          </div>

          {/* Payment info */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-900 text-xs">
              Payment Methods
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Payments are arranged directly on WhatsApp with the seller. We support:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                EasyPaisa
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                JazzCash
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-center col-span-2">
                Bank Transfer (Any Pakistani Bank)
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {settings.storeName || 'SAAD TRADING COMPANY'}. All Rights Reserved.
            {/* Discreet secret trigger for owner on the dot */}
            <span 
              onClick={onOpenOwnerPortal} 
              className="cursor-default select-none text-slate-400 hover:text-slate-600 ml-1"
              title=""
            >
              •
            </span>
          </span>
          <span>Prices in Pakistani Rupees (PKR)</span>
        </div>
      </div>
    </footer>
  );
};
