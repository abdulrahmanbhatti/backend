const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');

// @desc Get inventory status overview & stock alerts
// @route GET /api/inventory/overview
const getInventoryOverview = async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' });

    let totalProducts = products.length;
    let totalStockItems = 0;
    let inventoryCostValue = 0;
    let inventoryRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringCount = 0;

    const now = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const lowStockList = [];
    const outOfStockList = [];
    const expiringList = [];

    products.forEach((p) => {
      totalStockItems += p.quantity;
      inventoryCostValue += p.quantity * p.purchasePrice;
      inventoryRetailValue += p.quantity * p.salePrice;

      if (p.quantity <= 0) {
        outOfStockCount++;
        outOfStockList.push(p);
      } else if (p.quantity <= p.minStockLevel) {
        lowStockCount++;
        lowStockList.push(p);
      }

      if (p.expiryDate) {
        const exp = new Date(p.expiryDate);
        if (exp <= thirtyDaysLater) {
          expiringCount++;
          expiringList.push(p);
        }
      }
    });

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalStockItems,
        inventoryCostValue,
        inventoryRetailValue,
        potentialProfit: inventoryRetailValue - inventoryCostValue,
        lowStockCount,
        outOfStockCount,
        expiringCount
      },
      lowStockList: lowStockList.slice(0, 10),
      outOfStockList: outOfStockList.slice(0, 10),
      expiringList: expiringList.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get stock movements history
// @route GET /api/inventory/history
const getStockHistory = async (req, res) => {
  try {
    const { productId, type, limit = 50 } = req.query;
    let query = {};

    if (productId) query.product = productId;
    if (type && type !== 'All') query.type = type;

    const history = await StockHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getInventoryOverview,
  getStockHistory
};
