import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { formatPKR } from '../data/constants';
import { 
  X, 
  Search, 
  Package, 
  MessageCircle, 
  AlertCircle,
  Printer 
} from 'lucide-react';
import { OrderReceiptModal } from './admin/OrderReceiptModal';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
}) => {
  const { getOrderById, settings } = useStore();
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  if (!isOpen) return null;

  const handleSearch = async (idToSearch?: string) => {
    const target = (idToSearch || orderIdInput).trim();
    if (!target) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const cleanId = target.replace(/^#/, '');
      const order = await getOrderById(cleanId);
      setSearchedOrder(order);
      if (!order) {
        setErrorMessage(`No order found with ID "${cleanId}". Please check and try again.`);
      }
    } catch {
      setErrorMessage('Could not load order details.');
      setSearchedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  let cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-empire text-lg font-bold text-slate-900">
                Track Your AS Empire Order
              </h3>
              <p className="text-xs text-slate-500">
                Check delivery status of your mobile screen or accessories order
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Enter Order Tracking ID
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. ASE-2026-1234"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !orderIdInput.trim()}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {searchedOrder && (
          <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Order ID #{searchedOrder.id}
                </span>
                <span className="text-slate-500">
                  {new Date(searchedOrder.createdAt).toLocaleString('en-PK')}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {searchedOrder.status}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-600">
              <div>Customer: <strong className="text-slate-900">{searchedOrder.customerName}</strong></div>
              <div>City: <strong className="text-slate-900">{searchedOrder.city}</strong></div>
              <div>Address: {searchedOrder.address}</div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 block">Ordered Items:</span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {searchedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span>{it.name} × {it.quantity}</span>
                    <span className="font-bold text-slate-900">{formatPKR(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 flex justify-between font-bold text-sm text-slate-900">
              <span>Total Amount:</span>
              <span>{formatPKR(searchedOrder.totalAmount)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowReceipt(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                title="Print or save PDF receipt"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Receipt (PDF)</span>
              </button>

              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Assalam-o-Alaikum AS Empire! I am inquiring about my Order #${searchedOrder.id}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Owner</span>
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Printable Receipt Modal */}
      <OrderReceiptModal
        order={searchedOrder}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        settings={settings}
      />
    </div>
  );
};
