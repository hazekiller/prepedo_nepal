// app/services/bookingService.js
import API from './api';

/**
 * Booking Service - Helper functions for ride bookings
 */

// Vehicle categories with their details
export const VEHICLE_CATEGORIES = {
  SEDAN: {
    id: 'sedan',
    name: 'Executive Sedan',
    description: 'Perfect for business travel and airport transfers',
    capacity: 3,
    luggage: 2,
    baseRate: 3500,
  },
  SUV: {
    id: 'suv',
    name: 'Premium SUV',
    description: 'Spacious comfort for families and groups',
    capacity: 6,
    luggage: 4,
    baseRate: 5000,
  },
  EXECUTIVE: {
    id: 'executive',
    name: 'Executive Class',
    description: 'Ultimate luxury for VIP experiences',
    capacity: 4,
    luggage: 3,
    baseRate: 6500,
  },
  LUXURY_VAN: {
    id: 'luxury-van',
    name: 'Luxury Van',
    description: 'Ideal for large groups and events',
    capacity: 10,
    luggage: 6,
    baseRate: 8000,
  },
};

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  ESEWA: 'esewa',
  KHALTI: 'khalti',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
};

/**
 * Calculate fare based on distance, duration, and vehicle type
 */
export const calculateFare = (distance, duration, vehicleCategory, surcharges = {}) => {
  const category = VEHICLE_CATEGORIES[vehicleCategory] || VEHICLE_CATEGORIES.SEDAN;
  
  // Base fare
  let fare = category.baseRate;
  
  // Distance-based calculation (per km)
  const distanceRate = 150; // NPR per km
  fare += distance * distanceRate;
  
  // Duration-based calculation (per hour)
  const hourlyRate = category.baseRate * 0.5;
  fare += duration * hourlyRate;
  
  // Apply surcharges
  if (surcharges.nightCharge) {
    fare *= 1.25; // 25% night surcharge (10 PM - 6 AM)
  }
  
  if (surcharges.peakHour) {
    fare *= 1.15; // 15% peak hour surcharge (8-10 AM, 5-7 PM)
  }
  
  if (surcharges.airport) {
    fare += 500; // Airport pickup/dropoff fee
  }
  
  // Round to nearest 10
  fare = Math.round(fare / 10) * 10;
  
  return {
    baseFare: category.baseRate,
    distanceFare: distance * distanceRate,
    durationFare: duration * hourlyRate,
    surcharges: fare - (category.baseRate + (distance * distanceRate) + (duration * hourlyRate)),
    totalFare: fare,
  };
};

/**
 * Validate booking data before submission
 */
export const validateBookingData = (bookingData) => {
  const errors = {};
  
  if (!bookingData.vehicleId) {
    errors.vehicleId = 'Please select a vehicle';
  }
  
  if (!bookingData.pickupLocation) {
    errors.pickupLocation = 'Pickup location is required';
  }
  
  if (!bookingData.dropoffLocation) {
    errors.dropoffLocation = 'Dropoff location is required';
  }
  
  if (!bookingData.pickupDate) {
    errors.pickupDate = 'Pickup date is required';
  }
  
  if (!bookingData.pickupTime) {
    errors.pickupTime = 'Pickup time is required';
  }
  
  if (bookingData.passengers < 1) {
    errors.passengers = 'At least one passenger is required';
  }
  
  // Check if pickup date is in the past
  const pickupDateTime = new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`);
  if (pickupDateTime < new Date()) {
    errors.pickupDate = 'Pickup date/time cannot be in the past';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format booking data for API submission
 */
export const formatBookingData = (bookingData) => {
  return {
    vehicle_id: bookingData.vehicleId,
    pickup_location: bookingData.pickupLocation,
    dropoff_location: bookingData.dropoffLocation,
    pickup_datetime: `${bookingData.pickupDate}T${bookingData.pickupTime}`,
    duration: bookingData.duration || 2, // Default 2 hours
    passengers: bookingData.passengers || 1,
    special_requests: bookingData.specialRequests || '',
    payment_method: bookingData.paymentMethod || PAYMENT_METHODS.CASH,
  };
};

/**
 * Check if time slot is within peak hours
 */
export const isPeakHour = (time) => {
  const hour = new Date(`2000-01-01T${time}`).getHours();
  return (hour >= 8 && hour < 10) || (hour >= 17 && hour < 19);
};

/**
 * Check if time slot is during night
 */
export const isNightTime = (time) => {
  const hour = new Date(`2000-01-01T${time}`).getHours();
  return hour >= 22 || hour < 6;
};

/**
 * Get booking status color
 */
export const getBookingStatusColor = (status) => {
  const colors = {
    pending: '#F39C12',
    confirmed: '#3498DB',
    assigned: '#9B59B6',
    in_progress: '#27AE60',
    completed: '#2ECC71',
    cancelled: '#E74C3C',
  };
  return colors[status] || '#95A5A6';
};

/**
 * Get booking status label
 */
export const getBookingStatusLabel = (status) => {
  const labels = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    assigned: 'Driver Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] || 'Unknown';
};

/**
 * Estimate fare via API
 */
export const getEstimatedFare = async (bookingDetails) => {
  try {
    const response = await API.bookings.estimateFare(bookingDetails);
    return response.data;
  } catch (error) {
    console.error('Fare estimation error:', error);
    throw error;
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  try {
    // Validate data
    const validation = validateBookingData(bookingData);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }
    
    // Format data
    const formattedData = formatBookingData(bookingData);
    
    // Submit booking
    const response = await API.bookings.create(formattedData);
    return response.data;
  } catch (error) {
    console.error('Booking creation error:', error);
    throw error;
  }
};

/**
 * Get popular pickup locations in Nepal
 */
export const POPULAR_LOCATIONS = [
  { id: 1, name: 'Tribhuvan International Airport', address: 'Kathmandu', isAirport: true },
  { id: 2, name: 'Thamel', address: 'Kathmandu', isAirport: false },
  { id: 3, name: 'Durbar Marg', address: 'Kathmandu', isAirport: false },
  { id: 4, name: 'Boudhanath Stupa', address: 'Kathmandu', isAirport: false },
  { id: 5, name: 'Patan Durbar Square', address: 'Lalitpur', isAirport: false },
  { id: 6, name: 'Bhaktapur Durbar Square', address: 'Bhaktapur', isAirport: false },
  { id: 7, name: 'Pokhara Airport', address: 'Pokhara', isAirport: true },
  { id: 8, name: 'Lakeside', address: 'Pokhara', isAirport: false },
];

export default {
  VEHICLE_CATEGORIES,
  BOOKING_STATUS,
  PAYMENT_METHODS,
  calculateFare,
  validateBookingData,
  formatBookingData,
  isPeakHour,
  isNightTime,
  getBookingStatusColor,
  getBookingStatusLabel,
  getEstimatedFare,
  createBooking,
  POPULAR_LOCATIONS,
};