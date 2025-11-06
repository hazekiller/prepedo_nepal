// app/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/_env';

// API Configuration - Using environment config
const API_BASE_URL = `${ENV.API_BASE_URL}/api/v1`;

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    // Remove body if GET request
    if (options.method === 'GET') {
      delete config.body;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ============================================
// 🚗 LUXURY RIDE SHARING API - VERSION 2.0
// ============================================

export const API = {
  // Base URL
  BASE_URL: API_BASE_URL,

  // ========== AUTH ENDPOINTS ==========
  auth: {
    login: (email, password) => 
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      }),
    
    register: (userData) => 
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        skipAuth: true,
      }),
    
    getMe: () => apiRequest('/auth/me'),
    
    updatePassword: (currentPassword, newPassword) => 
      apiRequest('/auth/update-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),

    logout: async () => {
      await AsyncStorage.removeItem('authToken');
      return { success: true };
    },
  },

  // ========== VEHICLE ENDPOINTS ==========
  vehicles: {
    // Get all available vehicles
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/vehicles?${queryString}`, { skipAuth: true });
    },
    
    // Get vehicle by ID
    getById: (id) => apiRequest(`/vehicles/${id}`, { skipAuth: true }),
    
    // Get vehicles by category (sedan, suv, executive, luxury-van)
    getByCategory: (category) => 
      apiRequest(`/vehicles/category/${category}`, { skipAuth: true }),
    
    // Get featured/premium vehicles
    getFeatured: () => 
      apiRequest('/vehicles/featured', { skipAuth: true }),
    
    // Admin: Create vehicle
    create: (vehicleData) => 
      apiRequest('/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleData),
      }),
    
    // Admin: Update vehicle
    update: (id, vehicleData) => 
      apiRequest(`/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(vehicleData),
      }),
    
    // Admin: Delete vehicle
    delete: (id) => 
      apiRequest(`/vehicles/${id}`, {
        method: 'DELETE',
      }),

    // Get vehicle availability
    checkAvailability: (vehicleId, date, duration) =>
      apiRequest(`/vehicles/${vehicleId}/availability`, {
        method: 'POST',
        body: JSON.stringify({ date, duration }),
        skipAuth: true,
      }),
  },

  // ========== BOOKING ENDPOINTS ==========
  bookings: {
    // Create new booking
    create: (bookingData) => 
      apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      }),
    
    // Get user's bookings
    getMyBookings: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/bookings/my-bookings?${queryString}`);
    },
    
    // Get booking by ID
    getById: (id) => apiRequest(`/bookings/${id}`),
    
    // Calculate fare estimate
    estimateFare: (bookingDetails) =>
      apiRequest('/bookings/estimate', {
        method: 'POST',
        body: JSON.stringify(bookingDetails),
        skipAuth: true,
      }),
    
    // Cancel booking
    cancel: (id, reason) => 
      apiRequest(`/bookings/${id}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      }),
    
    // Update booking status (driver/admin)
    updateStatus: (id, status) => 
      apiRequest(`/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    // Rate completed ride
    rateRide: (id, rating, review) =>
      apiRequest(`/bookings/${id}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating, review }),
      }),

    // Get active/ongoing bookings
    getActive: () => apiRequest('/bookings/active'),

    // Admin: Get all bookings
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/bookings?${queryString}`);
    },
  },

  // ========== DRIVER ENDPOINTS ==========
  drivers: {
    // Get all drivers
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/drivers?${queryString}`);
    },
    
    // Get driver by ID
    getById: (id) => apiRequest(`/drivers/${id}`),
    
    // Get available drivers
    getAvailable: (date, location) =>
      apiRequest('/drivers/available', {
        method: 'POST',
        body: JSON.stringify({ date, location }),
      }),

    // Admin: Create driver
    create: (driverData) => 
      apiRequest('/drivers', {
        method: 'POST',
        body: JSON.stringify(driverData),
      }),

    // Admin: Update driver
    update: (id, driverData) => 
      apiRequest(`/drivers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(driverData),
      }),

    // Admin: Toggle driver active status
    toggleActive: (id) => 
      apiRequest(`/drivers/${id}/toggle-active`, {
        method: 'PUT',
      }),
  },

  // ========== LOCATIONS/ROUTES ENDPOINTS ==========
  locations: {
    // Get popular pickup locations
    getPopular: () => 
      apiRequest('/locations/popular', { skipAuth: true }),
    
    // Search locations
    search: (query) => 
      apiRequest(`/locations/search?q=${encodeURIComponent(query)}`, { skipAuth: true }),
    
    // Calculate route and estimate
    calculateRoute: (pickup, dropoff) =>
      apiRequest('/locations/calculate-route', {
        method: 'POST',
        body: JSON.stringify({ pickup, dropoff }),
        skipAuth: true,
      }),
  },

  // ========== PAYMENT ENDPOINTS ==========
  payments: {
    // Initialize payment
    initiate: (bookingId, method) =>
      apiRequest('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({ bookingId, method }),
      }),

    // Verify payment
    verify: (transactionId) =>
      apiRequest(`/payments/verify/${transactionId}`, {
        method: 'POST',
      }),

    // Get payment methods
    getMethods: () => 
      apiRequest('/payments/methods', { skipAuth: true }),

    // Get payment history
    getHistory: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/payments/history?${queryString}`);
    },
  },

  // ========== SUPPORT ENDPOINTS ==========
  support: {
    // Submit support ticket
    submit: (data) => 
      apiRequest('/support', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    // Get user's tickets
    getMyTickets: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/support/my-tickets?${queryString}`);
    },
    
    // Get ticket by ID
    getById: (id) => apiRequest(`/support/${id}`),

    // Admin: Get all tickets
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/support?${queryString}`);
    },
    
    // Admin: Update ticket status
    updateStatus: (id, status, response) => 
      apiRequest(`/support/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, response }),
      }),
  },

  // ========== ADMIN DASHBOARD ENDPOINTS ==========
  admin: {
    // Get dashboard overview
    getDashboard: () => apiRequest('/admin/dashboard'),
    
    // Get analytics
    getAnalytics: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/admin/analytics?${queryString}`);
    },
    
    // Get all users
    getUsers: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/admin/users?${queryString}`);
    },
    
    // Toggle user active status
    toggleUserActive: (id) => 
      apiRequest(`/admin/users/${id}/toggle-active`, {
        method: 'PUT',
      }),
    
    // Get activity logs
    getActivityLogs: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/admin/activity-logs?${queryString}`);
    },

    // Get revenue stats
    getRevenueStats: (startDate, endDate) =>
      apiRequest(`/admin/revenue?start=${startDate}&end=${endDate}`),

    // Get booking stats
    getBookingStats: (period = 'month') =>
      apiRequest(`/admin/booking-stats?period=${period}`),
  },

  // ========== NOTIFICATIONS ENDPOINTS ==========
  notifications: {
    // Get user notifications
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/notifications?${queryString}`);
    },

    // Mark as read
    markAsRead: (id) =>
      apiRequest(`/notifications/${id}/read`, {
        method: 'PUT',
      }),

    // Mark all as read
    markAllAsRead: () =>
      apiRequest('/notifications/read-all', {
        method: 'PUT',
      }),

    // Delete notification
    delete: (id) =>
      apiRequest(`/notifications/${id}`, {
        method: 'DELETE',
      }),
  },

  // ========== PROFILE ENDPOINTS ==========
  profile: {
    // Get user profile
    get: () => apiRequest('/profile'),

    // Update profile
    update: (profileData) =>
      apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),

    // Update profile picture
    updatePicture: (imageData) =>
      apiRequest('/profile/picture', {
        method: 'PUT',
        body: JSON.stringify({ image: imageData }),
      }),

    // Get ride statistics
    getRideStats: () => apiRequest('/profile/ride-stats'),
  },
};

// Helper function to upload file with multipart/form-data
export const uploadFile = async (endpoint, file, additionalData = {}) => {
  try {
    const token = await getAuthToken();
    const formData = new FormData();
    
    // Add file
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || 'upload.jpg',
    });

    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

export default API;