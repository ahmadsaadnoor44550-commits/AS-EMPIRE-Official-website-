import React from 'react';
import { Order, StoreSettings } from '../../types';
import { formatPKR } from '../../data/constants';
import { 
  Printer, 
  X, 
  Crown, 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface OrderReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  settings,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const businessPhone = settings.whatsappNumber || settings.contactPhone || '03330916398';
  const businessEmail = settings.contactEmail || 'ahmadsaadnoor44550@gmail.com';
  const businessAddress = settings.businessAddress || 'Shop #, Mobile Market, Pakistan';
  const storeName = settings.storeName || 'SAAD TRADING COMPANY';
  const ownerName = settings.ownerName || 'Ahmad Saad';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-y-auto max-h-[92vh] my-4 print:my-0 print:border-none print:shadow-none print:max-w-none print:rounded-none">
        
        {/* Action Header (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-empire font-bold text-sm tracking-wide text-white">
                Official Order Receipt & Tax Invoice
              </h3>
              <p className="text-[11px] text-slate-300">
                Order #{order.id} &bull; Ready for printing and PDF generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gold-btn font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              title="Print receipt or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div 
          id="printable-receipt" 
          className="p-6 sm:p-10 bg-white text-slate-800 space-y-6 print:p-6 print:space-y-4"
        >
          {/* Top Brand & Business Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-2 border-slate-900 pb-6 print:pb-4">
            {/* Logo & Brand */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-amber-400 border border-amber-500/40 shadow-sm">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-empire text-2xl font-black tracking-wider text-slate-950">
                    {storeName}
                  </h1>
                  <span className="text-[10px] font-bold tracking-widest text-amber-700 uppercase block">
                    {settings.tagline || 'Premium Mobile LCDs, LEDs, OLEDs & Accessories'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-sm pt-1">
                Wholesale & Retail Mobile Displays, Touch Screens, OCA Lamination, and Professional Parts.
              </p>
            </div>

            {/* Official Business Information */}
            <div className="text-left sm:text-right space-y-1 text-xs">
              <div className="inline-block px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px] uppercase tracking-wider mb-1">
                Official Commercial Invoice
              </div>
              <div className="font-bold text-slate-900">{ownerName} (Proprietor)</div>
              <div className="text-slate-600 flex sm:justify-end items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>WhatsApp: {businessPhone}</span>
              </div>
              <div className="text-slate-600 flex sm:justify-end items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{businessEmail}</span>
              </div>
              <div className="text-slate-600 flex sm:justify-end items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{businessAddress}</span>
              </div>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Invoice Number
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                INV-{order.id.replace('#', '')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Date & Time
              </span>
              <span className="font-semibold text-slate-900">
                {formattedDate}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Order Status
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{order.status}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Payment Type
              </span>
              <span className="font-bold text-slate-900">
                Advance Payment
              </span>
            </div>
          </div>

          {/* Customer / Destination Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                Billed / Delivered To
              </span>
              <div className="font-bold text-slate-900 text-sm">
                {order.customerName}
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.phone}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                Shipping Address & Destination
              </span>
              <div className="font-semibold text-slate-900">
                {order.city}, Pakistan
              </div>
              <div className="text-slate-600 leading-snug">
                {order.address}
              </div>
              {order.notes && (
                <div className="text-[11px] text-amber-800 italic pt-1">
                  Customer Note: "{order.notes}"
                </div>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Item & Description</th>
                  <th className="py-2.5 px-3 text-center">Category</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center w-16">Qty</th>
                  <th className="py-2.5 px-4 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Item ID: {item.productId.slice(0, 10)}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {item.category || 'Mobile Spare'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      {formatPKR(item.price)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatPKR(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            {/* Payment & Bank Details Notice */}
            <div className="w-full sm:max-w-xs space-y-2 text-[11px] text-slate-600 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
              <span className="font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Payment Verification
              </span>
              {settings.easyPaisaAccount && (
                <div>
                  <span className="font-semibold text-slate-800">EasyPaisa:</span> {settings.easyPaisaAccount}
                </div>
              )}
              {settings.jazzCashAccount && (
                <div>
                  <span className="font-semibold text-slate-800">JazzCash:</span> {settings.jazzCashAccount}
                </div>
              )}
              {settings.bankAccountDetails && (
                <div>
                  <span className="font-semibold text-slate-800">Bank:</span> {settings.bankAccountDetails}
                </div>
              )}
              {!settings.easyPaisaAccount && !settings.jazzCashAccount && !settings.bankAccountDetails && (
                <p className="text-slate-500">
                  Cash On Delivery or direct WhatsApp confirmation with the owner prior to delivery.
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Subtotal ({order.items.reduce((acc, i) => acc + i.quantity, 0)} items):</span>
                <span className="font-bold text-slate-900">{formatPKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Shipping / Delivery:</span>
                <span className="font-bold text-slate-900">
                  {order.deliveryCharges > 0 ? formatPKR(order.deliveryCharges) : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm">
                <span className="font-empire font-bold text-slate-900 uppercase tracking-wider">
                  Grand Total:
                </span>
                <span className="font-black text-amber-900 text-base">
                  {formatPKR(order.totalAmount)}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 text-right">
                All prices quoted in Pakistani Rupees (PKR)
              </div>
            </div>
          </div>

          {/* Warranty & Terms Footer with Stamp Box */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2 space-y-1 text-[10px] text-slate-500 leading-relaxed">
              <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Warranty & Quality Assurance
              </div>
              <p>
                1. Check LCD/LED ribbon and test display on the testing board before peeling warranty protective seals.
              </p>
              <p>
                2. Physical damage, broken flex cables, or removed warranty stamps are non-returnable.
              </p>
              <p>
                3. For inquiries, contact WhatsApp: <strong className="text-slate-700">{businessPhone}</strong>
              </p>
            </div>

            {/* Simulated Stamp / Signature Box */}
            <div className="text-center p-3 rounded-xl border border-dashed border-amber-400 bg-amber-50/40 space-y-1">
              <div className="w-8 h-8 mx-auto rounded-full bg-slate-900 text-amber-400 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                {storeName} Verified
              </div>
              <div className="text-[9px] text-slate-500">
                Authorized Signature & Seal
              </div>
            </div>
          </div>

          {/* Print Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            Thank you for doing business with {storeName}. Generated on {new Date().toLocaleDateString('en-PK')}.
          </div>
        </div>

        {/* Modal Bottom Close Button (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Tip: Select "Save as PDF" in your print dialog destination to save a digital copy.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl gold-btn text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
