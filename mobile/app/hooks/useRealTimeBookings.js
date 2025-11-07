import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { Alert, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';

const useRealTimeBookings = (role = 'driver') => {
  const { connected, on } = useSocket();
  const [newBooking, setNewBooking] = useState(null);
  const [bookingUpdate, setBookingUpdate] = useState(null);

  useEffect(() => {
    if (!connected) return;

    const unsubNewBooking = on('booking:new', (booking) => {
      console.log('🔔 New booking:', booking);
      setNewBooking(booking);
      
      // Show notification
      Notifications.scheduleNotificationAsync({
        content: {
          title: '🚗 New Ride Request!',
          body: `Pickup: ${booking.pickup_location}`,
          sound: true,
        },
        trigger: null,
      });
      
      // Vibrate
      Vibration.vibrate([0, 500, 200, 500]);
    });

    const unsubAccepted = on('booking:accepted', (booking) => {
      console.log('✅ Booking accepted:', booking);
      setBookingUpdate({ type: 'accepted', data: booking });
      Alert.alert('Driver Assigned', 'A driver has accepted your booking!');
    });

    const unsubStatus = on('booking:statusUpdated', (booking) => {
      console.log('🔄 Status update:', booking);
      setBookingUpdate({ type: 'statusUpdated', data: booking });
    });

    const unsubCancelled = on('booking:cancelled', (booking) => {
      console.log('❌ Booking cancelled:', booking);
      setBookingUpdate({ type: 'cancelled', data: booking });
      Alert.alert('Booking Cancelled', 'This booking has been cancelled');
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