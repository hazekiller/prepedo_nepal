// app/booking/_layout.js
import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../config/colors';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="vehicle-selection"
        options={{
          title: 'Choose Vehicle',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="date-time"
        options={{
          title: 'Select Date & Time',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: 'Review Booking',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="confirmation"
        options={{
          title: 'Booking Confirmed',
          headerShown: true,
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Payment',
          headerShown: true,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}