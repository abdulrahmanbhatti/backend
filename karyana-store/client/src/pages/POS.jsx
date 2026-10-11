import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  BookOpen,
  User,
  Check,
  RotateCcw,
  Printer,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import ReceiptModal from '../components/common/ReceiptModal';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Cart state
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'online' | 'udhaar'
  const [paidAmount, setPaidAmount] = useState('');

  // Customer state for Udhaar / tracking
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');

  // UI & invoice state
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const barcodeInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch products and customers
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, custRes] = await Promise.all([
        api.get('/products?status=active'),
        api.get('/customers')
      ]);

      if (prodRes.success) {
        setProducts(prodRes.data);
        setFilteredProducts(prodRes.data);
        const cats = ['All', ...new Set(prodRes.data.map((p) => p.category).filter(Boolean))];
        setCategories(cats);
      }

      if (custRes.success) {
        setCustomers(custRes.data);
      }
    } catch (err) {
      console.error('Error loading POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    barcodeInputRef.current?.focus();
  }, []);

  // Filter products when search or category changes
  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  // Handle direct barcode scanner submission
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const code = barcodeInput.trim();
    const found = products.find((p) => p.barcode === code || p.sku === code);

    if (found) {
      addToCart(found);
      setBarcodeInput('');
    } else {
      setErrorMsg(`No product found with barcode: ${code}`);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    if (product.quantity <= 0) {
      setErrorMsg(`Warning: ${product.name} is currently out of stock!`);
      setTimeout(() => setErrorMsg(''), 3000);
    }

    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.salePrice }
            : item
        );
      } else {
        return [
          ...prev,
          {
            _id: product._id,
            productId: product._id,
            name: product.name,
            unit: product.unit,
            salePrice: product.salePrice,
            purchasePrice: product.purchasePrice,
            quantity: 1,
            subtotal: product.salePrice
          }
        ];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id === productId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty, subtotal: newQty * item.salePrice };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setPaidAmount('');
    setSelectedCustomer(null);
  };

  // Computations
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const netTotal = Math.max(0, subtotal - (Number(discount) || 0));

  // Default tender amount when cash is selected
  useEffect(() => {
    if (paymentMethod === 'cash' && cart.length > 0 && !paidAmount) {
      setPaidAmount(netTotal.toString());
    } else if (paymentMethod === 'udhaar') {
      setPaidAmount('0');
    }
  }, [netTotal, paymentMethod]);

  const numPaid = Number(paidAmount) || 0;
  const changeDue = paymentMethod === 'cash' ? Math.max(0, numPaid - netTotal) : 0;
  const udhaarDue = paymentMethod === 'udhaar' ? Math.max(0, netTotal - numPaid) : 0;

  // Checkout submission
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMsg('Cart is empty. Please add products first.');
      return;
    }

    if (paymentMethod === 'udhaar' && !selectedCustomer) {
      setErrorMsg('Please select a Customer for Udhaar (Khata) sale.');
      return;
    }

    setCheckoutLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        customerId: selectedCustomer?._id || null,
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        customerPhone: selectedCustomer?.phone || '',
        items: cart,
        discount: Number(discount) || 0,
        paymentMethod,
        paidAmount: paymentMethod === 'cash' ? Math.min(numPaid, netTotal) : numPaid
      };

      const res = await api.post('/pos/checkout', payload);
      if (res.success) {
        setCompletedSale(res.data);
        clearCart();
        loadData(); // refresh stock numbers
      }
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-6rem)]">
      {/* Left Column: Product Catalog & Fast Scanner */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Bar: Barcode Scanner Input & Product Search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Barcode Scanner direct input */}
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                <Barcode className="h-5 w-5" />
              </div>
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode (Enter to add instantly)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </form>

            {/* Name/Code search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product (Shan, Rice, Oil, Surf)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <p className="text-sm">No products found matching your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const inCart = cart.find((item) => item._id === p._id);
                const isOut = p.quantity <= 0;
                const isLow = p.quantity > 0 && p.quantity <= p.minStockLevel;

                return (
                  <button
                    key={p._id}
                    onClick={() => addToCart(p)}
                    className={`flex flex-col text-left justify-between p-3 rounded-2xl border transition-all active:scale-95 ${
                      inCart
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                        : isOut
                        ? 'border-rose-200 bg-rose-50/30 opacity-75'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {p.category}
                        </span>
                        {isOut ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">
                            Low: {p.quantity}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {p.quantity} {p.unit}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.barcode}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-sm sm:text-base font-extrabold text-emerald-700">
                        Rs. {p.salePrice}
                      </span>
                      {inCart ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-sm">
                          {inCart.quantity}
                        </span>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white">
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active Cart & Fast Billing Summary */}
      <div className="w-full xl:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cart Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Cart ({cart.reduce((a, b) => a + b.quantity, 0)} Items)</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Customer Selector (Walk-in or Udhaar Account) */}
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Customer / Khata Account (گاہک)
          </label>
          <div className="relative">
            <select
              value={selectedCustomer?._id || ''}
              onChange={(e) => {
                const c = customers.find((cust) => cust._id === e.target.value);
                setSelectedCustomer(c || null);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Walk-in Customer (عام گاہک)</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone}) — Udhaar: Rs. {c.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-xs">
              <span className="font-bold text-amber-900">{selectedCustomer.name}</span>
              <span className="font-extrabold text-amber-700">
                Pichla Udhaar: Rs. {selectedCustomer.currentBalance.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
              <ShoppingCart className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-semibold">Cart is currently empty</p>
              <p className="text-[11px] text-slate-400">Scan barcode or click items to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-bold text-xs text-slate-800 truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Rs. {item.salePrice} × {item.quantity} ={' '}
                    <span className="font-bold text-slate-800">Rs. {item.subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item._id, -1)}
                    className="h-6 w-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, 1)}
                    className="h-6 w-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="ml-1 text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Calculations & Tender Section */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
          {/* Subtotal & Discount */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-800">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount (رعایت):</span>
              <div className="flex items-center gap-1">
                <span>Rs.</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-0.5 text-right font-bold text-xs"
                />
              </div>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-1.5">
              <span>Net Total (کل بل):</span>
              <span className="text-emerald-700">Rs. {netTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Banknote className="h-4 w-4 mb-0.5" />
                <span>Cash (نقد)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                  paymentMethod === 'online'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="h-4 w-4 mb-0.5" />
                <span>Online (آنلائن)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('udhaar')}
                className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                  paymentMethod === 'udhaar'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="h-4 w-4 mb-0.5" />
                <span>Udhaar (ادھار)</span>
              </button>
            </div>
          </div>

          {/* Cash Tender & Change Calculations */}
          {paymentMethod === 'cash' && (
            <div className="rounded-xl bg-white border border-slate-200 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Received / Wasool (وصول):</span>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0"
                  className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-right font-bold text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 border-t border-slate-100 pt-1">
                <span>Change to Return (بقایا واپس):</span>
                <span>Rs. {changeDue.toLocaleString()}</span>
              </div>
            </div>
          )}

          {paymentMethod === 'udhaar' && selectedCustomer && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-900 font-semibold space-y-1">
              <div className="flex justify-between">
                <span>Existing Udhaar:</span>
                <span>Rs. {selectedCustomer.currentBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-900 border-t border-amber-200 pt-0.5">
                <span>New Total Udhaar:</span>
                <span>Rs. {(selectedCustomer.currentBalance + netTotal).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Complete Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading || cart.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {checkoutLoading ? (
              <span>Saving Sale...</span>
            ) : (
              <>
                <Printer className="h-4 w-4" />
                <span>Save & Print Invoice (بل مکمل کریں)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instant Receipt Modal */}
      {completedSale && (
        <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}
    </div>
  );
};

export default POS;
