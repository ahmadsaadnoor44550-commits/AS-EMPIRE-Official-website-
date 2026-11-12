import React from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR } from '../data/constants';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  MessageCircle 
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
  onRequireAuth?: (message?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
  onRequireAuth,
}) => {
  const { currentUser } = useAuth();
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    cartSubtotal, 
    cartTotalCount,
    deliveryFee,
    cartFinalTotal,
    settings 
  } = useStore();

  if (!isOpen) return null;

  const threshold = settings.freeDeliveryThreshold || 5000;
  const differenceToFree = Math.max(0, threshold - cartSubtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((cartSubtotal / threshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-empire text-lg font-bold text-slate-900">
                  Shopping Bag
                </h3>
                <span className="text-xs text-slate-500">
                  {cartTotalCount} {cartTotalCount === 1 ? 'item' : 'items'} in your bag
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cart.length > 0 && (
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 text-xs">
              <div className="flex items-center justify-between text-slate-700 mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  {differenceToFree === 0 ? (
                    <strong className="text-emerald-700">Unlocked FREE Nationwide Delivery!</strong>
                  ) : (
                    <>Add <strong className="text-slate-900">{formatPKR(differenceToFree)}</strong> for Free Delivery</>
                  )}
                </span>
                <span className="text-slate-500">{freeDeliveryPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeDeliveryPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-slate-900">Your bag is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Browse Mobile LCDs, LEDs, and accessories to select your products.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.product.discountPrice ?? item.product.price;
                return (
                  <div key={item.product.id} className="pt-4 first:pt-0 flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-700 block">
                          {item.product.category}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <div className="text-xs font-bold text-slate-900">
                          {formatPKR(itemPrice)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-semibold">{formatPKR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : 'text-slate-900 font-semibold'}>
                    {deliveryFee === 0 ? 'FREE' : formatPKR(deliveryFee)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total (PKR)</span>
                  <span className="text-base text-slate-900">{formatPKR(cartFinalTotal)}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                Delivery across Pakistan. Instant direct order booking with Cash on Delivery (COD) or EasyPaisa / JazzCash.
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      if (onRequireAuth) {
                        onRequireAuth('Please register or sign in to complete your checkout.');
                      }
                      return;
                    }
                    onClose();
                    onOpenCheckout();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Direct Checkout</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full py-1 text-center text-[11px] text-slate-400 hover:text-slate-700"
                >
                  Clear Bag
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
