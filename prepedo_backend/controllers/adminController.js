const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const [totalUsers] = await promisePool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'user'"
    );

    // Total drivers
    const [totalDrivers] = await promisePool.query(
      "SELECT COUNT(*) as count FROM drivers"
    );

    // Approved drivers
    const [approvedDrivers] = await promisePool.query(
      "SELECT COUNT(*) as count FROM drivers WHERE is_approved = TRUE"
    );

    // Online drivers
    const [onlineDrivers] = await promisePool.query(
      "SELECT COUNT(*) as count FROM drivers WHERE is_online = TRUE"
    );

    // Total bookings
    const [totalBookings] = await promisePool.query(
      "SELECT COUNT(*) as count FROM bookings"
    );

    // Completed bookings
    const [completedBookings] = await promisePool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'"
    );

    // Active bookings
    const [activeBookings] = await promisePool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status IN ('accepted', 'arrived', 'started')"
    );

    // Total revenue
    const [totalRevenue] = await promisePool.query(
      "SELECT COALESCE(SUM(platform_commission), 0) as total FROM bookings WHERE status = 'completed'"
    );

    // Today's bookings
    const [todayBookings] = await promisePool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = CURDATE()"
    );

    // This month's revenue
    const [monthRevenue] = await promisePool.query(
      `SELECT COALESCE(SUM(platform_commission), 0) as total 
       FROM bookings 
       WHERE status = 'completed' 
         AND MONTH(completed_at) = MONTH(CURDATE()) 
         AND YEAR(completed_at) = YEAR(CURDATE())`
    );

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers[0].count
        },
        drivers: {
          total: totalDrivers[0].count,
          approved: approvedDrivers[0].count,
          online: onlineDrivers[0].count,
          pending: totalDrivers[0].count - approvedDrivers[0].count
        },
        bookings: {
          total: totalBookings[0].count,
          completed: completedBookings[0].count,
          active: activeBookings[0].count,
          today: todayBookings[0].count
        },
        revenue: {
          total: parseFloat(totalRevenue[0].total),
          this_month: parseFloat(monthRevenue[0].total)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { role = 'all', limit = 20, offset = 0, search = '' } = req.query;

    let roleFilter = '';
    if (role !== 'all') {
      roleFilter = `AND u.role = '${role}'`;
    }

    let searchFilter = '';
    if (search) {
      searchFilter = `AND (u.full_name LIKE '%${search}%' OR u.email LIKE '%${search}%' OR u.phone LIKE '%${search}%')`;
    }

    const [users] = await promisePool.query(
      `SELECT 
        u.id, u.full_name, u.email, u.phone, u.role, u.is_verified, 
        u.is_active, u.created_at
      FROM users u
      WHERE 1=1 ${roleFilter} ${searchFilter}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await promisePool.query(
      `SELECT COUNT(*) as total FROM users u WHERE 1=1 ${roleFilter} ${searchFilter}`
    );

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get pending driver approvals
// @route   GET /api/admin/drivers/pending
// @access  Private (Admin)
const getPendingDrivers = async (req, res) => {
  try {
    const [drivers] = await promisePool.query(
      `SELECT 
        u.id as user_id, u.full_name, u.email, u.phone,
        d.id as driver_id, d.license_number, d.license_expiry, 
        d.citizenship_number, d.vehicle_type, d.created_at,
        v.vehicle_number, v.vehicle_model, v.vehicle_color, v.vehicle_year
      FROM drivers d
      INNER JOIN users u ON d.user_id = u.id
      LEFT JOIN vehicles v ON d.id = v.driver_id
      WHERE d.is_approved = FALSE
      ORDER BY d.created_at DESC`
    );

    res.json({
      success: true,
      data: drivers
    });
  } catch (error) {
    console.error('Get pending drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve/Reject driver
// @route   PUT /api/admin/drivers/:id/approve
// @access  Private (Admin)
const approveDriver = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const driverId = req.params.id;
    const { is_approved, rejection_reason } = req.body;

    // Get driver info
    const [drivers] = await connection.query(
      'SELECT user_id FROM drivers WHERE id = ?',
      [driverId]
    );

    if (drivers.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Update driver approval status
    await connection.query(
      'UPDATE drivers SET is_approved = ? WHERE id = ?',
      [is_approved, driverId]
    );

    // Create notification
    const notificationTitle = is_approved ? 'Account Approved' : 'Account Rejected';
    const notificationMessage = is_approved 
      ? 'Your driver account has been approved. You can now start accepting rides.'
      : `Your driver account has been rejected. Reason: ${rejection_reason || 'Please contact support'}`;

    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, ?, ?, 'general')`,
      [drivers[0].user_id, notificationTitle, notificationMessage]
    );

    await connection.commit();

    res.json({
      success: true,
      message: is_approved ? 'Driver approved successfully' : 'Driver rejected'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Approve driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res) => {
  try {
    const { status = 'all', limit = 20, offset = 0, date = '' } = req.query;

    let statusFilter = '';
    if (status !== 'all') {
      statusFilter = `AND b.status = '${status}'`;
    }

    let dateFilter = '';
    if (date) {
      dateFilter = `AND DATE(b.created_at) = '${date}'`;
    }

    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        u.full_name as user_name, u.phone as user_phone,
        du.full_name as driver_name, du.phone as driver_phone,
        v.vehicle_number
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      LEFT JOIN drivers d ON b.driver_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE 1=1 ${statusFilter} ${dateFilter}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await promisePool.query(
      `SELECT COUNT(*) as total FROM bookings b WHERE 1=1 ${statusFilter} ${dateFilter}`
    );

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { is_active } = req.body;

    await promisePool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [is_active, userId]
    );

    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get revenue reports
// @route   GET /api/admin/reports/revenue
// @access  Private (Admin)
const getRevenueReports = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    let dateGrouping = '';
    let dateFormat = '';

    switch (period) {
      case 'day':
        dateGrouping = 'DATE(completed_at)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateGrouping = 'YEARWEEK(completed_at, 1)';
        dateFormat = '%Y-W%v';
        break;
      case 'month':
        dateGrouping = 'DATE_FORMAT(completed_at, "%Y-%m")';
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateGrouping = 'YEAR(completed_at)';
        dateFormat = '%Y';
        break;
      default:
        dateGrouping = 'DATE_FORMAT(completed_at, "%Y-%m")';
        dateFormat = '%Y-%m';
    }

    const [revenueData] = await promisePool.query(
      `SELECT 
        DATE_FORMAT(completed_at, ?) as period,
        COUNT(*) as total_bookings,
        SUM(final_fare) as total_fare,
        SUM(platform_commission) as total_commission,
        SUM(driver_earning) as total_driver_earning
      FROM bookings
      WHERE status = 'completed'
      GROUP BY ${dateGrouping}
      ORDER BY period DESC
      LIMIT 30`,
      [dateFormat]
    );

    res.json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    console.error('Get revenue reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create admin user
// @route   POST /api/admin/create-admin
// @access  Private (Admin)
const createAdmin = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    // Check if admin exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert admin
    await promisePool.query(
      `INSERT INTO users (full_name, email, phone, password, role, is_verified) 
       VALUES (?, ?, ?, ?, 'admin', TRUE)`,
      [full_name, email, phone, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully'
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getPendingDrivers,
  approveDriver,
  getAllBookings,
  toggleUserStatus,
  getRevenueReports,
  createAdmin
};