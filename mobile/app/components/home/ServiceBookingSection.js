// app/components/home/ServiceBookingSection.js - Prepedo Nepal
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../config/colors';

const RIDE_TYPES = [
  {
    id: 'luxury-sedan',
    name: 'Luxury Sedan',
    icon: 'car-sport',
    description: 'Premium comfort for 1-3 passengers',
    price: 'NPR 3,000',
    features: ['AC', 'WiFi', 'Premium Sound'],
  },
  {
    id: 'luxury-suv',
    name: 'Luxury SUV',
    icon: 'car',
    description: 'Spacious ride for 1-6 passengers',
    price: 'NPR 5,000',
    features: ['AC', 'WiFi', 'Extra Space'],
  },
  {
    id: 'executive',
    name: 'Executive Class',
    icon: 'diamond',
    description: 'Ultimate luxury experience',
    price: 'NPR 8,000',
    features: ['Chauffeur', 'Champagne', 'VIP'],
  },
];

export default function ServiceBookingSection() {
  const router = useRouter();
  const [selectedRide, setSelectedRide] = useState(null);

  const handleBookNow = () => {
    router.push({
      pathname: '/ride-booking',
      params: { rideType: selectedRide },
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Choose Your Ride</Text>
        <Text style={styles.sectionSubtitle}>
          Select from our premium fleet of luxury vehicles
        </Text>
      </View>

      {/* Ride Type Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {RIDE_TYPES.map((ride) => (
          <TouchableOpacity
            key={ride.id}
            style={[
              styles.rideCard,
              selectedRide === ride.id && styles.rideCardSelected,
            ]}
            onPress={() => setSelectedRide(ride.id)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                selectedRide === ride.id
                  ? ['rgba(212,175,55,0.2)', 'rgba(183,149,11,0.1)']
                  : ['rgba(26,26,26,1)', 'rgba(20,20,20,1)']
              }
              style={styles.cardGradient}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name={ride.icon}
                  size={40}
                  color={selectedRide === ride.id ? COLORS.primary : COLORS.textSecondary}
                />
              </View>

              {/* Ride Info */}
              <Text style={styles.rideName}>{ride.name}</Text>
              <Text style={styles.rideDescription}>{ride.description}</Text>

              {/* Price */}
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Starting at</Text>
                <Text style={styles.price}>{ride.price}</Text>
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {ride.features.map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Selection Indicator */}
              {selectedRide === ride.id && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Book Now Button */}
      {selectedRide && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.bookButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
            <Ionicons name="arrow-forward-circle" size={24} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Quick Info */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          All rides include professional chauffeurs, insurance, and 24/7 support
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  scrollContent: {
    paddingRight: 20,
    gap: 16,
  },
  rideCard: {
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  rideCardSelected: {
    borderColor: COLORS.primary,
  },
  cardGradient: {
    padding: 20,
    minHeight: 320,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(26,26,26,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rideName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  rideDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 'auto',
  },
  featureTag: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  featureText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  bookButton: {
    marginTop: 30,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  bookButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});