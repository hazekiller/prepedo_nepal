const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  registerDriver,
  getDriverProfile,
  updateDriverStatus,
  updateDriverLocation,
  getDriverEarnings,
  getDriverStats
} = require('../controllers/driverController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// @route   POST /api/drivers/register
// @desc    Register new driver
// @access  Public
router.post(
  '/register',
  [
    // User info validation
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    // Driver info validation
    body('license_number').trim().notEmpty().withMessage('License number is required'),
    body('license_expiry').isDate().withMessage('Valid license expiry date is required'),
    body('citizenship_number').trim().notEmpty().withMessage('Citizenship number is required'),
    body('vehicle_type')
      .isIn(['bike', 'car', 'taxi'])
      .withMessage('Vehicle type must be bike, car, or taxi'),
    
    // Vehicle info validation
    body('vehicle_number').trim().notEmpty().withMessage('Vehicle number is required'),
    body('vehicle_model').trim().notEmpty().withMessage('Vehicle model is required'),
    body('vehicle_color').trim().notEmpty().withMessage('Vehicle color is required'),
    body('vehicle_year').isInt({ min: 1990, max: 2030 }).withMessage('Valid vehicle year is required'),
    body('bluebook_number').trim().notEmpty().withMessage('Bluebook number is required'),
    
    handleValidationErrors
  ],
  registerDriver
);

// @route   GET /api/drivers/profile
// @desc    Get driver profile
// @access  Private (Driver)
router.get('/profile', verifyToken, checkRole('driver'), getDriverProfile);

// @route   PUT /api/drivers/status
// @desc    Update driver online/offline status
// @access  Private (Driver)
router.put(
  '/status',
  [
    verifyToken,
    checkRole('driver'),
    body('is_online').isBoolean().withMessage('is_online must be true or false'),
    body('latitude').optional().isFloat().withMessage('Valid latitude is required'),
    body('longitude').optional().isFloat().withMessage('Valid longitude is required'),
    handleValidationErrors
  ],
  updateDriverStatus
);

// @route   PUT /api/drivers/location
// @desc    Update driver location
// @access  Private (Driver)
router.put(
  '/location',
  [
    verifyToken,
    checkRole('driver'),
    body('latitude').isFloat().withMessage('Valid latitude is required'),
    body('longitude').isFloat().withMessage('Valid longitude is required'),
    handleValidationErrors
  ],
  updateDriverLocation
);

// @route   GET /api/drivers/earnings
// @desc    Get driver earnings
// @access  Private (Driver)
router.get('/earnings', verifyToken, checkRole('driver'), getDriverEarnings);

// @route   GET /api/drivers/stats
// @desc    Get driver statistics
// @access  Private (Driver)
router.get('/stats', verifyToken, checkRole('driver'), getDriverStats);

module.exports = router;