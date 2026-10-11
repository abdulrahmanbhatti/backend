import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Calendar,
  Package,
  Trash2,
  CheckCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';

const Expiry = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, expired, 7days, 30days
  const [msg, setMsg] = useState('');

  const fetchExpiryData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      if (res.success) {
        // Filter products with expiry dates
        const withExpiry = res.data.filter((p) => p.expiryDate);
        setProducts(withExpiry);
      }
    } catch (err) {
      console.error('Failed to load expiry products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, []);

  const now = new Date();
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const expiredList = products.filter((p) => new Date(p.expiryDate) < now);
  const next7DaysList = products.filter(
    (p) => new Date(p.expiryDate) >= now && new Date(p.expiryDate) <= sevenDaysLater
  );
  const next30DaysList = products.filter(
    (p) => new Date(p.expiryDate) > sevenDaysLater && new Date(p.expiryDate) <= thirtyDaysLater
  );

  const handleDiscardExpired = async (p) => {
    if (!window.confirm(`Discard and remove ${p.quantity} ${p.unit} of expired ${p.name} from stock?`)) return;

    try {
      await api.post(`/products/${p._id}/adjust-stock`, {
        type: 'expired',
        quantityChange: p.quantity,
        reason: 'Expired product removed from shelf'
      });
      setMsg(`${p.name} recorded as expired waste and removed from stock.`);
      fetchExpiryData();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  let displayedList = products;
  if (filter === 'expired') displayedList = expiredList;
  else if (filter === '7days') displayedList = next7DaysList;
  else if (filter === '30days') displayedList = next30DaysList;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Expiry Date Management (میعاد و زائد المیعاد اشیاء)
        </h1>
        <p className="text-xs text-slate-500">
          Monitor product shelf life and prevent expired stock from reaching customers
        </p>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Expiry Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilter('expired')}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${
            filter === 'expired'
              ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500'
              : 'border-rose-200 bg-white hover:bg-rose-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Expired (میعاد ختم ہوچکی)
            </span>
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-700 mt-2">{expiredList.length}</div>
          <div className="text-xs text-rose-600 mt-1">Hazardous: remove immediately</div>
        </div>

        <div
          onClick={() => setFilter('7days')}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${
            filter === '7days'
              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500'
              : 'border-amber-200 bg-white hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Expiring in &lt; 7 Days
            </span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-700 mt-2">{next7DaysList.length}</div>
          <div className="text-xs text-amber-600 mt-1">Discount or return to supplier</div>
        </div>

        <div
          onClick={() => setFilter('30days')}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${
            filter === '30days'
              ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
              : 'border-purple-200 bg-white hover:bg-purple-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Expiring in &lt; 30 Days
            </span>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-700 mt-2">{next30DaysList.length}</div>
          <div className="text-xs text-purple-600 mt-1">Rotate front of shelf</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          All Monitored Products ({products.length})
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4 text-center">Days Remaining</th>
                <th className="py-3.5 px-4 text-center">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Value at Cost</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No items in this expiry category!
                  </td>
                </tr>
              ) : (
                displayedList.map((p) => {
                  const expDate = new Date(p.expiryDate);
                  const diffTime = expDate - now;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isExpired = diffDays < 0;
                  const isSoon = diffDays >= 0 && diffDays <= 7;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 text-slate-500">{p.category}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {expDate.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            isExpired
                              ? 'bg-rose-100 text-rose-800'
                              : isSoon
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isExpired ? 'EXPIRED' : `${diffDays} Days`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {p.quantity} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-bold">
                        Rs. {(p.quantity * p.purchasePrice).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isExpired && p.quantity > 0 && (
                          <button
                            onClick={() => handleDiscardExpired(p)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-500 shadow-sm"
                          >
                            Discard & Log
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expiry;
