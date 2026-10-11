const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, backupData } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSettings);
router.put('/', protect, authorize('Admin'), updateSettings);
router.get('/backup', protect, authorize('Admin'), backupData);

module.exports = router;
