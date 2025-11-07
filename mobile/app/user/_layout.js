// app/(user)/_layout.js
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../config/colors';

export default function UserTabsLayout() {
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
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* My Bookings Tab */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'My Rides',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* Quick Book Center Tab */}
      <Tabs.Screen
        name="book"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerButton}>
              <Ionicons name="add" size={32} color="#000" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* Fleet Tab */}
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'Fleet',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={focused ? 'car' : 'car-outline'} size={24} color={color} />
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
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            </View>
          ),
        }}
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
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: COLORS.background,
  },
});
