// app/config/_env.js
import Constants from 'expo-constants';

// React Native / Expo environment configuration

// Ensure process.env is defined (important for web builds)
const getEnvVariable = (key, fallback) => {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

// Dynamically get the local IP address from the Expo host URI
const getLocalHost = () => {
  // hostUri contains the IP and port of the Expo bundler (e.g., "192.168.1.5:8081")
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return 'localhost';
};

const LOCAL_API_URL = `http://${getLocalHost()}:5000`;

const ENV = {
  // Base API URL
  API_BASE_URL: getEnvVariable(
    'EXPO_PUBLIC_API_URL',
    __DEV__ ? LOCAL_API_URL : 'https://prepedo.com'
  ),

  // Socket URL for real-time connections
  SOCKET_URL: getEnvVariable(
    'EXPO_PUBLIC_SOCKET_URL',
    __DEV__ ? LOCAL_API_URL : 'https://prepedo.com'
  ),

  // Node environment mode
  NODE_ENV: typeof __DEV__ !== 'undefined' && __DEV__ ? 'development' : 'production',
};

export default ENV;
