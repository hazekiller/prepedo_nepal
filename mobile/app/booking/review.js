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
import  COLORS  from '../config/colors';
import socketService from '../services/socketService';

export default function ReviewBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, token } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);

  const {
    pickupLocation,
    dropoffLocation,
    passengers,
    vehicleId,
    vehicleName,
    vehiclePrice,
    bookingType,
    scheduledDateTime,
  } = params;

  // Calculate estimated price (simple calculation, can be improved)
  const estimatedDistance = 10; // km - you can calculate this based on coordinates
  const baseFare = parseFloat(vehiclePrice) || 500;
  const perKmRate = 50;
  const estimatedPrice = baseFare + (estimatedDistance * perKmRate);
  const tax = estimatedPrice * 0.13; // 13% tax
  const totalPrice = estimatedPrice + tax;

  const handleConfirmBooking = async () => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in to book a ride');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        userId: user.id,
        userName: user.full_name,
        userEmail: user.email,
        pickupLocation,
        dropoffLocation,
        passengers: parseInt(passengers),
        vehicleId: parseInt(vehicleId),
        vehicleName,
        bookingType,
        scheduledDateTime: scheduledDateTime || null,
        estimatedPrice: totalPrice.toFixed(2),
        status: 'pending',
        timestamp: new Date().toISOString(),
      };

      // Emit booking via socket
      if (socketService.socket) {
        socketService.socket.emit('booking:create', bookingData, (response) => {
          if (response.success) {
            router.push({
              pathname: '/booking/confirmation',
              params: {
                bookingId: response.bookingId,
                ...bookingData,
              },
            });
          } else {
            Alert.alert('Error', response.message || 'Failed to create booking');
            setLoading(false);
          }
        });
      } else {
        Alert.alert('Error', 'Unable to connect to server');
        setLoading(false);
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
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
        </View>

        <View style={styles.content}>
          {/* Route Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Route Details</Text>
            <View style={styles.card}>
              <View style={styles.routeItem}>
                <View style={styles.locationDot} style={{backgroundColor: COLORS.primary}} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Pickup</Text>
                  <Text style={styles.locationText}>{pickupLocation}</Text>
                </View>
              </View>
              
              <View style={styles.routeLine} />
              
              <View style={styles.routeItem}>
                <View style={[styles.locationDot, {backgroundColor: '#FF6B6B'}]} />
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
            <Text style={styles.sectionTitle}>Price Breakdown</Text>
            <View style={styles.card}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Base Fare</Text>
                <Text style={styles.priceValue}>NPR {baseFare.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Distance ({estimatedDistance} km)</Text>
                <Text style={styles.priceValue}>NPR {(estimatedDistance * perKmRate).toFixed(2)}</Text>
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