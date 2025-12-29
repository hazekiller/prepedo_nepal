/**
 * Socket.io Handler - Real-time Communication Manager
 * Handles connections, rooms, and real-time events
 */

const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map of userId -> socketId
    this.driverSockets = new Map(); // Map of driverId -> socketId
    this.setupMiddleware();
    this.setupConnectionHandlers();
  }

  /**
   * Setup Socket.io middleware for authentication
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const [users] = await promisePool.query(
          'SELECT id, full_name, email, role FROM users WHERE id = ? AND is_active = true',
          [decoded.id]
        );

        if (users.length === 0) {
          return next(new Error('User not found or inactive'));
        }

        socket.user = users[0];

        // If driver, get driver info
        const [drivers] = await promisePool.query(
          'SELECT id, is_approved, is_online, vehicle_type FROM drivers WHERE user_id = ?',
          [socket.user.id]
        );

        if (drivers.length > 0) {
          socket.driver = drivers[0];
        }
        console.log(`✅ Socket authenticated: ${socket.user.email} (${socket.user.role})`);
        next();


      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup connection event handlers
   */
  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
      this.setupSocketEvents(socket);
    });
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const { user, driver } = socket;

    console.log(`🔌 New connection: ${user.email} (${socket.id})`);

    // Store user socket mapping
    this.userSockets.set(user.id, socket.id);

    // If driver, store driver socket mapping
    if (user.role === 'driver' && driver) {
      this.driverSockets.set(driver.id, socket.id);

      // Join driver room
      socket.join(`driver:${driver.id}`);

      // Join online drivers room if approved and online
      if (driver.is_approved && driver.is_online) {
        socket.join('drivers:online');
        if (driver.vehicle_type) {
          socket.join(`drivers:online:${driver.vehicle_type.toLowerCase()}`);
        }
      }
    }

    // Join user room
    socket.join(`user:${user.id}`);

    // Send connection success
    socket.emit('connected', {
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        role: user.role,
      },
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  /**
   * Setup all socket event handlers
   */
  setupSocketEvents(socket) {
    const { user, driver } = socket;

    // Driver events
    if (user.role === 'driver') {
      socket.on('driver:goOnline', () => this.handleDriverGoOnline(socket));
      socket.on('driver:goOffline', () => this.handleDriverGoOffline(socket));
      socket.on('driver:acceptBooking', (data) => this.handleAcceptBooking(socket, data));
      socket.on('driver:updateLocation', (data) => this.handleUpdateLocation(socket, data));
      socket.on('driver:updateStatus', (data) => this.handleUpdateBookingStatus(socket, data));
    }

    // User events
    if (user.role === 'user') {
      socket.on('user:requestRide', (data) => this.handleRequestRide(socket, data));
      socket.on('user:cancelBooking', (data) => this.handleCancelBooking(socket, data));
    }

    // Common events
    socket.on('booking:subscribe', (data) => this.handleSubscribeBooking(socket, data));
    socket.on('booking:unsubscribe', (data) => this.handleUnsubscribeBooking(socket, data));
  }

  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  getOnlineDriversCount() {
    let count = 0;
    const onlineDrivers = this.io.sockets.adapter.rooms.get('drivers:online');
    if (onlineDrivers) {
      count = onlineDrivers.size;
    }
    return count;
  }

  /**
   * Handle socket disconnection
   */
  handleDisconnection(socket) {
    const { user, driver } = socket;

    console.log(`❌ Disconnected: ${user.email} (${socket.id})`);

    // Remove from user sockets
    this.userSockets.delete(user.id);

    // Remove from driver sockets
    if (driver) {
      this.driverSockets.delete(driver.id);
    }
  }

  /**
   * Driver goes online
   */
  async handleDriverGoOnline(socket) {
    try {
      const { driver } = socket;

      if (!driver) {
        return socket.emit('error', { message: 'Driver profile not found' });
      }

      // Update database
      await promisePool.query(
        'UPDATE drivers SET is_online = true WHERE id = ?',
        [driver.id]
      );

      socket.join('drivers:online');
      if (driver.vehicle_type) {
        socket.join(`drivers:online:${driver.vehicle_type.toLowerCase()}`);
      }

      driver.is_online = true;

      // Notify all driver's devices
      this.io.to(`user:${socket.user.id}`).emit('driver:statusUpdated', {
        success: true,
        isOnline: true,
        message: 'You are now online',
      });

      console.log(`🟢 Driver ${driver.id} is now ONLINE`);
    } catch (error) {
      console.error('Driver go online error:', error);
      socket.emit('error', { message: 'Failed to go online' });
    }
  }

  /**
   * Driver goes offline
   */
  async handleDriverGoOffline(socket) {
    try {
      const { driver } = socket;

      if (!driver) {
        return socket.emit('error', { message: 'Driver profile not found' });
      }

      // Update database
      await promisePool.query(
        'UPDATE drivers SET is_online = false WHERE id = ?',
        [driver.id]
      );

      // Leave online drivers room
      socket.leave('drivers:online');
      if (driver.vehicle_type) {
        socket.leave(`drivers:online:${driver.vehicle_type.toLowerCase()}`);
      }

      driver.is_online = false;

      // Notify all driver's devices
      this.io.to(`user:${socket.user.id}`).emit('driver:statusUpdated', {
        success: true,
        isOnline: false,
        message: 'You are now offline',
      });

      console.log(`🔴 Driver ${driver.id} is now OFFLINE`);
    } catch (error) {
      console.error('Driver go offline error:', error);
      socket.emit('error', { message: 'Failed to go offline' });
    }
  }

  /**
   * Driver accepts a booking
   */
  async handleAcceptBooking(socket, data) {
    try {
      const { driver } = socket;
      const { bookingId } = data;

      if (!driver) {
        return socket.emit('error', { message: 'Driver profile not found' });
      }

      socket.emit('booking:acceptProcessing', { bookingId });
    } catch (error) {
      console.error('Accept booking error:', error);
      socket.emit('error', { message: 'Failed to accept booking' });
    }
  }

  /**
   * Update driver location
   */
  async handleUpdateLocation(socket, data) {
    try {
      const { driver } = socket;
      const { latitude, longitude } = data;

      if (!driver) {
        return socket.emit('error', { message: 'Driver profile not found' });
      }

      // Update database
      await promisePool.query(
        'UPDATE drivers SET current_latitude = ?, current_longitude = ? WHERE id = ?',
        [latitude, longitude, driver.id]
      );

      // Notify user with active booking
      const [bookings] = await promisePool.query(
        `SELECT user_id FROM bookings 
         WHERE driver_id = ? AND status IN ('accepted', 'arrived', 'started')
         LIMIT 1`,
        [driver.id]
      );

      if (bookings.length > 0) {
        const userId = bookings[0].user_id;
        this.io.to(`user:${userId}`).emit('driver:locationUpdated', {
          latitude,
          longitude,
        });
      }
    } catch (error) {
      console.error('Update location error:', error);
    }
  }

  /**
   * Update booking status
   */
  async handleUpdateBookingStatus(socket, data) {
    try {
      const { bookingId, status } = data;
      socket.emit('booking:statusUpdateProcessing', { bookingId, status });
    } catch (error) {
      console.error('Update booking status error:', error);
      socket.emit('error', { message: 'Failed to update booking status' });
    }
  }

  /**
   * User requests a ride
   */
  async handleRequestRide(socket, data) {
    try {
      socket.emit('booking:requestProcessing', data);
    } catch (error) {
      console.error('Request ride error:', error);
      socket.emit('error', { message: 'Failed to request ride' });
    }
  }

  /**
   * Cancel booking
   */
  async handleCancelBooking(socket, data) {
    try {
      const { bookingId } = data;
      socket.emit('booking:cancelProcessing', { bookingId });
    } catch (error) {
      console.error('Cancel booking error:', error);
      socket.emit('error', { message: 'Failed to cancel booking' });
    }
  }

  /**
   * Subscribe / Unsubscribe to booking updates
   */
  handleSubscribeBooking(socket, data) {
    const { bookingId } = data;
    socket.join(`booking:${bookingId}`);
    console.log(`📌 ${socket.user.email} subscribed to booking ${bookingId}`);
  }

  handleUnsubscribeBooking(socket, data) {
    const { bookingId } = data;
    socket.leave(`booking:${bookingId}`);
    console.log(`📍 ${socket.user.email} unsubscribed from booking ${bookingId}`);
  }

  /**
   * Emit events
   */
  async emitNewBookingToDrivers(booking) {
    try {
      console.log(`📢 Calculating nearby drivers for booking ${booking.id} (Type: ${booking.vehicle_type}) at [${booking.pickup_latitude}, ${booking.pickup_longitude}]`);

      // Find online approved drivers of the same vehicle type
      const [drivers] = await promisePool.query(
        `SELECT id, current_latitude, current_longitude FROM drivers 
         WHERE is_online = true AND is_approved = true AND vehicle_type = ?`,
        [booking.vehicle_type]
      );

      console.log(`🔍 Found ${drivers.length} online approved ${booking.vehicle_type} drivers`);

      let notifiedCount = 0;

      for (const driver of drivers) {
        let shouldNotify = true;
        let distance = null;

        // If driver has location, check distance (30km radius for better coverage)
        if (driver.current_latitude && driver.current_longitude) {
          distance = this.calculateDistance(
            parseFloat(booking.pickup_latitude),
            parseFloat(booking.pickup_longitude),
            parseFloat(driver.current_latitude),
            parseFloat(driver.current_longitude)
          );

          if (distance > 30) {
            shouldNotify = false;
          }
        }

        if (shouldNotify) {
          this.io.to(`driver:${driver.id}`).emit('booking:new', booking);
          notifiedCount++;
          console.log(`✅ Notifying Driver ${driver.id} (Distance: ${distance ? distance.toFixed(2) + 'km' : 'Unknown'})`);
        } else {
          console.log(`⏭️ Skipping Driver ${driver.id} (Distance: ${distance.toFixed(2)}km - too far)`);
        }
      }

      console.log(`🏁 Notification broadcast complete. Notified ${notifiedCount} drivers.`);
    } catch (error) {
      console.error('emitNewBookingToDrivers error:', error);
    }
  }

  /**
   * Helper: Calculate distance between two points in KM (Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  emitBookingTaken(bookingId) {
    console.log(`🚫 Broadcasting booking ${bookingId} as taken to all drivers`);
    this.io.to('drivers:online').emit('booking:taken', { bookingId });
  }

  emitBookingAccepted(booking, userId) {
    console.log(`✅ Notifying user ${userId} - booking ${booking.id} accepted`);
    this.io.to(`user:${userId}`).emit('booking:accepted', booking);
  }

  /**
   * Notify user about a new driver offer
   */
  emitNewOfferToUser(offer, userId) {
    console.log(`🔔 Notifying user ${userId} - new offer from driver ${offer.driver_name}`);
    this.io.to(`user:${userId}`).emit('booking:newOffer', offer);

    // Also emit to booking room (fallback)
    if (offer.booking_id) {
      this.io.to(`booking:${offer.booking_id}`).emit('booking:newOffer', offer);
    }
  }

  /**
   * Notify driver that they have been assigned to a booking
   */
  emitBookingAssignedToDriver(booking, driverId) {
    console.log(`🚖 Notifying driver ${driverId} - assigned to booking ${booking.id}`);
    this.io.to(`driver:${driverId}`).emit('booking:assigned', booking);
  }

  // ✅ FIXED HERE
  async emitBookingStatusUpdate(booking) {
    try {
      console.log(`🔄 Broadcasting booking ${booking.id} status: ${booking.status}`);

      // Notify user
      this.io.to(`user:${booking.user_id}`).emit('booking:statusUpdated', booking);

      // Notify driver if assigned
      if (booking.driver_id) {
        const [drivers] = await promisePool.query(
          'SELECT user_id FROM drivers WHERE id = ?',
          [booking.driver_id]
        );

        if (drivers.length > 0) {
          this.io.to(`user:${drivers[0].user_id}`).emit('booking:statusUpdated', booking);
        }
      }

      // Notify all subscribers
      this.io.to(`booking:${booking.id}`).emit('booking:statusUpdated', booking);
    } catch (error) {
      console.error('emitBookingStatusUpdate error:', error);
    }
  }

  emitBookingCancelled(booking, cancelledBy) {
    console.log(`❌ Booking ${booking.id} cancelled by ${cancelledBy}`);

    this.io.to(`user:${booking.user_id}`).emit('booking:cancelled', {
      ...booking,
      cancelled_by: cancelledBy,
    });

    if (booking.driver_id) {
      this.io.to(`driver:${booking.driver_id}`).emit('booking:cancelled', {
        ...booking,
        cancelled_by: cancelledBy,
      });
    }

    this.io.to(`booking:${booking.id}`).emit('booking:cancelled', {
      ...booking,
      cancelled_by: cancelledBy,
    });
  }

  /**
   * Counters
   */
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  getOnlineDriversCount() {
    return this.driverSockets.size;
  }
}

module.exports = SocketHandler;
