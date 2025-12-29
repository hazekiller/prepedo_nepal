// app/index.js
// Landing/Redirect Screen - Routes to User or Driver mode
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import COLORS from './config/colors';
import authService from './services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const { currentMode } = useSelector((state) => state.mode);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    checkAuthAndRedirect();
  }, [user]);

  const checkAuthAndRedirect = async () => {
    try {
      // Check if user is authenticated from storage or state
      const token = await AsyncStorage.getItem('token');

      if (!token && !user) {
        router.replace('/login');
        return;
      }

      // If we have a user role, use it to verify mode
      const role = user?.role || (await AsyncStorage.getItem('user').then(u => u ? JSON.parse(u).role : null));

      if (currentMode === 'driver' || role === 'driver') {
        router.replace('/driver/dashboard');
      } else if (role === 'admin') {
        router.replace('/admin-dashboard');
      } else {
        router.replace('/user/home');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1A1A1A', '#000000']}
        style={styles.gradient}
      >
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="car-sport" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.brandName}>PREPEDO NEPAL</Text>
          <Text style={styles.tagline}>Luxury Ride Sharing</Text>
        </View>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isLoading ? 'Loading...' : 'Redirecting...'}
          </Text>
        </View>

        <View style={styles.premiumBadge}>
          <Ionicons name="diamond" size={16} color={COLORS.primary} />
          <Text style={styles.premiumText}>PREMIUM SERVICE</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  loaderContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  premiumText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});