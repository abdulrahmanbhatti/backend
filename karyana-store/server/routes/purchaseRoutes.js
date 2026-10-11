const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getPurchases,
  getPurchaseById
} = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('Admin', 'Manager'), getPurchases);
router.get('/:id', protect, authorize('Admin', 'Manager'), getPurchaseById);
router.post('/', protect, authorize('Admin', 'Manager'), createPurchase);

module.exports = router;
