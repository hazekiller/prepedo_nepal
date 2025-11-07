// app/services/vehicleService.js
import API from '../config/api';

/**
 * Vehicle Service - Helper functions for vehicle management
 */

// Vehicle feature icons mapping
export const VEHICLE_FEATURES = {
  wifi: { icon: 'wifi', label: 'WiFi' },
  leather: { icon: 'diamond', label: 'Leather Seats' },
  climate: { icon: 'snow', label: 'Climate Control' },
  sound: { icon: 'musical-notes', label: 'Premium Sound' },
  massage: { icon: 'body', label: 'Massage Seats' },
  champagne: { icon: 'wine', label: 'Champagne Bar' },
  entertainment: { icon: 'tv', label: 'Entertainment System' },
  '4wd': { icon: 'car-sport', label: '4WD' },
  spacious: { icon: 'resize', label: 'Spacious Interior' },
  sunroof: { icon: 'sunny', label: 'Panoramic Sunroof' },
  gps: { icon: 'navigate', label: 'GPS Navigation' },
  usb: { icon: 'phone-portrait', label: 'USB Charging' },
  water: { icon: 'water', label: 'Complimentary Water' },
  partition: { icon: 'remove', label: 'Privacy Partition' },
};

// Mock vehicle data (replace with API calls in production)
export const MOCK_VEHICLES = [
  {
    id: 1,
    name: 'Mercedes S-Class',
    category: 'executive',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
    ],
    passengers: 3,
    luggage: 2,
    description: 'Experience the pinnacle of automotive luxury with the Mercedes S-Class. Perfect for executives and VIP travel.',
    features: ['wifi', 'leather', 'climate', 'sound', 'massage', 'partition'],
    pricePerHour: 6500,
    pricePerDay: 45000,
    available: true,
    rating: 4.9,
    totalRides: 245,
  },
  {
    id: 2,
    name: 'BMW 7 Series',
    category: 'executive',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    ],
    passengers: 4,
    luggage: 3,
    description: 'Sophistication meets performance. The BMW 7 Series delivers an unmatched luxury experience.',
    features: ['wifi', 'massage', 'champagne', 'entertainment', 'climate', 'sound'],
    pricePerHour: 7000,
    pricePerDay: 50000,
    available: true,
    rating: 4.8,
    totalRides: 198,
  },
  {
    id: 3,
    name: 'Range Rover',
    category: 'suv',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    ],
    passengers: 6,
    luggage: 4,
    description: 'Conquer any terrain in ultimate luxury. Perfect for family trips and mountain adventures.',
    features: ['4wd', 'spacious', 'wifi', 'sound', 'climate', 'sunroof'],
    pricePerHour: 6000,
    pricePerDay: 42000,
    available: true,
    rating: 4.7,
    totalRides: 312,
  },
  {
    id: 4,
    name: 'Audi A6',
    category: 'sedan',
    image: 'https://images.unsplash.com/photo-1610768764270-790fbec18178?w=800',
    images: [
      'https://images.unsplash.com/photo-1610768764270-790fbec18178?w=800',
    ],
    passengers: 4,
    luggage: 2,
    description: 'Elegant design meets cutting-edge technology. The Audi A6 is perfect for business and leisure.',
    features: ['wifi', 'leather', 'sunroof', 'sound', 'climate', 'gps'],
    pricePerHour: 5000,
    pricePerDay: 35000,
    available: true,
    rating: 4.6,
    totalRides: 276,
  },
  {
    id: 5,
    name: 'Toyota Alphard',
    category: 'luxury-van',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
    images: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
    ],
    passengers: 7,
    luggage: 5,
    description: 'Ultimate space and comfort for larger groups. Perfect for family trips and corporate events.',
    features: ['spacious', 'wifi', 'entertainment', 'climate', 'usb', 'water'],
    pricePerHour: 7500,
    pricePerDay: 55000,
    available: true,
    rating: 4.8,
    totalRides: 189,
  },
  {
    id: 6,
    name: 'Lexus LS',
    category: 'executive',
    image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800',
    images: [
      'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800',
    ],
    passengers: 4,
    luggage: 3,
    description: 'Japanese precision meets luxury comfort. The Lexus LS offers a serene driving experience.',
    features: ['wifi', 'massage', 'climate', 'sound', 'partition', 'leather'],
    pricePerHour: 6800,
    pricePerDay: 48000,
    available: false, // Example of unavailable vehicle
    rating: 4.9,
    totalRides: 167,
  },
];

/**
 * Get vehicles by category
 */
export const getVehiclesByCategory = (vehicles, category) => {
  if (category === 'all') return vehicles;
  return vehicles.filter(vehicle => vehicle.category === category);
};

/**
 * Get vehicle by ID
 */
export const getVehicleById = (vehicles, id) => {
  return vehicles.find(vehicle => vehicle.id === parseInt(id));
};

/**
 * Get featured vehicles (top rated or premium)
 */
export const getFeaturedVehicles = (vehicles, limit = 3) => {
  return vehicles
    .filter(v => v.available)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

/**
 * Calculate total cost for booking
 */
export const calculateVehicleCost = (vehicle, hours) => {
  if (!vehicle) return 0;
  
  // If booking more than 8 hours, use day rate
  if (hours >= 8) {
    const days = Math.ceil(hours / 24);
    return vehicle.pricePerDay * days;
  }
  
  return vehicle.pricePerHour * hours;
};

/**
 * Format vehicle price for display
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Get vehicle category label
 */
export const getCategoryLabel = (category) => {
  const labels = {
    sedan: 'Executive Sedan',
    suv: 'Premium SUV',
    executive: 'Executive Class',
    'luxury-van': 'Luxury Van',
  };
  return labels[category] || category;
};

/**
 * Get vehicle availability status
 */
export const getAvailabilityStatus = (vehicle) => {
  if (!vehicle) return { available: false, message: 'Vehicle not found' };
  
  if (!vehicle.available) {
    return { available: false, message: 'Currently unavailable' };
  }
  
  return { available: true, message: 'Available now' };
};

/**
 * Sort vehicles by different criteria
 */
export const sortVehicles = (vehicles, sortBy = 'price-low') => {
  const sorted = [...vehicles];
  
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
    case 'price-high':
      return sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'popular':
      return sorted.sort((a, b) => b.totalRides - a.totalRides);
    case 'capacity':
      return sorted.sort((a, b) => b.passengers - a.passengers);
    default:
      return sorted;
  }
};

/**
 * Filter vehicles by criteria
 */
export const filterVehicles = (vehicles, filters = {}) => {
  let filtered = [...vehicles];
  
  // Filter by availability
  if (filters.availableOnly) {
    filtered = filtered.filter(v => v.available);
  }
  
  // Filter by price range
  if (filters.minPrice) {
    filtered = filtered.filter(v => v.pricePerHour >= filters.minPrice);
  }
  if (filters.maxPrice) {
    filtered = filtered.filter(v => v.pricePerHour <= filters.maxPrice);
  }
  
  // Filter by passenger capacity
  if (filters.minPassengers) {
    filtered = filtered.filter(v => v.passengers >= filters.minPassengers);
  }
  
  // Filter by features
  if (filters.requiredFeatures && filters.requiredFeatures.length > 0) {
    filtered = filtered.filter(v => 
      filters.requiredFeatures.every(feature => v.features.includes(feature))
    );
  }
  
  return filtered;
};

/**
 * Get vehicle recommendation based on needs
 */
export const getRecommendedVehicle = (vehicles, needs = {}) => {
  const { passengers = 1, luggage = 0, budget = Infinity, category = null } = needs;
  
  let candidates = vehicles.filter(v => 
    v.available &&
    v.passengers >= passengers &&
    v.luggage >= luggage &&
    v.pricePerHour <= budget
  );
  
  if (category) {
    candidates = candidates.filter(v => v.category === category);
  }
  
  // Sort by rating and return best match
  return candidates.sort((a, b) => b.rating - a.rating)[0] || null;
};

/**
 * Fetch vehicles from API (production use)
 */
export const fetchVehicles = async (params = {}) => {
  try {
    const response = await API.vehicles.getAll(params);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    // Return mock data as fallback in development
    return MOCK_VEHICLES;
  }
};

/**
 * Fetch vehicle details from API
 */
export const fetchVehicleDetails = async (id) => {
  try {
    const response = await API.vehicles.getById(id);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    // Return mock data as fallback
    return getVehicleById(MOCK_VEHICLES, id);
  }
};

export default {
  VEHICLE_FEATURES,
  MOCK_VEHICLES,
  getVehiclesByCategory,
  getVehicleById,
  getFeaturedVehicles,
  calculateVehicleCost,
  formatPrice,
  getCategoryLabel,
  getAvailabilityStatus,
  sortVehicles,
  filterVehicles,
  getRecommendedVehicle,
  fetchVehicles,
  fetchVehicleDetails,
};