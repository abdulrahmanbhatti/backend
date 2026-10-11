const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: 'Piece'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  purchasePrice: {
    type: Number,
    required: true,
    default: 0
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  customerName: {
    type: String,
    default: 'Walk-in Customer'
  },
  customerPhone: {
    type: String,
    default: ''
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cashierName: {
    type: String,
    required: true
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'udhaar', 'split'],
    default: 'cash'
  },
  paidAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  changeAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingDue: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['completed', 'returned', 'cancelled'],
    default: 'completed'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sale', saleSchema);
