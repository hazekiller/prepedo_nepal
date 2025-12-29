// app/booking/vehicle-selection.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../config/colors';
import { API_URL } from '../config/api';
import MapComponent from '../components/shared/MapComponent';

export default function VehicleSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const {
    pickupLocation,
    pickupLatitude,
    pickupLongitude,
    dropoffLocation,
    dropoffLatitude,
    dropoffLongitude,
    passengers
  } = params;

  // Change: Use selector to get auth token
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      // Change: Call new quotes API endpoint
      const response = await fetch(`${API_URL}/api/bookings/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pickup_latitude: parseFloat(pickupLatitude),
          pickup_longitude: parseFloat(pickupLongitude),
          dropoff_latitude: parseFloat(dropoffLatitude),
          dropoff_longitude: parseFloat(dropoffLongitude)
        }),
      });
      const data = await response.json();

      if (data.success) {
        setVehicles(data.data.quotes);
      } else {
        Alert.alert('Error', data.message || 'Failed to load vehicle options');
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      Alert.alert('Error', 'Failed to calculate fares');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert('Select Vehicle', 'Please select a vehicle type to continue');
      return;
    }

    router.push({
      pathname: '/booking/date-time',
      params: {
        pickupLocation,
        pickupLatitude,
        pickupLongitude,
        dropoffLocation,
        dropoffLatitude,
        dropoffLongitude,
        passengers,
        // Change: Pass type-based data
        vehicleName: selectedVehicle.name,
        vehiclePrice: selectedVehicle.price,
        vehicleType: selectedVehicle.type,
        distance: selectedVehicle.distance
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Calculating best fares...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Ride</Text>
          <Text style={styles.subtitle}>
            Best prices for your trip to {dropoffLocation || 'Destination'}
          </Text>
          <View style={{ marginTop: 16 }}>
            <MapComponent
              height={180}
              pickup={{
                latitude: parseFloat(pickupLatitude),
                longitude: parseFloat(pickupLongitude)
              }}
              dropoff={{
                latitude: parseFloat(dropoffLatitude),
                longitude: parseFloat(dropoffLongitude)
              }}
            />
          </View>
        </View>

        <View style={styles.vehicleList}>
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              selected={selectedVehicle?.id === vehicle.id}
              onSelect={() => handleSelectVehicle(vehicle)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedVehicle && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedVehicle}
        >
          <LinearGradient
            colors={selectedVehicle ? [COLORS.primary, '#FFD700'] : ['#555', '#666']}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>
              {selectedVehicle ? `Book ${selectedVehicle.name} - NPR ${selectedVehicle.price}` : 'Select a Ride'}
            </Text>
            {selectedVehicle && <Ionicons name="arrow-forward" size={20} color="#000" />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function VehicleCard({ vehicle, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.vehicleCard, selected && styles.vehicleCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.vehicleContent}>
        {/* Left: Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: vehicle.image_url }}
            style={styles.vehicleImage}
            resizeMode="contain"
          />
        </View>

        {/* Middle: Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.etaText}>{vehicle.eta} drop-off</Text>
          <View style={styles.capacityRow}>
            <Ionicons name="person" size={12} color={COLORS.textSecondary} />
            <Text style={styles.capacityText}>{vehicle.capacity}</Text>
          </View>
        </View>

        {/* Right: Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>NPR {vehicle.price}</Text>
          {selected && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} style={{ marginTop: 4 }} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
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
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  vehicleList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  vehicleCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  vehicleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  etaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
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
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  continueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
});