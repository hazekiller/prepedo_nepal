const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  submitRating,
  getDriverRatings,
  getMyRatings
} = require('../controllers/ratingController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// @route   POST /api/ratings
// @desc    Submit rating and review
// @access  Private (User)
router.post(
  '/',
  [
    verifyToken,
    checkRole('user'),
    body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').optional().trim(),
    handleValidationErrors
  ],
  submitRating
);

// @route   GET /api/ratings/driver/:driverId
// @desc    Get driver ratings
// @access  Public
router.get('/driver/:driverId', getDriverRatings);

// @route   GET /api/ratings/my-ratings
// @desc    Get my ratings (as user)
// @access  Private (User)
router.get('/my-ratings', verifyToken, checkRole('user'), getMyRatings);

module.exports = router;