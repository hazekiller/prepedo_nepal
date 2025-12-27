// app/config/_env.js
// React Native / Expo environment configuration

// Ensure process.env is defined (important for web builds)
const getEnvVariable = (key, fallback) => {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const ENV = {
  // Base API URL
  API_BASE_URL: getEnvVariable(
    'EXPO_PUBLIC_API_URL',
    'https://prepedo.com'
  ),

  // Socket URL for real-time connections
  SOCKET_URL: getEnvVariable(
    'EXPO_PUBLIC_SOCKET_URL',
    'https://prepedo.com'
  ),

  // Node environment mode
  NODE_ENV: typeof __DEV__ !== 'undefined' && __DEV__ ? 'development' : 'production',
};

export default ENV;
