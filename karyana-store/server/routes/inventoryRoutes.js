const express = require('express');
const router = express.Router();
const { getInventoryOverview, getStockHistory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/overview', protect, getInventoryOverview);
router.get('/history', protect, authorize('Admin', 'Manager'), getStockHistory);

module.exports = router;
