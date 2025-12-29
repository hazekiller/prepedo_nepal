// app/user/book.js - Updated with real location and map selection
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../config/colors';
import MapComponent from '../components/shared/MapComponent';

export default function BookRideScreen() {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);

  const [pickup, setPickup] = useState({
    address: 'Kathmandu, Nepal',
    latitude: 27.7172,
    longitude: 85.3240
  });
  const [dropoff, setDropoff] = useState({
    address: '',
    latitude: null,
    longitude: null
  });
  const [passengers, setPassengers] = useState('1');
  const [isLoading, setIsLoading] = useState(false);

  // Map Selection State
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionType, setSelectionType] = useState(null); // 'pickup' or 'dropoff'
  const [tempCoords, setTempCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to use your current location.');
        return;
      }

      getCurrentLocation();
    })();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);

      // Try to get cached location first for speed
      const lastLoc = await Location.getLastKnownPositionAsync({});
      if (lastLoc) {
        setPickup(prev => ({
          ...prev,
          latitude: lastLoc.coords.latitude,
          longitude: lastLoc.coords.longitude
        }));
      }

      // Fresh location with balanced accuracy to avoid hangs
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maxAge: 10000
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      const reverse = await Location.reverseGeocodeAsync(coords);
      let address = 'Current Location';
      if (reverse && reverse[0]) {
        const { name, street, city } = reverse[0];
        address = `${name || street || ''}, ${city || ''}`.trim().replace(/^,/, '');
      }

      setPickup({
        address: address || 'Current Location',
        ...coords
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to Kathmandu if location fetching fails and no last known
      if (!pickup.latitude) {
        const ktmCoords = { latitude: 27.7172, longitude: 85.3240 };
        setPickup(prev => ({
          ...prev,
          ...ktmCoords,
          address: prev.address || 'Kathmandu, Nepal'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startSelecting = (type) => {
    setSelectionType(type);
    setIsSelecting(true);
    setSearchQuery('');
    const current = type === 'pickup' ? pickup : dropoff;
    if (current.latitude) {
      setTempCoords({ latitude: current.latitude, longitude: current.longitude });
    } else if (pickup.latitude) {
      setTempCoords({ latitude: pickup.latitude, longitude: pickup.longitude });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setTempCoords({ latitude, longitude });
      } else {
        Alert.alert('No results', 'Location not found. Try adding "Kathmandu" to your search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Search failed. Please check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const confirmSelection = async () => {
    if (!tempCoords) return;

    setIsLoading(true);
    try {
      const reverse = await Location.reverseGeocodeAsync(tempCoords);
      let address = `Lat: ${tempCoords.latitude.toFixed(4)}, Lng: ${tempCoords.longitude.toFixed(4)}`;

      if (reverse && reverse[0]) {
        const { name, street, city } = reverse[0];
        const res = `${name || street || ''}, ${city || ''}`.trim().replace(/^,/, '');
        if (res) address = res;
      }

      if (selectionType === 'pickup') {
        setPickup({ address, ...tempCoords });
      } else {
        setDropoff({ address, ...tempCoords });
      }
    } catch (e) {
      console.warn('Reverse geocode failed:', e);
      const address = `Lat: ${tempCoords.latitude.toFixed(4)}, Lng: ${tempCoords.longitude.toFixed(4)}`;
      if (selectionType === 'pickup') {
        setPickup({ address, ...tempCoords });
      } else {
        setDropoff({ address, ...tempCoords });
      }
    } finally {
      setIsLoading(false);
      setIsSelecting(false);
      setSelectionType(null);
    }
  };

  const handleContinue = () => {
    if (!user || !token) {
      Alert.alert('Login Required', 'Please login to book a ride', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!pickup.latitude || !dropoff.latitude) {
      Alert.alert('Error', 'Please select both pickup and drop-off locations on the map.');
      return;
    }

    router.push({
      pathname: '/booking/vehicle-selection',
      params: {
        pickupLocation: pickup.address,
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,
        dropoffLocation: dropoff.address,
        dropoffLatitude: dropoff.latitude,
        dropoffLongitude: dropoff.longitude,
        passengers,
        distance: routeInfo?.distance || 1, // Fallback to 1km
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Book a Ride</Text>
        <Text style={styles.subheading}>Luxury travel at your fingertips</Text>

        <View style={styles.mapPreview}>
          <MapComponent
            height={220}
            pickup={pickup.latitude ? pickup : null}
            dropoff={dropoff.latitude ? dropoff : null}
            showUserLocation
            onRouteInfo={setRouteInfo}
          />
          {routeInfo && pickup.latitude && dropoff.latitude && (
            <View style={styles.routeOverlay}>
              <View style={styles.routeInfoChip}>
                <Ionicons name="car" size={16} color={COLORS.primary} />
                <Text style={styles.routeInfoText}>{routeInfo.distance.toFixed(1)} km</Text>
              </View>
              <View style={styles.routeInfoChip}>
                <Ionicons name="time" size={16} color={COLORS.primary} />
                <Text style={styles.routeInfoText}>{Math.round(routeInfo.duration)} min</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.form}>
          {/* Pickup Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Location</Text>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => startSelecting('pickup')}
            >
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={[styles.locationText, !pickup.latitude && styles.placeholderText]} numberOfLines={1}>
                {pickup.latitude ? pickup.address : 'Select pickup point'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.currentLocBtn} onPress={getCurrentLocation}>
              <Ionicons name="locate" size={16} color={COLORS.primary} />
              <Text style={styles.currentLocText}>Use Current Location</Text>
            </TouchableOpacity>
          </View>

          {/* Dropoff Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Drop-off Location</Text>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => startSelecting('dropoff')}
            >
              <Ionicons name="flag" size={20} color="#FF6B6B" />
              <Text style={[styles.locationText, !dropoff.latitude && styles.placeholderText]} numberOfLines={1}>
                {dropoff.latitude ? dropoff.address : 'Select destination'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Passengers */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Passengers</Text>
            <View style={styles.passengerRow}>
              {[1, 2, 3, 4].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[styles.passengerBtn, passengers === num.toString() && styles.passengerBtnActive]}
                  onPress={() => setPassengers(num.toString())}
                >
                  <Text style={[styles.passengerBtnText, passengers === num.toString() && styles.passengerBtnTextActive]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleContinue}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[COLORS.primary, '#FFD700']}
            style={styles.submitGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.submitText}>Continue to Vehicles</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Map Selection Modal */}
      <Modal visible={isSelecting} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsSelecting(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Select {selectionType === 'pickup' ? 'Pickup' : 'Destination'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search area or landmark..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.searchBtnText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          <MapComponent
            height="100%"
            selectable
            showUserLocation
            selectionType={selectionType}
            latitude={tempCoords?.latitude || pickup.latitude || 27.7172}
            longitude={tempCoords?.longitude || pickup.longitude || 85.3240}
            onLocationSelect={setTempCoords}
          />

          <View style={styles.selectionFooter}>
            <Text style={styles.selectionHint}>Move the map to point location</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmSelection}>
              <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.confirmGradient}>
                <Text style={styles.confirmText}>Confirm Location</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 40,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  mapPreview: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  routeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    gap: 15,
  },
  routeInfoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  routeInfoText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  locationSelector: {
    backgroundColor: COLORS.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  currentLocText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  passengerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  passengerBtn: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passengerBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  passengerBtnText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  passengerBtnTextActive: {
    color: COLORS.primary,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 40,
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
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: COLORS.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: COLORS.background,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    marginLeft: 8,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
  },
  searchBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  selectionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  selectionHint: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  confirmBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmGradient: {
    padding: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
  },
});