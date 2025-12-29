// app/(user)/bookings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { COLORS } from '../config/colors';
import { API_BASE_URL } from '../config/api';
import socketService from '../services/socketService';

export default function MyRidesScreen() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [rideList, setRideList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();

    const socket = socketService.socket;
    if (socket) {
      socket.on('booking:statusUpdated', (data) => {
        setRideList((prev) =>
          prev.map(ride => ride.id === data.id ? { ...ride, ...data } : ride)
        );
      });

      socket.on('booking:new', (data) => {
        setRideList((prev) => [data, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('booking:statusUpdated');
        socket.off('booking:new');
      }
    };
  }, []);

  const fetchBookings = async () => {
    try {
      if (!token) return;
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRideList(response.data.data.bookings);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() => router.push(`/user/active-ride?id=${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.bookingId}>#{item.booking_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeItem}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={styles.locationText} numberOfLines={1}>{item.pickup_location}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeItem}>
          <Ionicons name="flag" size={16} color="#FF6B6B" />
          <Text style={styles.locationText} numberOfLines={1}>{item.dropoff_location}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        <Text style={styles.fareText}>NPR {item.estimated_fare}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'accepted': return COLORS.info;
      case 'started': return COLORS.success;
      case 'completed': return COLORS.textSecondary;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Bookings</Text>
      <FlatList
        data={rideList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 130 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 32, fontWeight: '900', color: COLORS.text, marginHorizontal: 16, marginTop: 60, marginBottom: 8 },
  rideCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingId: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '800' },
  routeContainer: { marginBottom: 16 },
  routeItem: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 15, color: COLORS.text, marginLeft: 12, flex: 1 },
  routeLine: { width: 1, height: 10, backgroundColor: COLORS.border, marginLeft: 7, marginVertical: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateText: { fontSize: 13, color: COLORS.textSecondary },
  fareText: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textMuted, fontSize: 16, marginTop: 16 },
});
