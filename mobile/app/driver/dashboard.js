import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import COLORS from '../config/colors';
import { API_BASE_URL } from '../config/api';
import socketService from '../services/socketService';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    if (socketService.socket) {
      socketService.socket.on('booking:new', (data) => {
        // Just refresh if a new booking arrives to update stats (or show alert)
        fetchDashboardData();
      });
      socketService.socket.on('booking:statusUpdated', (data) => {
        fetchDashboardData();
      });
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('booking:new');
        socketService.socket.off('booking:statusUpdated');
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!token) return;

      const [statsRes, ridesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/drivers/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/bookings/driver/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (ridesRes.data.success) {
        setRecentRides(ridesRes.data.data.bookings.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching driver dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: stats?.overall?.is_online ? '#4CAF5020' : '#FF6B6B20' }]}>
          <Text style={[styles.statusText, { color: stats?.overall?.is_online ? '#4CAF50' : '#FF6B6B' }]}>
            {stats?.overall?.is_online ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      {/* Main Stats */}
      <View style={styles.mainStats}>
        <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.mainStatsGradient}>
          <View style={styles.mainStatItem}>
            <Text style={styles.mainStatLabel}>Today's Earnings</Text>
            <Text style={styles.mainStatValue}>NPR {stats?.today?.earnings_today || 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.mainStatItem}>
            <Text style={styles.mainStatLabel}>Today's Rides</Text>
            <Text style={styles.mainStatValue}>{stats?.today?.rides_today || 0}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{stats?.overall?.rating || '5.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="car" size={24} color="#4A90E2" />
          <Text style={styles.statValue}>{stats?.overall?.total_rides || 0}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>NPR {stats?.overall?.total_earnings || 0}</Text>
          <Text style={styles.statLabel}>Lifetime</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/driver/earnings')}>
            <Text style={styles.viewAll}>View Earnings</Text>
          </TouchableOpacity>
        </View>

        {recentRides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No recent rides found</Text>
          </View>
        ) : (
          recentRides.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              style={styles.activityCard}
              onPress={() => router.push(`/driver/active-ride?rideId=${ride.id}`)}
            >
              <View style={styles.activityIcon}>
                <Ionicons
                  name={ride.status === 'completed' ? "checkmark-circle" : "time"}
                  size={20}
                  color={ride.status === 'completed' ? "#4CAF50" : COLORS.warning}
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={1}>{ride.dropoff_location}</Text>
                <Text style={styles.activityTime}>{new Date(ride.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Text style={styles.activityAmount}>+NPR {ride.estimated_fare}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 16, color: COLORS.textSecondary },
  userName: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: '800' },
  mainStats: { paddingHorizontal: 20, marginBottom: 24 },
  mainStatsGradient: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainStatItem: { flex: 1, alignItems: 'center' },
  mainStatLabel: { fontSize: 13, color: 'rgba(0,0,0,0.6)', fontWeight: '600' },
  mainStatValue: { fontSize: 22, fontWeight: '900', color: '#000', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(0,0,0,0.1)' },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: COLORS.cardBackground,
    width: '31%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginTop: 8 },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  viewAll: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  activityCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  activityTime: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  activityAmount: { fontSize: 14, fontWeight: '800', color: COLORS.success },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textMuted, marginTop: 12 },
});
