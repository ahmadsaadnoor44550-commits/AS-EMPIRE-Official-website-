import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR } from '../data/constants';
import { ShoppingBag, Heart, Eye, MessageCircle, Check, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onDirectBuy?: (product: Product) => void;
  onRequireAuth?: (message?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onOpenDetails, 
  onDirectBuy,
  onRequireAuth 
}) => {
  const { addToCart, isInWishlist, toggleWishlist, settings } = useStore();
  const { currentUser } = useAuth();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const inStock = product.isAvailable && product.stock > 0;
  const isLowStock = inStock && product.stock <= 5;
  const currentPrice = product.discountPrice ?? product.price;

  let cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Please register or sign in to add items to your cart.');
      }
      return;
    }
    if (!inStock) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleDirectBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Please register or sign in to buy products.');
      }
      return;
    }
    if (!inStock) return;
    addToCart(product, 1);
    if (onDirectBuy) {
      onDirectBuy(product);
    } else {
      onOpenDetails(product);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Please register or sign in to save items to your wishlist.');
      }
      return;
    }
    toggleWishlist(product.id);
  };

  const handleWhatsAppQuickOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const storeTitle = settings.storeName || 'SAAD TRADING COMPANY';
    const msg = 
`📱 *${storeTitle.toUpperCase()} – PRODUCT INQUIRY*
─────────────────────
*Item:* ${product.name}
*Category:* ${product.category}
*Price:* Rs. ${currentPrice.toLocaleString('en-PK')} PKR
*Availability:* ${inStock ? 'In Stock' : 'Check Availability'}
─────────────────────
Assalam-o-Alaikum ${storeTitle}! I am interested in purchasing this product. Please share delivery time and payment details.`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const mainImage = product.images?.[0] || '';

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Image Area */}
      <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="text-slate-300 flex flex-col items-center gap-1 text-xs">
            <ShoppingBag className="w-8 h-8" />
            <span>Display Screen</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all cursor-pointer ${
            isFavorited ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-slate-400 hover:text-slate-700 shadow-sm'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Badge */}
        <div className="absolute bottom-2.5 left-2.5">
          {!inStock ? (
            <span className="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-bold">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-0.5 sm:mb-1">
            {product.category}
          </span>
          <h3 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 group-hover:text-amber-800 transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Actions */}
        <div className="space-y-2.5 sm:space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              {formatPKR(currentPrice)}
            </span>
            {product.discountPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {formatPKR(product.price)}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <button
              onClick={handleDirectBuy}
              disabled={!inStock}
              className={`w-full py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                !inStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{inStock ? 'Buy Now' : 'Out of Stock'}</span>
            </button>

            <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  !inStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3 h-3 text-white" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3 text-slate-600" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleWhatsAppQuickOrder}
                className="py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <MessageCircle className="w-3 h-3 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
