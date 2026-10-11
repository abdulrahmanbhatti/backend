import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  Printer,
  Package,
  CreditCard,
  Banknote,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

const Reports = () => {
  const [period, setPeriod] = useState('monthly'); // today, yesterday, weekly, monthly, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = `?period=${period}`;
      if (period === 'custom' && startDate && endDate) {
        query = `?startDate=${startDate}&endDate=${endDate}`;
      }

      const [analRes, salesRes] = await Promise.all([
        api.get(`/reports/analytics${query}`),
        api.get(`/pos/sales${query}`)
      ]);

      if (analRes.success) setAnalytics(analRes);
      if (salesRes.success) setSalesList(salesRes.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Business Reports & Analytics (کاروباری رپورٹ)
          </h1>
          <p className="text-xs text-slate-500">
            Real profit calculations, best-selling grocery items, and sales trends
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'today', label: 'Today (آج)' },
            { id: 'yesterday', label: 'Yesterday (کل)' },
            { id: 'weekly', label: 'Last 7 Days (7 دن)' },
            { id: 'monthly', label: 'This Month (ماہانہ)' },
            { id: 'custom', label: 'Custom Range' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-2 py-1 text-xs"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-2 py-1 text-xs"
            />
            <button
              onClick={fetchReports}
              className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-bold text-white"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Sales Revenue
          </span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            Rs. {analytics?.summary?.totalSales?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {analytics?.summary?.billsCount || 0} Bills Completed
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Net Profit Earned (خالص منافع)
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            Rs. {analytics?.summary?.totalProfit?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-emerald-600 font-bold mt-1">
            Margin: {analytics?.summary?.marginPercentage || 0}%
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Inventory Cost of Goods Sold
          </span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">
            Rs. {analytics?.summary?.totalCost?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Wholesale acquisition cost</div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
            Wholesale Purchases
          </span>
          <div className="text-2xl font-black text-blue-900 mt-2">
            Rs. {analytics?.summary?.totalPurchasesCost?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {analytics?.summary?.purchasesCount || 0} Wholesaler Orders
          </div>
        </div>
      </div>

      {/* Row: Best Selling Items & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Selling Products */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Top Performing Products (سب سے زیادہ بکنے والی اشیاء)
              </h3>
            </div>
            <span className="text-xs text-slate-400">By units sold</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {analytics?.bestSellingProducts?.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No product sales in this period.</p>
            ) : (
              analytics?.bestSellingProducts?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.quantitySold} units sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900">
                      Rs. {item.revenue?.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600">
                      +Rs. {item.profit?.toLocaleString()} profit
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <CreditCard className="h-5 w-5 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">Payment Breakdown</h3>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Banknote className="h-4 w-4" />
                  <span>Cash (نقد رقم)</span>
                </span>
                <span>Rs. {analytics?.paymentMethods?.cash?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  <span>Online / Bank</span>
                </span>
                <span>Rs. {analytics?.paymentMethods?.online?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>Udhaar / Credit</span>
                </span>
                <span>Rs. {analytics?.paymentMethods?.udhaar?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
