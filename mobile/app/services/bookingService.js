import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import COLORS  from '../config/colors';
import socketService from '../services/socketService';

export default function BookRideScreen() {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.user);

  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [loading, setLoading] = useState(false);
  const [rideUpdates, setRideUpdates] = useState([]);

  useEffect(() => {
    // Subscribe to booking updates
    const unsubNew = socketService.on('booking:statusUpdated', (data) => {
      setRideUpdates((prev) => [data, ...prev]);
      Alert.alert('Ride Update', `Booking ${data.id} status: ${data.status}`);
    });

    return () => {
      unsubNew();
    };
  }, []);

  const handleCreateRide = async () => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in to request a ride.');
      return;
    }

    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Error', 'Please enter both pickup and drop-off locations.');
      return;
    }

    setLoading(true);

    try {
      if (!socketService.getConnectionStatus()) {
        const connected = await socketService.connect();
        if (!connected) {
          Alert.alert('Error', 'Unable to connect to server.');
          setLoading(false);
          return;
        }
      }

      const rideData = {
        passengerId: user.id,
        passengerName: user.full_name,
        pickupLocation,
        dropoffLocation,
        passengers: parseInt(passengers) || 1,
        status: 'requested',
        timestamp: new Date().toISOString(),
      };

      socketService.send('user:requestRide', rideData);

      Alert.alert('Ride Requested!', 'Your ride request has been sent.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create a Ride</Text>

      <TextInput
        style={styles.input}
        placeholder="Pickup Location"
        value={pickupLocation}
        onChangeText={setPickupLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Drop-off Location"
        value={dropoffLocation}
        onChangeText={setDropoffLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Passengers"
        value={passengers}
        onChangeText={setPassengers}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateRide} disabled={loading}>
        <LinearGradient colors={['#D4AF37', '#FFD700']} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>{loading ? 'Requesting...' : 'Request Ride'}</Text>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.updatesTitle}>Ride Updates:</Text>
      <FlatList
        data={rideUpdates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.updateItem}>
            <Text style={styles.updateText}>Booking {item.id}: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: COLORS.text },
  input: { backgroundColor: COLORS.cardBackground, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  button: { marginTop: 16, borderRadius: 12, overflow: 'hidden' },
  buttonGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16 },
  buttonText: { fontSize: 16, fontWeight: 'bold', marginRight: 8, color: '#000' },
  updatesTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 12, color: COLORS.text },
  updateItem: { padding: 12, backgroundColor: COLORS.cardBackground, borderRadius: 12, marginBottom: 8 },
  updateText: { color: COLORS.text },
});
