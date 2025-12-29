import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { logoutUser } from '../store/slices/authSlice';
import COLORS from '../config/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            dispatch(logoutUser());
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.gradient}>
        <View style={styles.header}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.full_name || "Driver Partner"}</Text>
          <Text style={styles.role}>Premium Driver</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <View style={styles.textGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>{user?.phone || "Not Set"}</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
            <View style={styles.textGroup}>
              <Text style={styles.label}>Email Address</Text>
              <Text style={styles.value}>{user?.email || "Not Set"}</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="car-outline" size={20} color={COLORS.primary} />
            <View style={styles.textGroup}>
              <Text style={styles.label}>Account Status</Text>
              <Text style={styles.value}>Verified & Approved</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LinearGradient colors={['#FF4B4B', '#D32F2F']} style={styles.logoutGradient}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout from Prepedo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={{ height: 130 }} />
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gradient: { flex: 1, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: COLORS.primary, marginBottom: 15 },
  name: { fontSize: 26, fontWeight: "900", color: COLORS.text, marginBottom: 4 },
  role: { fontSize: 14, color: COLORS.primary, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  content: { paddingHorizontal: 25 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  textGroup: { marginLeft: 16 },
  label: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  value: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  logoutBtn: { marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 10 },
  logoutText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
