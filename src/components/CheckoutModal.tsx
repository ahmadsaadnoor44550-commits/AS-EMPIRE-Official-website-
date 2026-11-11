import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR, PAKISTAN_CITIES } from '../data/constants';
import { 
  X, 
  MessageCircle, 
  MapPin, 
  Phone, 
  User, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Zap,
  Truck,
  Store
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string, whatsappUrl: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cart, cartSubtotal, deliveryFee, settings, createOrder } = useStore();
  const { userProfile, currentUser } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [customCity, setCustomCity] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup'>('courier');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill if customer is logged in
  useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName) setCustomerName(userProfile.fullName);
      if (userProfile.phone) setPhone(userProfile.phone);
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const appliedDeliveryFee = deliveryMethod === 'pickup' ? 0 : deliveryFee;
  const grandTotal = cartSubtotal + appliedDeliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g. 0300-1234567).');
      return;
    }
    if (deliveryMethod === 'courier' && (!address.trim() || address.trim().length < 6)) {
      setErrorMessage('Please enter a complete delivery address (Shop / House #, Street, Area).');
      return;
    }

    const finalCity = city === 'Other City in Pakistan' ? customCity.trim() : city;
    if (!finalCity) {
      setErrorMessage('Please specify your delivery city.');
      return;
    }

    const finalAddress = deliveryMethod === 'pickup'
      ? `[Store Pickup] ${settings.businessAddress || 'Shop Collection, Pakistan'}`
      : address.trim();

    setIsSubmitting(true);
    try {
      const { orderId, whatsappUrl } = await createOrder({
        customerName,
        phone,
        address: finalAddress,
        city: finalCity,
        notes,
        deliveryMethod,
      });

      // Hand off directly to the success confirmation dialog
      onSuccess(orderId, whatsappUrl);
      onClose();
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh] z-10 my-4 sm:my-8">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-empire text-lg font-bold text-slate-900">
                SAAD TRADING COMPANY Checkout
              </h3>
              <p className="text-xs text-slate-500">
                Direct WhatsApp Order & Verification (Pakistan)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs">
          
          {/* Summary Box with transparent price breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Items Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items):</span>
              <strong className="text-slate-900">{formatPKR(cartSubtotal)}</strong>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>Delivery ({deliveryMethod === 'pickup' ? 'Shop Pickup' : 'Courier COD'}):</span>
              </span>
              <strong className={appliedDeliveryFee === 0 ? 'text-emerald-700 font-bold' : 'text-slate-900'}>
                {appliedDeliveryFee === 0 ? 'FREE' : formatPKR(appliedDeliveryFee)}
              </strong>
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Total Payable:</span>
                <span className="text-slate-400 text-[10px]">Cash on Delivery (COD) / EasyPaisa / JazzCash</span>
              </div>
              <strong className="text-slate-900 text-lg font-black">
                {formatPKR(grandTotal)}
              </strong>
            </div>
          </div>

          {/* Delivery Method Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 uppercase tracking-wider text-xs block">
              Choose Delivery Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                onClick={() => setDeliveryMethod('courier')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryMethod === 'courier'
                    ? 'bg-amber-50/50 border-amber-600 ring-1 ring-amber-600/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  deliveryMethod === 'courier' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <strong className="text-slate-900 text-xs">Courier Delivery (COD)</strong>
                    <span className="text-[11px] font-bold text-amber-900">
                      {deliveryFee === 0 ? 'FREE' : formatPKR(deliveryFee)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Express courier to your home or shop in Pakistan. Cash paid upon arrival.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setDeliveryMethod('pickup')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryMethod === 'pickup'
                    ? 'bg-amber-50/50 border-amber-600 ring-1 ring-amber-600/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  deliveryMethod === 'pickup' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <strong className="text-slate-900 text-xs">Self Store Pickup</strong>
                    <span className="text-[11px] font-bold text-emerald-700">FREE</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Pick up in person from {settings.storeName || 'SAAD TRADING COMPANY'} shop. Rs. 0 delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Inputs */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Delivery Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Raza"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">WhatsApp / Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Delivery City (Pakistan) *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {city === 'Other City in Pakistan' && (
                <input
                  type="text"
                  placeholder="Enter your town / city"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Complete Delivery Address *</label>
              <textarea
                required
                rows={2}
                placeholder="Shop / House #, Market / Street Name, Area / Plaza"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Special Instructions / Model Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Model color, urgent delivery, test on arrival"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Direct Buy Confirmation Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 text-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct Order Confirmation (Pakistan)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              When you click below, your order is <strong>directly booked & saved in the SAAD TRADING COMPANY store database</strong>. You can immediately view your official receipt and confirm delivery via WhatsApp. Payment is made via <strong>Cash on Delivery (COD) or EasyPaisa / JazzCash / Bank Transfer</strong>.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:shadow-lg"
          >
            {isSubmitting ? (
              <span>Placing & Confirming Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Confirm & Place Order (Direct Buy)</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
