import { useEffect, useState } from 'react';
import useSocket from './useSocket';
import { Alert, Vibration, Platform } from 'react-native';

const getNotificationsModule = () => {
  try {
    return require('expo-notifications');
  } catch (e) {
    console.error('Failed to load expo-notifications:', e.message);
    return null;
  }
};

const useRealTimeBookings = (role = 'driver') => {
  const { connected, on } = useSocket();
  const [newBooking, setNewBooking] = useState(null);
  const [bookingUpdate, setBookingUpdate] = useState(null);

  useEffect(() => {
    if (!connected) return;

    const unsubNewBooking = on('booking:new', (booking) => {
      if (role !== 'driver') return;
      console.log('🔔 New booking request:', booking.id);
      setNewBooking(booking);

      const msg = `New ${booking.vehicle_type} request from ${booking.pickup_location}`;

      try {
        const Notifications = getNotificationsModule();
        if (Notifications && Notifications.scheduleNotificationAsync) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: '🚗 New Ride Request!',
              body: msg,
              sound: true,
              priority: 'high',
            },
            trigger: null,
          }).catch(err => console.log('🔔 Notification suppressed:', err.message));
        }
      } catch (error) {
        console.warn('Notification error:', error);
      }

      Vibration.vibrate([0, 500, 200, 500]);
    });

    const unsubAccepted = on('booking:accepted', (booking) => {
      console.log('✅ Booking accepted:', booking.id);
      setBookingUpdate({ type: 'accepted', data: booking });

      if (role === 'user') {
        Alert.alert('Driver Assigned', `Driver ${booking.driver_name || ''} has accepted your ride!`);
        Vibration.vibrate(400);
      }
    });

    const unsubStatus = on('booking:statusUpdated', (booking) => {
      console.log('🔄 Status update:', booking.status);
      setBookingUpdate({ type: 'statusUpdated', data: booking });

      // Notify user of important status changes
      if (role === 'user' && ['arrived', 'started', 'completed'].includes(booking.status)) {
        Vibration.vibrate(200);
      }
    });

    const unsubCancelled = on('booking:cancelled', (booking) => {
      console.log('❌ Booking cancelled:', booking.id);
      setBookingUpdate({ type: 'cancelled', data: booking });

      const cancelledBy = booking.cancelled_by === 'driver' ? 'the driver' : 'the passenger';
      Alert.alert('Ride Cancelled', `This ride was cancelled by ${cancelledBy}.`);
      Vibration.vibrate([0, 200, 100, 200]);
    });

    return () => {
      unsubNewBooking();
      unsubAccepted();
      unsubStatus();
      unsubCancelled();
    };
  }, [connected, on]);

  return {
    connected,
    newBooking,
    bookingUpdate,
    clearNewBooking: () => setNewBooking(null),
    clearBookingUpdate: () => setBookingUpdate(null),
  };
};

export default useRealTimeBookings;