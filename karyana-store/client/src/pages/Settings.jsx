import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Phone,
  MapPin,
  Receipt,
  Download,
  ShieldCheck,
  CheckCircle,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../context/StoreContext';

const Settings = () => {
  const { refreshSettings } = useStore();
  const [formData, setFormData] = useState({
    storeName: '',
    tagline: '',
    phone: '',
    address: '',
    currency: 'Rs.',
    invoiceFooter: '',
    lowStockAlertThreshold: 5,
    expiryAlertDays: 30
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.success && res.data) {
        setFormData(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', formData);
      if (res.success) {
        setMsg('Store settings updated successfully!');
        refreshSettings();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Download entire database JSON backup
  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await api.get('/settings/backup');
      if (res.success) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.backup, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `karyana_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setMsg('Database backup downloaded successfully!');
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to download backup: ' + err.message);
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Store Settings & Backup (سیٹنگز و بیک اپ)
        </h1>
        <p className="text-xs text-slate-500">
          Configure business details, receipt formatting, and export database backups
        </p>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-emerald-600" />
          <span>Store Information (دکان کی معلومات)</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Name:</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagline / Slogan:</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone / Mobile:</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Address:</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol:</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Low Stock Threshold:</label>
              <input
                type="number"
                min="1"
                value={formData.lowStockAlertThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockAlertThreshold: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Alert Days:</label>
              <input
                type="number"
                min="1"
                value={formData.expiryAlertDays}
                onChange={(e) => setFormData({ ...formData, expiryAlertDays: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Receipt Footer Note (رسید کے نیچے پیغام):
            </label>
            <textarea
              rows={2}
              value={formData.invoiceFooter}
              onChange={(e) => setFormData({ ...formData, invoiceFooter: e.target.value })}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings (محفوظ کریں)'}
            </button>
          </div>
        </form>
      </div>

      {/* Data Safety & Backup Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            Database Backup & Data Safety (ڈیٹا سیفٹی و بیک اپ)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Never lose your sales records or customer khata. Export full offline JSON backups anytime.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Complete Offline Backup</h4>
            <p className="text-[11px] text-slate-500">
              Includes Products, Customers, Khata Ledgers, Suppliers, Sales & Stock History
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={backupLoading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{backupLoading ? 'Exporting...' : 'Download Full Backup (.json)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
