const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
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
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const purchaseSchema = new mongoose.Schema({
  purchaseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  items: [purchaseItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  remainingBalance: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'unpaid'
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receivedByName: {
    type: String,
    default: 'Staff'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Purchase', purchaseSchema);
