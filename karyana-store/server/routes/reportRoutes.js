const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalytics } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/analytics', protect, authorize('Admin', 'Manager'), getAnalytics);

module.exports = router;
