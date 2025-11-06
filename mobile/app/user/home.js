// app/(user)/home.js
// User Home Screen - Main dashboard for passengers
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../config/colors';
import VehicleCard from '../components/vehicles/VehicleCard';

const { width } = Dimensions.get('window');

export default function UserHomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useSelector((state) => state.user);
  const { bookings } = useSelector((state) => state.bookings);

  // Mock featured vehicles (replace with actual Redux data)
  const featuredVehicles = [
    {
      id: '1',
      name: 'Mercedes S-Class',
      category: 'executive',
      image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800',
      passengers: 4,
      luggage: 3,
      pricePerHour: 2500,
      rating: 4.9,
      features: ['WiFi', 'Leather', 'Climate'],
      available: true,
    },
    {
      id: '2',
      name: 'Toyota Fortuner',
      category: 'suv',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
      passengers: 7,
      luggage: 4,
      pricePerHour: 1800,
      rating: 4.8,
      features: ['4WD', 'Spacious', 'GPS'],
      available: true,
    },
  ];

  const activeBooking = bookings?.find(
    (b) => b.status === 'ongoing' || b.status === 'confirmed'
  );

  useEffect(() => {
    // Load user data, bookings, featured vehicles
    loadData();
  }, []);

  const loadData = async () => {
    // Dispatch actions to load data
    // dispatch(fetchUserProfile());
    // dispatch(fetchActiveBookings());
    // dispatch(fetchFeaturedVehicles());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#1A1A1A', COLORS.background]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Namaste, {user?.name || 'Guest'}!</Text>
              <Text style={styles.subGreeting}>नमस्ते! Where to today?</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(user)/profile')}
            >
              <Image
                source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
                style={styles.profileImage}
              />
              <View style={styles.onlineIndicator} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Active Ride Banner */}
        {activeBooking && (
          <TouchableOpacity
            style={styles.activeRideBanner}
            onPress={() => router.push('/user/active-ride')}
          >
            <LinearGradient
              colors={['#D4AF37', '#FFD700']}
              style={styles.activeRideGradient}
            >
              <View style={styles.activeRideContent}>
                <View style={styles.activeRideLeft}>
                  <Ionicons name="car-sport" size={32} color="#000" />
                  <View style={styles.activeRideInfo}>
                    <Text style={styles.activeRideTitle}>Active Ride</Text>
                    <Text style={styles.activeRideSubtitle}>Tap to view details</Text>
                  </View>
                </View>
                <View style={styles.pulsingDot} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Booking Card */}
        <View style={styles.quickBookingCard}>
          <View style={styles.quickBookingHeader}>
            <Ionicons name="flash" size={24} color={COLORS.primary} />
            <Text style={styles.quickBookingTitle}>Quick Booking</Text>
          </View>

          {/* Location Inputs */}
          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => router.push('/booking/select-location?type=pickup')}
          >
            <View style={styles.locationDot} />
            <Text style={styles.locationPlaceholder}>Enter pickup location</Text>
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => router.push('/booking/select-location?type=dropoff')}
          >
            <Ionicons name="location" size={20} color={COLORS.error} />
            <Text style={styles.locationPlaceholder}>Enter drop-off location</Text>
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="home" size={20} color={COLORS.textSecondary} />
              <Text style={styles.quickActionText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="briefcase" size={20} color={COLORS.textSecondary} />
              <Text style={styles.quickActionText}>Work</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="airplane" size={20} color={COLORS.textSecondary} />
              <Text style={styles.quickActionText}>Airport</Text>
            </TouchableOpacity>
          </View>

          {/* Book Now Button */}
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={() => router.push('/(user)/fleet')}
          >
            <LinearGradient
              colors={['#D4AF37', '#FFD700']}
              style={styles.bookNowGradient}
            >
              <Text style={styles.bookNowText}>Choose Vehicle</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: 'rgba(59,130,246,0.1)' }]}
              onPress={() => router.push('/(user)/fleet?category=sedan')}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="car-sport" size={28} color="#FFF" />
              </View>
              <Text style={styles.serviceTitle}>Premium Sedans</Text>
              <Text style={styles.serviceDescription}>Comfortable rides</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: 'rgba(16,185,129,0.1)' }]}
              onPress={() => router.push('/(user)/fleet?category=suv')}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="car" size={28} color="#FFF" />
              </View>
              <Text style={styles.serviceTitle}>Luxury SUVs</Text>
              <Text style={styles.serviceDescription}>Spacious travel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: 'rgba(139,92,246,0.1)' }]}
              onPress={() => router.push('/(user)/fleet?category=executive')}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="diamond" size={28} color="#FFF" />
              </View>
              <Text style={styles.serviceTitle}>Executive Class</Text>
              <Text style={styles.serviceDescription}>Premium luxury</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: 'rgba(245,158,11,0.1)' }]}
              onPress={() => router.push('/(user)/fleet?category=van')}
            >
              <View style={[styles.serviceIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="bus" size={28} color="#FFF" />
              </View>
              <Text style={styles.serviceTitle}>Group Travel</Text>
              <Text style={styles.serviceDescription}>8+ seaters</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Vehicles */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Vehicles</Text>
            <TouchableOpacity onPress={() => router.push('/(user)/fleet')}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>

          {featuredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => router.push(`/fleet/${vehicle.id}`)}
            />
          ))}
        </View>

        {/* Why Prepedo Section */}
        <View style={styles.whySection}>
          <Text style={styles.sectionTitle}>Why Prepedo?</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Verified Drivers</Text>
                <Text style={styles.featureDescription}>
                  All drivers verified by Nepal Government with police clearance
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                <Ionicons name="cash" size={24} color="#10B981" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Fair Pricing</Text>
                <Text style={styles.featureDescription}>
                  No surge pricing during festivals - Dashain मा पनि सस्तै
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>24/7 Safety</Text>
                <Text style={styles.featureDescription}>
                  Emergency SOS connected to Nepal Police
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Promotional Banner */}
        <TouchableOpacity style={styles.promoBanner}>
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A']}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>🎉 First Ride Offer!</Text>
              <Text style={styles.promoDescription}>
                Get 20% off on your first booking
              </Text>
              <Text style={styles.promoCode}>Use code: PREPEDO20</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={40} color={COLORS.primary} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  profileButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  activeRideBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  activeRideGradient: {
    padding: 20,
  },
  activeRideContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeRideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeRideInfo: {
    marginLeft: 16,
  },
  activeRideTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginBottom: 2,
  },
  activeRideSubtitle: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  quickBookingCard: {
    backgroundColor: COLORS.cardBackground,
    margin: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickBookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickBookingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginLeft: 8,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  locationPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bookNowButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  bookNowText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    marginRight: 8,
  },
  servicesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  featuredSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  whySection: {
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 4,
  },
  promoDescription: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  promoCode: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D97706',
  },
  bottomSpacing: {
    height: 100,
  },
});