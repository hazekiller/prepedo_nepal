// app/driver/active-ride.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import COLORS from '../config/colors';
import socketService from '../services/socketService';
import useSocket from '../hooks/useSocket';
import { API_BASE_URL } from '../config/api';
import MapComponent from '../components/shared/MapComponent';

export default function ActiveRideScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useSelector((state) => state.auth);

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rideStatus, setRideStatus] = useState('accepted'); // accepted, arrived, started, completed
  const [currentLocation, setCurrentLocation] = useState(null);

  const { connected } = useSocket();

  useEffect(() => {
    if (params.rideId) {
      if (token) {
        fetchRideDetails(params.rideId);
      }
    } else {
      setLoading(false);
    }
  }, [params.rideId, token]);

  useEffect(() => {
    let locationInterval;
    const socket = socketService.socket;

    if (socket && params.rideId && connected) {
      console.log('📌 Driver subscribing to ride room:', params.rideId);
      socket.emit('booking:subscribe', { bookingId: params.rideId });

      socket.on('booking:statusUpdated', handleRideUpdate);

      const onCancelled = (data) => {
        console.log('❌ Booking cancelled:', data);
        Alert.alert(
          'Ride Cancelled',
          `The ride was cancelled by ${data.cancelled_by === 'user' ? 'the passenger' : 'admin'}.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      };

      socket.on('booking:cancelled', onCancelled);

      // Simulate location updates for tracking verification
      locationInterval = setInterval(() => {
        if (ride) {
          const isGoingToPickup = ['accepted', 'arrived'].includes(rideStatus);
          const targetLat = isGoingToPickup ? parseFloat(ride.pickupLatitude) : parseFloat(ride.dropoffLatitude);
          const targetLon = isGoingToPickup ? parseFloat(ride.pickupLongitude) : parseFloat(ride.dropoffLongitude);

          setCurrentLocation(prev => {
            if (!prev) {
              return {
                latitude: targetLat + (Math.random() * 0.005 - 0.0025),
                longitude: targetLon + (Math.random() * 0.005 - 0.0025)
              };
            }

            const newLat = prev.latitude + (targetLat - prev.latitude) * 0.1;
            const newLon = prev.longitude + (targetLon - prev.longitude) * 0.1;

            const newPos = { latitude: newLat, longitude: newLon };
            socket.emit('driver:updateLocation', newPos);
            return newPos;
          });
        }
      }, 5000);

      return () => {
        socket.off('booking:statusUpdated', handleRideUpdate);
        socket.off('booking:cancelled', onCancelled);
        if (locationInterval) clearInterval(locationInterval);
      };
    }
  }, [params.rideId, connected, !!ride, rideStatus]); // Added ride and rideStatus to dependencies for simulation

  const fetchRideDetails = async (rideId) => {
    try {
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/bookings/${rideId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setRide({
          id: data.id,
          passengerName: data.user_name,
          passengerPhone: data.user_phone,
          pickupLocation: data.pickup_location,
          pickupLatitude: data.pickup_latitude,
          pickupLongitude: data.pickup_longitude,
          dropoffLocation: data.dropoff_location,
          dropoffLatitude: data.dropoff_latitude,
          dropoffLongitude: data.dropoff_longitude,
          estimatedFare: data.estimated_fare,
          distance: `${data.distance} km`,
          duration: 'Calculating...',
          status: data.status,
        });
        setRideStatus(prev => {
          if (prev === 'arriving' && data.status === 'started') return prev;
          return data.status;
        });
      }
    } catch (error) {
      console.error('Error fetching ride:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleRideUpdate = (data) => {
    if (data.id === params.rideId || data.rideId === params.rideId) {
      // Don't revert to 'started' if we are already in 'arriving' state locally
      setRideStatus(prev => {
        if (prev === 'arriving' && data.status === 'started') return prev;
        return data.status;
      });
    }
  };

  const updateStatusOnServer = async (newStatus) => {
    if (isUpdating) return false;
    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/bookings/${params.rideId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setRideStatus(newStatus);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartRide = () => {
    Alert.alert(
      'Start Ride',
      'Have you picked up the passenger?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => updateStatusOnServer('started'),
        },
      ]
    );
  };

  const handleArrivedAtPickup = () => {
    Alert.alert(
      'Arrived at Pickup',
      'Have you arrived at the pickup location?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => updateStatusOnServer('arrived'),
        },
      ]
    );
  };

  const handleArrivedAtDropoff = () => {
    Alert.alert(
      'Arrived at Destination',
      'Have you arrived at the drop-off location?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            // Only local status change for UI flow
            setRideStatus('arriving');
          },
        },
      ]
    );
  };

  const handleCompleteRide = () => {
    Alert.alert(
      'Complete Ride',
      'Is the passenger safely dropped off?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            const success = await updateStatusOnServer('completed');
            if (success) {
              setTimeout(() => {
                router.back();
              }, 2000);
            }
          },
        },
      ]
    );
  };



  // ... (handleRideUpdate, updateStatusOnServer, etc.)

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.put(
                `${API_BASE_URL}/api/bookings/${params.rideId}/cancel`,
                { reason: 'Driver requested cancellation' },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.success) {
                Alert.alert('Success', 'Ride cancelled successfully', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              } else {
                Alert.alert('Error', response.data.message || 'Failed to cancel');
              }
            } catch (error) {
              console.error('Cancel error:', error);
              Alert.alert('Error', 'Failed to cancel ride');
            }
          },
        },
      ]
    );
  };

  const handleContactPassenger = () => {
    Alert.alert(
      'Contact Passenger',
      ride?.passengerPhone || 'Phone number not available',
      [
        { text: 'Close' },
        { text: 'Call', onPress: () => Alert.alert('Calling...', 'This would open the phone dialer') },
      ]
    );
  };

  const handleNavigate = () => {
    if (!ride) return;

    const lat = rideStatus === 'accepted' ? ride.pickupLatitude : ride.dropoffLatitude;
    const lon = rideStatus === 'accepted' ? ride.pickupLongitude : ride.dropoffLongitude;
    const label = rideStatus === 'accepted' ? 'Pickup Location' : 'Dropoff Location';

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lon}`,
      android: `geo:0,0?q=${lat},${lon}(${label})`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
        Linking.openURL(browserUrl);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.errorText}>Ride not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A', '#000000']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Ride</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Ride Status Banner */}
        <View style={styles.statusBanner}>
          <Ionicons
            name={
              rideStatus === 'accepted' ? 'checkmark-circle' :
                rideStatus === 'started' ? 'car' :
                  rideStatus === 'arriving' ? 'location' :
                    'checkmark-done-circle'
            }
            size={32}
            color={COLORS.primary}
          />
          <Text style={styles.statusText}>
            {rideStatus === 'accepted' && 'Ride Accepted'}
            {rideStatus === 'started' && 'Ride in Progress'}
            {rideStatus === 'arriving' && 'Arriving at Destination'}
            {rideStatus === 'completed' && 'Ride Completed'}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Main Map View */}
          <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
            <MapComponent
              height={260}
              pickup={{
                latitude: parseFloat(ride.pickupLatitude),
                longitude: parseFloat(ride.pickupLongitude)
              }}
              dropoff={{
                latitude: parseFloat(ride.dropoffLatitude),
                longitude: parseFloat(ride.dropoffLongitude)
              }}
              driver={currentLocation}
              origin={currentLocation}
              destination={(rideStatus === 'accepted' || rideStatus === 'arrived') ? {
                latitude: parseFloat(ride.pickupLatitude),
                longitude: parseFloat(ride.pickupLongitude)
              } : {
                latitude: parseFloat(ride.dropoffLatitude),
                longitude: parseFloat(ride.dropoffLongitude)
              }}
            />
          </View>

          {/* Passenger Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Passenger Details</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{ride.passengerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{ride.passengerPhone}</Text>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactPassenger}>
              <Text style={styles.contactButtonText}>Contact Passenger</Text>
            </TouchableOpacity>
          </View>

          {/* Route Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Route Information</Text>
            <View style={styles.routeItem}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeText}>{ride.pickupLocation}</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeItem}>
              <Ionicons name="flag" size={20} color="#FF6B6B" />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Drop-off</Text>
                <Text style={styles.routeText}>{ride.dropoffLocation}</Text>
              </View>
            </View>
          </View>

          {/* Trip Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="navigate" size={24} color={COLORS.primary} />
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{ride.distance}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color={COLORS.primary} />
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{ride.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash" size={24} color={COLORS.primary} />
              <Text style={styles.statLabel}>Fare</Text>
              <Text style={styles.statValue}>NPR {ride.estimatedFare}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {rideStatus !== 'completed' && (
              <TouchableOpacity
                style={[styles.primaryButton, { marginBottom: 16, borderColor: '#4A90E2', borderWidth: 1 }]}
                onPress={handleNavigate}
                disabled={isUpdating}
              >
                <LinearGradient colors={['#1e3a8a', '#1e40af']} style={styles.buttonGradient}>
                  <Text style={[styles.primaryButtonText, { color: '#fff' }]}>
                    {rideStatus === 'accepted' || rideStatus === 'arrived' ? 'Navigate to Pickup' : 'Navigate to Dropoff'}
                  </Text>
                  <Ionicons name="navigate-circle" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {rideStatus === 'accepted' && (
              <TouchableOpacity
                style={[styles.primaryButton, { marginBottom: 12 }]}
                onPress={handleArrivedAtPickup}
                disabled={isUpdating}
              >
                <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.buttonGradient}>
                  <Text style={styles.primaryButtonText}>
                    {isUpdating ? 'Updating...' : 'Arrived at Pickup'}
                  </Text>
                  {!isUpdating && <Ionicons name="location" size={20} color="#fff" />}
                </LinearGradient>
              </TouchableOpacity>
            )}

            {rideStatus === 'arrived' && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleStartRide}
                disabled={isUpdating}
              >
                <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.buttonGradient}>
                  <Text style={styles.primaryButtonText}>
                    {isUpdating ? 'Starting...' : 'Start Ride'}
                  </Text>
                  {!isUpdating && <Ionicons name="arrow-forward" size={20} color="#000" />}
                </LinearGradient>
              </TouchableOpacity>
            )}

            {rideStatus === 'started' && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleArrivedAtDropoff}
                disabled={isUpdating}
              >
                <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.buttonGradient}>
                  <Text style={styles.primaryButtonText}>Arrived at Destination</Text>
                  <Ionicons name="checkmark" size={20} color="#000" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {rideStatus === 'arriving' && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCompleteRide}
                disabled={isUpdating}
              >
                <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.buttonGradient}>
                  <Text style={styles.primaryButtonText}>
                    {isUpdating ? 'Completing...' : 'Complete Ride'}
                  </Text>
                  {!isUpdating && <Ionicons name="checkmark-done" size={20} color="#000" />}
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Cancel Ride only available before starting the ride */}
            {['accepted', 'arrived'].includes(rideStatus) && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelRide}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>Cancel Ride</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 12,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  routeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginLeft: 10,
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
});