// app/user/dashboard.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { COLORS } from '../config/colors';
import { API_BASE_URL } from '../config/api';

export default function UserDashboard() {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const bookings = response.data.data.bookings;
        setRecentBookings(bookings.slice(0, 3));

        const stats = {
          totalBookings: bookings.length,
          activeBookings: bookings.filter(b => ['pending', 'accepted', 'started', 'arrived'].includes(b.status)).length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          totalSpent: bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + parseFloat(b.estimated_fare || 0), 0),
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.full_name || 'Guest'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/user/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/user/book')}>
            <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.quickActionGradient}>
              <Ionicons name="add-circle" size={32} color="#000" />
              <Text style={styles.quickActionText}>Book Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={28} color={COLORS.primary} />
            <Text style={styles.statValue}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time" size={28} color="#FF6B6B" />
            <Text style={styles.statValue}>{stats.activeBookings}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.completedBookings}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="wallet" size={28} color={COLORS.primary} />
            <Text style={styles.statValue}>NPR {stats.totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => router.push('/user/bookings')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No bookings yet</Text>
              <TouchableOpacity style={styles.bookNowButton} onPress={() => router.push('/user/book')}>
                <Text style={styles.bookNowText}>Book Your First Ride</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onPress={() => router.push(`/user/active-ride?id=${booking.id}`)} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function BookingCard({ booking, onPress }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'accepted':
        return '#2196F3';
      case 'in_progress':
        return '#9C27B0';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return COLORS.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'accepted':
        return 'checkmark-circle-outline';
      case 'in_progress':
        return 'car-outline';
      case 'completed':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.bookingCard} onPress={onPress}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>#{booking.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}20` }]}>
          <Ionicons name={getStatusIcon(booking.status)} size={14} color={getStatusColor(booking.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingRoute}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {booking.pickup_location}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="flag" size={16} color="#FF6B6B" />
          <Text style={styles.locationText} numberOfLines={1}>
            {booking.dropoff_location}
          </Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.bookingPrice}>NPR {booking.estimated_fare || '0.00'}</Text>
        <Text style={styles.bookingDate}>
          {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  quickActionText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginRight: '2%',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 20,
  },
  bookNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  bookingCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  bookingRoute: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  bookingDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});