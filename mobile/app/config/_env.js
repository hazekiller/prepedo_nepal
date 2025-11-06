// app/config/_env.js

// React Native environment variables
export const ENV = {
  API_BASE_URL: __DEV__
    ? 'http://192.168.1.68:5000' // Use your PC LAN IP for Expo LAN
    : 'https://saalik-api.prepedo.com', // Production
  NODE_ENV: __DEV__ ? 'development' : 'production'
};
