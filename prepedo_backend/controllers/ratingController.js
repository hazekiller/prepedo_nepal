const { promisePool } = require('../config/database');

// @desc    Submit rating and review
// @route   POST /api/ratings
// @access  Private (User)
const submitRating = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { booking_id, rating, review } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Get booking info
    const [bookings] = await connection.query(
      `SELECT b.*, d.id as driver_id
       FROM bookings b
       INNER JOIN drivers d ON b.driver_id = d.id
       WHERE b.id = ? AND b.user_id = ?`,
      [booking_id, userId]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not authorized'
      });
    }

    const booking = bookings[0];

    if (booking.status !== 'completed') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'You can only rate completed bookings'
      });
    }

    // Check if already rated
    const [existingRatings] = await connection.query(
      'SELECT id FROM ratings WHERE booking_id = ?',
      [booking_id]
    );

    if (existingRatings.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'You have already rated this booking'
      });
    }

    // Insert rating
    await connection.query(
      `INSERT INTO ratings (booking_id, user_id, driver_id, rating, review)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, userId, booking.driver_id, rating, review]
    );

    // Update driver's average rating
    const [avgRating] = await connection.query(
      `SELECT AVG(rating) as avg_rating
       FROM ratings
       WHERE driver_id = ?`,
      [booking.driver_id]
    );

    await connection.query(
      'UPDATE drivers SET rating = ? WHERE id = ?',
      [parseFloat(avgRating[0].avg_rating).toFixed(2), booking.driver_id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// @desc    Get driver ratings
// @route   GET /api/ratings/driver/:driverId
// @access  Public
const getDriverRatings = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const { limit = 20, offset = 0 } = req.query;

    // Get driver average rating
    const [driverInfo] = await promisePool.query(
      `SELECT d.rating, d.total_rides, u.full_name as driver_name
       FROM drivers d
       INNER JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [driverId]
    );

    if (driverInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Get ratings breakdown
    const [ratingsBreakdown] = await promisePool.query(
      `SELECT 
        rating,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ratings WHERE driver_id = ?)) as percentage
      FROM ratings
      WHERE driver_id = ?
      GROUP BY rating
      ORDER BY rating DESC`,
      [driverId, driverId]
    );

    // Get recent reviews
    const [reviews] = await promisePool.query(
      `SELECT 
        r.rating, r.review, r.created_at,
        u.full_name as user_name,
        b.booking_number
      FROM ratings r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN bookings b ON r.booking_id = b.id
      WHERE r.driver_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [driverId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await promisePool.query(
      'SELECT COUNT(*) as total FROM ratings WHERE driver_id = ?',
      [driverId]
    );

    res.json({
      success: true,
      data: {
        driver: driverInfo[0],
        ratings_breakdown: ratingsBreakdown,
        reviews: reviews,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    console.error('Get driver ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my ratings (as user)
// @route   GET /api/ratings/my-ratings
// @access  Private (User)
const getMyRatings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [ratings] = await promisePool.query(
      `SELECT 
        r.*,
        b.booking_number, b.pickup_location, b.dropoff_location,
        u.full_name as driver_name,
        d.vehicle_type
      FROM ratings r
      INNER JOIN bookings b ON r.booking_id = b.id
      INNER JOIN drivers d ON r.driver_id = d.id
      INNER JOIN users u ON d.user_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  submitRating,
  getDriverRatings,
  getMyRatings
};