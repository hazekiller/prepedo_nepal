import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { COLORS } from '../config/colors';

const FleetScreen = () => {
  const { fleet } = useSelector((state) => state.user);

  if (!fleet || fleet.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>No vehicles available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={fleet}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>Type: {item.type}</Text>
            <Text style={styles.details}>Plate: {item.plateNumber}</Text>
            <Text style={styles.details}>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default FleetScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  card: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  details: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  infoText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: COLORS.textSecondary },
});
