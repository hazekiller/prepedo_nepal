// app/user/book.js - Updated to navigate to booking flow
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/colors';

export default function BookRideScreen() {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.user);

  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [passengers, setPassengers] = useState('1');

  const handleContinue = () => {
    if (!user || !token) {
      Alert.alert('Login Required', 'Please login to book a ride', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Error', 'Please enter both pickup and drop-off locations.');
      return;
    }

    if (!passengers || parseInt(passengers) < 1) {
      Alert.alert('Error', 'Please enter a valid number of passengers.');
      return;
    }

    // Navigate to vehicle selection with booking data
    router.push({
      pathname: '/booking/vehicle-selection',
      params: {
        pickupLocation,
        dropoffLocation,
        passengers,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Book a Ride</Text>
      <Text style={styles.subheading}>Where would you like to go?</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.label}>Pickup Location</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter pickup location"
            placeholderTextColor={COLORS.textMuted}
            value={pickupLocation}
            onChangeText={setPickupLocation}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="flag" size={20} color="#FF6B6B" />
            <Text style={styles.label}>Drop-off Location</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter drop-off location"
            placeholderTextColor={COLORS.textMuted}
            value={dropoffLocation}
            onChangeText={setDropoffLocation}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="people" size={20} color={COLORS.primary} />
            <Text style={styles.label}>Number of Passengers</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={COLORS.textMuted}
            value={passengers}
            onChangeText={setPassengers}
            keyboardType="numeric"
            maxLength={1}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Next, you'll choose your vehicle and select your preferred pickup time
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleContinue}
      >
        <LinearGradient
          colors={[COLORS.primary, '#FFD700']}
          style={styles.submitGradient}
        >
          <Text style={styles.submitText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  heading: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 10,
    lineHeight: 18,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginRight: 8,
  },
});