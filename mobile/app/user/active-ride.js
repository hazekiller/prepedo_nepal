import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import socketService from '../services/socketService';
import { COLORS } from '../config/colors';
import { API_BASE_URL } from '../config/api';
import MapComponent from '../components/shared/MapComponent';

export default function ActiveRideScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useSelector((state) => state.auth);
  const [ride, setRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = socketService.socket;
    if (socket && id) {
      console.log('📌 Subscribing to ride updates:', id);
      socket.emit('booking:subscribe', { bookingId: id });

      socket.on('booking:statusUpdated', (data) => {
        console.log('🔄 Ride status updated:', data.status);
        setRide(prev => ({ ...prev, ...data }));
        if (data.status === 'completed') {
          Alert.alert('Success', 'Your ride is complete!', [
            { text: 'OK', onPress: () => router.push('/user/home') }
          ]);
        }
      });

      socket.on('driver:locationUpdated', (coords) => {
        console.log('📍 Driver location update:', coords);
        setDriverLocation(coords);
      });
    }

    fetchRideDetails();

    return () => {
      if (socket) {
        socket.off('booking:statusUpdated');
        socket.off('driver:locationUpdated');
      }
    };
  }, [id]);

  const fetchRideDetails = async () => {
    try {
      if (!token || !id) return;

      const response = await axios.get(`${API_BASE_URL}/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRide(response.data.data);
      } else {
        Alert.alert('Error', 'Could not fetch ride details');
      }
    } catch (error) {
      console.error('Fetch ride error:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Connecting to your ride...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.textMuted} />
        <Text style={styles.errorText}>Ride details not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <View style={{ width: 28 }} />
        </View>

        <MapComponent
          height={300}
          latitude={driverLocation?.latitude || 27.7172}
          longitude={driverLocation?.longitude || 85.3240}
        />

        <ScrollView style={styles.content}>
          <View style={styles.statusBanner}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {ride.status === 'accepted' ? 'Driver is coming to you' :
                ride.status === 'started' ? 'On your way to destination' :
                  ride.status.toUpperCase()}
            </Text>
          </View>

          {/* Driver Card */}
          <View style={styles.card}>
            <View style={styles.driverInfo}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color="#000" />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{ride.driver_name || 'Your Rider'}</Text>
                <Text style={styles.driverSub}>
                  {ride.vehicle_model} • {ride.vehicle_number}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color={COLORS.primary} />
                  <Text style={styles.ratingText}>{ride.driver_rating || '5.0'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Trip Details Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            <View style={styles.routeItem}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.routeText}>{ride.pickup_location}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeItem}>
              <Ionicons name="flag" size={20} color="#FF6B6B" />
              <Text style={styles.routeText}>{ride.dropoff_location}</Text>
            </View>

            <View style={styles.divider} />
            <View style={styles.fareRow}>
              <View>
                <Text style={styles.fareLabel}>Payment Mode</Text>
                <Text style={styles.paymentMethod}>{ride.payment_method?.toUpperCase() || 'CASH'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.fareLabel}>Total Fare</Text>
                <Text style={styles.fareValue}>Rs. {ride.estimated_fare}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { color: COLORS.textSecondary, marginTop: 10 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  errorText: { color: COLORS.textSecondary, marginTop: 16, fontSize: 16 },
  backButton: { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: '#000', fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 20 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.1)', padding: 12, borderRadius: 12, marginBottom: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 10 },
  statusText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  card: { backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 16, marginBottom: 16 },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  driverDetails: { flex: 1, marginLeft: 15 },
  driverName: { color: COLORS.text, fontWeight: '700', fontSize: 18 },
  driverSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  callButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { color: COLORS.text, fontWeight: '700', fontSize: 16, marginBottom: 15 },
  routeItem: { flexDirection: 'row', alignItems: 'center' },
  routeText: { color: COLORS.text, fontSize: 14, marginLeft: 12 },
  routeLine: { width: 1, height: 15, backgroundColor: COLORS.border, marginLeft: 10, marginVertical: 4 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 2 },
  paymentMethod: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  fareValue: { color: COLORS.primary, fontWeight: '900', fontSize: 18 },
});
