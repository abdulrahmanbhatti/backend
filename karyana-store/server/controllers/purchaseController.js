const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const StockHistory = require('../models/StockHistory');

const generatePurchaseNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await Purchase.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lte: new Date(new Date().setHours(23, 59, 59, 999))
    }
  });
  const seq = String(countToday + 1).padStart(4, '0');
  return `PUR-${dateStr}-${seq}`;
};

// @desc Record new Purchase from Wholesaler
// @route POST /api/purchases
const createPurchase = async (req, res) => {
  try {
    const { supplierId, items, paidAmount = 0, notes = '' } = req.body;

    if (!supplierId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Supplier and items are required' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item._id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }

      const qty = Number(item.quantity) || 1;
      const pPrice = Number(item.purchasePrice !== undefined ? item.purchasePrice : product.purchasePrice);
      const subtotal = qty * pPrice;
      totalAmount += subtotal;

      processedItems.push({
        product: product._id,
        name: product.name,
        unit: product.unit,
        quantity: qty,
        purchasePrice: pPrice,
        subtotal
      });
    }

    const paid = Number(paidAmount) || 0;
    const remainingBalance = Math.max(0, totalAmount - paid);
    const paymentStatus = paid >= totalAmount ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
    const purchaseNumber = await generatePurchaseNumber();

    // 1. Create Purchase record
    const purchase = await Purchase.create({
      purchaseNumber,
      supplier: supplier._id,
      supplierName: supplier.name,
      items: processedItems,
      totalAmount,
      paidAmount: paid,
      remainingBalance,
      paymentStatus,
      receivedBy: req.user ? req.user._id : null,
      receivedByName: req.user ? req.user.name : 'Staff',
      notes
    });

    // 2. Increase stock for each item & add to StockHistory
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const prevStock = product.quantity;
        const newStock = prevStock + item.quantity;
        product.quantity = newStock;
        // Optionally update the product's purchase price to the latest wholesale cost
        product.purchasePrice = item.purchasePrice;
        await product.save();

        await StockHistory.create({
          product: product._id,
          productName: product.name,
          type: 'purchase',
          quantityChange: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `Purchase ${purchaseNumber}`,
          referenceId: purchase._id.toString(),
          user: req.user ? req.user._id : null,
          userName: req.user ? req.user.name : 'Staff'
        });
      }
    }

    // 3. Update Supplier balance
    supplier.totalPurchases += totalAmount;
    supplier.paidAmount += paid;
    supplier.currentPayable += remainingBalance;
    await supplier.save();

    res.status(201).json({
      success: true,
      message: 'Purchase recorded and stock updated successfully',
      data: purchase
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get all purchases with filters
// @route GET /api/purchases
const getPurchases = async (req, res) => {
  try {
    const { supplierId, paymentStatus, search } = req.query;
    let query = {};

    if (supplierId) query.supplier = supplierId;
    if (paymentStatus && paymentStatus !== 'All') query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { purchaseNumber: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } }
      ];
    }

    const purchases = await Purchase.find(query).sort({ createdAt: -1 });
    const totalPurchaseCost = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

    res.json({
      success: true,
      count: purchases.length,
      totalPurchaseCost,
      data: purchases
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get single purchase
// @route GET /api/purchases/:id
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    res.json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById
};
