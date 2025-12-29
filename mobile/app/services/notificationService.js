// app/services/notificationService.js
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

// safe notification wrapper
const isRunningInExpoGo = Constants.appOwnership === 'expo';

// helper to get Notifications safely
const getNotifications = () => {
  try {
    return require('expo-notifications');
  } catch (e) {
    console.warn('expo-notifications not available');
    return null;
  }
};

// Configure behaviour for showing notifications in-app
try {
  const Notifications = getNotifications();
  if (Notifications && Notifications.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.log('Notification handler skipped:', e.message);
}

export async function showLocalNotification(title, body) {
  try {
    if (!title && !body) return;

    const Notifications = getNotifications();
    if (Notifications && Notifications.scheduleNotificationAsync) {
      // schedule immediate local notification
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true, priority: 'high' },
        trigger: null,
      });
    } else {
      throw new Error('Notifications module not available');
    }
  } catch (err) {
    console.log('Notification suppressed (Expo Go fallback):', title, body);
    // In many cases, we don't want to show an Alert for every background update
    // But for critical ones, we could:
    // Alert.alert(title || 'Notification', body || '');
  }
}

export async function getExpoPushTokenIfAvailable() {
  try {
    const Notifications = getNotifications();
    if (!Notifications || isRunningInExpoGo) {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData?.data ?? null;
  } catch (err) {
    return null;
  }
}

export default {
  showLocalNotification,
  getExpoPushTokenIfAvailable,
};
