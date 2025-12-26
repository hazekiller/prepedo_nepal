const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test database connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Users table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'driver', 'admin') DEFAULT 'user',
        profile_image VARCHAR(255) DEFAULT NULL,
        address TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Drivers table (additional driver-specific info)
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        license_number VARCHAR(50) UNIQUE NOT NULL,
        license_expiry DATE NOT NULL,
        license_image VARCHAR(255),
        citizenship_number VARCHAR(50) UNIQUE NOT NULL,
        citizenship_image VARCHAR(255),
        vehicle_type ENUM('bike', 'car', 'taxi') NOT NULL,
        is_online BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT FALSE,
        rating DECIMAL(3,2) DEFAULT 5.00,
        total_rides INT DEFAULT 0,
        total_earnings DECIMAL(10,2) DEFAULT 0.00,
        bank_name VARCHAR(100),
        bank_account VARCHAR(50),
        current_latitude DECIMAL(10,8),
        current_longitude DECIMAL(11,8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_vehicle_type (vehicle_type),
        INDEX idx_is_online (is_online),
        INDEX idx_is_approved (is_approved)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Vehicles table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        driver_id INT NOT NULL,
        vehicle_type ENUM('bike', 'car', 'taxi') NOT NULL,
        vehicle_number VARCHAR(50) UNIQUE NOT NULL,
        vehicle_model VARCHAR(100) NOT NULL,
        vehicle_color VARCHAR(50) NOT NULL,
        vehicle_year INT NOT NULL,
        vehicle_image VARCHAR(255),
        bluebook_number VARCHAR(50) UNIQUE NOT NULL,
        bluebook_image VARCHAR(255),
        insurance_number VARCHAR(50),
        insurance_expiry DATE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
        INDEX idx_driver_id (driver_id),
        INDEX idx_vehicle_number (vehicle_number),
        INDEX idx_vehicle_type (vehicle_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Bookings table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_number VARCHAR(20) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        driver_id INT,
        vehicle_id INT,
        pickup_location VARCHAR(255) NOT NULL,
        pickup_latitude DECIMAL(10,8) NOT NULL,
        pickup_longitude DECIMAL(11,8) NOT NULL,
        dropoff_location VARCHAR(255) NOT NULL,
        dropoff_latitude DECIMAL(10,8) NOT NULL,
        dropoff_longitude DECIMAL(11,8) NOT NULL,
        vehicle_type ENUM('bike', 'car', 'taxi') NOT NULL,
        distance DECIMAL(10,2) NOT NULL COMMENT 'Distance in KM',
        estimated_fare DECIMAL(10,2) NOT NULL,
        final_fare DECIMAL(10,2),
        platform_commission DECIMAL(10,2),
        driver_earning DECIMAL(10,2),
        status ENUM('pending', 'accepted', 'arrived', 'started', 'completed', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
        payment_method ENUM('cash', 'esewa', 'khalti', 'card') DEFAULT 'cash',
        notes TEXT,
        cancelled_by ENUM('user', 'driver', 'admin'),
        cancellation_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP NULL,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        cancelled_at TIMESTAMP NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_driver_id (driver_id),
        INDEX idx_status (status),
        INDEX idx_booking_number (booking_number),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Ratings table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT UNIQUE NOT NULL,
        user_id INT NOT NULL,
        driver_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
        INDEX idx_booking_id (booking_id),
        INDEX idx_driver_id (driver_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Notifications table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('booking', 'payment', 'general', 'promotion') DEFAULT 'general',
        is_read BOOLEAN DEFAULT FALSE,
        related_id INT COMMENT 'Related booking_id or other entity',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Driver earnings table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS driver_earnings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        driver_id INT NOT NULL,
        booking_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        commission DECIMAL(10,2) NOT NULL,
        net_earning DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        INDEX idx_driver_id (driver_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Booking offers table (for multi-driver choice flow)
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS booking_offers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        driver_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
        INDEX idx_booking_id (booking_id),
        INDEX idx_driver_id (driver_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  promisePool,
  testConnection,
  initializeDatabase
};