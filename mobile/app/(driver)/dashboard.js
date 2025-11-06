// app/(driver)/dashboard.js
// Driver Dashboard - Main screen for drivers
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setDriverStatus } from '../store/slices/modeSlice';
import { COLORS } from '../config/colors';

export default function DriverDashboardScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useSelector((state) => state.user);
  const { driverStatus, driverProfile } = useSelector((state) => state.mode);
  const isOnline = driverStatus === 'online';

  // Mock data (replace with actual Redux data)
  const [todayEarnings, setTodayEarnings] = useState(3200);
  const [weeklyEarnings, setWeeklyEarnings] = useState(18500);
  const [monthlyEarnings, setMonthlyEarnings] = useState(67400);
  const [totalRides, setTotalRides] = useState(234);
  const [todayRides, setTodayRides] = useState(5);
  const [rating, setRating] = useState(4.9);

  const [rideRequests] = useState([
    {
      id: '1',
      passenger: 'Ram Bahadur Thapa',
      rating: 4.8,
      pickup: 'Tribhuvan International Airport',
      dropoff: 'Thamel, Kathmandu',
      distance: '5.2 km',
      estimatedFare: 450,
      pickupTime: '5 min',
    },
    {
      id: '2',
      passenger: 'Sita Gurung',
      rating: 4.9,
      pickup: 'Durbar Marg',
      dropoff: 'Boudhanath Stupa',
      distance: '8.1 km',
      estimatedFare: 680,
      pickupTime: '12 min',
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load driver stats, earnings, requests
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleOnlineStatus = () => {
    const newStatus = isOnline ? 'offline' : 'online';
    dispatch(setDriverStatus(newStatus));
  };

  const handleAcceptRequest = (requestId) => {
    // Accept ride request
    router.push(`/driver/active-ride?id=${requestId}`);
  };

  const handleDeclineRequest = (requestId) => {
    // Decline ride request
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#1A1A1A', COLORS.background]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Driver Dashboard</Text>
              <Text style={styles.subGreeting}>{user?.name || 'Driver'}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(driver)/profile')}
            >
              <Ionicons name="person-circle" size={48} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Online/Offline Toggle */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Ionicons
                name={isOnline ? 'checkmark-circle' : 'close-circle'}
                size={32}
                color={isOnline ? '#10B981' : '#6B7280'}
              />
              <View style={styles.statusText}>
                <Text style={styles.statusTitle}>
                  {isOnline ? 'You\'re Online' : 'You\'re Offline'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {isOnline ? 'Ready to accept rides' : 'Not accepting rides'}
                </Text>
              </View>
            </View>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: '#6B7280', true: '#10B981' }}
              thumbColor={isOnline ? '#FFF' : '#F3F4F6'}
              ios_backgroundColor="#6B7280"
            />
          </View>

          {!isOnline && (
            <View style={styles.offlineWarning}>
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text style={styles.offlineWarningText}>
                Go online to start receiving ride requests
              </Text>
            </View>
          )}
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <LinearGradient
            colors={['#D4AF37', '#FFD700']}
            style={styles.earningsGradient}
          >
            <Text style={styles.earningsLabel}>Today's Earnings</Text>
            <Text style={styles.earningsAmount}>NPR {todayEarnings.toLocaleString()}</Text>
            <View style={styles.earningsStats}>
              <View style={styles.earningStat}>
                <Text style={styles.earningStatLabel}>This Week</Text>
                <Text style={styles.earningStatValue}>NPR {weeklyEarnings.toLocaleString()}</Text>
              </View>
              <View style={styles.earningStat}>
                <Text style={styles.earningStatLabel}>This Month</Text>
                <Text style={styles.earningStatValue}>NPR {monthlyEarnings.toLocaleString()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Ride Requests */}
        {isOnline && rideRequests.length > 0 && (
          <View style={styles.requestsSection}>
            <Text style={styles.sectionTitle}>Ride Requests ({rideRequests.length})</Text>
            {rideRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                {/* Passenger Info */}
                <View style={styles.requestHeader}>
                  <View style={styles.passengerInfo}>
                    <Ionicons name="person-circle" size={48} color={COLORS.primary} />
                    <View style={styles.passengerDetails}>
                      <Text style={styles.passengerName}>{request.passenger}</Text>
                      <View style={styles.passengerRating}>
                        <Ionicons name="star" size={14} color={COLORS.primary} />
                        <Text style={styles.passengerRatingText}>{request.rating}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.pickupTime}>
                    <Ionicons name="time" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.pickupTimeText}>{request.pickupTime}</Text>
                  </View>
                </View>

                {/* Trip Details */}
                <View style={styles.tripDetails}>
                  <View style={styles.locationRow}>
                    <View style={styles.locationDot} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {request.pickup}
                    </Text>
                  </View>
                  <View style={styles.locationLine} />
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={18} color={COLORS.error} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {request.dropoff}
                    </Text>
                  </View>
                </View>

                {/* Trip Info */}
                <View style={styles.tripInfo}>
                  <View style={styles.tripInfoItem}>
                    <Ionicons name="car" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.tripInfoText}>{request.distance}</Text>
                  </View>
                  <View style={styles.tripInfoItem}>
                    <Ionicons name="cash" size={16} color={COLORS.primary} />
                    <Text style={styles.tripInfoValue}>NPR {request.estimatedFare}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleDeclineRequest(request.id)}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <LinearGradient
                      colors={['#D4AF37', '#FFD700']}
                      style={styles.acceptButtonGradient}
                    >
                      <Text style={styles.acceptButtonText}>Accept Ride</Text>
                      <Ionicons name="arrow-forward" size={18} color="#000" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Performance Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="star" size={32} color={COLORS.primary} />
              <Text style={styles.statValue}>{rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="car-sport" size={32} color="#3B82F6" />
              <Text style={styles.statValue}>{todayRides}</Text>
              <Text style={styles.statLabel}>Today's Rides</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-done" size={32} color="#10B981" />
              <Text style={styles.statValue}>{totalRides}</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/(driver)/earnings')}
            >
              <Ionicons name="cash" size={32} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/driver/history')}
            >
              <Ionicons name="time" size={32} color="#3B82F6" />
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/driver/vehicle')}
            >
              <Ionicons name="car" size={32} color="#10B981" />
              <Text style={styles.quickActionText}>Vehicle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/(driver)/profile')}
            >
              <Ionicons name="settings" size={32} color="#8B5CF6" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  profileButton: {
    width: 48,
    height: 48,
  },
  statusCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 8,
  },
  offlineWarningText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
    flex: 1,
  },
  earningsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  earningsGradient: {
    padding: 24,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  earningsStats: {
    flexDirection: 'row',
    gap: 24,
  },
  earningStat: {},
  earningStatLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  earningStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  requestsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  passengerDetails: {
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },
  passengerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerRatingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pickupTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pickupTimeText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tripDetails: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 16,
  },
  tripInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripInfoText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tripInfoValue: {
    marginLeft: 6,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '900',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.error,
  },
  acceptButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    marginRight: 6,
  },
  statsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '900',
  },
  bottomSpacing: {
    height: 100,
  },
});