const express = require('express');
const router = express.Router();
const { login, getMe, getStaff, createStaff, updateStaff } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);

// Staff management (Admin only)
router.get('/staff', protect, authorize('Admin'), getStaff);
router.post('/staff', protect, authorize('Admin'), createStaff);
router.put('/staff/:id', protect, authorize('Admin'), updateStaff);

module.exports = router;
