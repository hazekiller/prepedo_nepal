// app/components/vehicles/VehicleCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/colors';

const { width } = Dimensions.get('window');

export default function VehicleCard({ vehicle, onPress, compact = false }) {
  if (!vehicle) return null;

  const {
    id,
    name,
    category,
    image,
    passengers,
    luggage,
    pricePerHour,
    features = [],
    rating,
    available = true,
  } = vehicle;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={() => onPress?.(vehicle)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: image }} style={styles.compactImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.compactGradient}
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{name}</Text>
          <Text style={styles.compactPrice}>NPR {pricePerHour}/hr</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, !available && styles.cardDisabled]}
      onPress={() => onPress?.(vehicle)}
      activeOpacity={0.9}
      disabled={!available}
    >
      {/* Vehicle Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.vehicleImage} />
        
        {/* Image Overlay Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.imageGradient}
        />

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{getCategoryLabel(category)}</Text>
        </View>

        {/* Availability Badge */}
        {!available && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}

        {/* Rating */}
        {rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.primary} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Vehicle Info */}
      <View style={styles.infoContainer}>
        {/* Name */}
        <Text style={styles.vehicleName}>{name}</Text>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="people" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{passengers} seats</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="briefcase" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{luggage} bags</Text>
          </View>
        </View>

        {/* Features */}
        {features.length > 0 && (
          <View style={styles.featuresRow}>
            {features.slice(0, 3).map((feature, index) => (
              <View key={index} style={styles.featureChip}>
                <Ionicons 
                  name={getFeatureIcon(feature)} 
                  size={10} 
                  color={COLORS.primary} 
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
            {features.length > 3 && (
              <Text style={styles.moreFeatures}>+{features.length - 3} more</Text>
            )}
          </View>
        )}

        {/* Price & CTA */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.price}>NPR {pricePerHour.toLocaleString()}</Text>
            <Text style={styles.priceUnit}>per hour</Text>
          </View>
          
          <LinearGradient
            colors={available ? ['#D4AF37', '#FFD700'] : ['#555', '#777']}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>{available ? 'Book Now' : 'Unavailable'}</Text>
            {available && <Ionicons name="arrow-forward" size={16} color="#000" />}
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Helper functions
const getCategoryLabel = (category) => {
  const labels = {
    sedan: 'Executive Sedan',
    suv: 'Premium SUV',
    executive: 'Executive Class',
    'luxury-van': 'Luxury Van',
  };
  return labels[category] || category;
};

const getFeatureIcon = (feature) => {
  const icons = {
    wifi: 'wifi',
    leather: 'diamond',
    climate: 'snow',
    sound: 'musical-notes',
    massage: 'body',
    champagne: 'wine',
    entertainment: 'tv',
    '4wd': 'car-sport',
    spacious: 'resize',
    sunroof: 'sunny',
    gps: 'navigate',
    usb: 'phone-portrait',
    water: 'water',
    partition: 'remove',
  };
  return icons[feature.toLowerCase()] || 'checkmark-circle';
};

const styles = StyleSheet.create({
  // Full Card Styles
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unavailableText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 20,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  featureText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  moreFeatures: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    alignSelf: 'center',
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
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  priceUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },

  // Compact Card Styles
  compactCard: {
    width: (width - 60) / 2,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  compactImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  compactGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  compactInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  compactPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});