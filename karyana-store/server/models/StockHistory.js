const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sale', 'purchase', 'manual_add', 'manual_reduce', 'damaged', 'expired', 'return', 'opening_stock'],
    required: true
  },
  quantityChange: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  referenceId: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    default: 'Staff'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockHistory', stockHistorySchema);
