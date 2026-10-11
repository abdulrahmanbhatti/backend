const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  company: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    required: [true, 'Supplier phone number is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  totalPurchases: {
    type: Number,
    default: 0,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currentPayable: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
