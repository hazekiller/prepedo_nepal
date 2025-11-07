// app/booking/date-time.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import COLORS  from '../config/colors';

export default function DateTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bookingType, setBookingType] = useState('now'); // 'now' or 'scheduled'

  const { pickupLocation, dropoffLocation, passengers, vehicleId, vehicleName, vehiclePrice } = params;

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleContinue = () => {
    let scheduledDateTime = null;

    if (bookingType === 'scheduled') {
      // Combine date and time
      const combined = new Date(date);
      combined.setHours(time.getHours());
      combined.setMinutes(time.getMinutes());
      
      // Check if scheduled time is in the past
      if (combined < new Date()) {
        Alert.alert('Invalid Time', 'Please select a future date and time');
        return;
      }
      
      scheduledDateTime = combined.toISOString();
    }

    router.push({
      pathname: '/booking/review',
      params: {
        pickupLocation,
        dropoffLocation,
        passengers,
        vehicleId,
        vehicleName,
        vehiclePrice,
        bookingType,
        scheduledDateTime: scheduledDateTime || '',
      },
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Date & Time</Text>
          <Text style={styles.subtitle}>When do you need the ride?</Text>
        </View>

        <View style={styles.content}>
          {/* Booking Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Type</Text>
            
            <TouchableOpacity
              style={[styles.optionCard, bookingType === 'now' && styles.optionCardSelected]}
              onPress={() => setBookingType('now')}
            >
              <View style={styles.optionContent}>
                <View style={[styles.radioOuter, bookingType === 'now' && styles.radioOuterSelected]}>
                  {bookingType === 'now' && <View style={styles.radioInner} />}
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Book Now</Text>
                  <Text style={styles.optionDescription}>Get picked up as soon as possible</Text>
                </View>
                <Ionicons name="flash" size={24} color={bookingType === 'now' ? COLORS.primary : COLORS.textMuted} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, bookingType === 'scheduled' && styles.optionCardSelected]}
              onPress={() => setBookingType('scheduled')}
            >
              <View style={styles.optionContent}>
                <View style={[styles.radioOuter, bookingType === 'scheduled' && styles.radioOuterSelected]}>
                  {bookingType === 'scheduled' && <View style={styles.radioInner} />}
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Schedule for Later</Text>
                  <Text style={styles.optionDescription}>Choose a specific date and time</Text>
                </View>
                <Ionicons name="calendar" size={24} color={bookingType === 'scheduled' ? COLORS.primary : COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Date & Time Selection (only show if scheduled) */}
          {bookingType === 'scheduled' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Date</Text>
                <TouchableOpacity
                  style={styles.dateTimeCard}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Time</Text>
                <TouchableOpacity
                  style={styles.dateTimeCard}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.continueGradient}>
            <Text style={styles.continueText}>Continue to Review</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  optionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  dateTimeCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginRight: 8,
  },
});