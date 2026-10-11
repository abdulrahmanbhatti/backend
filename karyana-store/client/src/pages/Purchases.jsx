import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Building2,
  Trash2,
  X,
  CheckCircle,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // New Purchase Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [paidAmount, setPaidAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // View purchase modal
  const [viewingPurchase, setViewingPurchase] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [purRes, supRes, prodRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/suppliers'),
        api.get('/products')
      ]);

      if (purRes.success) setPurchases(purRes.data);
      if (supRes.success) {
        setSuppliers(supRes.data);
        if (supRes.data.length > 0) setSelectedSupplierId(supRes.data[0]._id);
      }
      if (prodRes.success) setProducts(prodRes.data);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewPurchaseModal = () => {
    setPurchaseItems([
      {
        productId: products[0]?._id || '',
        name: products[0]?.name || '',
        quantity: 10,
        purchasePrice: products[0]?.purchasePrice || 0
      }
    ]);
    setPaidAmount('0');
    setNotes('');
    setShowModal(true);
  };

  const addItemRow = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        productId: products[0]?._id || '',
        name: products[0]?.name || '',
        quantity: 10,
        purchasePrice: products[0]?.purchasePrice || 0
      }
    ]);
  };

  const updateItemRow = (index, field, value) => {
    const updated = [...purchaseItems];
    if (field === 'productId') {
      const p = products.find((prod) => prod._id === value);
      updated[index].productId = value;
      updated[index].name = p ? p.name : '';
      updated[index].purchasePrice = p ? p.purchasePrice : 0;
    } else {
      updated[index][field] = value;
    }
    setPurchaseItems(updated);
  };

  const removeItemRow = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.purchasePrice) || 0;
      return sum + q * p;
    }, 0);
  };

  const totalBill = calculateTotal();
  const numPaid = Number(paidAmount) || 0;
  const balanceDue = Math.max(0, totalBill - numPaid);

  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    if (purchaseItems.length === 0) return;

    setSaving(true);
    try {
      const res = await api.post('/purchases', {
        supplierId: selectedSupplierId,
        items: purchaseItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: Number(item.quantity),
          purchasePrice: Number(item.purchasePrice)
        })),
        paidAmount: numPaid,
        notes
      });

      if (res.success) {
        setMsg('Purchase recorded and inventory stocks increased successfully!');
        setShowModal(false);
        loadData();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to record purchase');
    } finally {
      setSaving(false);
    }
  };

  const filteredPurchases = purchases.filter(
    (p) =>
      p.purchaseNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Wholesale Purchases (مال خریداری)
          </h1>
          <p className="text-xs text-slate-500">
            Record supplier orders. Stocks increase automatically upon entry.
          </p>
        </div>

        <button
          onClick={openNewPurchaseModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Stock Purchase (نیا مال درج کریں)</span>
        </button>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Search & Stats */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by purchase number or supplier name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
          {filteredPurchases.length} Records Total
        </span>
      </div>

      {/* Purchases Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Purchase #</th>
                <th className="py-3.5 px-4">Supplier (ڈیلر)</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">Items Count</th>
                <th className="py-3.5 px-4 text-right">Total Bill</th>
                <th className="py-3.5 px-4 text-right">Paid Amount</th>
                <th className="py-3.5 px-4 text-right">Remaining Due (بقایا)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    Loading wholesale purchases...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    No purchase records found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-blue-700 font-mono">
                      {p.purchaseNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.supplierName}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {p.items?.length || 0} Products
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      Rs. {p.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-semibold">
                      Rs. {p.paidAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-700">
                      {p.remainingBalance > 0 ? `Rs. ${p.remainingBalance.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.paymentStatus === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewingPurchase(p)}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="View Purchase Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Record New Wholesale Purchase (خریداری درج کریں)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Stock counts will automatically increase upon saving
            </p>

            <form onSubmit={handleSubmitPurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Wholesaler / Supplier (ڈیلر منتخب کریں):
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.company || 'Distributor'}) — Current Due: Rs. {s.currentPayable.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Products Bought:</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {purchaseItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex-1">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItemRow(idx, 'productId', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 py-1.5 px-2 text-xs font-semibold"
                        >
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 py-1.5 px-2 text-center text-xs font-bold"
                        />
                      </div>

                      <div className="w-28">
                        <input
                          type="number"
                          min="0"
                          placeholder="Unit Cost"
                          value={item.purchasePrice}
                          onChange={(e) => updateItemRow(idx, 'purchasePrice', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 py-1.5 px-2 text-right text-xs font-bold"
                        />
                      </div>

                      <div className="w-24 text-right font-black text-slate-800 pr-2">
                        Rs. {((Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0)).toLocaleString()}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Supplier Settlement */}
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-sm font-black text-slate-900">
                  <span>Total Purchase Bill:</span>
                  <span>Rs. {totalBill.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between font-semibold">
                  <span>Paid to Wholesaler Now (ادا شدہ رقم):</span>
                  <div className="flex items-center gap-1">
                    <span>Rs.</span>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-right font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-between font-bold text-rose-700 border-t border-blue-200 pt-2">
                  <span>Remaining Payable (ڈیلر کا باقی ادھار):</span>
                  <span>Rs. {balanceDue.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Notes / Memo:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received via Delivery Van 4"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || purchaseItems.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  {saving ? 'Recording Stock...' : 'Save & Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Purchase Modal */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl relative">
            <button
              onClick={() => setViewingPurchase(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 font-mono">
              {viewingPurchase.purchaseNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Supplier: <span className="font-bold text-slate-800">{viewingPurchase.supplierName}</span>
            </p>

            <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Cost</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingPurchase.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 font-medium text-slate-800">{item.name}</td>
                      <td className="py-2 px-3 text-center">{item.quantity} {item.unit}</td>
                      <td className="py-2 px-3 text-right">Rs. {item.purchasePrice}</td>
                      <td className="py-2 px-3 text-right font-bold">Rs. {item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between font-bold">
                <span>Total Amount:</span>
                <span>Rs. {viewingPurchase.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Paid Amount:</span>
                <span>Rs. {viewingPurchase.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-black">
                <span>Remaining Payable:</span>
                <span>Rs. {viewingPurchase.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setViewingPurchase(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
