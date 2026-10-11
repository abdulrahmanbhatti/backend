const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'General'
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: 0,
    default: 0
  },
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: 0,
    default: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  unit: {
    type: String,
    enum: ['Piece', 'Packet', 'Box', 'Bottle', 'Kg', 'Gram', 'Liter', 'Dozen'],
    default: 'Piece'
  },
  minStockLevel: {
    type: Number,
    default: 5,
    min: 0
  },
  expiryDate: {
    type: Date,
    default: null
  },
  image: {
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

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function () {
  return this.quantity > 0 && this.quantity <= this.minStockLevel;
});

// Virtual for out of stock status
productSchema.virtual('isOutOfStock').get(function () {
  return this.quantity <= 0;
});

module.exports = mongoose.model('Product', productSchema);
