// app/services/notificationService.js
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

// safe notification wrapper
const isRunningInExpoGo = Constants.appOwnership === 'expo'; // expo go
const supportsRemotePush = !isRunningInExpoGo; // remote push not available in Expo Go

// Configure behaviour for showing notifications in-app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function showLocalNotification(title, body) {
  try {
    if (!title && !body) return;

    // schedule immediate local notification (works in Expo Go)
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true, priority: 'high' },
      trigger: null,
    });
  } catch (err) {
    console.warn('showLocalNotification fallback to Alert', err);
    Alert.alert(title || 'Notification', body || '');
  }
}

export async function getExpoPushTokenIfAvailable() {
  // Only attempt token registration on dev client or standalone builds
  try {
    if (!supportsRemotePush) {
      console.warn('Remote push not supported in Expo Go — use dev build or standalone.');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData?.data ?? null;
  } catch (err) {
    console.error('getExpoPushTokenIfAvailable error', err);
    return null;
  }
}

export default {
  showLocalNotification,
  getExpoPushTokenIfAvailable,
};
