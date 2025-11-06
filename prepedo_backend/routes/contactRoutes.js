// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/', contactController.create);      // 👈 Allow users to submit contact forms
router.get('/', contactController.getAll);
router.get('/:id', contactController.getById);

// Admin routes (protected)
router.put('/:id/status', protect, contactController.updateStatus);

module.exports = router;
