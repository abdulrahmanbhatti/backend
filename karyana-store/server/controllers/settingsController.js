const Setting = require('../models/Setting');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const LedgerEntry = require('../models/LedgerEntry');

// @desc Get store settings
// @route GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Update store settings
// @route PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Backup entire store database to JSON
// @route GET /api/settings/backup
const backupData = async (req, res) => {
  try {
    const [products, customers, suppliers, sales, purchases, ledger, settings] = await Promise.all([
      Product.find(),
      Customer.find(),
      Supplier.find(),
      Sale.find(),
      Purchase.find(),
      LedgerEntry.find(),
      Setting.find()
    ]);

    const backup = {
      backupDate: new Date().toISOString(),
      version: '1.0',
      data: {
        products,
        customers,
        suppliers,
        sales,
        purchases,
        ledger,
        settings
      }
    };

    res.json({
      success: true,
      backup
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Backup failed', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  backupData
};
