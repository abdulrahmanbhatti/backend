const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// @desc Dashboard Overview Stats
// @route GET /api/reports/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's Sales
    const todaySales = await Sale.find({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
    const todayBillsCount = todaySales.length;
    const todayProfitTotal = todaySales.reduce((sum, s) => sum + s.profit, 0);

    // Products Stats
    const products = await Product.find({ status: 'active' });
    const totalProducts = products.length;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let nearExpiryCount = 0;

    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    products.forEach((p) => {
      if (p.quantity <= 0) outOfStockCount++;
      else if (p.quantity <= p.minStockLevel) lowStockCount++;

      if (p.expiryDate && new Date(p.expiryDate) <= thirtyDays) {
        nearExpiryCount++;
      }
    });

    // Udhaar / Khata total credit outstanding
    const customers = await Customer.find({ status: 'active' });
    const totalUdhaarPending = customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
    const customersWithUdhaarCount = customers.filter((c) => c.currentBalance > 0).length;

    // Supplier payable due
    const suppliers = await Supplier.find({ status: 'active' });
    const totalSupplierPayable = suppliers.reduce((sum, s) => sum + (s.currentPayable > 0 ? s.currentPayable : 0), 0);

    // Recent Sales
    const recentSales = await Sale.find().sort({ createdAt: -1 }).limit(5);

    // Recent Purchases
    const recentPurchases = await Purchase.find().sort({ createdAt: -1 }).limit(5);

    // Last 7 days sales for mini-chart
    const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7DaysSales = await Sale.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$total' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        today: {
          sales: todaySalesTotal,
          bills: todayBillsCount,
          profit: todayProfitTotal
        },
        inventory: {
          totalProducts,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          nearExpiry: nearExpiryCount
        },
        khata: {
          totalUdhaarPending,
          customersCount: customersWithUdhaarCount
        },
        supplier: {
          totalPayable: totalSupplierPayable
        },
        recentSales,
        recentPurchases,
        last7DaysSales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Comprehensive Analytics & Detailed Reports
// @route GET /api/reports/analytics
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    let dateQuery = {};

    const now = new Date();
    if (period === 'today') {
      dateQuery = {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      };
    } else if (period === 'yesterday') {
      const y = new Date(Date.now() - 24 * 60 * 60 * 1000);
      dateQuery = {
        $gte: new Date(y.setHours(0, 0, 0, 0)),
        $lte: new Date(y.setHours(23, 59, 59, 999))
      };
    } else if (period === 'weekly') {
      dateQuery = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === 'monthly') {
      dateQuery = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const saleFilter = dateQuery.$gte ? { createdAt: dateQuery } : {};
    const purchaseFilter = dateQuery.$gte ? { createdAt: dateQuery } : {};

    const sales = await Sale.find(saleFilter);
    const purchases = await Purchase.find(purchaseFilter);

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalCost = sales.reduce((sum, s) => sum + s.totalCost, 0);
    const totalPurchasesCost = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

    // Best-selling products aggregation
    const productSalesMap = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const id = item.product.toString();
        if (!productSalesMap[id]) {
          productSalesMap[id] = {
            name: item.name,
            quantitySold: 0,
            revenue: 0,
            profit: 0
          };
        }
        productSalesMap[id].quantitySold += item.quantity;
        productSalesMap[id].revenue += item.subtotal;
        productSalesMap[id].profit += (item.salePrice - item.purchasePrice) * item.quantity;
      });
    });

    const bestSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    // Payment methods breakdown
    const paymentMethods = {
      cash: 0,
      online: 0,
      udhaar: 0
    };
    sales.forEach((s) => {
      if (paymentMethods[s.paymentMethod] !== undefined) {
        paymentMethods[s.paymentMethod] += s.total;
      }
    });

    res.json({
      success: true,
      summary: {
        totalSales,
        totalProfit,
        totalCost,
        billsCount: sales.length,
        totalPurchasesCost,
        purchasesCount: purchases.length,
        marginPercentage: totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0
      },
      bestSellingProducts,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics
};
