// app/driver/requests.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const mockRequests = [
  { id: "1", pickup: "Baneshwor", drop: "Patan", fare: "Rs. 450" },
  { id: "2", pickup: "Balaju", drop: "Kalanki", fare: "Rs. 300" },
];

export default function RequestsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Active Ride Requests</Text>

      <FlatList
        data={mockRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <Text style={styles.route}>{item.pickup} ➜ {item.drop}</Text>
            <Text style={styles.fare}>{item.fare}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No ride requests available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  heading: { fontSize: 20, fontWeight: "700", color: "#FF6B00", marginBottom: 15 },
  requestCard: {
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    marginBottom: 10,
  },
  route: { fontSize: 16, fontWeight: "500" },
  fare: { color: "#FF6B00", fontWeight: "600", marginTop: 5 },
});
