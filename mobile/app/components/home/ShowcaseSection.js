// app/components/home/ShowcaseSection.js - Prepedo Nepal
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../config/colors';

const FEATURED_VEHICLES = [
  {
    id: 1,
    name: 'Mercedes S-Class',
    category: 'Executive Sedan',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    passengers: 3,
    luggage: 2,
    rating: 4.9,
    pricePerHour: 'NPR 4,500',
  },
  {
    id: 2,
    name: 'Range Rover',
    category: 'Luxury SUV',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    passengers: 6,
    luggage: 4,
    rating: 4.8,
    pricePerHour: 'NPR 6,000',
  },
  {
    id: 3,
    name: 'BMW 7 Series',
    category: 'Premium Sedan',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    passengers: 4,
    luggage: 3,
    rating: 4.9,
    pricePerHour: 'NPR 5,000',
  },
];

export default function ShowcaseSection() {
  const router = useRouter();

  const handleVehiclePress = (vehicle) => {
    router.push({
      pathname: '/vehicle-details',
      params: { vehicleId: vehicle.id },
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Our Premium Fleet</Text>
          <Text style={styles.sectionSubtitle}>
            Experience luxury with our handpicked collection
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push('/fleet')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Vehicle Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FEATURED_VEHICLES.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={styles.vehicleCard}
            onPress={() => handleVehiclePress(vehicle)}
            activeOpacity={0.9}
          >
            {/* Vehicle Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.imageGradient}
              />
              
              {/* Rating Badge */}
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{vehicle.rating}</Text>
              </View>

              {/* Category Tag */}
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{vehicle.category}</Text>
              </View>
            </View>

            {/* Vehicle Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>

              {/* Features */}
              <View style={styles.featuresRow}>
                <View style={styles.feature}>
                  <Ionicons name="people" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.featureText}>{vehicle.passengers} Seats</Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="briefcase" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.featureText}>{vehicle.luggage} Bags</Text>
                </View>
              </View>

              {/* Price & CTA */}
              <View style={styles.footer}>
                <View>
                  <Text style={styles.priceLabel}>Per Hour</Text>
                  <Text style={styles.price}>{vehicle.pricePerHour}</Text>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.bookButtonGradient}
                  >
                    <Text style={styles.bookButtonText}>Book</Text>
                    <Ionicons name="arrow-forward" size={16} color="#000" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <TouchableOpacity
        style={styles.bottomCTA}
        onPress={() => router.push('/fleet')}
        activeOpacity={0.9}
      >
        <View style={styles.ctaContent}>
          <View>
            <Text style={styles.ctaTitle}>Need a Custom Package?</Text>
            <Text style={styles.ctaSubtitle}>Contact us for special arrangements</Text>
          </View>
          <Ionicons name="chevron-forward-circle" size={32} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingRight: 40,
    gap: 20,
  },
  vehicleCard: {
    width: 320,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoContainer: {
    padding: 20,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  bookButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomCTA: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ctaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});