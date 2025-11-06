// app/_layout.js - Updated Root Layout with Login Integration
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './store/store';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './config/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate preloading assets, fonts, etc.
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if user is already logged in
        const token = await AsyncStorage.getItem('userToken');
        if (token) setIsLoggedIn(true);
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) return <LoadingScreen />;

  return (
    <Provider store={store}>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade',
          animationDuration: 300,
          presentation: 'card',
        }}
      >
        {/* MAIN SCREENS */}
        <Stack.Screen name="index" options={{ title: 'Home' }} />

        {/* AUTH SCREENS */}
        {!isLoggedIn && <Stack.Screen name="login" options={{ title: 'Login', animation: 'slide_from_bottom' }} />}
        {!isLoggedIn && <Stack.Screen name="register" options={{ title: 'Register', animation: 'slide_from_bottom' }} />}

        {/* VEHICLE SCREENS */}
        <Stack.Screen name="fleet" options={{ title: 'Our Fleet', animation: 'fade' }} />
        <Stack.Screen name="fleet/[id]" options={{ title: 'Vehicle Details', animation: 'slide_from_right' }} />

        {/* BOOKING FLOW */}
        <Stack.Screen name="booking/select-location" options={{ title: 'Select Location', presentation: 'modal' }} />
        <Stack.Screen name="booking/vehicle-selection" options={{ title: 'Choose Vehicle', animation: 'slide_from_right' }} />
        <Stack.Screen name="booking/date-time" options={{ title: 'Date & Time', animation: 'slide_from_right' }} />
        <Stack.Screen name="booking/review" options={{ title: 'Review Booking', animation: 'slide_from_right' }} />
        <Stack.Screen name="booking/confirmation" options={{ title: 'Confirmation', animation: 'fade', presentation: 'modal' }} />
        <Stack.Screen name="booking/payment" options={{ title: 'Payment', presentation: 'modal' }} />

        {/* USER SCREENS */}
        <Stack.Screen name="user/dashboard" options={{ title: 'Dashboard', animation: 'fade' }} />
        <Stack.Screen name="user/bookings" options={{ title: 'My Bookings', animation: 'slide_from_right' }} />
        <Stack.Screen name="user/bookings/[id]" options={{ title: 'Booking Details', animation: 'slide_from_right' }} />
        <Stack.Screen name="user/profile" options={{ title: 'Profile', animation: 'slide_from_right' }} />
        <Stack.Screen name="user/settings" options={{ title: 'Settings', animation: 'slide_from_right' }} />

        {/* DRIVER SCREENS */}
        <Stack.Screen name="driver/dashboard" options={{ title: 'Driver Dashboard', animation: 'fade' }} />
        <Stack.Screen name="driver/active-ride" options={{ title: 'Active Ride', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="driver/ride-requests" options={{ title: 'Ride Requests', animation: 'slide_from_right' }} />
        <Stack.Screen name="driver/earnings" options={{ title: 'Earnings', animation: 'slide_from_right' }} />

        {/* ADMIN SCREENS */}
        <Stack.Screen name="admin/dashboard" options={{ title: 'Admin Dashboard', animation: 'fade' }} />
        <Stack.Screen name="admin/login" options={{ title: 'Admin Login', presentation: 'modal' }} />

        {/* SUPPORT/INFO SCREENS */}
        <Stack.Screen name="support" options={{ title: 'Support', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="about" options={{ title: 'About Us', animation: 'fade' }} />
        <Stack.Screen name="contact" options={{ title: 'Contact', animation: 'fade' }} />

        {/* LEGACY / STORIES */}
        <Stack.Screen name="stories/index" options={{ title: 'Stories' }} />
        <Stack.Screen name="stories/[id]" options={{ title: 'Story Details' }} />
      </Stack>
    </Provider>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <LinearGradient colors={['#000000', '#1A1A1A', '#000000']} style={styles.loadingGradient}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="car-sport" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.brandName}>PREPEDO NEPAL</Text>
          <Text style={styles.tagline}>Luxury Ride Sharing</Text>
        </View>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Preparing your journey...</Text>
        </View>

        <View style={styles.premiumBadge}>
          <Ionicons name="diamond" size={16} color={COLORS.primary} />
          <Text style={styles.premiumText}>PREMIUM SERVICE</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  loadingContainer: { flex: 1 },
  loadingGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 60 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(212,175,55,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: COLORS.primary },
  brandName: { fontSize: 28, fontWeight: '900', color: COLORS.primary, letterSpacing: 3, marginBottom: 8 },
  tagline: { fontSize: 13, color: COLORS.textSecondary, letterSpacing: 1 },
  loaderContainer: { alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  premiumBadge: { position: 'absolute', bottom: 60, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary },
  premiumText: { fontSize: 11, color: COLORS.primary, fontWeight: '700', letterSpacing: 1.5 },
});
