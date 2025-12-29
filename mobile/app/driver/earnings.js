// app/driver/earnings.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform
} from "react-native";
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import COLORS from '../config/colors';
import { API_BASE_URL } from '../config/api';

export default function EarningsScreen() {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('all'); // today, week, month, all
  const [data, setData] = useState({
    summary: null,
    total_lifetime_earnings: 0,
    recent_earnings: []
  });

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/api/drivers/earnings?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  const PeriodTab = ({ id, label }) => (
    <TouchableOpacity
      style={[styles.tab, period === id && styles.tabActive]}
      onPress={() => {
        setLoading(true);
        setPeriod(id);
      }}
    >
      <Text style={[styles.tabText, period === id && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.headerGradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Earnings</Text>
          <TouchableOpacity style={styles.walletIcon}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Total Earnings Card */}
        <View style={styles.mainEarningCard}>
          <LinearGradient
            colors={[COLORS.primary, '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardGradient}
          >
            <View>
              <Text style={styles.lifetimeLabel}>Net Earnings</Text>
              <Text style={styles.lifetimeAmount}>
                NPR {period === 'all' ? (data.total_lifetime_earnings || 0).toLocaleString() : (data.summary?.total_earnings || 0).toLocaleString()}
              </Text>
              <Text style={styles.bookingCount}>
                {data.summary?.total_bookings || 0} Total Rides
              </Text>
            </View>
            <View style={styles.iconCircle}>
              <Ionicons name="trending-up" size={32} color="#000" />
            </View>
          </LinearGradient>
        </View>

        {/* Period Filter Tabs */}
        <View style={styles.tabsContainer}>
          <PeriodTab id="today" label="Today" />
          <PeriodTab id="week" label="Week" />
          <PeriodTab id="month" label="Month" />
          <PeriodTab id="all" label="All" />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Revenue</Text>
            <Text style={styles.statValue}>NPR {data.summary?.total_amount || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: COLORS.error }]}>Commission</Text>
            <Text style={styles.statValue}>-Rs. {data.summary?.total_commission || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: COLORS.success }]}>Your Share</Text>
            <Text style={styles.statValue}>NPR {data.summary?.total_earnings || 0}</Text>
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Recent Transactions</Text>
          <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
        </View>

        {data.recent_earnings && data.recent_earnings.length > 0 ? (
          data.recent_earnings.map((item, index) => (
            <View key={item.id} style={styles.transactionCard}>
              <View style={styles.txIcon}>
                <Ionicons name="car" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle} numberOfLines={1}>{item.dropoff_location}</Text>
                <Text style={styles.txSub}>
                  {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {item.booking_number}
                </Text>
              </View>
              <View style={styles.txAmountContainer}>
                <Text style={styles.txAmount}>+ {item.net_earning}</Text>
                <Text style={styles.txGross}>Gross: {item.amount}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No earnings found for this period</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: COLORS.text, letterSpacing: 0.5 },
  walletIcon: { backgroundColor: 'rgba(212, 175, 55, 0.15)', padding: 10, borderRadius: 12 },
  mainEarningCard: { paddingHorizontal: 20, marginBottom: 20 },
  cardGradient: {
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lifetimeLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(0,0,0,0.6)', textTransform: 'uppercase' },
  lifetimeAmount: { fontSize: 32, fontWeight: '900', color: '#000', marginVertical: 4 },
  bookingCount: { fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.5)' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '700' },
  tabTextActive: { color: '#000' },
  scroll: { flex: 1 },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  statBox: {
    width: '31%',
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center'
  },
  statLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  historyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  txSub: { fontSize: 12, color: COLORS.textSecondary },
  txAmountContainer: { alignItems: 'flex-end' },
  txAmount: { fontSize: 16, fontWeight: '900', color: COLORS.success },
  txGross: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, marginTop: 12 },
});
