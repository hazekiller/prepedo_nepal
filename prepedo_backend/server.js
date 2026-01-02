// prepedo_backend/server.js - Updated with Socket.io
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection, initializeDatabase } = require('./config/database');
const SocketHandler = require('./socket/socketHandler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Configure CORS origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
    'https://prepedo.com',
    'http://localhost:8081',
    'http://localhost:5173',
    'http://192.168.1.68:8081',
    'http://localhost:19006',
    'exp://192.168.1.68:19000',
    'exp://192.168.1.68:8081',
  ];

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize Socket Handler
const socketHandler = new SocketHandler(io);

// Make io and socketHandler available to routes
app.set('io', io);
app.set('socketHandler', socketHandler);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS for HTTP requests
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Prepedo Nepal API Server',
    version: '1.0.0',
    status: 'Running',
    socket: {
      connected: socketHandler.getConnectedUsersCount(),
      onlineDrivers: socketHandler.getOnlineDriversCount(),
    }
  });
});

// Socket.io health check
app.get('/api/socket/health', (req, res) => {
  res.json({
    success: true,
    socket: {
      status: 'running',
      connectedUsers: socketHandler.getConnectedUsersCount(),
      onlineDrivers: socketHandler.getOnlineDriversCount(),
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin', require('./routes/settingsRoutes')); // Settings Routes sharing /api/admin prefix

// Global routes
const bookingController = require('./controllers/bookingController');
app.get('/api/vehicles', bookingController.getVehicles);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database.');
      process.exit(1);
    }

    await initializeDatabase();

    server.listen(PORT, () => {
      const displayHost = process.env.DOMAIN || 'localhost';
      console.log('\n' + '='.repeat(60));
      console.log('🚀 PREPEDO NEPAL - BACKEND SERVER STARTED!');
      console.log('='.repeat(60));
      console.log(`📡 HTTP Server:    http://${displayHost}:${PORT}`);
      console.log(`⚡ Socket.io:      ws://${displayHost}:${PORT}`);
      console.log(`🌍 Environment:    ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database:       Connected`);
      console.log('='.repeat(60));
      console.log('📚 Available Endpoints:');
      console.log(`   Health:         GET  http://${displayHost}:${PORT}/`);
      console.log(`   Socket Health:  GET  http://${displayHost}:${PORT}/api/socket/health`);
      console.log(`   Auth:           POST http://${displayHost}:${PORT}/api/auth/login`);
      console.log(`   Bookings:       POST http://${displayHost}:${PORT}/api/bookings`);
      console.log('='.repeat(60));
      console.log('✅ Server is ready to accept connections!\n');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = { app, server, io, socketHandler };