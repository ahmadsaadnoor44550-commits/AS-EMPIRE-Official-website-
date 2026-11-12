import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { formatPKR } from '../../data/constants';
import { 
  X, 
  User, 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Check, 
  AlertCircle,
  Phone, 
  Mail, 
  MapPin,
  Building,
  Heart,
  LogOut,
  MessageCircle,
  ExternalLink,
  Printer,
  ChevronDown,
  ChevronUp,
  Save,
  ShoppingCart,
  Trash2
} from 'lucide-react';
import { OrderReceiptModal } from '../admin/OrderReceiptModal';
import { Order, OrderStatus } from '../../types';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (id: string) => void;
  initialTab?: 'orders' | 'profile' | 'wishlist';
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onTrackOrder,
  initialTab = 'orders',
}) => {
  const { userProfile, currentUser, logout, updateCustomerProfile } = useAuth();
  const { customerOrders, settings, cancelOrder, products, wishlist, toggleWishlist, addToCart } = useStore();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>(initialTab);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.fullName || '');
      setEditPhone(userProfile.phone || '');
      setEditAddress(userProfile.address || '');
      setEditCity(userProfile.city || '');
    } else if (currentUser) {
      setEditName(currentUser.displayName || '');
      setEditPhone(currentUser.phoneNumber || '');
    }
  }, [userProfile, currentUser, isOpen]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen || !currentUser) return null;

  const cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    setSavingProfile(true);
    try {
      await updateCustomerProfile({
        fullName: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        city: editCity.trim(),
      });
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setProfileErrorMsg(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Status Badge Helper according to specifications:
  // Pending = yellow, Confirmed = blue, Shipped = purple, Delivered = green, Cancelled = red
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
      case 'Pending Confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Pending
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            Confirmed
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Truck className="w-3 h-3 text-purple-600" />
            Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <X className="w-3 h-3 text-red-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            {status}
          </span>
        );
    }
  };

  // Progress Tracker Step Helper
  const renderProgressTracker = (status: OrderStatus) => {
    if (status === 'Cancelled') {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-semibold">Order Cancelled</span>
        </div>
      );
    }

    const steps = [
      { key: 'Pending', label: 'Pending' },
      { key: 'Confirmed', label: 'Confirmed' },
      { key: 'Shipped', label: 'Shipped' },
      { key: 'Delivered', label: 'Delivered' },
    ];

    let currentStepIdx = 0;
    if (status === 'Confirmed') currentStepIdx = 1;
    if (status === 'Shipped') currentStepIdx = 2;
    if (status === 'Delivered') currentStepIdx = 3;

    return (
      <div className="py-2">
        <div className="relative flex items-center justify-between">
          {/* Background Line */}
          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
          {/* Active Fill Line */}
          <div 
            className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-amber-600 transition-all duration-500 -z-0"
            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((st, i) => {
            const isCompleted = i < currentStepIdx;
            const isCurrent = i === currentStepIdx;
            return (
              <div key={st.key} className="flex flex-col items-center z-10">
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    isCompleted 
                      ? 'bg-amber-600 text-white' 
                      : isCurrent 
                      ? 'bg-amber-600 text-white ring-4 ring-amber-100' 
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${
                  isCurrent ? 'text-amber-800' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl z-10 max-h-[92vh] flex flex-col">
        
        {/* Header with Daraz-Style Profile Identity */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-empire text-lg sm:text-xl font-bold text-slate-900">
                  {userProfile?.fullName || 'Valued Customer'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                  Daraz Customer
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                {currentUser.email} {userProfile?.phone && `• ${userProfile.phone}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Daraz Style) */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-white text-amber-900 shadow-sm font-bold border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <span>My Orders</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {customerOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-white text-amber-900 shadow-sm font-bold border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-amber-600" />
            <span>Profile & Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'wishlist' 
                ? 'bg-white text-amber-900 shadow-sm font-bold border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4 text-amber-600" />
            <span>Wishlist</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {wishlist.length}
            </span>
          </button>
        </div>

        {/* Content Body with Scroll */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">

          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {customerOrders.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Package className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">You haven't placed any orders yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Browse our mobile LCDs, AMOLED displays, and spare parts catalog to place your first order.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    return (
                      <div
                        key={order.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-sm transition-all space-y-3"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-700 text-sm">
                              #{order.id}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Progress Tracker (spec: Pending -> Confirmed -> Shipped -> Delivered) */}
                        {renderProgressTracker(order.status)}

                        {/* Last status change timestamp if available */}
                        {order.statusUpdatedAt && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Status updated: {new Date(order.statusUpdatedAt).toLocaleString('en-PK', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}

                        {/* Summary of items */}
                        <div className="text-xs text-slate-700 space-y-1.5 pt-1">
                          {order.items.slice(0, isExpanded ? undefined : 2).map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50">
                              <div className="flex items-center gap-2 truncate">
                                {it.image && (
                                  <img 
                                    src={it.image} 
                                    alt={it.name} 
                                    className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" 
                                  />
                                )}
                                <span className="truncate">• {it.name} <strong className="text-slate-500 font-normal">× {it.quantity}</strong></span>
                              </div>
                              <span className="font-semibold text-slate-900 shrink-0 ml-2">
                                {formatPKR(it.price * it.quantity)}
                              </span>
                            </div>
                          ))}

                          {order.items.length > 2 && !isExpanded && (
                            <button
                              onClick={() => setExpandedOrderId(order.id)}
                              className="text-[11px] text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span>+{order.items.length - 2} more item(s)</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          )}

                          {isExpanded && order.items.length > 2 && (
                            <button
                              onClick={() => setExpandedOrderId(null)}
                              className="text-[11px] text-slate-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span>Show less</span>
                              <ChevronUp className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Order Address & Total */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Destination</span>
                            <span className="text-slate-800 font-medium truncate block max-w-xs">
                              {order.address}, {order.city}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
                            <span className="font-bold text-sm text-slate-900">
                              {formatPKR(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-600" />
                            <span>Invoice / Receipt</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onClose();
                                onTrackOrder(order.id);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Track Details
                            </button>

                            {(order.status === 'Pending' || order.status === 'Pending Confirmation' || order.status === 'Confirmed') && (
                              confirmCancelId === order.id ? (
                                <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-200 animate-fadeIn">
                                  <span className="text-[11px] text-red-700 font-semibold px-1">Cancel order?</span>
                                  <button
                                    onClick={async () => {
                                      setCancelling(true);
                                      await cancelOrder(order.id);
                                      setCancelling(false);
                                      setConfirmCancelId(null);
                                    }}
                                    disabled={cancelling}
                                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer disabled:opacity-50"
                                  >
                                    {cancelling ? '...' : 'Yes, Cancel'}
                                  </button>
                                  <button
                                    onClick={() => setConfirmCancelId(null)}
                                    className="px-2 py-1 rounded-lg text-slate-600 text-xs hover:text-slate-800 cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmCancelId(order.id)}
                                  className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs cursor-pointer transition-colors"
                                  title="Cancel order"
                                >
                                  Cancel
                                </button>
                              )
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE & ADDRESS EDITOR */}
          {activeTab === 'profile' && (
            <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Manage Profile & Default Delivery Address</h4>
                <p className="text-slate-500 text-xs">
                  This information will automatically pre-fill your checkout for fast 1-click orders.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. Usman Ali"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Mobile / WhatsApp Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address (Read-only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      disabled
                      value={currentUser.email || ''}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-200/60 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Default Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="House / Shop #, Street name, Near landmark"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-600 resize-none text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">City</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="e.g. Lahore, Karachi, Rawalpindi"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-3">
              {wishlistProducts.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Your wishlist is empty</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click the heart icon on any product in our store to save it here for later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wishlistProducts.map((p) => (
                    <div 
                      key={p.id}
                      className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm hover:border-amber-300 transition-all"
                    >
                      <img 
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200'} 
                        alt={p.name} 
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{p.name}</h5>
                        <p className="text-[11px] text-slate-500 truncate">{p.category || 'Product'}</p>
                        <p className="font-bold text-amber-700 text-xs mt-1">
                          {formatPKR(p.discountPrice ?? p.price)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact SAAD TRADING COMPANY on WhatsApp</span>
          </a>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-semibold transition-colors cursor-pointer"
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
