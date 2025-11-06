// app/components/rides/RideCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/colors';
import bookingService from '../../services/bookingService';

export default function RideCard({ ride, onPress, showStatus = true }) {
  if (!ride) return null;

  const {
    id,
    vehicle,
    driver,
    pickupLocation,
    dropoffLocation,
    pickupDatetime,
    status,
    fare,
    rating,
  } = ride;

  const statusColor = bookingService.getBookingStatusColor(status);
  const statusLabel = bookingService.getBookingStatusLabel(status);
  const isActive = ['confirmed', 'assigned', 'in_progress'].includes(status);
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isActive && styles.cardActive,
        isCancelled && styles.cardCancelled,
      ]}
      onPress={() => onPress?.(ride)}
      activeOpacity={0.8}
    >
      {/* Status Indicator */}
      {isActive && (
        <View style={styles.activeIndicator}>
          <View style={styles.pulseOuter}>
            <View style={styles.pulseInner} />
          </View>
          <Text style={styles.activeText}>LIVE</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Vehicle & Driver Info */}
        <View style={styles.header}>
          <View style={styles.vehicleInfo}>
            {vehicle?.image && (
              <Image 
                source={{ uri: vehicle.image }} 
                style={styles.vehicleImage} 
              />
            )}
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleName} numberOfLines={1}>
                {vehicle?.name || 'Vehicle'}
              </Text>
              {driver && (
                <View style={styles.driverRow}>
                  <Ionicons name="person" size={12} color={COLORS.textSecondary} />
                  <Text style={styles.driverName} numberOfLines={1}>
                    {driver.name}
                  </Text>
                  {driver.rating && (
                    <>
                      <Ionicons name="star" size={10} color={COLORS.primary} />
                      <Text style={styles.driverRating}>{driver.rating}</Text>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Status Badge */}
          {showStatus && (
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          )}
        </View>

        {/* Route */}
        <View style={styles.routeContainer}>
          {/* Pickup */}
          <View style={styles.locationRow}>
            <View style={styles.locationIcon}>
              <View style={styles.pickupDot} />
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {pickupLocation}
              </Text>
            </View>
          </View>

          {/* Route Line */}
          <View style={styles.routeLine} />

          {/* Dropoff */}
          <View style={styles.locationRow}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Dropoff</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {dropoffLocation}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Date/Time */}
          <View style={styles.dateTimeContainer}>
            <Ionicons name="calendar" size={14} color={COLORS.textSecondary} />
            <Text style={styles.dateTimeText}>
              {formatDateTime(pickupDatetime)}
            </Text>
          </View>

          {/* Fare or Rating */}
          <View style={styles.rightInfo}>
            {isCompleted && rating ? (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={COLORS.primary} />
                <Text style={styles.ratingText}>{rating}/5</Text>
              </View>
            ) : (
              <View style={styles.fareContainer}>
                <Text style={styles.fareLabel}>Fare</Text>
                <Text style={styles.fareAmount}>NPR {fare?.toLocaleString() || '---'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Active Ride Actions */}
        {isActive && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call" size={16} color={COLORS.primary} />
              <Text style={styles.actionText}>Call Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="navigate" size={16} color={COLORS.primary} />
              <Text style={styles.actionText}>Track Ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Completed - Rate Prompt */}
        {isCompleted && !rating && (
          <TouchableOpacity style={styles.ratePrompt}>
            <Ionicons name="star-outline" size={16} color={COLORS.primary} />
            <Text style={styles.ratePromptText}>Rate this ride</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Shine effect for active rides */}
      {isActive && (
        <LinearGradient
          colors={['transparent', 'rgba(212,175,55,0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shineEffect}
        />
      )}
    </TouchableOpacity>
  );
}

// Helper function
const formatDateTime = (datetime) => {
  if (!datetime) return 'Not set';
  const date = new Date(datetime);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${timeStr}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${timeStr}`;
  }
  return `${dateStr}, ${timeStr}`;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  cardCancelled: {
    opacity: 0.6,
  },
  activeIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  pulseOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(212,175,55,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vehicleInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  vehicleDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  driverRating: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  routeContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationIcon: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginLeft: 11,
    marginVertical: 4,
  },
  locationDetails: {
    flex: 1,
    paddingVertical: 2,
  },
  locationLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  fareAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ratePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  ratePromptText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});