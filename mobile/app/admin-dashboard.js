// app/admin-dashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { COLORS } from './config/colors';
import { API_ENDPOINTS } from './config/api';

// Import your modular components
import Header from './components/admin/Header';
import StatsGrid from './components/admin/StatsGrid';
import QuickActions from './components/admin/QuickActions';
import RecentStoriesList from './components/admin/RecentStoriesList';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('userData');

      if (!token) {
        router.replace('/admin-login');
        return;
      }

      if (user) {
        setUserData(JSON.parse(user));
      }

      fetchDashboard();
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/admin-login');
    }
  };

  const fetchDashboard = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/admin-login');
        return;
      }

      const response = await fetch(API_ENDPOINTS.dashboard, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        await AsyncStorage.multiRemove(['authToken', 'userData']);
        router.replace('/admin-login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['authToken', 'userData']);
              router.replace('/admin-login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (error && !dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboard}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButtonError} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header userData={userData} onLogout={handleLogout} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️ {error}</Text>
          </View>
        )}

        <StatsGrid overview={dashboardData?.overview} />
        <QuickActions router={router} />
        
        {dashboardData?.recentStories && dashboardData.recentStories.length > 0 && (
          <RecentStoriesList stories={dashboardData.recentStories} router={router} />
        )}

        {dashboardData && (!dashboardData.recentStories || dashboardData.recentStories.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent stories yet</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/admin/stories/create')}
            >
              <Text style={styles.createButtonText}>Create Your First Story</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerSection}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.backLink}>← Back to Website</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.background 
  },
  loadingText: { 
    marginTop: 15, 
    fontSize: 16, 
    color: COLORS.textSecondary 
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonError: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: { 
    flex: 1 
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSection: { 
    padding: 20, 
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backLink: { 
    fontSize: 14, 
    color: COLORS.primary, 
    fontWeight: '600' 
  },
});