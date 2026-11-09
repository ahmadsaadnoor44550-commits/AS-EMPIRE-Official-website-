import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { formatPKR } from '../../data/constants';
import { 
  X, 
  User, 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  Phone, 
  Mail, 
  LogOut,
  MessageCircle,
  ExternalLink,
  Printer 
} from 'lucide-react';
import { OrderReceiptModal } from '../admin/OrderReceiptModal';
import { Order } from '../../types';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (id: string) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const { userProfile, currentUser, logout } = useAuth();
  const { customerOrders, settings } = useStore();
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  if (!isOpen || !currentUser) return null;

  const cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-lg">
              {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h3 className="font-empire text-lg sm:text-xl font-bold text-slate-900">
                My Customer Account
              </h3>
              <p className="text-xs text-slate-500">
                Welcome back, <strong className="text-slate-800">{userProfile?.fullName || currentUser.email}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Name</span>
            <span className="font-semibold text-slate-900">{userProfile?.fullName || 'Valued Customer'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Email</span>
            <span className="font-semibold text-slate-900 truncate block">{currentUser.email}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Phone</span>
            <span className="font-semibold text-slate-900">{userProfile?.phone || 'Not set'}</span>
          </div>
        </div>

        {/* Order History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>My Orders History ({customerOrders.length})</span>
            </h4>
          </div>

          {customerOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">You haven't placed any orders yet.</p>
              <p className="text-[11px] text-slate-400">Browse Mobile LCDs, LEDs, and accessories to place your first order.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-sm transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-700">#{order.id}</span>
                      <span className="text-slate-400 text-[11px] ml-2">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {order.status}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-slate-600 space-y-1">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>• {it.name} × {it.quantity}</span>
                        <span className="font-medium text-slate-800">{formatPKR(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Total: {formatPKR(order.totalAmount)}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="inline-flex items-center gap-1 font-bold text-[11px] text-slate-800 hover:text-amber-700 cursor-pointer"
                        title="Print or save PDF receipt"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-600" />
                        <span>Receipt (PDF)</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onTrackOrder(order.id);
                        }}
                        className="text-amber-700 hover:text-amber-800 font-semibold text-[11px] underline cursor-pointer"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact Owner on WhatsApp</span>
          </a>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* Printable Order Receipt Modal */}
      <OrderReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        settings={settings}
      />
    </div>
  );
};
