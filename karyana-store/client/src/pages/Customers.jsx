import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  BookOpen,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    openingBalance: '0',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      openingBalance: '0',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      address: c.address || '',
      openingBalance: c.currentBalance.toString(),
      notes: c.notes || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer._id}`, formData);
        setMsg('Customer updated successfully!');
      } else {
        await api.post('/customers', formData);
        setMsg('Customer created successfully!');
      }
      setShowModal(false);
      fetchCustomers();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer ${name}?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      setMsg(`${name} removed successfully.`);
      fetchCustomers();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Customer Directory (گاہکوں کی فہرست)
          </h1>
          <p className="text-xs text-slate-500">
            Manage your neighborhood customers, contact info and balances
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Customer (نیا گاہک درج کریں)</span>
        </button>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name or mobile number..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
          {filtered.length} Customers Total
        </span>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Address / Area</th>
                <th className="py-3.5 px-4 text-right">Total Purchases</th>
                <th className="py-3.5 px-4 text-right">Total Credit Taken</th>
                <th className="py-3.5 px-4 text-right">Paid Amount</th>
                <th className="py-3.5 px-4 text-right">Pending Balance (بقایا)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900 text-xs sm:text-sm">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{c.phone}</td>
                    <td className="py-3 px-4 text-slate-500">{c.address || '—'}</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      Rs. {c.totalPurchases?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      Rs. {c.totalCredit?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-semibold">
                      Rs. {c.paidAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                          c.currentBalance > 0
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Rs. {c.currentBalance?.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate('/khata')}
                          className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 border border-amber-200"
                          title="Open Digital Khata"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span>Khata</span>
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(c._id, c.name)}
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

      {/* Add / Edit Customer Modal */}
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
              {editingCustomer ? 'Edit Customer' : 'Add New Customer (نیا گاہک)'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Record customer contact and opening balance</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Haji Abdul Rashid"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Phone:</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 0300-1234567"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / Mohalla:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. House 14, Main Bazar"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {!editingCustomer && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opening Udhaar Balance (پہلے سے موجود ادھار):
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
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes:</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Pays every Friday"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
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
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCustomer ? 'Update' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
