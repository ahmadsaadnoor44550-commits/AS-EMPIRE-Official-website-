import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../data/constants';
import { 
  X, 
  ShoppingBag, 
  MessageCircle, 
  Heart, 
  Check, 
  Truck, 
  ShieldCheck, 
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onProceedToCheckout,
}) => {
  const { addToCart, isInWishlist, toggleWishlist, settings } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [];
  const isFavorited = isInWishlist(product.id);
  const currentPrice = product.discountPrice ?? product.price;
  const inStock = product.isAvailable && product.stock > 0;
  const isLowStock = inStock && product.stock <= 5;

  let cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    onClose();
    onProceedToCheckout();
  };

  const handleWhatsAppOrder = () => {
    const totalItemPrice = currentPrice * quantity;
    const storeTitle = settings.storeName || 'SAAD TRADING COMPANY';
    const msg = 
`📱 *${storeTitle.toUpperCase()} – ORDER INQUIRY*
─────────────────────
*Item:* ${product.name}
*Category:* ${product.category}
*Quantity:* ${quantity}
*Price Per Unit:* Rs. ${currentPrice.toLocaleString('en-PK')} PKR
*Total Amount:* Rs. ${totalItemPrice.toLocaleString('en-PK')} PKR
─────────────────────
Assalam-o-Alaikum ${storeTitle}! I want to order this product. Please share delivery timeframe and payment details (EasyPaisa / JazzCash / Bank Transfer).`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh] z-10 my-4 sm:my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Images */}
          <div className="p-4 sm:p-6 bg-slate-50 flex flex-col gap-3 sm:gap-4 border-b md:border-b-0 md:border-r border-slate-200">
            <div 
              onClick={() => {
                if (images.length > 0) {
                  setZoomLevel(1);
                  setIsZoomOpen(true);
                }
              }}
              className="relative aspect-square w-full rounded-2xl bg-white border border-slate-200 p-4 flex items-center justify-center overflow-hidden cursor-zoom-in group select-none"
            >
              {images.length > 0 ? (
                <>
                  <img
                    src={images[selectedImageIndex] || images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/85 text-white text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-sm pointer-events-none shadow-md">
                    <Maximize2 className="w-3 h-3 text-amber-400" />
                    <span>Tap photo to zoom (Mobile)</span>
                  </div>
                </>
              ) : (
                <div className="text-slate-300 flex flex-col items-center gap-2">
                  <Smartphone className="w-12 h-12" />
                  <span className="text-xs">No image provided</span>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`absolute top-4 right-4 p-2.5 rounded-full transition-all z-10 ${
                  isFavorited ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400 hover:text-slate-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail switcher */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 p-1 bg-white shrink-0 transition-all ${
                      selectedImageIndex === idx ? 'border-amber-600' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Quality badges */}
            <div className="mt-auto pt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Nationwide Express</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Quality Tested</span>
              </div>
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="p-4 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
            <div className="space-y-4">
              
              {/* Category & Stock */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">
                  {product.category}
                </span>

                <div>
                  {!inStock ? (
                    <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold">
                      Only {product.stock} Units Left
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      In Stock ({product.stock} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {formatPKR(currentPrice)}
                </span>
                {product.discountPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPKR(product.price)}
                  </span>
                )}
                <span className="text-xs font-bold text-slate-500 ml-auto uppercase">
                  Pakistani Rupees (PKR)
                </span>
              </div>

              {/* Quantity Selector */}
              {inStock && (
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    Quantity:
                  </span>
                  <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-1 text-slate-700 hover:bg-slate-200 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-xs font-bold text-slate-900 min-w-[32px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3.5 py-1 text-slate-700 hover:bg-slate-200 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-600">
                    Total: <strong className="text-slate-900">{formatPKR(currentPrice * quantity)}</strong>
                  </span>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Description:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-h-36 overflow-y-auto">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Specifications:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">{k}</span>
                        <span className="font-semibold text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Payment is arranged directly with the seller on WhatsApp via <strong>EasyPaisa, JazzCash, or Bank Transfer</strong>.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    !inStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>Buy Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp Directly</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Fullscreen Mobile Photo Zoom Lightbox Modal */}
      {isZoomOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[70] bg-black/95 flex flex-col justify-between p-3 sm:p-6 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10 z-10">
            <div>
              <h4 className="text-sm font-bold truncate max-w-[220px] sm:max-w-md">{product.name}</h4>
              <p className="text-[11px] text-amber-400">
                Photo {selectedImageIndex + 1} of {images.length} • Zoom: {Math.round(zoomLevel * 100)}%
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.5, 3))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.5, 1))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Zoomable Image Center Area */}
          <div className="flex-1 relative flex items-center justify-center overflow-auto p-2">
            {images.length > 1 && (
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 z-10 border border-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[75vh] max-w-[90vw] object-contain transition-transform duration-200 cursor-zoom-in"
                onClick={() => setZoomLevel((prev) => (prev < 2 ? prev + 0.5 : 1))}
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 z-10 border border-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setZoomLevel(1);
                }}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 p-1 bg-white shrink-0 transition-all ${
                  selectedImageIndex === idx ? 'border-amber-400 scale-105' : 'border-white/30 opacity-60'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
