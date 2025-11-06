const { promisePool } = require('../config/database');

// Helper function to calculate fare
const calculateFare = (distance, vehicleType) => {
  let baseFare, perKmFare;

  switch (vehicleType) {
    case 'bike':
      baseFare = parseFloat(process.env.BASE_FARE_BIKE) || 50;
      perKmFare = parseFloat(process.env.PER_KM_FARE_BIKE) || 15;
      break;
    case 'car':
      baseFare = parseFloat(process.env.BASE_FARE_CAR) || 100;
      perKmFare = parseFloat(process.env.PER_KM_FARE_CAR) || 25;
      break;
    case 'taxi':
      baseFare = parseFloat(process.env.BASE_FARE_TAXI) || 150;
      perKmFare = parseFloat(process.env.PER_KM_FARE_TAXI) || 30;
      break;
    default:
      baseFare = 50;
      perKmFare = 15;
  }

  const totalFare = baseFare + (distance * perKmFare);
  return Math.round(totalFare);
};

// Helper function to generate booking number
const generateBookingNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BK${timestamp}${random}`;
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    const {
      pickup_location,
      pickup_latitude,
      pickup_longitude,
      dropoff_location,
      dropoff_latitude,
      dropoff_longitude,
      vehicle_type,
      distance,
      notes
    } = req.body;

    const userId = req.user.id;

    // Generate booking number
    const bookingNumber = generateBookingNumber();

    // Calculate fare
    const estimatedFare = calculateFare(distance, vehicle_type);

    // Insert booking
    const [result] = await promisePool.query(
      `INSERT INTO bookings (
        booking_number, user_id, pickup_location, pickup_latitude, pickup_longitude,
        dropoff_location, dropoff_latitude, dropoff_longitude, vehicle_type,
        distance, estimated_fare, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        bookingNumber, userId, pickup_location, pickup_latitude, pickup_longitude,
        dropoff_location, dropoff_latitude, dropoff_longitude, vehicle_type,
        distance, estimatedFare, notes
      ]
    );

    // Get created booking
    const [bookings] = await promisePool.query(
      `SELECT b.*, u.full_name as user_name, u.phone as user_phone
       FROM bookings b
       INNER JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: bookings[0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
const getUserBookings = async (req, res) => {
  try {
    const { status = 'all', limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    let statusFilter = '';
    if (status !== 'all') {
      statusFilter = `AND b.status = '${status}'`;
    }

    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        u.full_name as user_name, u.phone as user_phone,
        d.id as driver_id,
        du.full_name as driver_name, du.phone as driver_phone,
        dr.rating as driver_rating,
        v.vehicle_number, v.vehicle_model, v.vehicle_color
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      LEFT JOIN drivers d ON b.driver_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      LEFT JOIN drivers dr ON d.id = dr.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.user_id = ? ${statusFilter}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await promisePool.query(
      `SELECT COUNT(*) as total FROM bookings WHERE user_id = ? ${statusFilter}`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: countResult[0].total > (parseInt(offset) + parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        u.full_name as user_name, u.phone as user_phone, u.email as user_email,
        d.id as driver_id,
        du.full_name as driver_name, du.phone as driver_phone,
        dr.rating as driver_rating, dr.vehicle_type,
        v.vehicle_number, v.vehicle_model, v.vehicle_color, v.vehicle_year,
        r.rating as user_rating, r.review
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      LEFT JOIN drivers d ON b.driver_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      LEFT JOIN drivers dr ON d.id = dr.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      LEFT JOIN ratings r ON b.id = r.booking_id
      WHERE b.id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Check authorization
    if (req.user.role === 'user' && booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    if (req.user.role === 'driver') {
      // Get driver's id
      const [drivers] = await promisePool.query(
        'SELECT id FROM drivers WHERE user_id = ?',
        [req.user.id]
      );
      
      if (drivers.length === 0 || booking.driver_id !== drivers[0].id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this booking'
        });
      }
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get available bookings for drivers
// @route   GET /api/bookings/available
// @access  Private (Driver)
const getAvailableBookings = async (req, res) => {
  try {
    // Get driver info
    const [drivers] = await promisePool.query(
      `SELECT id, vehicle_type, is_approved, is_online, current_latitude, current_longitude
       FROM drivers WHERE user_id = ?`,
      [req.user.id]
    );

    if (drivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const driver = drivers[0];

    if (!driver.is_approved) {
      return res.status(403).json({
        success: false,
        message: 'Your driver account is not approved yet'
      });
    }

    if (!driver.is_online) {
      return res.status(403).json({
        success: false,
        message: 'You need to be online to view available bookings'
      });
    }

    // Get pending bookings matching driver's vehicle type
    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        u.full_name as user_name, u.phone as user_phone
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      WHERE b.status = 'pending' 
        AND b.vehicle_type = ?
      ORDER BY b.created_at DESC
      LIMIT 20`,
      [driver.vehicle_type]
    );

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get available bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Accept booking (Driver)
// @route   PUT /api/bookings/:id/accept
// @access  Private (Driver)
const acceptBooking = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const bookingId = req.params.id;

    // Get driver info
    const [drivers] = await connection.query(
      'SELECT id, is_approved, is_online FROM drivers WHERE user_id = ?',
      [req.user.id]
    );

    if (drivers.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const driver = drivers[0];

    if (!driver.is_approved || !driver.is_online) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'You must be approved and online to accept bookings'
      });
    }

    // Get vehicle info
    const [vehicles] = await connection.query(
      'SELECT id FROM vehicles WHERE driver_id = ? LIMIT 1',
      [driver.id]
    );

    if (vehicles.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'No vehicle found for this driver'
      });
    }

    // Check booking status
    const [bookings] = await connection.query(
      'SELECT id, status, user_id FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (bookings[0].status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'This booking has already been accepted or cancelled'
      });
    }

    // Update booking
    await connection.query(
      `UPDATE bookings 
       SET driver_id = ?, vehicle_id = ?, status = 'accepted', accepted_at = NOW()
       WHERE id = ?`,
      [driver.id, vehicles[0].id, bookingId]
    );

    // Create notification for user
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, related_id)
       VALUES (?, 'Driver Accepted', 'Your booking has been accepted by a driver', 'booking', ?)`,
      [bookings[0].user_id, bookingId]
    );

    await connection.commit();

    // Get updated booking
    const [updatedBooking] = await connection.query(
      `SELECT 
        b.*,
        u.full_name as user_name, u.phone as user_phone,
        v.vehicle_number, v.vehicle_model, v.vehicle_color
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = ?`,
      [bookingId]
    );

    res.json({
      success: true,
      message: 'Booking accepted successfully',
      data: updatedBooking[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Accept booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Driver)
const updateBookingStatus = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const bookingId = req.params.id;
    const { status } = req.body; // arrived, started, completed

    // Get driver info
    const [drivers] = await connection.query(
      'SELECT id FROM drivers WHERE user_id = ?',
      [req.user.id]
    );

    if (drivers.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const driverId = drivers[0].id;

    // Get booking
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? AND driver_id = ? FOR UPDATE',
      [bookingId, driverId]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you'
      });
    }

    const booking = bookings[0];
    let updateQuery = '';
    let notificationTitle = '';
    let notificationMessage = '';

    if (status === 'arrived') {
      if (booking.status !== 'accepted') {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid status transition'
        });
      }
      updateQuery = "UPDATE bookings SET status = 'arrived' WHERE id = ?";
      notificationTitle = 'Driver Arrived';
      notificationMessage = 'Your driver has arrived at pickup location';
    } else if (status === 'started') {
      if (booking.status !== 'arrived' && booking.status !== 'accepted') {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid status transition'
        });
      }
      updateQuery = "UPDATE bookings SET status = 'started', started_at = NOW() WHERE id = ?";
      notificationTitle = 'Ride Started';
      notificationMessage = 'Your ride has started';
    } else if (status === 'completed') {
      if (booking.status !== 'started') {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Ride must be started before completing'
        });
      }

      const finalFare = booking.estimated_fare;
      const commission = Math.round(finalFare * (parseFloat(process.env.PLATFORM_COMMISSION) || 15) / 100);
      const driverEarning = finalFare - commission;

      updateQuery = `UPDATE bookings 
                     SET status = 'completed', completed_at = NOW(), 
                         final_fare = ?, platform_commission = ?, driver_earning = ?
                     WHERE id = ?`;
      
      await connection.query(updateQuery, [finalFare, commission, driverEarning, bookingId]);

      // Update driver stats
      await connection.query(
        `UPDATE drivers 
         SET total_rides = total_rides + 1, total_earnings = total_earnings + ?
         WHERE id = ?`,
        [driverEarning, driverId]
      );

      // Create earning record
      await connection.query(
        `INSERT INTO driver_earnings (driver_id, booking_id, amount, commission, net_earning)
         VALUES (?, ?, ?, ?, ?)`,
        [driverId, bookingId, finalFare, commission, driverEarning]
      );

      notificationTitle = 'Ride Completed';
      notificationMessage = `Your ride has been completed. Fare: NPR ${finalFare}`;
    } else {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    if (status !== 'completed') {
      await connection.query(updateQuery, [bookingId]);
    }

    // Create notification
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, related_id)
       VALUES (?, ?, ?, 'booking', ?)`,
      [booking.user_id, notificationTitle, notificationMessage, bookingId]
    );

    await connection.commit();

    // Get updated booking
    const [updatedBooking] = await connection.query(
      `SELECT 
        b.*,
        u.full_name as user_name, u.phone as user_phone
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      WHERE b.id = ?`,
      [bookingId]
    );

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const bookingId = req.params.id;
    const { reason } = req.body;

    // Get booking
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Check authorization
    let cancelledBy = '';
    if (req.user.role === 'user') {
      if (booking.user_id !== req.user.id) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this booking'
        });
      }
      cancelledBy = 'user';
    } else if (req.user.role === 'driver') {
      const [drivers] = await connection.query(
        'SELECT id FROM drivers WHERE user_id = ?',
        [req.user.id]
      );
      if (drivers.length === 0 || booking.driver_id !== drivers[0].id) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this booking'
        });
      }
      cancelledBy = 'driver';
    } else if (req.user.role === 'admin') {
      cancelledBy = 'admin';
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be cancelled'
      });
    }

    // Update booking
    await connection.query(
      `UPDATE bookings 
       SET status = 'cancelled', cancelled_by = ?, cancellation_reason = ?, cancelled_at = NOW()
       WHERE id = ?`,
      [cancelledBy, reason, bookingId]
    );

    // Create notification
    const notifyUserId = cancelledBy === 'user' ? booking.driver_id : booking.user_id;
    if (notifyUserId) {
      await connection.query(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         VALUES (?, 'Booking Cancelled', ?, 'booking', ?)`,
        [notifyUserId, `Booking has been cancelled by ${cancelledBy}`, bookingId]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// @desc    Get driver bookings
// @route   GET /api/bookings/driver/my-bookings
// @access  Private (Driver)
const getDriverBookings = async (req, res) => {
  try {
    const { status = 'all', limit = 20, offset = 0 } = req.query;

    // Get driver info
    const [drivers] = await promisePool.query(
      'SELECT id FROM drivers WHERE user_id = ?',
      [req.user.id]
    );

    if (drivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const driverId = drivers[0].id;

    let statusFilter = '';
    if (status !== 'all') {
      statusFilter = `AND b.status = '${status}'`;
    }

    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        u.full_name as user_name, u.phone as user_phone,
        v.vehicle_number, v.vehicle_model
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.driver_id = ? ${statusFilter}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`,
      [driverId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await promisePool.query(
      `SELECT COUNT(*) as total FROM bookings WHERE driver_id = ? ${statusFilter}`,
      [driverId]
    );

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: countResult[0].total > (parseInt(offset) + parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get driver bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  getAvailableBookings,
  acceptBooking,
  updateBookingStatus,
  cancelBooking,
  getDriverBookings
};