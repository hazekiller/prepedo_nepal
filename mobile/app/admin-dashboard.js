// app/admin-dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import COLORS from './config/colors'; // ✅ default import
import { API_ENDPOINTS } from './config/api';

// Only import Header
import Header from './components/admin/Header';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
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

      if (user) setUserData(JSON.parse(user));
      setLoading(false);
    } catch (err) {
      console.error('Auth check error:', err);
      router.replace('/admin-login');
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
            } catch (err) {
              console.error('Logout error:', err);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkAuth();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
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
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Welcome to your Admin Dashboard</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.backButtonText}>← Back to Website</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: 15, fontSize: 16, color: COLORS.textSecondary },
  scrollView: { flex: 1 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { fontSize: 18, color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  backButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
