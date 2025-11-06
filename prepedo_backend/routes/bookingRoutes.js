const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  getAvailableBookings,
  acceptBooking,
  updateBookingStatus,
  cancelBooking,
  getDriverBookings
} = require('../controllers/bookingController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private (User)
router.post(
  '/',
  [
    verifyToken,
    checkRole('user'),
    body('pickup_location').trim().notEmpty().withMessage('Pickup location is required'),
    body('pickup_latitude').isFloat().withMessage('Valid pickup latitude is required'),
    body('pickup_longitude').isFloat().withMessage('Valid pickup longitude is required'),
    body('dropoff_location').trim().notEmpty().withMessage('Dropoff location is required'),
    body('dropoff_latitude').isFloat().withMessage('Valid dropoff latitude is required'),
    body('dropoff_longitude').isFloat().withMessage('Valid dropoff longitude is required'),
    body('vehicle_type')
      .isIn(['bike', 'car', 'taxi'])
      .withMessage('Vehicle type must be bike, car, or taxi'),
    body('distance').isFloat({ min: 0.1 }).withMessage('Distance must be greater than 0'),
    handleValidationErrors
  ],
  createBooking
);

// @route   GET /api/bookings/my-bookings
// @desc    Get user bookings
// @access  Private (User)
router.get('/my-bookings', verifyToken, checkRole('user'), getUserBookings);

// @route   GET /api/bookings/available
// @desc    Get available bookings for drivers
// @access  Private (Driver)
router.get('/available', verifyToken, checkRole('driver'), getAvailableBookings);

// @route   GET /api/bookings/driver/my-bookings
// @desc    Get driver bookings
// @access  Private (Driver)
router.get('/driver/my-bookings', verifyToken, checkRole('driver'), getDriverBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', verifyToken, getBookingById);

// @route   PUT /api/bookings/:id/accept
// @desc    Accept booking
// @access  Private (Driver)
router.put('/:id/accept', verifyToken, checkRole('driver'), acceptBooking);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (arrived, started, completed)
// @access  Private (Driver)
router.put(
  '/:id/status',
  [
    verifyToken,
    checkRole('driver'),
    body('status')
      .isIn(['arrived', 'started', 'completed'])
      .withMessage('Status must be arrived, started, or completed'),
    handleValidationErrors
  ],
  updateBookingStatus
);

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put(
  '/:id/cancel',
  [
    verifyToken,
    body('reason').optional().trim(),
    handleValidationErrors
  ],
  cancelBooking
);

module.exports = router;