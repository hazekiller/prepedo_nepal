import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/colors';

const FleetScreen = () => {
  const router = useRouter();
  const { fleet } = useSelector((state) => state.user || { fleet: [] });

  const renderVehicle = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name="car-sport" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>{item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Available' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 107, 107, 0.1)' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Available' ? '#4CAF50' : '#FF6B6B' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View style={styles.detailItem}>
          <Ionicons name="card-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.plateNumber}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>Premium Verified</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.headerGradient}>
        <View style={styles.navbar}>
          <Text style={styles.headerTitle}>Our Fleet</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <FlatList
        data={fleet && fleet.length > 0 ? fleet : [
          { id: 1, name: 'Toyota Camry', type: 'Premium', plateNumber: 'BA 2 PA 1234', status: 'Available' },
          { id: 2, name: 'Hyundai Nexo', type: 'Luxury', plateNumber: 'BA 3 PA 5678', status: 'In Service' },
          { id: 3, name: 'Mercedes S-Class', type: 'VIP', plateNumber: 'BA 1 PA 9999', status: 'Available' },
        ]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVehicle}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default FleetScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  type: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
