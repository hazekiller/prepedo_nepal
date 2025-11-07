// app/driver/dashboard.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Driver Dashboard</Text>
      <Text style={styles.subtext}>
        Welcome back! Here’s your performance summary:
      </Text>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardValue}>150</Text>
          <Text style={styles.cardLabel}>Total Rides</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardValue}>₹45,000</Text>
          <Text style={styles.cardLabel}>Total Earnings</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.sectionText}>No recent rides found.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "700", color: "#FF6B00", marginBottom: 8 },
  subtext: { color: "#666", marginBottom: 20 },
  cardContainer: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    backgroundColor: "#FFEFE2",
    borderRadius: 12,
    padding: 20,
    width: "47%",
    alignItems: "center",
  },
  cardValue: { fontSize: 24, fontWeight: "700", color: "#333" },
  cardLabel: { fontSize: 14, color: "#777" },
  section: { marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  sectionText: { color: "#555" },
});
