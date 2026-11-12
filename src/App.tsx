import React, { useState, useMemo, useEffect } from 'react';
import { useStore, StoreProvider } from './context/StoreContext';
import { useAuth, AuthProvider } from './context/AuthContext';
import { Product } from './types';
import { formatPKR } from './data/constants';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { WishlistModal } from './components/WishlistModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { OwnerAuthModal } from './components/admin/OwnerAuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerAuthModal } from './components/customer/CustomerAuthModal';
import { CustomerAccountModal } from './components/customer/CustomerAccountModal';
import { 
  ArrowUpDown, 
  ShieldCheck,
  Truck,
  Smartphone,
  MessageCircle,
  Bell,
  X as XIcon,
  CheckCircle2
} from 'lucide-react';

function StorefrontApp() {
  const { products, loadingProducts, settings, orderStatusNotice, clearStatusNotice } = useStore();
  const { isOwner, currentUser } = useAuth();

  // Navigation View Mode
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Modals
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingIdToPreload, setTrackingIdToPreload] = useState('');
  const [ownerAuthOpen, setOwnerAuthOpen] = useState(false);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
  const [customerAuthMode, setCustomerAuthMode] = useState<'login' | 'register'>('login');
  const [customerAccountOpen, setCustomerAccountOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [authPromptMessage, setAuthPromptMessage] = useState<string>('');

  // Order Success Screen
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successWhatsappUrl, setSuccessWhatsappUrl] = useState<string | null>(null);

  // Owner Secret URL Routing: When owner opens website with /admin, #admin, #/admin, or ?admin=true
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isPathAdmin = path === '/admin' || path.startsWith('/admin/');
      const isHashAdmin = hash === '#admin' || hash === '#/admin';
      const isQueryAdmin = search.includes('admin=true') || search.includes('admin=1');

      if (isPathAdmin || isHashAdmin || isQueryAdmin) {
        if (isOwner) {
          setViewMode('admin');
        } else {
          setOwnerAuthOpen(true);
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    // Optional keyboard shortcut: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isOwner) {
          setViewMode('admin');
        } else {
          setOwnerAuthOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOwner]);

  // Synchronize dynamic browser title with customized store name & owner
  useEffect(() => {
    const storeName = settings.storeName || 'SAAD TRADING COMPANY';
    const ownerName = settings.ownerName || 'Ahmad Saad';
    document.title = `${storeName} – Official Store | ${ownerName}`;
  }, [settings.storeName, settings.ownerName]);

  // Filtered and Sorted Products
  const displayedProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (inStockOnly) {
      list = list.filter((p) => p.isAvailable && p.stock > 0);
    }

    list.sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'discount') {
        const discA = a.discountPrice ? a.price - a.discountPrice : 0;
        const discB = b.discountPrice ? b.price - b.discountPrice : 0;
        return discB - discA;
      }
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    return list;
  }, [products, selectedCategory, searchQuery, inStockOnly, sortBy]);

  const handleOpenOwnerPortal = () => {
    if (isOwner) {
      setViewMode('admin');
    } else {
      setOwnerAuthOpen(true);
    }
  };

  const handleOpenCustomerAuth = (mode: 'login' | 'register' = 'login', prompt: string = '') => {
    setAuthPromptMessage(prompt);
    setCustomerAuthMode(mode);
    setCustomerAuthOpen(true);
  };

  const handleRequireCustomerAuth = (message: string = 'Please register or sign in to continue shopping.') => {
    handleOpenCustomerAuth('login', message);
  };

  const handleDirectBuy = (product: Product) => {
    if (!currentUser) {
      handleRequireCustomerAuth('Please register or sign in to purchase this product.');
      return;
    }
    setCheckoutOpen(true);
  };

  // If in admin mode and verified as owner, render Admin Dashboard
  if (viewMode === 'admin' && isOwner) {
    return <AdminDashboard onReturnToStore={() => setViewMode('customer')} />;
  }

  let cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Header */}
      <Header
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenTracking={() => {
          setTrackingIdToPreload('');
          setTrackingOpen(true);
        }}
        onOpenOwnerPortal={handleOpenOwnerPortal}
        onOpenCustomerAuth={handleOpenCustomerAuth}
        onOpenCustomerAccount={() => setCustomerAccountOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Real-time Order Status Change Notification Banner */}
      {orderStatusNotice && (
        <div className="sticky top-20 z-30 bg-amber-500 text-white shadow-md animate-fadeIn px-4 py-3 border-b border-amber-600">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-white animate-bounce" />
              </div>
              <div className="text-xs sm:text-sm font-medium">
                <strong className="font-bold underline mr-1.5">Order #{orderStatusNotice.orderId}:</strong>
                {orderStatusNotice.message}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCustomerAccountOpen(true);
                  clearStatusNotice();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-sm cursor-pointer"
              >
                View in My Orders
              </button>
              <button
                onClick={clearStatusNotice}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Dismiss"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Pure White Hero Banner */}
      {!searchQuery && selectedCategory === 'All' && (
        <HeroBanner onSelectCategory={(cat) => setSelectedCategory(cat)} />
      )}

      {/* 4. Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700 block">
              {selectedCategory === 'All' ? 'Available Inventory' : selectedCategory}
            </span>
            <h2 className="font-empire text-2xl sm:text-3xl font-black text-slate-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory === 'All' ? 'Mobile Displays & Accessories' : selectedCategory}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {displayedProducts.length} items • Direct WhatsApp order placement in Pakistani Rupees (PKR)
            </p>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discounts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid / Empty State */}
        {loadingProducts ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500">Loading catalog...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-sm">
              <Smartphone className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="font-empire text-lg font-bold text-slate-900">
              {products.length === 0 ? 'Stock Updating' : 'No Matching Products'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {products.length === 0
                ? `Welcome to ${settings.storeName || 'SAAD TRADING COMPANY'}. We are updating our stock of Mobile LCDs, LEDs, and OLED Screens. Inquire directly on WhatsApp for immediate availability.`
                : 'Try clearing your search terms or selecting another category.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {products.length === 0 ? (
                isOwner ? (
                  <button
                    onClick={handleOpenOwnerPortal}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm"
                  >
                    Open Owner Dashboard to Add Products
                  </button>
                ) : (
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Assalam-o-Alaikum ${settings.storeName || 'SAAD TRADING COMPANY'}! I am looking for a mobile display screen/accessory.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                )
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setInStockOnly(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setSelectedProductDetails(p)}
                onDirectBuy={() => handleDirectBuy(product)}
                onRequireAuth={handleRequireCustomerAuth}
              />
            ))}
          </div>
        )}

        {/* Business WhatsApp & Direct Order Section */}
        <section className="mt-16 p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-amber-800 tracking-wider block">
                Direct WhatsApp Service
              </span>
              <h3 className="font-empire text-2xl font-bold text-slate-900 leading-snug">
                Verified Displays & Screen Replacements
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with SAAD TRADING COMPANY on WhatsApp to verify display model compatibility, check bulk wholesale rates, or place express retail orders.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
                <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong className="text-slate-900 block">Nationwide Delivery</strong>
                  <span className="text-slate-500">Express delivery to Lahore, Karachi, Rawalpindi, Islamabad & all Pakistani cities</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-slate-900 block">Easy Payment Discussion</strong>
                  <span className="text-slate-500">Pay directly via EasyPaisa, JazzCash, or Bank Transfer upon WhatsApp confirmation</span>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-right space-y-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Assalam-o-Alaikum ${settings.storeName || 'SAAD TRADING COMPANY'}! I am interested in placing an order for mobile screens.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Owner on WhatsApp</span>
              </a>
              <p className="text-[11px] text-slate-500">
                Direct Number: <strong className="text-slate-800">{settings.whatsappNumber || '03330916398'}</strong>
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* 5. Footer */}
      <Footer
        onOpenOwnerPortal={handleOpenOwnerPortal}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenTracking={() => {
          setTrackingIdToPreload('');
          setTrackingOpen(true);
        }}
        onOpenCustomerAuth={handleOpenCustomerAuth}
      />

      {/* 6. Floating WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Modals */}
      <ProductDetailsModal
        product={selectedProductDetails}
        onClose={() => setSelectedProductDetails(null)}
        onProceedToCheckout={() => {
          if (selectedProductDetails) {
            handleDirectBuy(selectedProductDetails);
          } else {
            setCheckoutOpen(true);
          }
        }}
        onRequireAuth={handleRequireCustomerAuth}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onOpenCheckout={() => setCheckoutOpen(true)}
        onRequireAuth={handleRequireCustomerAuth}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={(orderId, whatsappUrl) => {
          setSuccessOrderId(orderId);
          setSuccessWhatsappUrl(whatsappUrl);
        }}
      />

      <OrderSuccessModal
        orderId={successOrderId}
        whatsappUrl={successWhatsappUrl}
        onClose={() => setSuccessOrderId(null)}
        onTrackOrder={(id) => {
          setTrackingIdToPreload(id);
          setTrackingOpen(true);
        }}
      />

      <OrderTrackingModal
        isOpen={trackingOpen}
        onClose={() => setTrackingOpen(false)}
        initialOrderId={trackingIdToPreload}
      />

      <WishlistModal
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onOpenProduct={(p) => setSelectedProductDetails(p)}
      />

      {/* Private Owner Auth Modal */}
      <OwnerAuthModal
        isOpen={ownerAuthOpen}
        onClose={() => setOwnerAuthOpen(false)}
        onSuccess={() => setViewMode('admin')}
      />

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={customerAuthOpen}
        onClose={() => {
          setCustomerAuthOpen(false);
          setAuthPromptMessage('');
        }}
        initialMode={customerAuthMode}
        promptMessage={authPromptMessage}
      />

      {/* Customer Account Modal */}
      <CustomerAccountModal
        isOpen={customerAccountOpen}
        onClose={() => setCustomerAccountOpen(false)}
        onTrackOrder={(id) => {
          setTrackingIdToPreload(id);
          setTrackingOpen(true);
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <StorefrontApp />
      </StoreProvider>
    </AuthProvider>
  );
}
