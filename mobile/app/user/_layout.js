// app/(user)/_layout.js
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/colors';
import useRealTimeBookings from '../hooks/useRealTimeBookings';

export default function UserTabsLayout() {
  // Activate global background listener for ride updates
  useRealTimeBookings('user');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* My Bookings Tab */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Rides',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* Center Book Button */}
      <Tabs.Screen
        name="book"
        options={{
          title: 'Book',
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerButton}>
              <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.centerGradient}>
                <Ionicons name="add" size={32} color="#000" />
              </LinearGradient>
            </View>
          ),
          tabBarLabelStyle: {
            color: COLORS.primary,
            fontWeight: '900',
            fontSize: 10,
            marginBottom: -2,
          }
        }}
      />

      {/* Fleet Tab */}
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'Fleet',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={focused ? 'car' : 'car-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen
        name="settings"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="active-ride"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    height: Platform.OS === 'ios' ? 90 : 70,
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: Platform.OS === 'ios' ? 0 : 10,
  },
  tabBarItem: {
    height: 70,
    paddingTop: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  centerButton: {
    position: 'absolute',
    top: -20,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#000', // Matches background to create the "notch" look
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
});
