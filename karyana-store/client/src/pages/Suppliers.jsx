import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  ArrowDownLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Suppliers = () => {
  const { isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    address: '',
    openingBalance: '0',
    notes: ''
  });

  // Record Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      if (res.success) setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      company: '',
      phone: '',
      address: '',
      openingBalance: '0',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      company: s.company || '',
      phone: s.phone,
      address: s.address || '',
      openingBalance: s.currentPayable.toString(),
      notes: s.notes || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, formData);
        setMsg('Supplier updated successfully!');
      } else {
        await api.post('/suppliers', formData);
        setMsg('Supplier created successfully!');
      }
      setShowModal(false);
      fetchSuppliers();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSupplierPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    setSaving(true);
    try {
      const res = await api.post(`/suppliers/${activeSupplier._id}/payment`, {
        amount: Number(payAmount),
        notes: payNotes
      });

      if (res.success) {
        setMsg(`Rs. ${Number(payAmount).toLocaleString()} payment recorded for ${activeSupplier.name}.`);
        setShowPayModal(false);
        setPayAmount('');
        setPayNotes('');
        fetchSuppliers();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete supplier ${name}?`)) return;
    try {
      await api.delete(`/suppliers/${id}`);
      setMsg(`${name} removed successfully.`);
      fetchSuppliers();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.company?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.toLowerCase().includes(search.toLowerCase())
  );

  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + (s.currentPayable > 0 ? s.currentPayable : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Wholesale Suppliers & Dealers (سپلائرز و ڈیلرز)
          </h1>
          <p className="text-xs text-slate-500">
            Track wholesale accounts, purchase volumes, and outstanding payables
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Supplier (نیا سپلائر درج کریں)</span>
        </button>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Top Payable Notice */}
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-rose-900">
            Total Payable to Wholesalers (ڈیلرز کا کل واجب الادا بقایا)
          </h3>
          <p className="text-xs text-rose-700">Amount owed to distributors for grocery stocks</p>
        </div>
        <div className="text-2xl font-black text-rose-700">
          Rs. {totalSupplierDebt.toLocaleString()}
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier by name, company, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
          {filtered.length} Suppliers Total
        </span>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Company / Agency</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4 text-right">Total Purchases</th>
                <th className="py-3.5 px-4 text-right">Paid Amount</th>
                <th className="py-3.5 px-4 text-right">Payable Due (واجب الادا)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Loading suppliers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900 text-xs sm:text-sm">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{s.company || '—'}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{s.phone}</td>
                    <td className="py-3 px-4 text-slate-500">{s.address || '—'}</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      Rs. {s.totalPurchases?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-semibold">
                      Rs. {s.paidAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-700 text-sm">
                      Rs. {s.currentPayable?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveSupplier(s);
                            setShowPayModal(true);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          title="Record Payment to Supplier"
                        >
                          <ArrowDownLeft className="h-3 w-3" />
                          <span>Pay</span>
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(s._id, s.name)}
                            className="p-1 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier (نیا سپلائر)'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Record wholesaler contact and company</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Haji Ghulam Rasool"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Agency Name:
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Akbari Mandi Grains Mart"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Phone:</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 0301-7788990"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / Mandi:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Akbari Mandi, Lahore"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {!editingSupplier && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opening Payable Due (پہلے سے واجب الادا رقم):
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                      placeholder="0"
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              )}

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
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSupplier ? 'Update' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {showPayModal && activeSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Record Payment to Supplier (ڈیلر کو ادائیگی)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paying supplier <span className="font-bold text-slate-800">{activeSupplier.name}</span>
            </p>

            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 mb-4 text-xs flex justify-between items-center">
              <span className="font-semibold text-rose-800">Total Payable Due:</span>
              <span className="font-black text-rose-900 text-sm">
                Rs. {activeSupplier.currentPayable.toLocaleString()}
              </span>
            </div>

            <form onSubmit={handleSupplierPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount (ادا کردہ رقم):
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-xs">
                    Rs.
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={activeSupplier.currentPayable}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Voucher Reference:</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid cash against bill #104"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  {saving ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
