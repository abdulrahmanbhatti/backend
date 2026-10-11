const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const StockHistory = require('../models/StockHistory');
const LedgerEntry = require('../models/LedgerEntry');

// Generate unique invoice number
const generateInvoiceNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await Sale.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lte: new Date(new Date().setHours(23, 59, 59, 999))
    }
  });
  const seq = String(countToday + 1).padStart(4, '0');
  return `INV-${dateStr}-${seq}`;
};

// @desc Process new POS Sale / Checkout
// @route POST /api/pos/checkout
const checkout = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      items,
      discount = 0,
      paymentMethod = 'cash',
      paidAmount = 0,
      notes = ''
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty' });
    }

    let subtotal = 0;
    let totalCost = 0;
    const processedItems = [];

    // Verify stock and calculate totals
    for (const item of items) {
      const product = await Product.findById(item.productId || item._id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product '${item.name}' not found` });
      }

      const itemQty = Number(item.quantity) || 1;
      const itemSalePrice = Number(item.salePrice !== undefined ? item.salePrice : product.salePrice);
      const itemPurchasePrice = Number(product.purchasePrice) || 0;
      const itemSubtotal = itemQty * itemSalePrice;

      subtotal += itemSubtotal;
      totalCost += itemQty * itemPurchasePrice;

      processedItems.push({
        product: product._id,
        name: product.name,
        unit: product.unit,
        quantity: itemQty,
        purchasePrice: itemPurchasePrice,
        salePrice: itemSalePrice,
        subtotal: itemSubtotal
      });
    }

    const discountAmount = Number(discount) || 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const amountPaid = Number(paidAmount) || 0;

    let changeAmount = 0;
    let remainingDue = 0;

    if (paymentMethod === 'cash') {
      if (amountPaid >= finalTotal) {
        changeAmount = amountPaid - finalTotal;
        remainingDue = 0;
      } else {
        remainingDue = finalTotal - amountPaid;
      }
    } else if (paymentMethod === 'udhaar') {
      // Entire or partial unpaid amount goes to customer balance
      remainingDue = Math.max(0, finalTotal - amountPaid);
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'Customer must be selected for Udhaar (Credit) sale'
        });
      }
    } else {
      // Online / Card
      remainingDue = Math.max(0, finalTotal - amountPaid);
    }

    const profit = finalTotal - totalCost;
    const invoiceNumber = await generateInvoiceNumber();

    // 1. Create Sale
    const sale = await Sale.create({
      invoiceNumber,
      customer: customerId || null,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      cashier: req.user ? req.user._id : null,
      cashierName: req.user ? req.user.name : 'Cashier',
      items: processedItems,
      subtotal,
      discount: discountAmount,
      total: finalTotal,
      totalCost,
      profit,
      paymentMethod,
      paidAmount: amountPaid,
      changeAmount,
      remainingDue,
      notes
    });

    // 2. Decrease Stock & Record Stock History for each item
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const prevStock = product.quantity;
        const newStock = Math.max(0, prevStock - item.quantity);
        product.quantity = newStock;
        await product.save();

        await StockHistory.create({
          product: product._id,
          productName: product.name,
          type: 'sale',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `Sale ${invoiceNumber}`,
          referenceId: sale._id.toString(),
          user: req.user ? req.user._id : null,
          userName: req.user ? req.user.name : 'Cashier'
        });
      }
    }

    // 3. Update Customer & Khata if customer selected or udhaar
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer) {
        customer.totalPurchases += finalTotal;
        if (remainingDue > 0) {
          customer.totalCredit += remainingDue;
          customer.currentBalance += remainingDue;
        }
        customer.paidAmount += Math.min(amountPaid, finalTotal);
        await customer.save();

        // Create Ledger Entry for Udhaar or Sale
        await LedgerEntry.create({
          customer: customer._id,
          type: remainingDue > 0 ? 'credit_sale' : 'payment_received',
          sale: sale._id,
          amount: remainingDue > 0 ? remainingDue : finalTotal,
          balanceAfter: customer.currentBalance,
          description: `Bill #${invoiceNumber} (Total: Rs. ${finalTotal.toLocaleString()}, Paid: Rs. ${amountPaid.toLocaleString()}, Remaining Udhaar: Rs. ${remainingDue.toLocaleString()})`,
          paymentMethod,
          recordedBy: req.user ? req.user._id : null,
          recordedByName: req.user ? req.user.name : 'Cashier'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      data: sale
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during checkout', error: error.message });
  }
};

// @desc Get sales with date filters & pagination
// @route GET /api/pos/sales
const getSales = async (req, res) => {
  try {
    const { startDate, endDate, period, search, paymentMethod } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { cashierName: { $regex: search, $options: 'i' } }
      ];
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    const now = new Date();
    if (period === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      query.createdAt = { $gte: start, $lte: end };
    } else if (period === 'yesterday') {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const start = new Date(yesterday.setHours(0, 0, 0, 0));
      const end = new Date(yesterday.setHours(23, 59, 59, 999));
      query.createdAt = { $gte: start, $lte: end };
    } else if (period === 'weekly') {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: lastWeek };
    } else if (period === 'monthly') {
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: lastMonth };
    } else if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 });

    const totalSalesAmount = sales.reduce((acc, s) => acc + s.total, 0);
    const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
    const totalBills = sales.length;

    res.json({
      success: true,
      count: totalBills,
      totalSalesAmount,
      totalProfit,
      data: sales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get single sale invoice by ID or Invoice Number
// @route GET /api/pos/sales/:id
const getSaleById = async (req, res) => {
  try {
    let sale = await Sale.findById(req.params.id);
    if (!sale) {
      sale = await Sale.findOne({ invoiceNumber: req.params.id });
    }

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  checkout,
  getSales,
  getSaleById
};
