// app/(user)/bookings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { COLORS } from '../config/colors';
import socketService from '../services/socketService';

export default function MyRidesScreen() {
  const router = useRouter();
  const { bookings } = useSelector((state) => state.bookings);
  const [rideList, setRideList] = useState([]);

  useEffect(() => {
    setRideList(bookings || []);

    if (socketService.socket) {
      socketService.socket.on('ride:update', (data) => {
        setRideList((prev) => [data, ...prev]);
      });
    }
  }, [bookings]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() => router.push(`/user/active-ride?id=${item.id}`)}
    >
      <Text style={styles.rideTitle}>{item.pickupLocation} → {item.dropoffLocation}</Text>
      <Text style={styles.rideStatus}>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Rides</Text>
      <FlatList
        data={rideList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  heading: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 16 },
  rideCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rideTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  rideStatus: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: 4 },
});
