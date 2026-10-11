const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'Bismillah Karyana & General Store'
  },
  tagline: {
    type: String,
    default: 'Taza Aur Khalis Ashya Ka Ba-Aitimad Markaz'
  },
  phone: {
    type: String,
    default: '0300-1234567'
  },
  address: {
    type: String,
    default: 'Main Bazar, Near Jamia Masjid, Lahore, Pakistan'
  },
  currency: {
    type: String,
    default: 'Rs.'
  },
  invoiceFooter: {
    type: String,
    default: 'Shukriya! Dobara Tashreef Layen. Khareeda huwa maal wapas nahi hoga.'
  },
  lowStockAlertThreshold: {
    type: Number,
    default: 5
  },
  expiryAlertDays: {
    type: Number,
    default: 30
  },
  taxPercentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
