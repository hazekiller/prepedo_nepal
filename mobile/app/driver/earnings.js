// app/driver/earnings.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function EarningsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Earnings</Text>

      <View style={styles.card}>
        <Text style={styles.amount}>Rs. 45,000</Text>
        <Text style={styles.label}>Total Earnings</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.amount}>Rs. 1,200</Text>
        <Text style={styles.label}>Today’s Earnings</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "700", color: "#FF6B00", marginBottom: 20 },
  card: {
    backgroundColor: "#FFEFE2",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  amount: { fontSize: 24, fontWeight: "700", color: "#333" },
  label: { color: "#555", marginTop: 5 },
});
