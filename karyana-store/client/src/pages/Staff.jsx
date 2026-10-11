import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Shield,
  Phone,
  User,
  KeyRound,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'Cashier',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/staff');
      if (res.success) setStaff(res.data);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/auth/staff', formData);
      if (res.success) {
        setMsg(`Staff member ${formData.name} created successfully!`);
        setShowModal(false);
        setFormData({ username: '', password: '', name: '', role: 'Cashier', phone: '' });
        fetchStaff();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to create staff');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Are you sure you want to mark ${user.name} as ${newStatus}?`)) return;

    try {
      await api.put(`/auth/staff/${user._id}`, { status: newStatus });
      setMsg(`${user.name} marked as ${newStatus}.`);
      fetchStaff();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Staff & Cashier Management (عملہ و ملازمین)
          </h1>
          <p className="text-xs text-slate-500">
            Control user access roles: Admin/Owner, Manager, and Counter Cashier
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Staff (نیا ملازم درج کریں)</span>
        </button>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {staff.map((u) => (
          <div
            key={u._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-base">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{u.name}</h3>
                  <p className="text-xs text-slate-500">@{u.username}</p>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  u.role === 'Admin'
                    ? 'bg-emerald-100 text-emerald-800'
                    : u.role === 'Manager'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {u.role}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-medium text-slate-800">{u.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span
                  className={`font-bold ${
                    u.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {u.status}
                </span>
              </div>
            </div>

            {u.role !== 'Admin' && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleToggleStatus(u)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                    u.status === 'active'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {u.status === 'active' ? 'Deactivate Account' : 'Reactivate Account'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
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
              Add New Staff Account (نیا ملازم اکاونٹ)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Create counter cashier or store manager</p>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bilal Ahmed"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username (لاگ ان نام):</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. cashier2"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password (کم از کم 6 ہندسے):</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role / عہدہ:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-semibold focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Cashier">Cashier (کاؤنٹر کیشیئر)</option>
                    <option value="Manager">Manager (اسٹور منیجر)</option>
                    <option value="Admin">Admin (مالک / ایڈمن)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900"
                  />
                </div>
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
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 shadow-md disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
