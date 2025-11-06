import api from '../config/api';

class AdminService {
  // Get all users (Admin only)
  async getAllUsers() {
    try {
      const response = await api.get('/api/user/all');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await api.get('/api/user/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const response = await api.put(`/api/user/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      const response = await api.put(`/api/user/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/api/user/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get splash screens
  async getSplashScreens() {
    try {
      const response = await api.get('/api/splash');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update splash screen
  async updateSplashScreen(splashId, data) {
    try {
      const response = await api.put(`/api/splash/${splashId}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get ads
  async getAds() {
    try {
      const response = await api.get('/api/ads');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create ad
  async createAd(adData) {
    try {
      const response = await api.post('/api/ads', adData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update ad
  async updateAd(adId, adData) {
    try {
      const response = await api.put(`/api/ads/${adId}`, adData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete ad
  async deleteAd(adId) {
    try {
      const response = await api.delete(`/api/ads/${adId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle errors
  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new AdminService();