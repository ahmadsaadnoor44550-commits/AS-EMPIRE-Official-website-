import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth, PRIMARY_OWNER_EMAIL } from '../../context/AuthContext';
import { Product, Order, OrderStatus, StoreSettings, UserProfile } from '../../types';
import { formatPKR } from '../../data/constants';
import { ProductFormModal } from './ProductFormModal';
import { OrderReceiptModal } from './OrderReceiptModal';
import { 
  Package, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  HelpCircle, 
  LogOut, 
  ExternalLink, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  MessageCircle, 
  Save, 
  Crown, 
  ShieldCheck, 
  AlertCircle,
  Phone,
  Users,
  UserPlus,
  Mail,
  User,
  Image as ImageIcon,
  Printer
} from 'lucide-react';

interface AdminDashboardProps {
  onReturnToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onReturnToStore }) => {
  const { 
    products, 
    orders, 
    settings, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateOrderStatus, 
    updateSettings,
    addBusinessCategory,
    removeBusinessCategory
  } = useStore();

  const { 
    currentUser, 
    logout, 
    allCustomers, 
    loadingCustomers, 
    refreshCustomers,
    createAdditionalOwnerAccount 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'customers' | 'settings' | 'new-account' | 'guide'>('products');

  // Product Form Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Printable Order Receipt state
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Search & filters
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // New Owner Account Form State
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerPassword, setNewOwnerPassword] = useState('');
  const [newAccountMsg, setNewAccountMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [creatingOwner, setCreatingOwner] = useState(false);

  // Sync settingsForm when store settings change
  React.useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Statistics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending Confirmation').length;
  const confirmedOrders = orders.filter((o) => o.status === 'Confirmed' || o.status === 'Shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'Confirmed' || o.status === 'Shipped' || o.status === 'Delivered')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCatFilter === 'All' || p.category === productCatFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.city.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Customers
  const filteredCustomers = allCustomers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q));
  });

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    if (selectedProduct) {
      await updateProduct(selectedProduct.id, productData);
    } else {
      await addProduct(productData);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}" from AS Empire?`)) {
      await deleteProduct(id);
    }
  };

  const handleToggleProductAvailability = async (product: Product) => {
    await updateProduct(product.id, { isAvailable: !product.isAvailable });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await updateSettings(settingsForm);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleCreateNewOwnerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAccountMsg(null);
    if (!newOwnerEmail || !newOwnerPassword || newOwnerPassword.length < 6) {
      setNewAccountMsg({ type: 'error', text: 'Please provide a valid email and password (min 6 characters).' });
      return;
    }
    setCreatingOwner(true);
    try {
      await createAdditionalOwnerAccount({
        fullName: newOwnerName.trim() || 'New Business Owner',
        email: newOwnerEmail.trim(),
        phone: newOwnerPhone.trim(),
        pass: newOwnerPassword
      });
      setNewAccountMsg({ type: 'success', text: `Successfully registered new owner account for ${newOwnerEmail}!` });
      setNewOwnerName('');
      setNewOwnerEmail('');
      setNewOwnerPhone('');
      setNewOwnerPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create owner account.';
      setNewAccountMsg({ type: 'error', text: msg });
    } finally {
      setCreatingOwner(false);
    }
  };

  const openWhatsAppCustomer = (order: Order) => {
    let clean = order.phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('03')) clean = '92' + clean.slice(1);
    const msg = `Assalam-o-Alaikum ${order.customerName}! This is AS Empire regarding your Order #${order.id}. Current status: ${order.status}.`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-empire text-lg font-black tracking-wide text-slate-900">
                  AS <span className="gold-text">EMPIRE</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-[10px] font-black uppercase text-amber-900">
                  Owner Dashboard
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Logged in: <strong className="text-slate-800">{currentUser?.email || 'Owner'}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onReturnToStore}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">View Live Website</span>
            </button>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 transition-all"
              title="Sign Out of Dashboard"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto border-t border-slate-100 py-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({totalProducts})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({totalOrders})</span>
            {pendingOrders > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px]">
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('customers');
              refreshCustomers();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'customers'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({allCustomers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Owner & Store Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('new-account')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'new-account'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Business Account</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Deployment Guide</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Missing WhatsApp Warning (as required by prompt) */}
        {!settings.whatsappNumber && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4 text-xs text-amber-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                <strong>Attention Owner:</strong> Please enter your WhatsApp number in <strong>Owner Settings</strong> so customers can send orders directly to your WhatsApp.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold shrink-0 hover:bg-amber-700 transition-colors"
            >
              Open Settings
            </button>
          </div>
        )}

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Products
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{totalProducts}</div>
            <span className="text-[10px] text-slate-500">Live in Catalog</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Orders
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{totalOrders}</div>
            <span className="text-[10px] text-slate-500">All Time</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">
              Pending Orders
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-800">{pendingOrders}</div>
            <span className="text-[10px] text-amber-700">Needs WhatsApp Review</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">
              Confirmed / Shipped
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-900">{confirmedOrders}</div>
            <span className="text-[10px] text-blue-600">Active Shipments</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
              Delivered
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-800">{deliveredOrders}</div>
            <span className="text-[10px] text-emerald-700">Completed Orders</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Registered Customers
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{allCustomers.length}</div>
            <span className="text-[10px] text-slate-500">Shopper Accounts</span>
          </div>
        </div>

        {/* TAB 1: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by product name, category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                  />
                </div>

                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                >
                  <option value="All">All Categories</option>
                  {(settings.categories || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setProductModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-base text-slate-900">Your Product Catalog is Empty</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No sample products have been added. Click <strong>"Add Product"</strong> above to enter your real Mobile LCDs, LEDs, OLED Screens, and accessories.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800"
                  >
                    Add First Product Now
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price (PKR)</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                                {prod.images?.[0] ? (
                                  <img src={prod.images[0]} alt="" className="w-full h-full object-contain" />
                                ) : (
                                  <Package className="w-5 h-5 text-slate-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate max-w-xs sm:max-w-md">
                                  {prod.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {prod.images?.length || 0} Photos {prod.featured && '• ⭐ Featured'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-700 font-medium">
                            {prod.category}
                          </td>

                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div>{formatPKR(prod.discountPrice ?? prod.price)}</div>
                            {prod.discountPrice && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatPKR(prod.price)}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {prod.stock} units
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleProductAvailability(prod)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                prod.isAvailable && prod.stock > 0
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-red-50 border-red-200 text-red-800'
                              }`}
                              title="Click to toggle availability"
                            >
                              {prod.isAvailable && prod.stock > 0 ? '● Available' : '● Out of Stock'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedProduct(prod);
                                  setProductModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="Edit Product Info"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID, customer, phone, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {['All', 'Pending Confirmation', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      orderStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center space-y-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">No Orders Received Yet</h4>
                <p className="text-xs text-slate-500">
                  When customers place orders on your website via WhatsApp, they will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono font-bold text-base text-amber-800">
                          #{order.id}
                        </span>
                        <span className="text-xs text-slate-500 ml-3">
                          {new Date(order.createdAt).toLocaleString('en-PK')}
                        </span>
                      </div>

                      {/* Status Change Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">Update Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
                        >
                          <option value="Pending Confirmation">Pending Confirmation</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Customer</span>
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.phone}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Destination</span>
                        <div className="font-bold text-slate-900">{order.city}</div>
                        <div className="text-slate-600 truncate">{order.address}</div>
                        {order.notes && <div className="text-[11px] text-amber-800 italic">"{order.notes}"</div>}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total</span>
                        <div className="font-black text-slate-900 text-sm">{formatPKR(order.totalAmount)}</div>
                        <div className="text-[11px] text-slate-500">Shipping: {formatPKR(order.deliveryCharges)}</div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700">Ordered Items ({order.items.length}):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-slate-900 block truncate">{it.name}</span>
                              <span className="text-slate-500 text-[11px]">Qty: {it.quantity}</span>
                            </div>
                            <span className="font-bold text-slate-900">{formatPKR(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Actions: Print Receipt & WhatsApp */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                      <button
                        onClick={() => setReceiptOrder(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer hover:shadow"
                        title="Print or download official PDF sales receipt & tax invoice"
                      >
                        <Printer className="w-4 h-4 text-amber-400" />
                        <span>Print Receipt (PDF)</span>
                      </button>

                      <button
                        onClick={() => openWhatsAppCustomer(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-empire text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span>Registered Customer Accounts ({allCustomers.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Customers registered on your public website. Passwords are securely hashed and never readable.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer name, email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {loadingCustomers ? (
                <div className="p-12 text-center text-xs text-slate-500">Loading customers...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-base text-slate-900">No registered customers yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When customers open your public link and click "Register", their details will be securely saved here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Mobile / WhatsApp</th>
                        <th className="py-3 px-4">Registered Date</th>
                        <th className="py-3 px-4">Total Orders</th>
                        <th className="py-3 px-4 text-right">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCustomers.map((cust) => {
                        const custOrders = orders.filter((o) => o.customerId === cust.uid || o.phone === cust.phone);
                        let clean = (cust.phone || '').replace(/[^0-9]/g, '');
                        if (clean.startsWith('03')) clean = '92' + clean.slice(1);

                        return (
                          <tr key={cust.uid} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {cust.fullName}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                              {cust.email}
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {cust.phone || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {new Date(cust.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-800 text-[11px]">
                                {custOrders.length} {custOrders.length === 1 ? 'Order' : 'Orders'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {cust.phone ? (
                                <a
                                  href={`https://wa.me/${clean}?text=${encodeURIComponent(`Assalam-o-Alaikum ${cust.fullName}! This is AS Empire owner.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[10px]">No phone</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: OWNER SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-empire text-lg font-bold text-slate-900 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-amber-600" />
                <span>Owner & Website Settings</span>
              </h3>
              <p className="text-xs text-slate-500">
                You have full control. Edit your WhatsApp number, business name, address, categories, and direct payment details. Click <strong>"Save Settings Permanently"</strong> to commit changes to Cloud Firestore.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Settings saved permanently to Firestore! Live website updated.</span>
              </div>
            )}

            {/* WhatsApp Configuration */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Owner WhatsApp Number (Order Receiving)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="03330916398"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                  <p className="text-[10px] text-slate-500">
                    Your real WhatsApp number: <strong>03330916398</strong> (all customer order buttons route to this number).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Owner Contact Phone</label>
                  <input
                    type="text"
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    placeholder="03330916398"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Business Identity */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Business Identity & Owner Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Business Name</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    placeholder="AS Empire"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Owner Name</label>
                  <input
                    type="text"
                    value={settingsForm.ownerName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                    placeholder="Ahmad Saad"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Business Tagline / Subtitle</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  placeholder="Premium Mobile LCDs, LEDs, OLED Screens & Accessories"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Physical Business Address (Pakistan)</label>
                <input
                  type="text"
                  value={settingsForm.businessAddress}
                  onChange={(e) => setSettingsForm({ ...settingsForm, businessAddress: e.target.value })}
                  placeholder="e.g. Hall Road / Hafeez Center, Lahore, Pakistan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Top Announcement Banner</label>
                <input
                  type="text"
                  value={settingsForm.announcement || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                  placeholder="Welcome to AS Empire – Premium Mobile Displays & Phone Accessories."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Business Description</label>
                <textarea
                  rows={3}
                  value={settingsForm.aboutText || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, aboutText: e.target.value })}
                  placeholder="Describe your mobile LCD, LED, and accessory business..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Business Categories Management */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Business Categories (Display Panels & Accessories)
              </h4>
              <p className="text-slate-500">
                You can add or remove categories according to your inventory:
              </p>

              <div className="flex flex-wrap gap-2">
                {(settingsForm.categories || []).map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-800"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => removeBusinessCategory(cat)}
                      className="text-slate-400 hover:text-red-600 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md pt-2">
                <input
                  type="text"
                  placeholder="New category name (e.g. Battery Replacements)"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCatInput.trim()) {
                      addBusinessCategory(newCatInput.trim());
                      setNewCatInput('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Add Category
                </button>
              </div>
            </div>

            {/* Payment Details for Customers */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Direct Payment Accounts (Shared on WhatsApp)
              </h4>
              <p className="text-slate-500">
                Save your real EasyPaisa, JazzCash, and Bank account numbers so you can quickly share them with buyers:
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">EasyPaisa Account</label>
                  <input
                    type="text"
                    value={settingsForm.easyPaisaAccount || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, easyPaisaAccount: e.target.value })}
                    placeholder="Title: Ahmad Saad | 0333-0916398"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">JazzCash Account</label>
                  <input
                    type="text"
                    value={settingsForm.jazzCashAccount || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, jazzCashAccount: e.target.value })}
                    placeholder="Title: Ahmad Saad | 0333-0916398"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Bank Transfer Details</label>
                  <input
                    type="text"
                    value={settingsForm.bankAccountDetails || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountDetails: e.target.value })}
                    placeholder="Bank Name | Account Title | Account/IBAN Number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{settingsSaving ? 'Saving Changes...' : 'Save Settings Permanently'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 5: CREATE NEW BUSINESS / OWNER ACCOUNT */}
        {activeTab === 'new-account' && (
          <div className="max-w-2xl space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-empire text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                <span>Create New Owner Account for Your Business</span>
              </h3>
              <p className="text-xs text-slate-500">
                As requested, you can manually create additional owner/admin accounts for yourself or new businesses directly from here.
              </p>
            </div>

            {newAccountMsg && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2 font-semibold ${
                  newAccountMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {newAccountMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{newAccountMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateNewOwnerAccount} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Owner Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmad Saad (Business 2)"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Owner Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="newbusiness@gmail.com"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Owner Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="03330916398"
                  value={newOwnerPhone}
                  onChange={(e) => setNewOwnerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Owner Password * (Min 6 characters)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newOwnerPassword}
                  onChange={(e) => setNewOwnerPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creatingOwner}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{creatingOwner ? 'Creating Account...' : 'Register New Business Owner Account'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: DEPLOYMENT GUIDE */}
        {activeTab === 'guide' && (
          <div className="max-w-4xl space-y-5 text-xs text-slate-700">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-empire text-lg font-bold text-slate-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <span>AS Empire – Deployment & Share Guide</span>
              </h3>
              <p className="text-slate-500">
                Summary of your live system, database connection, and customer sharing instructions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">1. Sharing the Website with Customers</h4>
              <p className="leading-relaxed text-slate-600">
                You can share your live website URL with customers across Pakistan. Customers open the website, view your Mobile LCDs, LEDs, and accessories, add items to cart, register their accounts, and submit orders directly to your WhatsApp number (<strong>{settings.whatsappNumber || '03330916398'}</strong>).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">2. Security & Owner Protection</h4>
              <p className="leading-relaxed text-slate-600">
                Customers are strictly restricted to public catalog browsing and customer accounts. Only verified owner credentials (such as <strong>ahmadsaadnoor44550@gmail.com</strong>) have permission to add, edit, or delete products and change store settings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">3. Real Database Storage</h4>
              <p className="leading-relaxed text-slate-600">
                All products, settings, customer accounts, and orders are stored in Google Cloud Firestore (<code>ai-studio-1280530e-622b-425f-abd5-fa11a478c9b2</code>). Data is permanently saved and will never be lost on refresh or browser exit.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedProduct(null);
        }}
        productToEdit={selectedProduct}
        onSave={handleSaveProduct}
      />

      {/* Official Order Printable Receipt / PDF Modal */}
      <OrderReceiptModal
        order={receiptOrder}
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        settings={settings}
      />
    </div>
  );
};
