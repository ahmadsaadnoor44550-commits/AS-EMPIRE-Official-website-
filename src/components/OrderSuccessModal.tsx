import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  MessageCircle, 
  Copy, 
  Check, 
  X, 
  PackageSearch, 
  ShoppingBag,
  ShieldCheck,
  Printer 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderReceiptModal } from './admin/OrderReceiptModal';
import { Order } from '../types';

interface OrderSuccessModalProps {
  orderId: string | null;
  whatsappUrl: string | null;
  onClose: () => void;
  onTrackOrder: (id: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderId,
  whatsappUrl,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = useState(false);
  const [loadedOrder, setLoadedOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const { settings, getOrderById } = useStore();

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId).then((ord) => {
        if (ord) setLoadedOrder(ord);
      });
    }
  }, [orderId, getOrderById]);

  if (!orderId) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wide">
            ✓ Order Placed & Confirmed Directly
          </span>
          <h3 className="font-empire text-2xl font-bold text-slate-900">
            Thank You for Shopping with AS Empire!
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Your order has been successfully recorded into our database. The owner has been notified and your official sales invoice is ready.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Order Tracking ID
            </span>
            <span className="font-mono text-lg font-bold text-amber-800">
              #{orderId}
            </span>
          </div>

          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Order Details on WhatsApp to Owner</span>
            </a>
          )}

          {loadedOrder && (
            <button
              onClick={() => setShowReceipt(true)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print / Download Official Receipt (PDF)</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(orderId);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PackageSearch className="w-3.5 h-3.5 text-slate-600" />
              <span>Track Order</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

      </div>

      {/* Official Receipt Modal */}
      {loadedOrder && (
        <OrderReceiptModal
          order={loadedOrder}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          settings={settings}
        />
      )}
    </div>
  );
};
