const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  recordSupplierPayment,
  deleteSupplier
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSuppliers);
router.get('/:id', protect, getSupplierById);
router.post('/', protect, authorize('Admin', 'Manager'), createSupplier);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateSupplier);
router.post('/:id/payment', protect, authorize('Admin', 'Manager'), recordSupplierPayment);
router.delete('/:id', protect, authorize('Admin'), deleteSupplier);

module.exports = router;
