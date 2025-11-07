import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { COLORS } from '../config/colors';

export default function ProfileScreen() {
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout pressed') },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>User not logged in.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Image
          source={{
            uri: user.avatar
              ? user.avatar
              : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.info}>Phone: {user.phone || 'N/A'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  profileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  email: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 8 },
  info: { fontSize: 14, color: COLORS.textSecondary },
  logoutButton: {
    marginTop: 40,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  infoText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: COLORS.textSecondary },
});
