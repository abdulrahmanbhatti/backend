const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');

// @desc Get all suppliers
// @route GET /api/suppliers
const getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query).sort({ currentPayable: -1, name: 1 });
    const totalPayableToSuppliers = suppliers.reduce((acc, s) => acc + (s.currentPayable > 0 ? s.currentPayable : 0), 0);

    res.json({
      success: true,
      count: suppliers.length,
      totalPayableToSuppliers,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get single supplier
// @route GET /api/suppliers/:id
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const purchases = await Purchase.find({ supplier: supplier._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        supplier,
        purchases
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Create supplier
// @route POST /api/suppliers
const createSupplier = async (req, res) => {
  try {
    const { name, company, phone, address, notes, openingBalance = 0 } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    const initBalance = Number(openingBalance) || 0;

    const supplier = await Supplier.create({
      name: name.trim(),
      company: company || '',
      phone: phone.trim(),
      address: address || '',
      notes: notes || '',
      totalPurchases: initBalance,
      currentPayable: initBalance
    });

    res.status(201).json({ success: true, message: 'Supplier created successfully', data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Update supplier
// @route PUT /api/suppliers/:id
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const { name, company, phone, address, notes, status } = req.body;

    if (name) supplier.name = name.trim();
    if (company !== undefined) supplier.company = company;
    if (phone) supplier.phone = phone.trim();
    if (address !== undefined) supplier.address = address;
    if (notes !== undefined) supplier.notes = notes;
    if (status) supplier.status = status;

    await supplier.save();

    res.json({ success: true, message: 'Supplier updated successfully', data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Record payment made to Supplier
// @route POST /api/suppliers/:id/payment
const recordSupplierPayment = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const { amount, notes } = req.body;
    const paymentAmount = Number(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive payment amount is required' });
    }

    supplier.paidAmount += paymentAmount;
    supplier.currentPayable = Math.max(0, supplier.currentPayable - paymentAmount);
    await supplier.save();

    res.json({
      success: true,
      message: `Payment of Rs. ${paymentAmount.toLocaleString()} recorded for supplier`,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Delete supplier
// @route DELETE /api/suppliers/:id
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    if (supplier.currentPayable > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier with pending payable balance of Rs. ${supplier.currentPayable.toLocaleString()}`
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Supplier removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  recordSupplierPayment,
  deleteSupplier
};
