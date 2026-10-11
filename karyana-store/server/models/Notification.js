const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'expiry', 'khata_overdue', 'supplier_due', 'system'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
