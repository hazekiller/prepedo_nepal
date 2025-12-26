import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { COLORS } from '../config/colors';
import { API_BASE_URL } from '../config/api';
import socketService from '../services/socketService';
import useSocket from '../hooks/useSocket';
import MapComponent from '../components/shared/MapComponent';

export default function RequestsScreen() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const { connected } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [driverStatus, setDriverStatus] = useState({ is_online: false, is_approved: false });

  useFocusEffect(
    useCallback(() => {
      fetchAvailableBookings();
    }, [])
  );

  useEffect(() => {
    fetchAvailableBookings();

    // Listen for new bookings
    if (connected && socketService.socket) {
      console.log('📡 Socket connected in RequestsScreen, setting up listeners...');

      socketService.socket.on('booking:new', (newBooking) => {
        console.log('🔔 New booking received:', newBooking.id);
        setRequests(prev => [newBooking, ...prev]);
      });

      socketService.socket.on('booking:taken', (data) => {
        console.log('🚫 Booking taken by another driver:', data.bookingId);
        setRequests(prev => prev.filter(r => r.id !== data.bookingId));
      });

      socketService.socket.on('booking:assigned', (booking) => {
        console.log('🚖 You have been assigned to booking:', booking.id);
        Alert.alert('Success', 'You have been selected for this ride!', [
          { text: 'View Ride', onPress: () => router.push(`/driver/active-ride?rideId=${booking.id}`) }
        ]);
      });
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('booking:new');
        socketService.socket.off('booking:taken');
        socketService.socket.off('booking:assigned');
      }
    };
  }, [connected]);

  const fetchAvailableBookings = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/api/bookings/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRequests(response.data.data.bookings || response.data.data);
        setStatusMessage(response.data.message);
        setDriverStatus(response.data.status || { is_online: false, is_approved: false });
      }
    } catch (error) {
      console.error('Fetch available bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (bookingId) => {
    try {
      setAcceptingId(bookingId);
      const response = await axios.post(
        `${API_BASE_URL}/api/bookings/${bookingId}/offer`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Offer sent to user!', [
          {
            text: 'OK', onPress: () => {
              // Filter out the requested ride from UI after offering
              setRequests(prev => prev.filter(r => r.id !== bookingId));
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Send offer error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to send offer';

      if (error.response?.status === 403) {
        Alert.alert('Access Denied', errorMsg, [
          { text: 'Go to Status', onPress: () => router.push('/driver/toggle-status') },
          { text: 'Cancel', style: 'cancel' }
        ]);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.heading}>Available Requests</Text>
          <Text style={styles.subheading}>Nearby rides in Kathmandu Valley</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapComponent height={200} />
        </View>

        {statusMessage && (
          <View style={styles.messageBanner}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.messageText}>{statusMessage}</Text>
          </View>
        )}

        {!driverStatus.is_online && driverStatus.is_approved && (
          <View style={[styles.messageBanner, { backgroundColor: 'rgba(255, 107, 0, 0.1)', borderColor: COLORS.primary }]}>
            <Ionicons name="warning" size={20} color={COLORS.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.messageText, { marginLeft: 0 }]}>You are currently OFFLINE. Go online to send offers.</Text>
              <TouchableOpacity
                style={styles.goOnlineBtn}
                onPress={() => router.push('/driver/toggle-status')}
              >
                <Text style={styles.goOnlineText}>GO ONLINE NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.userInfo}>
                  <Ionicons name="person-circle" size={40} color={COLORS.primary} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.userName}>{item.user_name || 'Passenger'}</Text>
                    <Text style={styles.userRating}>⭐ 4.8</Text>
                  </View>
                </View>
                <Text style={styles.fare}>Rs. {item.estimated_fare || item.fare}</Text>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routeBox}>
                  <Ionicons name="location" size={16} color={COLORS.primary} />
                  <Text style={styles.routeText} numberOfLines={1}>{item.pickup_location || item.pickup}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeBox}>
                  <Ionicons name="flag" size={16} color="#FF6B6B" />
                  <Text style={styles.routeText} numberOfLines={1}>{item.dropoff_location || item.drop}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleSendOffer(item.id)}
                disabled={acceptingId !== null}
              >
                <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.acceptGradient}>
                  {acceptingId === item.id ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.acceptText}>Send Offer</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No ride requests available near you.</Text>
            </View>
          }
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gradient: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  heading: { fontSize: 28, fontWeight: "900", color: COLORS.primary },
  subheading: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  messageBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  messageText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  goOnlineBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  goOnlineText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  mapContainer: { marginHorizontal: 20, marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  requestCard: {
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userName: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  userRating: { color: COLORS.primary, fontSize: 12, marginTop: 2 },
  fare: { color: COLORS.primary, fontWeight: "900", fontSize: 20 },
  routeContainer: { marginBottom: 20 },
  routeBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  routeText: { color: COLORS.text, fontSize: 14, marginLeft: 10, flex: 1 },
  routeLine: { width: 1, height: 10, backgroundColor: COLORS.border, marginLeft: 7, marginBottom: 8 },
  acceptButton: { borderRadius: 12, overflow: 'hidden' },
  acceptGradient: { paddingVertical: 14, alignItems: 'center' },
  acceptText: { color: "#000", fontWeight: "900", fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textSecondary, marginTop: 16, fontSize: 16 },
});
