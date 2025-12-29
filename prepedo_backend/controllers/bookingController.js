const { promisePool } = require('../config/database');

// Helper function to calculate fare based on Haversine distance
const calculateFare = (distance, vehicleType) => {
  let baseFare, perKmFare;
  const bookingFee = 30; // Premium service booking fee

  // KTM Valley specific base rates (Premium Service)
  switch (vehicleType) {
    case 'bike':
      baseFare = parseFloat(process.env.BASE_FARE_BIKE) || 60;
      perKmFare = parseFloat(process.env.PER_KM_FARE_BIKE) || 18;
      break;
    case 'car':
      baseFare = parseFloat(process.env.BASE_FARE_CAR) || 150;
      perKmFare = parseFloat(process.env.PER_KM_FARE_CAR) || 35;
      break;
    case 'taxi':
      baseFare = parseFloat(process.env.BASE_FARE_TAXI) || 200;
      perKmFare = parseFloat(process.env.PER_KM_FARE_TAXI) || 45;
      break;
    default:
      baseFare = 60;
      perKmFare = 18;
  }

  // Calculate fare using distance (already calculated via Haversine)
  let totalFare = baseFare + (distance * perKmFare) + bookingFee;

  // KTM Valley Surge Multiplier (Rush Hour & Night)
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  let multiplier = 1.0;

  // Morning Rush (8:00 AM - 10:30 AM)
  if (hour >= 8 && hour < 11) {
    multiplier = 1.35;
  }
  // Evening Rush (4:30 PM - 8:00 PM)
  else if (hour >= 16 && hour < 20) {
    multiplier = 1.5;
  }
  // Late Night (10:00 PM - 5:00 AM)
  else if (hour >= 22 || hour < 5) {
    multiplier = 1.4;
  }

  // Saturday adjustment
  if (day === 6) {
    multiplier *= 0.95;
  }

  totalFare *= multiplier;

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

    const createdBooking = bookings[0];

    // Trigger socket notification for drivers
    const socketHandler = req.app.get('socketHandler');
    if (socketHandler) {
      socketHandler.emitNewBookingToDrivers(createdBooking);
    }

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
        dr.current_latitude as driver_latitude, dr.current_longitude as driver_longitude,
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
    const status = {
      is_approved: !!driver.is_approved,
      is_online: !!driver.is_online
    };

    // We allow offline drivers to see the list, but not unapproved ones
    if (!driver.is_approved) {
      return res.status(200).json({
        success: true,
        data: [],
        status: status,
        message: 'Your driver account is pending approval. You will see requests once approved.'
      });
    }

    // Get pending bookings matching driver's vehicle type
    // Also check if this driver has already sent an offer
    // Filter by proximity (10km radius) if driver location is known
    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        u.full_name as user_name, u.phone as user_phone,
        CASE WHEN bo.id IS NOT NULL THEN TRUE ELSE FALSE END as offer_sent,
        (6371 * acos(
          cos(radians(?)) * cos(radians(b.pickup_latitude)) * 
          cos(radians(b.pickup_longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(b.pickup_latitude))
        )) AS distance_to_pickup
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      LEFT JOIN booking_offers bo ON b.id = bo.booking_id AND bo.driver_id = ?
      WHERE b.status = 'pending' 
        AND b.vehicle_type = ?
      HAVING distance_to_pickup IS NULL OR distance_to_pickup < 30
      ORDER BY distance_to_pickup ASC, b.created_at DESC
      LIMIT 20`,
      [
        driver.current_latitude, driver.current_longitude, driver.current_latitude,
        driver.id, driver.vehicle_type
      ]
    );

    res.json({
      success: true,
      data: bookings,
      status: status
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

    const updatedBookingData = updatedBooking[0];

    // Trigger socket notification for user
    const socketHandler = req.app.get('socketHandler');
    if (socketHandler) {
      socketHandler.emitBookingAccepted(updatedBookingData, updatedBookingData.user_id);
      socketHandler.emitBookingStatusUpdate(updatedBookingData);
    }

    res.json({
      success: true,
      message: 'Booking accepted successfully',
      data: updatedBookingData
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

    // Trigger socket notification
    const socketHandler = req.app.get('socketHandler');
    if (socketHandler) {
      socketHandler.emitBookingStatusUpdate(updatedBooking[0]);
    }

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

    // Trigger socket notification
    const socketHandler = req.app.get('socketHandler');
    if (socketHandler) {
      // Fetch updated booking reference to send via socket
      /* We reuse the fetched booking object, but update status manually 
         because transaction is committed but we need to send the event now. 
         Ideally fetch again, but for speed we can patch the object. 
      */
      const cancelledBooking = { ...booking, status: 'cancelled', cancelled_by: cancelledBy, cancellation_reason: reason };
      socketHandler.emitBookingCancelled(cancelledBooking, cancelledBy);
    }

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

// @desc    Calculate fare estimate
// @access  Private (User)
const getFareEstimate = async (req, res) => {
  try {
    const { distance, vehicle_type } = req.body;
    const estimatedFare = calculateFare(distance, vehicle_type);

    res.json({
      success: true,
      data: {
        distance,
        vehicle_type,
        fare: estimatedFare
      }
    });
  } catch (error) {
    console.error('Fare estimation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Calculate distance between two coordinates in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// @desc    Get booking quotes for all vehicle types
// @route   POST /api/bookings/quotes
// @access  Private (User)
const getBookingQuotes = async (req, res) => {
  try {
    const { pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude } = req.body;
    let { distance } = req.body;

    // Calculate distance if not provided
    if (!distance) {
      if (!pickup_latitude || !pickup_longitude || !dropoff_latitude || !dropoff_longitude) {
        return res.status(400).json({
          success: false,
          message: 'Coordinates are required to calculate distance'
        });
      }
      distance = calculateDistance(
        parseFloat(pickup_latitude),
        parseFloat(pickup_longitude),
        parseFloat(dropoff_latitude),
        parseFloat(dropoff_longitude)
      );
    }

    // Ensure minimum distance of 1km for pricing
    const billingDistance = Math.max(parseFloat(distance), 1);

    // Vehicle types configuration
    const vehicleTypes = [
      {
        id: 'bike',
        name: 'Bike',
        type: 'bike',
        description: 'Fast & affordable',
        capacity: 1,
        image_url: 'https://cdn-icons-png.flaticon.com/512/3082/3082383.png'
      },
      {
        id: 'car',
        name: 'Car',
        type: 'car',
        description: 'Comfortable ride',
        capacity: 4,
        image_url: 'https://cdn-icons-png.flaticon.com/512/3082/3082365.png'
      },
      {
        id: 'taxi',
        name: 'Taxi',
        type: 'taxi',
        description: 'Traditional taxi service',
        capacity: 4,
        image_url: 'https://cdn-icons-png.flaticon.com/512/2555/2555013.png'
      }
    ];

    // Calculate fare for each type
    const quotes = vehicleTypes.map(vehicle => {
      const fare = calculateFare(billingDistance, vehicle.type);

      // Calculate simplified ETA (2 mins + 2 mins per km)
      const etaMinutes = Math.round(2 + (billingDistance * 2));

      return {
        ...vehicle,
        price: fare,
        currency: 'NPR',
        eta: `${etaMinutes} min`,
        distance: parseFloat(billingDistance.toFixed(2))
      };
    });

    res.json({
      success: true,
      data: {
        distance: parseFloat(billingDistance.toFixed(2)),
        quotes
      }
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res) => {
  try {
    const [vehicles] = await promisePool.query('SELECT * FROM vehicles WHERE is_verified = 1');

    // If no vehicles in DB, return some defaults for testing
    if (vehicles.length === 0) {
      return res.json({
        success: true,
        data: [
          { id: 1, name: 'Bike', type: 'bike', base_price: 50, price_per_km: 15, vehicle_model: 'Hero Splendor', vehicle_number: 'BA 1 PA 1234', vehicle_type: 'bike' },
          { id: 2, name: 'Car', type: 'car', base_price: 150, price_per_km: 35, vehicle_model: 'Suzuki Swift', vehicle_number: 'BA 2 PA 5678', vehicle_type: 'car' },
          { id: 3, name: 'Taxi', type: 'taxi', base_price: 100, price_per_km: 40, vehicle_model: 'Maruti Alto', vehicle_number: 'BA 3 PA 9012', vehicle_type: 'taxi' }
        ]
      });
    }

    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create an offer for a booking (Driver)
// @route   POST /api/bookings/:id/offer
// @access  Private (Driver)
const createOffer = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Get driver info
    const [drivers] = await promisePool.query(
      'SELECT id, is_approved, is_online FROM drivers WHERE user_id = ?',
      [req.user.id]
    );

    if (drivers.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }

    const driver = drivers[0];
    console.log(`🔍 [Offer Attempt] UserID: ${req.user.id}, DriverID: ${driver.id}, Online: ${driver.is_online}, Approved: ${driver.is_approved}`);

    if (!driver.is_approved) {
      return res.status(403).json({ success: false, message: 'Your account is not approved yet. Please contact admin.' });
    }

    if (!driver.is_online) {
      return res.status(403).json({ success: false, message: 'You are currently offline. Please go online in the Status tab to send offers.' });
    }

    // Check if booking is still pending
    const [bookings] = await promisePool.query(
      'SELECT status, user_id FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (bookings[0].status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This booking is no longer available' });
    }

    // Check if already offered
    const [existingOffers] = await promisePool.query(
      'SELECT id FROM booking_offers WHERE booking_id = ? AND driver_id = ?',
      [bookingId, driver.id]
    );

    if (existingOffers.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already offered for this ride' });
    }

    // Insert offer
    const [result] = await promisePool.query(
      'INSERT INTO booking_offers (booking_id, driver_id) VALUES (?, ?)',
      [bookingId, driver.id]
    );

    // Get offer details with driver info
    const [offers] = await promisePool.query(
      `SELECT o.*, u.full_name as driver_name, dr.rating as driver_rating, v.vehicle_model, v.vehicle_number
       FROM booking_offers o
       JOIN drivers dr ON o.driver_id = dr.id
       JOIN users u ON dr.user_id = u.id
       LEFT JOIN vehicles v ON dr.id = v.driver_id
       WHERE o.id = ?`,
      [result.insertId]
    );

    // Notify user via socket
    const socketHandler = req.app.get('socketHandler');
    if (socketHandler) {
      socketHandler.emitNewOfferToUser(offers[0], bookings[0].user_id);
    }

    res.status(201).json({
      success: true,
      message: 'Offer sent successfully',
      data: offers[0]
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get offers for a booking
// @route   GET /api/bookings/:id/offers
// @access  Private
const getBookingOffers = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const [offers] = await promisePool.query(
      `SELECT o.*, u.full_name as driver_name, dr.rating as driver_rating, 
              v.vehicle_model, v.vehicle_number, v.vehicle_type, v.vehicle_color
       FROM booking_offers o
       JOIN drivers dr ON o.driver_id = dr.id
       JOIN users u ON dr.user_id = u.id
       LEFT JOIN vehicles v ON dr.id = v.driver_id
       WHERE o.booking_id = ? AND o.status = 'pending'`,
      [bookingId]
    );

    res.json({ success: true, data: offers });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Select a driver from offers (User)
// @route   POST /api/bookings/:id/select-driver
// @access  Private (User)
const selectDriver = async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    const bookingId = req.params.id;
    const { driver_id } = req.body;

    // Check booking ownership and status
    const [bookings] = await connection.query(
      'SELECT id, user_id, status FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (bookings[0].user_id !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (bookings[0].status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Booking is already accepted or cancelled' });
    }

    // Get vehicle for selected driver
    const [vehicles] = await connection.query(
      'SELECT id FROM vehicles WHERE driver_id = ? LIMIT 1',
      [driver_id]
    );

    if (vehicles.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'No vehicle found for selected driver' });
    }

    // Update booking with driver and status
    await connection.query(
      `UPDATE bookings SET driver_id = ?, vehicle_id = ?, status = 'accepted', accepted_at = NOW() WHERE id = ?`,
      [driver_id, vehicles[0].id, bookingId]
    );

    // Update offer statuses
    await connection.query(
      'UPDATE booking_offers SET status = "accepted" WHERE booking_id = ? AND driver_id = ?',
      [bookingId, driver_id]
    );
    await connection.query(
      'UPDATE booking_offers SET status = "rejected" WHERE booking_id = ? AND driver_id != ?',
      [bookingId, driver_id]
    );

    await connection.commit();

    // Get updated booking
    const [updatedBooking] = await connection.query(
      `SELECT b.*, u.full_name as driver_name, dr.rating as driver_rating, v.vehicle_number, v.vehicle_model
       FROM bookings b
       JOIN drivers dr ON b.driver_id = dr.id
       JOIN users u ON dr.user_id = u.id
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.id = ?`,
      [bookingId]
    );

    // Notify selected driver and other drivers via socket
    const socketHandler = req.app.get('socketHandler');
    if (socketHandler) {
      socketHandler.emitBookingAccepted(updatedBooking[0], updatedBooking[0].user_id);
      socketHandler.emitBookingAssignedToDriver(updatedBooking[0], driver_id);
      socketHandler.emitBookingTaken(bookingId);
    }

    res.json({
      success: true,
      message: 'Driver selected and booking confirmed',
      data: updatedBooking[0]
    });

  } catch (error) {
    await connection.rollback();
    console.error('Select driver error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
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
  getDriverBookings,
  getFareEstimate,
  getVehicles,
  createOffer,
  getBookingOffers,
  selectDriver,
  getBookingQuotes
};
