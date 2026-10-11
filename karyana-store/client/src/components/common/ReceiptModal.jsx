import React from 'react';
import { Printer, X, CheckCircle, Share2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const ReceiptModal = ({ sale, onClose }) => {
  const { settings } = useStore();

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Action Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Sale Completed! (کامیاب فروخت)</h2>
          <p className="text-xs text-slate-500">Invoice ready for customer</p>
        </div>

        {/* Printable Receipt Section */}
        <div
          id="printable-receipt"
          className="my-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 font-mono text-xs text-slate-800"
        >
          {/* Receipt Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wide">
              {settings?.storeName || 'BISMILLAH KARYANA'}
            </h3>
            <p className="text-[10px] text-slate-600">{settings?.tagline}</p>
            <p className="text-[10px] text-slate-600">{settings?.address}</p>
            <p className="text-[10px] text-slate-600 font-bold">Tel: {settings?.phone}</p>
          </div>

          {/* Invoice Meta */}
          <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span>Invoice #:</span>
              <span className="font-bold">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date/Time:</span>
              <span>{new Date(sale.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold">{sale.customerName || 'Walk-in'}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full my-2 text-left">
            <thead>
              <tr className="border-b border-slate-300 text-[10px] uppercase">
                <th className="py-1">Item</th>
                <th className="text-center py-1">Qty</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sale.items?.map((item, idx) => (
                <tr key={idx} className="py-1">
                  <td className="py-1 pr-1 font-sans">{item.name}</td>
                  <td className="text-center py-1">{item.quantity} {item.unit || ''}</td>
                  <td className="text-right py-1">{item.salePrice}</td>
                  <td className="text-right py-1 font-semibold">{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {sale.subtotal?.toLocaleString()}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Discount:</span>
                <span>- Rs. {sale.discount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-slate-300 pt-1">
              <span>Grand Total:</span>
              <span>Rs. {sale.total?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Payment Type:</span>
              <span className="uppercase font-semibold">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span>Rs. {sale.paidAmount?.toLocaleString()}</span>
            </div>
            {sale.changeAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Change Returned:</span>
                <span>Rs. {sale.changeAmount?.toLocaleString()}</span>
              </div>
            )}
            {sale.remainingDue > 0 && (
              <div className="flex justify-between text-amber-700 font-bold border-t border-amber-200 pt-1">
                <span>Remaining Udhaar (کھاتہ):</span>
                <span>Rs. {sale.remainingDue?.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-dashed border-slate-300 mt-3 pt-2 text-center text-[10px] text-slate-500 font-sans">
            <p>{settings?.invoiceFooter}</p>
            <p className="mt-1 font-mono text-[9px] text-slate-400">Software by Karyana POS System</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt (پرنٹ کریں)</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
