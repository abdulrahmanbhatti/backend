import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Package,
  AlertTriangle,
  BookOpen,
  Truck,
  ShoppingCart,
  Calendar,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReceiptModal from '../components/common/ReceiptModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500">Loading store dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white shadow-lg">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-2">
            Welcome Back
          </span>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1">
            Store is running smoothly. Here is your daily performance summary.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/pos')}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Launch POS (بل کاؤنٹر)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row 1: Today's Financials */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Sales (آج کی فروخت)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              Rs. {stats?.today?.sales?.toLocaleString() || 0}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{stats?.today?.bills || 0} Bills Generated Today</span>
          </div>
        </div>

        {/* Today's Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Profit (آج کا منافع)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-blue-600">
              Rs. {stats?.today?.profit?.toLocaleString() || 0}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Real profit based on wholesale margins
          </div>
        </div>

        {/* Udhaar / Khata Pending */}
        <div
          onClick={() => navigate('/khata')}
          className="cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm hover:shadow-md transition-all hover:bg-amber-50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Total Udhaar (کل ادھار / کھاتہ)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-800">
              Rs. {stats?.khata?.totalUdhaarPending?.toLocaleString() || 0}
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium flex items-center justify-between">
            <span>{stats?.khata?.customersCount || 0} Customers Pending</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Supplier Payable Due */}
        <div
          onClick={() => navigate('/suppliers')}
          className="cursor-pointer rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm hover:shadow-md transition-all hover:bg-rose-50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Supplier Payables (ڈیلرز بقایا)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-rose-700">
              Rs. {stats?.supplier?.totalPayable?.toLocaleString() || 0}
            </span>
          </div>
          <div className="mt-2 text-xs text-rose-600 font-medium flex items-center justify-between">
            <span>Amount owed to wholesalers</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* KPI Cards Row 2: Inventory Health & Alerts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => navigate('/products')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 transition-all flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats?.inventory?.totalProducts || 0}</div>
            <div className="text-xs text-slate-500 font-medium">Total Products in Store</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/inventory')}
          className="cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm hover:border-amber-400 transition-all flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-700">{stats?.inventory?.lowStock || 0}</div>
            <div className="text-xs text-amber-800 font-medium">Low Stock Items (کم اسٹاک)</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/inventory')}
          className="cursor-pointer rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-sm hover:border-rose-400 transition-all flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-rose-700">{stats?.inventory?.outOfStock || 0}</div>
            <div className="text-xs text-rose-800 font-medium">Out of Stock (ختم شدہ)</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/expiry')}
          className="cursor-pointer rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-sm hover:border-purple-400 transition-all flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-purple-700">{stats?.inventory?.nearExpiry || 0}</div>
            <div className="text-xs text-purple-800 font-medium">Near Expiry (&lt;30 days)</div>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Sales & Recent Purchases */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Sales Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-800">Recent Sales (حالیہ بلز)</h2>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View All
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 overflow-x-auto">
            {stats?.recentSales?.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No sales recorded yet today.</p>
            ) : (
              stats?.recentSales?.map((sale) => (
                <div key={sale._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{sale.invoiceNumber}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-semibold uppercase">
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {sale.customerName} • {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-extrabold text-slate-900 text-sm">
                        Rs. {sale.total.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        +Rs. {sale.profit?.toLocaleString()} profit
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                      title="View Receipt"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Purchases Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">Recent Purchases (اسٹاک خریداری)</h2>
            </div>
            <button
              onClick={() => navigate('/purchases')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 overflow-x-auto">
            {stats?.recentPurchases?.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No wholesaler purchases yet.</p>
            ) : (
              stats?.recentPurchases?.map((pur) => (
                <div key={pur._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{pur.purchaseNumber}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        pur.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pur.paymentStatus}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {pur.supplierName} • {new Date(pur.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900 text-sm">
                      Rs. {pur.totalAmount.toLocaleString()}
                    </div>
                    {pur.remainingBalance > 0 && (
                      <div className="text-[10px] text-rose-600 font-semibold">
                        Due: Rs. {pur.remainingBalance.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {selectedSale && (
        <ReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </div>
  );
};

export default Dashboard;
