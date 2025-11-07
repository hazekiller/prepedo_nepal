// app/components/admin/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../config/colors'; // ✅ default import

export default function Header({ userData, onLogout }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{userData?.full_name || 'Admin'}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  welcomeText: { fontSize: 14, color: COLORS.textSecondary },
  userName: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutButtonText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});
