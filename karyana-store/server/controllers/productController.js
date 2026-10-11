const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');

// @desc Get all products with search & filters
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, stockStatus, status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (stockStatus === 'low') {
      query.$expr = {
        $and: [
          { $gt: ['$quantity', 0] },
          { $lte: ['$quantity', '$minStockLevel'] }
        ]
      };
    } else if (stockStatus === 'out') {
      query.quantity = { $lte: 0 };
    } else if (stockStatus === 'available') {
      query.quantity = { $gt: 0 };
    }

    const products = await Product.find(query).sort({ name: 1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get single product by Barcode or SKU
// @route GET /api/products/barcode/:code
const getProductByBarcode = async (req, res) => {
  try {
    const code = req.params.code.trim();
    const product = await Product.findOne({
      $or: [{ barcode: code }, { sku: code }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found with this barcode/SKU' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get single product
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Create new product
// @route POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      purchasePrice,
      salePrice,
      quantity,
      barcode,
      sku,
      unit,
      minStockLevel,
      expiryDate,
      image,
      status
    } = req.body;

    if (!name || salePrice === undefined) {
      return res.status(400).json({ success: false, message: 'Name and Sale Price are required' });
    }

    // Auto-generate barcode/sku if not given
    const genBarcode = barcode || `KAR-${Date.now().toString().slice(-8)}`;
    const genSku = sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = await Product.create({
      name: name.trim(),
      category: category || 'General',
      brand: brand || '',
      purchasePrice: Number(purchasePrice) || 0,
      salePrice: Number(salePrice),
      quantity: Number(quantity) || 0,
      barcode: genBarcode,
      sku: genSku,
      unit: unit || 'Piece',
      minStockLevel: Number(minStockLevel) || 5,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      image: image || '',
      status: status || 'active'
    });

    // Record initial stock entry
    if (Number(quantity) > 0) {
      await StockHistory.create({
        product: product._id,
        productName: product.name,
        type: 'opening_stock',
        quantityChange: Number(quantity),
        previousStock: 0,
        newStock: Number(quantity),
        reason: 'Initial stock entered upon product registration',
        user: req.user ? req.user._id : null,
        userName: req.user ? req.user.name : 'Admin'
      });
    }

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Update product
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      category,
      brand,
      purchasePrice,
      salePrice,
      quantity,
      barcode,
      sku,
      unit,
      minStockLevel,
      expiryDate,
      image,
      status
    } = req.body;

    // If quantity is modified directly here, log stock history
    if (quantity !== undefined && Number(quantity) !== product.quantity) {
      const diff = Number(quantity) - product.quantity;
      await StockHistory.create({
        product: product._id,
        productName: name || product.name,
        type: diff > 0 ? 'manual_add' : 'manual_reduce',
        quantityChange: diff,
        previousStock: product.quantity,
        newStock: Number(quantity),
        reason: 'Manual stock adjustment in product edit',
        user: req.user ? req.user._id : null,
        userName: req.user ? req.user.name : 'Staff'
      });
      product.quantity = Number(quantity);
    }

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (purchasePrice !== undefined) product.purchasePrice = Number(purchasePrice);
    if (salePrice !== undefined) product.salePrice = Number(salePrice);
    if (barcode) product.barcode = barcode;
    if (sku) product.sku = sku;
    if (unit) product.unit = unit;
    if (minStockLevel !== undefined) product.minStockLevel = Number(minStockLevel);
    if (expiryDate !== undefined) product.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (image !== undefined) product.image = image;
    if (status) product.status = status;

    await product.save();

    res.json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Delete product
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Instead of hard-deleting and breaking sales history, we can soft-delete or remove if no sales
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Adjust stock (Stock In, Stock Out, Damaged, Expired)
// @route POST /api/products/:id/adjust-stock
const adjustStock = async (req, res) => {
  try {
    const { type, quantityChange, reason } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const qty = Number(quantityChange);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity change is required' });
    }

    const prevStock = product.quantity;
    let newStock = prevStock;
    let actualChange = 0;

    if (type === 'stock_in' || type === 'manual_add') {
      actualChange = qty;
      newStock = prevStock + qty;
    } else if (['damaged', 'expired', 'manual_reduce', 'waste'].includes(type)) {
      if (prevStock < qty) {
        return res.status(400).json({ success: false, message: `Cannot reduce ${qty}. Current stock is only ${prevStock}.` });
      }
      actualChange = -qty;
      newStock = prevStock - qty;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid adjustment type' });
    }

    product.quantity = newStock;
    await product.save();

    await StockHistory.create({
      product: product._id,
      productName: product.name,
      type: type === 'stock_in' ? 'manual_add' : type,
      quantityChange: actualChange,
      previousStock: prevStock,
      newStock: newStock,
      reason: reason || `Manual adjustment: ${type}`,
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Staff'
    });

    res.json({
      success: true,
      message: `Stock updated successfully. New stock: ${newStock}`,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock
};
