const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// @desc    Register new driver
// @route   POST /api/drivers/register
// @access  Public
const registerDriver = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      // User info
      full_name,
      email,
      phone,
      password,
      address,
      // Driver info
      license_number,
      license_expiry,
      citizenship_number,
      vehicle_type,
      bank_name,
      bank_account,
      // Vehicle info
      vehicle_number,
      vehicle_model,
      vehicle_color,
      vehicle_year,
      bluebook_number,
      insurance_number,
      insurance_expiry
    } = req.body;

    // Check if user exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Check if license or citizenship exists
    const [existingDrivers] = await connection.query(
      'SELECT id FROM drivers WHERE license_number = ? OR citizenship_number = ?',
      [license_number, citizenship_number]
    );

    if (existingDrivers.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Driver with this license or citizenship number already exists'
      });
    }

    // Check if vehicle exists
    const [existingVehicles] = await connection.query(
      'SELECT id FROM vehicles WHERE vehicle_number = ? OR bluebook_number = ?',
      [vehicle_number, bluebook_number]
    );

    if (existingVehicles.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this number or bluebook already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [userResult] = await connection.query(
      `INSERT INTO users (full_name, email, phone, password, role, address) 
       VALUES (?, ?, ?, ?, 'driver', ?)`,
      [full_name, email, phone, hashedPassword, address]
    );

    const userId = userResult.insertId;

    // Insert driver
    const [driverResult] = await connection.query(
      `INSERT INTO drivers (
        user_id, license_number, license_expiry, citizenship_number,
        vehicle_type, bank_name, bank_account
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, license_number, license_expiry, citizenship_number,
        vehicle_type, bank_name, bank_account
      ]
    );

    const driverId = driverResult.insertId;

    // Insert vehicle
    await connection.query(
      `INSERT INTO vehicles (
        driver_id, vehicle_number, vehicle_model, vehicle_color,
        vehicle_year, bluebook_number, insurance_number, insurance_expiry
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        driverId, vehicle_number, vehicle_model, vehicle_color,
        vehicle_year, bluebook_number, insurance_number, insurance_expiry
      ]
    );

    await connection.commit();

    // Get created user
    const [users] = await connection.query(
      'SELECT id, full_name, email, phone, role, address FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Driver registered successfully. Your account will be reviewed by admin.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Register driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during driver registration',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// @desc    Get driver profile
// @route   GET /api/drivers/profile
// @access  Private (Driver)
const getDriverProfile = async (req, res) => {
  try {
    const [drivers] = await promisePool.query(
      `SELECT 
        u.id, u.full_name, u.email, u.phone, u.address, u.profile_image,
        d.id as driver_id, d.license_number, d.license_expiry, d.citizenship_number,
        d.vehicle_type, d.is_online, d.is_approved, d.rating, d.total_rides,
        d.total_earnings, d.bank_name, d.bank_account,
        v.id as vehicle_id, v.vehicle_number, v.vehicle_model, v.vehicle_color,
        v.vehicle_year, v.bluebook_number, v.insurance_number, v.insurance_expiry,
        v.is_verified as vehicle_verified
      FROM users u
      INNER JOIN drivers d ON u.id = d.user_id
      LEFT JOIN vehicles v ON d.id = v.driver_id
      WHERE u.id = ?`,
      [req.user.id]
    );

    if (drivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    res.json({
      success: true,
      data: drivers[0]
    });
  } catch (error) {
    console.error('Get driver profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update driver status (online/offline)
// @route   PUT /api/drivers/status
// @access  Private (Driver)
const updateDriverStatus = async (req, res) => {
  try {
    const { is_online, latitude, longitude } = req.body;

    // Get driver_id from user_id
    const [drivers] = await promisePool.query(
      'SELECT id, is_approved FROM drivers WHERE user_id = ?',
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

    // Update status and location
    await promisePool.query(
      `UPDATE drivers 
       SET is_online = ?, current_latitude = ?, current_longitude = ? 
       WHERE id = ?`,
      [is_online, latitude || null, longitude || null, driver.id]
    );

    res.json({
      success: true,
      message: `Driver status updated to ${is_online ? 'online' : 'offline'}`,
      data: {
        is_online,
        latitude,
        longitude
      }
    });
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update driver location
// @route   PUT /api/drivers/location
// @access  Private (Driver)
const updateDriverLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Get driver_id from user_id
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

    await promisePool.query(
      'UPDATE drivers SET current_latitude = ?, current_longitude = ? WHERE id = ?',
      [latitude, longitude, drivers[0].id]
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: { latitude, longitude }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get driver earnings
// @route   GET /api/drivers/earnings
// @access  Private (Driver)
const getDriverEarnings = async (req, res) => {
  try {
    const { period = 'all' } = req.query; // all, today, week, month

    // Get driver_id
    const [drivers] = await promisePool.query(
      'SELECT id, total_earnings FROM drivers WHERE user_id = ?',
      [req.user.id]
    );

    if (drivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const driverId = drivers[0].id;
    let dateFilter = '';

    if (period === 'today') {
      dateFilter = 'AND DATE(de.created_at) = CURDATE()';
    } else if (period === 'week') {
      dateFilter = 'AND YEARWEEK(de.created_at, 1) = YEARWEEK(CURDATE(), 1)';
    } else if (period === 'month') {
      dateFilter = 'AND MONTH(de.created_at) = MONTH(CURDATE()) AND YEAR(de.created_at) = YEAR(CURDATE())';
    }

    // Get earnings summary
    const [summary] = await promisePool.query(
      `SELECT 
        COUNT(*) as total_bookings,
        SUM(amount) as total_amount,
        SUM(commission) as total_commission,
        SUM(net_earning) as total_earnings
      FROM driver_earnings de
      WHERE driver_id = ? ${dateFilter}`,
      [driverId]
    );

    // Get recent earnings
    const [recentEarnings] = await promisePool.query(
      `SELECT 
        de.*,
        b.booking_number,
        b.pickup_location,
        b.dropoff_location,
        u.full_name as customer_name
      FROM driver_earnings de
      INNER JOIN bookings b ON de.booking_id = b.id
      INNER JOIN users u ON b.user_id = u.id
      WHERE de.driver_id = ? ${dateFilter}
      ORDER BY de.created_at DESC
      LIMIT 20`,
      [driverId]
    );

    res.json({
      success: true,
      data: {
        summary: summary[0],
        total_lifetime_earnings: drivers[0].total_earnings,
        recent_earnings: recentEarnings
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get driver statistics
// @route   GET /api/drivers/stats
// @access  Private (Driver)
const getDriverStats = async (req, res) => {
  try {
    // Get driver_id
    const [drivers] = await promisePool.query(
      `SELECT id, rating, total_rides, total_earnings, is_online 
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

    // Get today's stats
    const [todayStats] = await promisePool.query(
      `SELECT 
        COUNT(*) as rides_today,
        COALESCE(SUM(driver_earning), 0) as earnings_today
      FROM bookings
      WHERE driver_id = ? 
        AND status = 'completed'
        AND DATE(completed_at) = CURDATE()`,
      [driver.id]
    );

    // Get this week's stats
    const [weekStats] = await promisePool.query(
      `SELECT 
        COUNT(*) as rides_week,
        COALESCE(SUM(driver_earning), 0) as earnings_week
      FROM bookings
      WHERE driver_id = ? 
        AND status = 'completed'
        AND YEARWEEK(completed_at, 1) = YEARWEEK(CURDATE(), 1)`,
      [driver.id]
    );

    // Get this month's stats
    const [monthStats] = await promisePool.query(
      `SELECT 
        COUNT(*) as rides_month,
        COALESCE(SUM(driver_earning), 0) as earnings_month
      FROM bookings
      WHERE driver_id = ? 
        AND status = 'completed'
        AND MONTH(completed_at) = MONTH(CURDATE())
        AND YEAR(completed_at) = YEAR(CURDATE())`,
      [driver.id]
    );

    // Get recent ratings
    const [recentRatings] = await promisePool.query(
      `SELECT r.rating, r.review, r.created_at, u.full_name as customer_name
       FROM ratings r
       INNER JOIN users u ON r.user_id = u.id
       WHERE r.driver_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [driver.id]
    );

    res.json({
      success: true,
      data: {
        overall: {
          rating: driver.rating,
          total_rides: driver.total_rides,
          total_earnings: driver.total_earnings,
          is_online: driver.is_online
        },
        today: todayStats[0],
        week: weekStats[0],
        month: monthStats[0],
        recent_ratings: recentRatings
      }
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  registerDriver,
  getDriverProfile,
  updateDriverStatus,
  updateDriverLocation,
  getDriverEarnings,
  getDriverStats
};