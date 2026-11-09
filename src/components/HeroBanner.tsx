import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle, ArrowRight, ShieldCheck, Truck, Smartphone, CheckCircle } from 'lucide-react';

interface HeroBannerProps {
  onSelectCategory: (category: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  const { settings } = useStore();

  let cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);

  const categories = settings.categories || ['Mobile LCDs', 'Mobile LEDs', 'OLED Screens', 'Mobile Accessories'];

  return (
    <div className="bg-gradient-to-b from-white via-slate-50/60 to-white border-b border-slate-200 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold tracking-wide">
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            <span>Official AS Empire Store</span>
          </div>

          {/* Heading */}
          <h1 className="font-empire text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {settings.storeName || 'AS Empire'} – Premium Mobile Displays & Screens
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {settings.tagline || 'Wholesale and retail Mobile LCDs, Mobile LEDs, OLED Screens, and mobile phone accessories across Pakistan.'} Direct order coordination on WhatsApp.
          </p>

          {/* Category Quick Links */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-amber-400 text-xs font-semibold shadow-sm transition-all"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Assalam-o-Alaikum AS Empire! I am inquiring about mobile display screens and accessories.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Owner on WhatsApp</span>
            </a>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Nationwide Courier Dispatch (TCS / Leopards)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Tested & Verified Display Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>EasyPaisa, JazzCash & Bank Transfer</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
