// app/config/api.js
import ENV from './_env'; // ✅ default import

// Base URL
const API_BASE_URL = ENV.API_BASE_URL;

export const API_ENDPOINTS = {
  // Health check
  health: `${API_BASE_URL}/api`,

  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  me: `${API_BASE_URL}/api/auth/me`,
  updatePassword: `${API_BASE_URL}/api/auth/update-password`,

  // Drivers
  registerDriver: `${API_BASE_URL}/api/drivers/register`,
  driverProfile: `${API_BASE_URL}/api/drivers/profile`,

  // Bookings
  createBooking: `${API_BASE_URL}/api/bookings`,
  myBookings: `${API_BASE_URL}/api/bookings/my-bookings`,
  availableBookings: `${API_BASE_URL}/api/bookings/available`,
  acceptBooking: (id) => `${API_BASE_URL}/api/bookings/${id}/accept`,

  // Admin
  dashboard: `${API_BASE_URL}/api/admin/dashboard`,
  analytics: `${API_BASE_URL}/api/admin/analytics`,
  users: `${API_BASE_URL}/api/admin/users`,
  toggleUserActive: (id) => `${API_BASE_URL}/api/admin/users/${id}/toggle-active`,
  activityLogs: `${API_BASE_URL}/api/admin/activity-logs`
};

// Export base URL
export { API_BASE_URL, ENV };
export default API_ENDPOINTS;
