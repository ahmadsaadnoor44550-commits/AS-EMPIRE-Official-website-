import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Crown, 
  Menu, 
  X, 
  Shield, 
  PackageSearch,
  MessageCircle,
  User
} from 'lucide-react';
import { formatPKR } from '../data/constants';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenTracking: () => void;
  onOpenOwnerPortal: () => void;
  onOpenCustomerAuth: (mode?: 'login' | 'register') => void;
  onOpenCustomerAccount: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenWishlist,
  onOpenTracking,
  onOpenOwnerPortal,
  onOpenCustomerAuth,
  onOpenCustomerAccount,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const { cartTotalCount, cartSubtotal, wishlist, settings } = useStore();
  const { isOwner, currentUser, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  let cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);

  const categories = settings.categories || ['Mobile LCDs', 'Mobile LEDs', 'OLED Screens', 'Mobile Accessories'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
          
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-amber-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div 
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-empire text-xl sm:text-2xl font-black tracking-wide text-slate-900">
                AS <span className="gold-text font-black">EMPIRE</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                Mobile Displays & Accessories
              </span>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Mobile LCDs, LEDs, OLED Screens, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Customer Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* WhatsApp Contact */}
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Assalam-o-Alaikum AS Empire! I am inquiring about product availability.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            {/* Track Order */}
            <button
              onClick={onOpenTracking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all"
              title="Track Order Status"
            >
              <PackageSearch className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Track</span>
            </button>

            {/* Customer Account Button (Sign In or My Account) */}
            {currentUser && !isOwner ? (
              <button
                onClick={onOpenCustomerAccount}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-semibold transition-all"
              >
                <User className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline truncate max-w-[100px]">{userProfile?.fullName || 'My Account'}</span>
              </button>
            ) : !isOwner ? (
              <button
                onClick={() => onOpenCustomerAuth('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            ) : null}

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-rose-600 transition-all"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-[17px] text-[10px] font-bold text-white bg-rose-600 rounded-full px-1">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-[16px] text-[9px] font-black text-slate-950 bg-amber-400 rounded-full px-1">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline">{formatPKR(cartSubtotal)}</span>
            </button>

            {/* ONLY visible if the owner is already signed in */}
            {isOwner && (
              <button
                onClick={onOpenOwnerPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 border border-amber-600 text-white shadow-sm"
                title="Owner Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Owner Dashboard</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search LCDs, LEDs, OLEDs, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Navigation Strip */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-11 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500 font-medium shrink-0 text-[11px]">
            <span>Currency: <strong>Pakistani Rupees (Rs. PKR)</strong></span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-5 space-y-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
              Categories
            </span>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                selectedCategory === 'All' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                  selectedCategory === cat ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2">
            {!currentUser ? (
              <button
                onClick={() => {
                  onOpenCustomerAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>Customer Sign In / Register</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenCustomerAccount();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>My Customer Profile & Orders</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenTracking();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <PackageSearch className="w-4 h-4 text-slate-500" />
              <span>Track Order</span>
            </button>

            {isOwner && (
              <button
                onClick={() => {
                  onOpenOwnerPortal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600"
              >
                <Shield className="w-4 h-4" />
                <span>Owner Dashboard</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
