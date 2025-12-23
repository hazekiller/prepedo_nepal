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

  // Get pickup and dropoff from params
  const {
    pickupLocation,
    pickupLatitude,
    pickupLongitude,
    dropoffLocation,
    dropoffLatitude,
    dropoffLongitude,
    passengers
  } = params;

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vehicles`);
      const data = await response.json();

      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert('Select Vehicle', 'Please select a vehicle to continue');
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
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        vehiclePrice: selectedVehicle.price_per_km || selectedVehicle.base_price,
        vehicleType: selectedVehicle.category?.toLowerCase() || 'car',
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Vehicle</Text>
          <Text style={styles.subtitle}>
            From {pickupLocation} to {dropoffLocation}
          </Text>
          <Text style={styles.passengersInfo}>
            <Ionicons name="people" size={16} color={COLORS.textSecondary} /> {passengers} passenger(s)
          </Text>
          <View style={{ marginTop: 16 }}>
            <MapComponent height={150} />
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
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
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
      <View style={styles.vehicleImageContainer}>
        {vehicle.image ? (
          <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
        ) : (
          <View style={styles.vehicleImagePlaceholder}>
            <Ionicons name="car" size={48} color={COLORS.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.vehicleInfo}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          {selected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </View>
          )}
        </View>

        <Text style={styles.vehicleCategory}>{vehicle.category || 'Luxury'}</Text>

        <View style={styles.vehicleFeatures}>
          <View style={styles.feature}>
            <Ionicons name="people" size={16} color={COLORS.textSecondary} />
            <Text style={styles.featureText}>{vehicle.capacity || 4} seats</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="speedometer" size={16} color={COLORS.textSecondary} />
            <Text style={styles.featureText}>{vehicle.transmission || 'Automatic'}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Base Fare</Text>
          <Text style={styles.price}>NPR {vehicle.base_price || vehicle.price_per_km || '500'}</Text>
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
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  passengersInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  vehicleList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  vehicleCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleCardSelected: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  vehicleImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.border,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  vehicleImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  vehicleInfo: {
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  selectedBadge: {
    marginLeft: 8,
  },
  vehicleCategory: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  vehicleFeatures: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
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
    padding: 18,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginRight: 8,
  },
});