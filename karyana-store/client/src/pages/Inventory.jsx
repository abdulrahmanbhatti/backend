import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  History,
  TrendingUp,
  DollarSign,
  Package,
  X,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';

const Inventory = () => {
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('stock_in'); // stock_in, damaged, expired, manual_reduce
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [msg, setMsg] = useState('');

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [overRes, histRes, prodRes] = await Promise.all([
        api.get('/inventory/overview'),
        api.get('/inventory/history?limit=30'),
        api.get('/products')
      ]);

      if (overRes.success) setOverview(overRes);
      if (histRes.success) setHistory(histRes.data);
      if (prodRes.success) setProducts(prodRes.data);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQty || Number(adjustQty) <= 0) return;

    setAdjusting(true);
    try {
      const res = await api.post(`/products/${selectedProduct._id}/adjust-stock`, {
        type: adjustType,
        quantityChange: Number(adjustQty),
        reason: adjustReason
      });

      if (res.success) {
        setMsg(`Stock updated successfully for ${selectedProduct.name}`);
        setShowAdjustModal(false);
        setAdjustQty('');
        setAdjustReason('');
        setSelectedProduct(null);
        loadInventory();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Stock adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Inventory Management (اسٹاک کنٹرول)
          </h1>
          <p className="text-xs text-slate-500">
            Monitor stock levels, inventory valuation, damages and movement logs
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(products[0] || null);
            setShowAdjustModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Adjust Stock (اسٹاک ان / آؤٹ / ضائع)</span>
        </button>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Inventory Valuation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Stock Units
          </span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {overview?.stats?.totalStockItems?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all product lines</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Stock Valuation (Wholesale Cost)
          </span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">
            Rs. {overview?.stats?.inventoryCostValue?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Total invested capital</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Retail Value (فروخت ویلیو)
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">
            Rs. {overview?.stats?.inventoryRetailValue?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Potential Profit: Rs. {overview?.stats?.potentialProfit?.toLocaleString() || 0}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Stock Warnings
          </span>
          <div className="text-2xl font-black text-amber-900 mt-2 flex items-center gap-3">
            <span>{overview?.stats?.lowStockCount || 0} Low</span>
            <span className="text-rose-600">• {overview?.stats?.outOfStockCount || 0} Out</span>
          </div>
          <div className="text-xs text-amber-700 mt-1 font-semibold">
            Requires restocking from supplier
          </div>
        </div>
      </div>

      {/* Stock Alerts Notice Board */}
      {overview?.lowStockList?.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900">
              Low Stock Alert (کم اسٹاک کی اشیاء — فوری آرڈر کریں)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {overview.lowStockList.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-xl bg-white border border-amber-200 px-3 py-2 text-xs"
              >
                <span className="font-bold text-slate-800 truncate mr-2">{item.name}</span>
                <span className="shrink-0 px-2 py-0.5 rounded-full font-black bg-amber-100 text-amber-900">
                  Only {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Movement History Log */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Stock Movement History (اسٹاک ردوبدل کی مکمل تاریخ)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Last 30 transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Change</th>
                <th className="py-3 px-4 text-center">Previous Stock</th>
                <th className="py-3 px-4 text-center">New Stock</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Handled By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((log) => {
                  const isPositive = log.quantityChange > 0;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{log.productName}</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-black">
                        <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                          {isPositive ? `+${log.quantityChange}` : log.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">{log.previousStock}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{log.newStock}</td>
                      <td className="py-3 px-4 text-slate-600 font-sans">{log.reason || '—'}</td>
                      <td className="py-3 px-4 text-slate-500">{log.userName}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAdjustModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Adjust Stock (اسٹاک ردوبدل)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add new stock, record damages or waste
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Product:</label>
                <select
                  value={selectedProduct?._id || ''}
                  onChange={(e) => {
                    const p = products.find((prod) => prod._id === e.target.value);
                    setSelectedProduct(p || null);
                  }}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Current Stock: {p.quantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Action:</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="stock_in">➕ Stock In / Add (نیا اسٹاک آیا)</option>
                  <option value="damaged">⚠️ Damaged Goods (خراب / ٹوٹ پھوٹ)</option>
                  <option value="expired">⌛ Expired Stock (میعاد ختم شدہ)</option>
                  <option value="manual_reduce">➖ Manual Reduction (اسٹاک کم کریں)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity ({selectedProduct?.unit || 'Units'}):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Note:</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Packet torn during transit"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  {adjusting ? 'Updating...' : 'Confirm Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
