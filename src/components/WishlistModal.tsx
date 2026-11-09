import React from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { formatPKR } from '../data/constants';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  onOpenProduct,
}) => {
  const { wishlist, products, toggleWishlist, addToCart } = useStore();

  if (!isOpen) return null;

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-empire text-lg font-bold text-slate-900">
                Saved Favorites
              </h3>
              <p className="text-xs text-slate-500">
                {savedProducts.length} items saved
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {savedProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Your saved wishlist is empty.</p>
            </div>
          ) : (
            savedProducts.map((prod) => {
              const currentPrice = prod.discountPrice ?? prod.price;
              const inStock = prod.isAvailable && prod.stock > 0;
              return (
                <div
                  key={prod.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3"
                >
                  <img
                    src={prod.images?.[0] || ''}
                    alt={prod.name}
                    className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-slate-200 shrink-0 cursor-pointer"
                    onClick={() => {
                      onClose();
                      onOpenProduct(prod);
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">
                      {prod.category}
                    </span>
                    <h4
                      className="text-xs font-semibold text-slate-900 truncate cursor-pointer hover:text-amber-800"
                      onClick={() => {
                        onClose();
                        onOpenProduct(prod);
                      }}
                    >
                      {prod.name}
                    </h4>
                    <span className="text-xs font-bold text-slate-900">
                      {formatPKR(currentPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (inStock) addToCart(prod, 1);
                      }}
                      disabled={!inStock}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-40"
                      title={inStock ? 'Move to Cart' : 'Out of stock'}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
