import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import COLORS from '../config/colors';
import { API_BASE_URL } from '../config/api';
import socketService from '../services/socketService';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useSelector((state) => state.auth);
  const scaleAnim = new Animated.Value(0);

  const [offers, setOffers] = React.useState([]);
  const [loadingOffers, setLoadingOffers] = React.useState(true);
  const [selectingId, setSelectingId] = React.useState(null);

  const {
    bookingId,
    pickupLocation,
    dropoffLocation,
    vehicleName,
    bookingType,
  } = params;

  useEffect(() => {
    // Animate check mark
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    fetchOffers();

    // Listen for driver acceptance and new offers
    // Listen for driver acceptance and new offers
    if (bookingId) {
      console.log('📌 Subscribing to booking updates:', bookingId);
      socketService.send('booking:subscribe', { bookingId });

      const unsubscribeOffer = socketService.on('booking:newOffer', (offer) => {
        console.log('🔔 New offer received:', offer.driver_name);
        setOffers(prev => {
          // Check if offer already exists to avoid duplicates
          if (prev.find(o => o.driver_id === offer.driver_id)) return prev;
          return [offer, ...prev];
        });
      });

      const unsubscribeAccepted = socketService.on('booking:accepted', (booking) => {
        console.log('✅ Driver confirmed for booking:', booking.id);
        router.push(`/user/active-ride?id=${booking.id}`);
      });

      return () => {
        socketService.send('booking:unsubscribe', { bookingId });
        unsubscribeOffer();
        unsubscribeAccepted();
      };
    }
  }, [bookingId]);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings/${bookingId}/offers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOffers(response.data.data);
      }
    } catch (error) {
      console.error('Fetch offers error:', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleSelectDriver = async (driverId) => {
    try {
      setSelectingId(driverId);
      const response = await axios.post(
        `${API_BASE_URL}/api/bookings/${bookingId}/select-driver`,
        { driver_id: driverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        router.push(`/user/active-ride?id=${bookingId}`);
      }
    } catch (error) {
      console.error('Select driver error:', error);
      Alert.alert('Error', 'Failed to select driver. Please try again.');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1A1A1A', '#000000']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Success Animation */}
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={100} color={COLORS.primary} />
            </View>
          </Animated.View>

          <Text style={styles.title}>Ride Requested!</Text>
          <Text style={styles.subtitle}>
            Waiting for nearby riders to send you offers. Choose your preferred rider below.
          </Text>

          {/* Driver Offers Section */}
          <View style={styles.offersSection}>
            <Text style={styles.sectionTitle}>Rider Offers</Text>
            {loadingOffers ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : offers.length === 0 ? (
              <View style={styles.emptyOffers}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.emptyOffersText}>Searching for nearby riders...</Text>
              </View>
            ) : (
              offers.map((offer) => (
                <View key={offer.driver_id} style={styles.offerCard}>
                  <View style={styles.offerMain}>
                    <View style={styles.driverInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={24} color="#000" />
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.driverName}>{offer.driver_name}</Text>
                        <Text style={styles.driverVehicle}>{offer.vehicle_model} • {offer.vehicle_number}</Text>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color={COLORS.primary} />
                          <Text style={styles.ratingText}>{offer.driver_rating || '5.0'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.fareBadge}>
                      <Text style={styles.fareText}>CASH</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelectDriver(offer.driver_id)}
                    disabled={selectingId !== null}
                  >
                    <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.selectGradient}>
                      {selectingId === offer.driver_id ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={styles.selectText}>Accept Offer</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Trip Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.summaryText} numberOfLines={1}>{pickupLocation}</Text>
            </View>
            <View style={styles.summaryLine} />
            <View style={styles.summaryRow}>
              <Ionicons name="flag" size={16} color="#FF4B4B" />
              <Text style={styles.summaryText} numberOfLines={1}>{dropoffLocation}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.push('/user/home')}
          >
            <Text style={styles.cancelText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successCircle: {
    marginBottom: 20,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  offersSection: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyOffers: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyOffersText: {
    marginLeft: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  offerCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  offerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  driverVehicle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  fareBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fareText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.success,
  },
  selectButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  selectText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 15,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 10,
    flex: 1,
  },
  summaryLine: {
    width: 1,
    height: 10,
    backgroundColor: COLORS.border,
    marginLeft: 7,
    marginVertical: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.danger || '#FF4B4B',
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.danger || '#FF4B4B',
    fontWeight: '700',
    fontSize: 16,
  },
});