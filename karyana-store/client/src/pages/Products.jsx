import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Barcode,
  AlertTriangle,
  X,
  CheckCircle,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UNITS = ['Piece', 'Packet', 'Box', 'Bottle', 'Kg', 'Gram', 'Liter', 'Dozen'];
const CATEGORIES = [
  'General',
  'Oil & Ghee',
  'Spices & Recipe Mixes',
  'Beverages & Tea',
  'Dairy & Milk',
  'Grains & Pulses',
  'Flour & Grains',
  'Sugar & Sweeteners',
  'Household & Cleaning',
  'Personal Care',
  'Beverages & Syrups',
  'Sauces & Condiments',
  'Snacks & Biscuits'
];

const Products = () => {
  const { isManager, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    brand: '',
    purchasePrice: '',
    salePrice: '',
    quantity: '',
    barcode: '',
    sku: '',
    unit: 'Piece',
    minStockLevel: '5',
    expiryDate: ''
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'General',
      brand: '',
      purchasePrice: '',
      salePrice: '',
      quantity: '',
      barcode: `KAR-${Date.now().toString().slice(-8)}`,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      unit: 'Piece',
      minStockLevel: '5',
      expiryDate: ''
    });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      brand: p.brand || '',
      purchasePrice: p.purchasePrice.toString(),
      salePrice: p.salePrice.toString(),
      quantity: p.quantity.toString(),
      barcode: p.barcode || '',
      sku: p.sku || '',
      unit: p.unit || 'Piece',
      minStockLevel: p.minStockLevel?.toString() || '5',
      expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
        setMsg('Product updated successfully!');
      } else {
        await api.post('/products', formData);
        setMsg('Product created successfully!');
      }
      setShowModal(false);
      fetchProducts();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/products/${id}`);
      setMsg(`${name} removed successfully.`);
      fetchProducts();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());

    let matchStock = true;
    if (stockFilter === 'low') matchStock = p.quantity > 0 && p.quantity <= p.minStockLevel;
    if (stockFilter === 'out') matchStock = p.quantity <= 0;

    return matchCat && matchSearch && matchStock;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Product Management (اشیاء و قیمتیں)
          </h1>
          <p className="text-xs text-slate-500">
            Manage your store inventory, retail & wholesale prices, barcodes and units
          </p>
        </div>

        {isManager && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product (نئی چیز شامل کریں)</span>
          </button>
        )}
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, barcode, or SKU..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setStockFilter('all')}
              className={`flex-1 rounded-xl text-xs font-bold py-2 transition-all ${
                stockFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`flex-1 rounded-xl text-xs font-bold py-2 transition-all ${
                stockFilter === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`flex-1 rounded-xl text-xs font-bold py-2 transition-all ${
                stockFilter === 'out' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Barcode / SKU</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Sale Price</th>
                <th className="py-3.5 px-4 text-right">Profit Margin</th>
                <th className="py-3.5 px-4 text-center">Current Stock</th>
                <th className="py-3.5 px-4 text-center">Unit</th>
                {isManager && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    Loading products catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isOut = p.quantity <= 0;
                  const isLow = p.quantity > 0 && p.quantity <= p.minStockLevel;
                  const margin = p.salePrice - p.purchasePrice;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{p.name}</div>
                        {p.brand && <div className="text-[10px] text-slate-400">{p.brand}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <div>{p.barcode}</div>
                        <div className="text-[10px] text-slate-400">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        Rs. {p.purchasePrice}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        Rs. {p.salePrice}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        +Rs. {margin}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.quantity} {p.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">{p.unit}</td>
                      {isManager && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(p._id, p.name)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingProduct ? 'Edit Product (اشیاء تبدیل کریں)' : 'Add New Product (نئی چیز شامل کریں)'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Complete all inventory details below</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name (چیز کا نام):
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shan Biryani Masala 50g"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand:</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Shan, Dalda, Tapal"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Purchase / Wholesale Price (خرید قیمت):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sale / Retail Price (فروخت قیمت):
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Qty:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit:</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Alert Level:</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Barcode:</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date:</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
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
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
