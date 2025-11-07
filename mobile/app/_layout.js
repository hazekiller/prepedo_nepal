// app/_layout.js - Root Layout for Ride Sharing App
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import COLORS from './config/colors'; // ✅ default import
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
      <PersistGate loading={null} persistor={persistor}>
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
          {/* AUTH SCREENS */}
          <Stack.Screen name="login" options={{ title: 'Login', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="register" options={{ title: 'Register', animation: 'slide_from_bottom' }} />

          {/* MAIN SCREENS */}
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen name="fleet" options={{ title: 'Our Fleet', animation: 'fade' }} />

          {/* BOOKING FLOW */}
          <Stack.Screen name="booking" options={{ headerShown: false }} />

          {/* USER SCREENS */}
          <Stack.Screen name="user" options={{ headerShown: false }} />

          {/* DRIVER SCREENS */}
          <Stack.Screen name="driver" options={{ headerShown: false }} />

          {/* ADMIN SCREENS */}
          <Stack.Screen name="admin-dashboard" options={{ title: 'Admin Dashboard', animation: 'fade' }} />

          {/* SUPPORT/INFO SCREENS */}
          <Stack.Screen name="support" options={{ title: 'Support', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="contact" options={{ title: 'Contact', animation: 'fade' }} />
        </Stack>
      </PersistGate>
    </Provider>
  );
}

// ========================
// Loading Screen Component
// ========================
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary, COLORS.background]}
        style={styles.loadingGradient}
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

// ========================
// Styles
// ========================
const styles = StyleSheet.create({
  loadingContainer: { flex: 1 },
  loadingGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 60 },
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
  brandName: { fontSize: 28, fontWeight: '900', color: COLORS.primary, letterSpacing: 3, marginBottom: 8 },
  tagline: { fontSize: 13, color: COLORS.textSecondary, letterSpacing: 1 },
  loaderContainer: { alignItems: 'center', marginVertical: 16 },
  loadingText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  premiumBadge: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  premiumText: { fontSize: 11, color: COLORS.primary, fontWeight: '700', letterSpacing: 1.5, marginLeft: 6 },
});
