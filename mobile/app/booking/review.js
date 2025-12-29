// app/booking/review.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../config/colors';
import socketService from '../services/socketService';
import MapComponent from '../components/shared/MapComponent';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

export default function ReviewBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, token } = useSelector((state) => state.auth); // Use auth slice

  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [fetchingFare, setFetchingFare] = useState(true);

  const {
    pickupLocation,
    pickupLatitude,
    pickupLongitude,
    dropoffLocation,
    dropoffLatitude,
    dropoffLongitude,
    passengers,
    vehicleId,
    vehicleName,
    vehiclePrice,
    bookingType,
    scheduledDateTime,
    distance = 10, // Default distance if not passed
    vehicleType = 'car' // Default type
  } = params;

  React.useEffect(() => {
    fetchFareEstimate();
  }, []);

  const fetchFareEstimate = async () => {
    try {
      setFetchingFare(true);
      const response = await axios.post(`${API_BASE_URL}/api/bookings/calculate-fare`, {
        distance: parseFloat(distance),
        vehicle_type: vehicleType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const fare = response.data.data.fare;
        const calculatedTax = fare * 0.13;
        setEstimatedPrice(fare);
        setTax(calculatedTax);
        setTotalPrice(fare + calculatedTax);
      }
    } catch (error) {
      console.error('Error fetching fare estimate:', error);
      // Fallback logic
      const base = parseFloat(vehiclePrice) || 150;
      const rate = 35;
      const fare = base + (parseFloat(distance) * rate);
      const calculatedTax = fare * 0.13;
      setEstimatedPrice(fare);
      setTax(calculatedTax);
      setTotalPrice(fare + calculatedTax);
    } finally {
      setFetchingFare(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in to book a ride');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/bookings`, {
        pickup_location: pickupLocation,
        pickup_latitude: parseFloat(pickupLatitude) || 27.6915,
        pickup_longitude: parseFloat(pickupLongitude) || 85.3420,
        dropoff_location: dropoffLocation,
        dropoff_latitude: parseFloat(dropoffLatitude) || 27.7027,
        dropoff_longitude: parseFloat(dropoffLongitude) || 85.3123,
        vehicle_type: vehicleType,
        distance: parseFloat(distance),
        notes: `Ride for ${passengers} passengers`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        router.push({
          pathname: '/booking/confirmation',
          params: {
            bookingId: response.data.data.id,
            ...response.data.data
          },
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Review Your Booking</Text>
          <Text style={styles.subtitle}>Please confirm all details before proceeding</Text>
          <View style={{ marginTop: 20 }}>
            <MapComponent
              height={180}
              pickup={{
                latitude: parseFloat(pickupLatitude),
                longitude: parseFloat(pickupLongitude)
              }}
              dropoff={{
                latitude: parseFloat(dropoffLatitude),
                longitude: parseFloat(dropoffLongitude)
              }}
            />
          </View>
        </View>

        {fetchingFare ? (
          <View style={styles.loadingFare}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingFareText}>Calculating KTM Valley Fare...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Route Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Route Details</Text>
              <View style={styles.card}>
                <View style={styles.routeItem}>
                  <View style={[styles.locationDot, { backgroundColor: COLORS.primary }]} />
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationLabel}>Pickup</Text>
                    <Text style={styles.locationText}>{pickupLocation}</Text>
                  </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.routeItem}>
                  <View style={[styles.locationDot, { backgroundColor: '#FF6B6B' }]} />
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationLabel}>Drop-off</Text>
                    <Text style={styles.locationText}>{dropoffLocation}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Vehicle Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicle</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Ionicons name="car" size={20} color={COLORS.primary} />
                  <Text style={styles.infoText}>{vehicleName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="people" size={20} color={COLORS.primary} />
                  <Text style={styles.infoText}>{passengers} passenger(s)</Text>
                </View>
              </View>
            </View>

            {/* Timing Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timing</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Ionicons name={bookingType === 'now' ? 'flash' : 'calendar'} size={20} color={COLORS.primary} />
                  <Text style={styles.infoText}>
                    {bookingType === 'now' ? 'Pick up now' : `Scheduled: ${formatDateTime(scheduledDateTime)}`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Price Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Breakdown (KTM Valley Rate)</Text>
              <View style={styles.card}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Estimated Fare</Text>
                  <Text style={styles.priceValue}>NPR {estimatedPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Tax (13%)</Text>
                  <Text style={styles.priceValue}>NPR {tax.toFixed(2)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>NPR {totalPrice.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.termsText}>
                By confirming this booking, you agree to our terms and conditions
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#555', '#666'] : [COLORS.primary, '#FFD700']}
            style={styles.confirmGradient}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Text style={styles.confirmText}>Confirm Booking</Text>
                <Ionicons name="checkmark-circle" size={24} color="#000" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingFare: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  loadingFareText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginLeft: 5,
    marginVertical: 8,
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  confirmText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginRight: 8,
  },
});