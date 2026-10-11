const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  recordPayment,
  deleteCustomer
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomerById);
router.post('/', protect, createCustomer);
router.put('/:id', protect, updateCustomer);
router.post('/:id/payment', protect, recordPayment);
router.delete('/:id', protect, authorize('Admin'), deleteCustomer);

module.exports = router;
