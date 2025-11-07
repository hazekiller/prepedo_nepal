// app/booking/confirmation.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import COLORS  from '../config/colors';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scaleAnim = new Animated.Value(0);

  const {
    bookingId,
    pickupLocation,
    dropoffLocation,
    vehicleName,
    bookingType,
    scheduledDateTime,
  } = params;

  useEffect(() => {
    // Animate check mark
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

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
      <LinearGradient
        colors={['#000000', '#1A1A1A', '#000000']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Success Animation */}
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={120} color={COLORS.primary} />
            </View>
          </Animated.View>

          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            {bookingType === 'now' 
              ? 'Your ride has been requested. A driver will accept your booking shortly.'
              : 'Your ride has been scheduled successfully.'}
          </Text>

          {/* Booking Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>#{bookingId || 'PENDING'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Pickup</Text>
                <Text style={styles.detailValue}>{pickupLocation}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="flag" size={20} color="#FF6B6B" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Drop-off</Text>
                <Text style={styles.detailValue}>{dropoffLocation}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="car" size={20} color={COLORS.primary} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Vehicle</Text>
                <Text style={styles.detailValue}>{vehicleName}</Text>
              </View>
            </View>

            {bookingType === 'scheduled' && scheduledDateTime && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Scheduled</Text>
                  <Text style={styles.detailValue}>{formatDateTime(scheduledDateTime)}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {bookingType === 'now'
                ? 'You will receive a notification once a driver accepts your booking.'
                : 'You will receive a reminder before your scheduled pickup time.'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/user/bookings')}
          >
            <LinearGradient
              colors={[COLORS.primary, '#FFD700']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>View My Bookings</Text>
              <Ionicons name="list" size={20} color="#000" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/user/home')}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  successCircle: {
    marginBottom: 32,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});