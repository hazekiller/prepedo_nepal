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

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, address } = req.body;

    // Check if user exists
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

    // Insert user
    const [result] = await promisePool.query(
      `INSERT INTO users (full_name, email, phone, password, role, address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone, hashedPassword, role || 'user', address]
    );

    // Get created user
    const [users] = await promisePool.query(
      'SELECT id, full_name, email, phone, role, address, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await promisePool.query(
      `SELECT id, full_name, email, phone, password, role, profile_image, 
              address, is_verified, is_active 
       FROM users WHERE email = ? OR phone = ?`,
      [email, email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If user is driver, get driver info
    let driverInfo = null;
    if (user.role === 'driver') {
      const [drivers] = await promisePool.query(
        `SELECT d.*, v.vehicle_number, v.vehicle_model, v.vehicle_color 
         FROM drivers d 
         LEFT JOIN vehicles v ON d.id = v.driver_id 
         WHERE d.user_id = ?`,
        [user.id]
      );
      if (drivers.length > 0) {
        driverInfo = drivers[0];
      }
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        driverInfo,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const [users] = await promisePool.query(
      `SELECT id, full_name, email, phone, role, profile_image, 
              address, is_verified, is_active, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // If user is driver, get driver info
    let driverInfo = null;
    if (user.role === 'driver') {
      const [drivers] = await promisePool.query(
        `SELECT d.*, v.vehicle_number, v.vehicle_model, v.vehicle_color, v.vehicle_year
         FROM drivers d 
         LEFT JOIN vehicles v ON d.id = v.driver_id 
         WHERE d.user_id = ?`,
        [user.id]
      );
      if (drivers.length > 0) {
        driverInfo = drivers[0];
      }
    }

    res.json({
      success: true,
      data: {
        user,
        driverInfo
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;
    const userId = req.user.id;

    // Check if phone is being changed and if it's already taken
    if (phone) {
      const [existingUsers] = await promisePool.query(
        'SELECT id FROM users WHERE phone = ? AND id != ?',
        [phone, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
    }

    // Update user
    await promisePool.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [full_name, phone, address, userId]
    );

    // Get updated user
    const [users] = await promisePool.query(
      `SELECT id, full_name, email, phone, role, profile_image, 
              address, is_verified, is_active 
       FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Get user with password
    const [users] = await promisePool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, users[0].password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await promisePool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword
};