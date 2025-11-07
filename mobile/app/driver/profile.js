// app/driver/profile.js
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function ProfileScreen() {
  const driver = {
    name: "Bikram Thapa",
    phone: "9867890123",
    email: "bikram@example.com",
    vehicle: "Toyota Corolla (BA 1 PA 1234)",
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{driver.name}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{driver.phone}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{driver.email}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Vehicle:</Text>
        <Text style={styles.value}>{driver.vehicle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", backgroundColor: "#fff", padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginTop: 40, marginBottom: 20 },
  name: { fontSize: 22, fontWeight: "700", color: "#FF6B00", marginBottom: 20 },
  infoBox: { width: "100%", marginBottom: 15 },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 16, fontWeight: "600", color: "#333" },
});
