// app/services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api'; // Make sure this points to your LAN IP
import axios from 'axios';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach token automatically if stored
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ---------------- User Auth ----------------
  async register(userData) {
    try {
      const response = await this.api.post('/user/register', userData);
      if (response.data.token) {
        await this.saveAuthData(response.data.token, response.data.user);
      }
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/user/login', credentials);
      if (response.data.token) {
        await this.saveAuthData(response.data.token, response.data.user);
      }
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  // ... (keeping other methods same until we find usage of authToken)

  // ---------------- Auth Helpers ----------------
  async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }

  async getUserData() {
    const userDataString = await AsyncStorage.getItem('userData');
    return userDataString ? JSON.parse(userDataString) : null;
  }

  async saveAuthData(token, user) {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  }

  async clearAuthData() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
  }

  // ---------------- Error Handling ----------------
  _handleError(error) {
    if (error.response && error.response.data) {
      return new Error(error.response.data.message || 'An error occurred on the server.');
    } else if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }
}

export default new AuthService();
