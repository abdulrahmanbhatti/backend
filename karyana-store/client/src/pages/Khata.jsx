import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  Banknote
} from 'lucide-react';
import { api } from '../services/api';

const Khata = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [pendingOnly, setPendingOnly] = useState(true);
  const [loading, setLoading] = useState(true);

  // Selected customer ledger view
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Payment recording modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers${pendingOnly ? '?withBalanceOnly=true' : ''}`);
      if (res.success) {
        setCustomers(res.data);
        setFilteredCustomers(res.data);
        if (res.data.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch khata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [pendingOnly]);

  // Filter customers by search term
  useEffect(() => {
    if (!search.trim()) {
      setFilteredCustomers(customers);
    } else {
      const q = search.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
        )
      );
    }
  }, [search, customers]);

  // Load single customer detail and ledger history
  const loadCustomerLedger = async (id) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.success) {
        setCustomerDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerLedger(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  // Submit payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;

    setSubmittingPayment(true);
    try {
      const res = await api.post(`/customers/${selectedCustomerId}/payment`, {
        amount: Number(paymentAmount),
        paymentMethod,
        notes: paymentNotes
      });

      if (res.success) {
        setActionMsg(`Rs. ${Number(paymentAmount).toLocaleString()} wasool kar li gayi.`);
        setPaymentAmount('');
        setPaymentNotes('');
        setShowPaymentModal(false);
        // Refresh detail and list
        loadCustomerLedger(selectedCustomerId);
        fetchCustomers();
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Payment submission failed');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const totalMarketUdhaar = customers.reduce(
    (sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Hero Banner: Digital Khata */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-6 w-6 text-amber-200" />
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Digital Udhaar / Khata (ڈیجیٹل کھاتہ)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-amber-100">
            Real-time customer credit ledger, balance tracking, and cash collection
          </p>
        </div>

        <div className="rounded-2xl bg-black/30 border border-white/20 p-4 text-right backdrop-blur-md">
          <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">
            Total Market Udhaar (مارکیٹ میں پھنسا کل ادھار)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            Rs. {totalMarketUdhaar.toLocaleString()}
          </span>
        </div>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main 2-Column Split: Customer list on left, Full ledger on right */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Customer Selection Panel */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => setPendingOnly(!pendingOnly)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  pendingOnly
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {pendingOnly ? 'Pending Udhaar Only' : 'All Customers'}
              </button>
              <span className="text-slate-400 font-semibold">{filteredCustomers.length} accounts</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No customer khata found.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomerId === c._id;
                return (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCustomerId(c._id)}
                    className={`w-full text-left p-3.5 flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-4 border-amber-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{c.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{c.phone}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm text-amber-700">
                        Rs. {c.currentBalance.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Total: Rs. {c.totalCredit.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Customer Ledger Sheet */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {detailLoading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            </div>
          ) : !customerDetail ? (
            <div className="flex h-96 flex-col items-center justify-center text-slate-400">
              <BookOpen className="h-12 w-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Select a customer to view their digital khata ledger</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Customer Header & Wasooli Action */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">
                      {customerDetail.customer.name}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      {customerDetail.customer.phone}
                    </span>
                  </div>
                  {customerDetail.customer.address && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{customerDetail.customer.address}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Khata Slip</span>
                  </button>

                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    <span>Record Payment (رقم وصول کریں)</span>
                  </button>
                </div>
              </div>

              {/* Balance Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Current Balance Due (باقی ادھار)
                  </span>
                  <div className="text-2xl font-black text-amber-900 mt-1">
                    Rs. {customerDetail.customer.currentBalance.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Udhaar Taken (کل لیا گیا ادھار)
                  </span>
                  <div className="text-2xl font-extrabold text-slate-800 mt-1">
                    Rs. {customerDetail.customer.totalCredit.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Total Amount Paid (اب تک دی گئی رقم)
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-900 mt-1">
                    Rs. {customerDetail.customer.paidAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Khata Ledger History Table */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>Ledger Transactions (کھاتہ تفصیل و اندراج)</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({customerDetail.ledger?.length || 0} entries)
                  </span>
                </h3>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Date / Time</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4 text-right">Debit (ادھار دیا)</th>
                        <th className="py-3 px-4 text-right">Credit (وصول ہوا)</th>
                        <th className="py-3 px-4 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {customerDetail.ledger?.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400">
                            No ledger entries found for this customer.
                          </td>
                        </tr>
                      ) : (
                        customerDetail.ledger.map((entry) => {
                          const isPayment = entry.type === 'payment_received';
                          const isCreditSale = entry.type === 'credit_sale';

                          return (
                            <tr key={entry._id} className="hover:bg-slate-50/60">
                              <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                                {new Date(entry.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isPayment
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isCreditSale
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {isPayment ? 'Payment' : isCreditSale ? 'Credit Sale' : 'Opening'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-800 font-sans">{entry.description}</td>
                              <td className="py-3 px-4 text-right font-bold text-amber-700">
                                {!isPayment ? `Rs. ${entry.amount.toLocaleString()}` : '-'}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-emerald-700">
                                {isPayment ? `Rs. ${entry.amount.toLocaleString()}` : '-'}
                              </td>
                              <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                                Rs. {entry.balanceAfter.toLocaleString()}
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
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && customerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Record Udhaar Payment (رقم وصول کریں)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Receiving payment from <span className="font-bold text-slate-800">{customerDetail.customer.name}</span>
            </p>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4 text-xs flex justify-between items-center">
              <span className="font-semibold text-amber-800">Total Udhaar Balance:</span>
              <span className="font-extrabold text-amber-900 text-sm">
                Rs. {customerDetail.customer.currentBalance.toLocaleString()}
              </span>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount Wasool (وصول شدہ رقم):
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-xs">
                    Rs.
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={customerDetail.customer.currentBalance}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cash">Cash (نقد رقم)</option>
                  <option value="online">EasyPaisa / JazzCash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Description:
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid by customer at counter"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  {submittingPayment ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Khata;
