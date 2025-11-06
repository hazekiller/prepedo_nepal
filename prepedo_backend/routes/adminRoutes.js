const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getDashboardStats,
  getAllUsers,
  getPendingDrivers,
  approveDriver,
  getAllBookings,
  toggleUserStatus,
  getRevenueReports,
  createAdmin
} = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// All routes require admin role
router.use(verifyToken, checkRole('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', getAllUsers);

// @route   GET /api/admin/drivers/pending
// @desc    Get pending driver approvals
// @access  Private (Admin)
router.get('/drivers/pending', getPendingDrivers);

// @route   PUT /api/admin/drivers/:id/approve
// @desc    Approve or reject driver
// @access  Private (Admin)
router.put(
  '/drivers/:id/approve',
  [
    body('is_approved').isBoolean().withMessage('is_approved must be true or false'),
    body('rejection_reason').optional().trim(),
    handleValidationErrors
  ],
  approveDriver
);

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private (Admin)
router.get('/bookings', getAllBookings);

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private (Admin)
router.put(
  '/users/:id/toggle-status',
  [
    body('is_active').isBoolean().withMessage('is_active must be true or false'),
    handleValidationErrors
  ],
  toggleUserStatus
);

// @route   GET /api/admin/reports/revenue
// @desc    Get revenue reports
// @access  Private (Admin)
router.get('/reports/revenue', getRevenueReports);

// @route   POST /api/admin/create-admin
// @desc    Create new admin user
// @access  Private (Admin)
router.post(
  '/create-admin',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
  ],
  createAdmin
);

module.exports = router;