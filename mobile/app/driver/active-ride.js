// app/driver/active-ride.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import COLORS  from '../config/colors';
import socketService from '../services/socketService';

export default function ActiveRideScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rideStatus, setRideStatus] = useState('accepted'); // accepted, started, arriving, completed

  useEffect(() => {
    // Get ride data from params or fetch from server
    if (params.rideId) {
      fetchRideDetails(params.rideId);
    }

    // Listen for ride updates via socket
    if (socketService.socket) {
      socketService.socket.on('ride:update', handleRideUpdate);
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('ride:update', handleRideUpdate);
      }
    };
  }, [params.rideId]);

  const fetchRideDetails = async (rideId) => {
    try {
      // Fetch ride details from API
      // const response = await fetch(`${API_URL}/api/rides/${rideId}`);
      // const data = await response.json();
      
      // For now, use mock data
      const mockRide = {
        id: rideId,
        passengerName: 'John Doe',
        passengerPhone: '+977 9812345678',
        pickupLocation: 'Thamel, Kathmandu',
        dropoffLocation: 'Durbar Square, Patan',
        estimatedFare: 500,
        distance: '8.5 km',
        duration: '25 min',
        status: 'accepted',
      };
      
      setRide(mockRide);
      setRideStatus(mockRide.status);
    } catch (error) {
      console.error('Error fetching ride:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleRideUpdate = (data) => {
    if (data.rideId === params.rideId) {
      setRideStatus(data.status);
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
          onPress: () => {
            setRideStatus('started');
            if (socketService.socket) {
              socketService.socket.emit('ride:start', { rideId: params.rideId });
            }
          },
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
          onPress: () => {
            setRideStatus('completed');
            if (socketService.socket) {
              socketService.socket.emit('ride:complete', {
                rideId: params.rideId,
                fare: ride?.estimatedFare,
              });
            }
            
            setTimeout(() => {
              router.back();
            }, 2000);
          },
        },
      ]
    );
  };

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            if (socketService.socket) {
              socketService.socket.emit('ride:cancel', { rideId: params.rideId });
            }
            router.back();
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
          {rideStatus === 'accepted' && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartRide}>
              <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.buttonGradient}>
                <Text style={styles.primaryButtonText}>Start Ride</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {rideStatus === 'started' && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleArrivedAtDropoff}>
              <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.buttonGradient}>
                <Text style={styles.primaryButtonText}>Arrived at Destination</Text>
                <Ionicons name="checkmark" size={20} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {rideStatus === 'arriving' && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleCompleteRide}>
              <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.buttonGradient}>
                <Text style={styles.primaryButtonText}>Complete Ride</Text>
                <Ionicons name="checkmark-done" size={20} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {rideStatus !== 'completed' && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRide}>
              <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            </TouchableOpacity>
          )}
        </View>
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