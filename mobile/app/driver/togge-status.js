// app/driver/toggle-status.js
import React, { useState } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

export default function ToggleStatusScreen() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Driver Status</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          You are currently {isOnline ? "ONLINE" : "OFFLINE"}
        </Text>
        <Switch
          value={isOnline}
          onValueChange={setIsOnline}
          thumbColor={isOnline ? "#fff" : "#fff"}
          trackColor={{ false: "#ccc", true: "#FF6B00" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "700", color: "#FF6B00", marginBottom: 20 },
  statusContainer: { alignItems: "center" },
  statusText: { fontSize: 18, marginBottom: 10, color: "#333" },
});
