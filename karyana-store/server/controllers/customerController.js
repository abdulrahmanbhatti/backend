const Customer = require('../models/Customer');
const LedgerEntry = require('../models/LedgerEntry');
const Sale = require('../models/Sale');

// @desc Get all customers
// @route GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const { search, withBalanceOnly } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (withBalanceOnly === 'true') {
      query.currentBalance = { $gt: 0 };
    }

    const customers = await Customer.find(query).sort({ currentBalance: -1, name: 1 });

    // Calculate totals
    const totalCreditOutstanding = customers.reduce((acc, c) => acc + (c.currentBalance > 0 ? c.currentBalance : 0), 0);

    res.json({
      success: true,
      count: customers.length,
      totalCreditOutstanding,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get single customer with ledger history and sales
// @route GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const ledger = await LedgerEntry.find({ customer: customer._id }).sort({ createdAt: -1 });
    const recentSales = await Sale.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      data: {
        customer,
        ledger,
        recentSales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Create customer
// @route POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, phone, address, notes, openingBalance } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    const initBalance = Number(openingBalance) || 0;

    const customer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      address: address || '',
      notes: notes || '',
      totalCredit: initBalance,
      currentBalance: initBalance
    });

    if (initBalance > 0) {
      await LedgerEntry.create({
        customer: customer._id,
        type: 'opening_balance',
        amount: initBalance,
        balanceAfter: initBalance,
        description: 'Opening udhaar balance recorded',
        paymentMethod: 'none',
        recordedBy: req.user ? req.user._id : null,
        recordedByName: req.user ? req.user.name : 'Staff'
      });
    }

    res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Update customer
// @route PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { name, phone, address, notes, status } = req.body;

    if (name) customer.name = name.trim();
    if (phone) customer.phone = phone.trim();
    if (address !== undefined) customer.address = address;
    if (notes !== undefined) customer.notes = notes;
    if (status) customer.status = status;

    await customer.save();

    res.json({ success: true, message: 'Customer updated successfully', data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Record Payment received from Customer (Udhaar Wapsi)
// @route POST /api/customers/:id/payment
const recordPayment = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { amount, paymentMethod, notes } = req.body;
    const paymentAmount = Number(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive payment amount is required' });
    }

    const prevBalance = customer.currentBalance;
    const newBalance = prevBalance - paymentAmount;

    customer.paidAmount += paymentAmount;
    customer.currentBalance = newBalance;
    await customer.save();

    const ledgerEntry = await LedgerEntry.create({
      customer: customer._id,
      type: 'payment_received',
      amount: paymentAmount,
      balanceAfter: newBalance,
      description: notes || `Payment received via ${paymentMethod || 'cash'}`,
      paymentMethod: paymentMethod || 'cash',
      recordedBy: req.user ? req.user._id : null,
      recordedByName: req.user ? req.user.name : 'Staff'
    });

    res.json({
      success: true,
      message: `Payment of Rs. ${paymentAmount.toLocaleString()} recorded successfully`,
      data: {
        customer,
        ledgerEntry
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Delete customer
// @route DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (customer.currentBalance > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with remaining udhaar balance of Rs. ${customer.currentBalance.toLocaleString()}`
      });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  recordPayment,
  deleteCustomer
};
