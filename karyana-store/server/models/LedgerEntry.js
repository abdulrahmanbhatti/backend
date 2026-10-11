const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_sale', 'payment_received', 'adjustment', 'opening_balance'],
    required: true
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'bank_transfer', 'udhaar', 'other', 'none'],
    default: 'cash'
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordedByName: {
    type: String,
    default: 'Staff'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
