import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { COLORS } from '../config/colors';
import { API_BASE_URL } from '../config/api';
import socketService from '../services/socketService';
import MapComponent from '../components/shared/MapComponent';

export default function RequestsScreen() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [acceptingId, setAcceptingId] = React.useState(null);

  React.useEffect(() => {
    fetchAvailableBookings();

    // Listen for new bookings
    if (socketService.socket) {
      socketService.socket.on('booking:new', (newBooking) => {
        console.log('🔔 New booking received:', newBooking.id);
        setRequests(prev => [newBooking, ...prev]);
      });

      socketService.socket.on('booking:taken', (data) => {
        console.log('🚫 Booking taken by another driver:', data.bookingId);
        setRequests(prev => prev.filter(r => r.id !== data.bookingId));
      });
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('booking:new');
      }
    };
  }, []);

  const fetchAvailableBookings = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/api/bookings/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRequests(response.data.data.bookings);
      }
    } catch (error) {
      console.error('Fetch available bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (bookingId) => {
    try {
      setAcceptingId(bookingId);
      const response = await axios.post(
        `${API_BASE_URL}/api/bookings/${bookingId}/offer`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Offer sent to user!', [
          {
            text: 'OK', onPress: () => {
              // Filter out the requested ride from UI after offering
              setRequests(prev => prev.filter(r => r.id !== bookingId));
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Send offer error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send offer');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.heading}>Available Requests</Text>
          <Text style={styles.subheading}>Nearby rides in Kathmandu Valley</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapComponent height={200} />
        </View>

        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.userInfo}>
                  <Ionicons name="person-circle" size={40} color={COLORS.primary} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.userName}>{item.user_name || 'Passenger'}</Text>
                    <Text style={styles.userRating}>⭐ 4.8</Text>
                  </View>
                </View>
                <Text style={styles.fare}>Rs. {item.estimated_fare || item.fare}</Text>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routeBox}>
                  <Ionicons name="location" size={16} color={COLORS.primary} />
                  <Text style={styles.routeText} numberOfLines={1}>{item.pickup_location || item.pickup}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeBox}>
                  <Ionicons name="flag" size={16} color="#FF6B6B" />
                  <Text style={styles.routeText} numberOfLines={1}>{item.dropoff_location || item.drop}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleSendOffer(item.id)}
                disabled={acceptingId !== null}
              >
                <LinearGradient colors={[COLORS.primary, '#FFD700']} style={styles.acceptGradient}>
                  {acceptingId === item.id ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.acceptText}>Send Offer</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No ride requests available near you.</Text>
            </View>
          }
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gradient: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  heading: { fontSize: 28, fontWeight: "900", color: COLORS.primary },
  subheading: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  mapContainer: { marginHorizontal: 20, marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  requestCard: {
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userName: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  userRating: { color: COLORS.primary, fontSize: 12, marginTop: 2 },
  fare: { color: COLORS.primary, fontWeight: "900", fontSize: 20 },
  routeContainer: { marginBottom: 20 },
  routeBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  routeText: { color: COLORS.text, fontSize: 14, marginLeft: 10, flex: 1 },
  routeLine: { width: 1, height: 10, backgroundColor: COLORS.border, marginLeft: 7, marginBottom: 8 },
  acceptButton: { borderRadius: 12, overflow: 'hidden' },
  acceptGradient: { paddingVertical: 14, alignItems: 'center' },
  acceptText: { color: "#000", fontWeight: "900", fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textSecondary, marginTop: 16, fontSize: 16 },
});
