import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // fixed
import socketService from '../services/socketService';
import { COLORS } from '../config/colors';

export default function ActiveRideScreen() {
  const { id } = useLocalSearchParams(); // ✅ useLocalSearchParams
  const [ride, setRide] = useState(null);

  useEffect(() => {
    if (socketService.socket) {
      socketService.socket.emit('ride:join', { rideId: id });

      socketService.socket.on('ride:update', (data) => {
        setRide(data);
      });
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('ride:update');
      }
    };
  }, [id]);

  if (!ride)
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Ride</Text>
      <Text style={styles.info}>Pickup: {ride.pickupLocation}</Text>
      <Text style={styles.info}>Drop-off: {ride.dropoffLocation}</Text>
      <Text style={styles.info}>Passengers: {ride.passengers}</Text>
      <Text style={styles.info}>Status: {ride.status}</Text>
      {ride.driverName && <Text style={styles.info}>Driver: {ride.driverName}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  heading: { fontSize: 26, fontWeight: '900', color: COLORS.text, marginBottom: 20 },
  info: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginVertical: 6 },
  loadingText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginTop: 50 },
});
