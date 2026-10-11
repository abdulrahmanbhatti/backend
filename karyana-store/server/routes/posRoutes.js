const express = require('express');
const router = express.Router();
const { checkout, getSales, getSaleById } = require('../controllers/posController');
const { protect } = require('../middleware/auth');

router.post('/checkout', protect, checkout);
router.get('/sales', protect, getSales);
router.get('/sales/:id', protect, getSaleById);

module.exports = router;
