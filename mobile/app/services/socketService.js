// app/services/socketService.js
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../config/_env';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('❌ No auth token found, cannot connect to socket');
        return false;
      }

      if (this.socket) this.disconnect();

      this.socket = io(ENV.API_BASE_URL, {
        transports: ['websocket', 'polling'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.setupEventListeners();

      return new Promise((resolve) => {
        this.socket.on('connected', () => {
          console.log('✅ Socket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message);
          this.isConnected = false;
          resolve(false);
        });
      });
    } catch (error) {
      console.error('❌ Socket connection failed:', error);
      return false;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🟢 Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection:status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection:status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('❌ Max reconnection attempts reached');
        this.emit('connection:failed', { error: error.message });
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.emit('socket:error', error);
    });

    // Booking updates
    this.socket.on('booking:new', (booking) => this.emit('booking:new', booking));
    this.socket.on('booking:accepted', (booking) => this.emit('booking:accepted', booking));
    this.socket.on('booking:statusUpdated', (booking) => this.emit('booking:statusUpdated', booking));
    this.socket.on('booking:cancelled', (booking) => this.emit('booking:cancelled', booking));
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try { callback(data); } catch (err) { console.error(err); }
      });
    }
  }

  send(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn(`⚠️ Cannot send ${event}: Socket not connected`);
      return false;
    }
    this.socket.emit(event, data);
    return true;
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
