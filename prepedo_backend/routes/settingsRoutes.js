const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All routes require admin role
router.use(verifyToken, checkRole('admin'));

// @route   GET /api/admin/settings
// @desc    Get all system settings
// @access  Private (Admin)
router.get('/settings', getSettings);

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Private (Admin)
router.put('/settings', updateSettings);

module.exports = router;
