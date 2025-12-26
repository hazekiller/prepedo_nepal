import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import socketService from '../services/socketService';
import useSocket from '../hooks/useSocket';
import { COLORS } from '../config/colors';
import { API_BASE_URL } from '../config/api';

export default function ToggleStatusScreen() {
  const { token } = useSelector((state) => state.auth);
  const { connected } = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverStatus();

    if (connected && socketService.socket) {
      socketService.socket.on('driver:statusUpdated', (data) => {
        setIsOnline(data.isOnline);
      });
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('driver:statusUpdated');
      }
    };
  }, [connected]);

  const fetchDriverStatus = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/api/drivers/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setIsOnline(response.data.data.is_online);
      }
    } catch (error) {
      console.error('Fetch driver status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async (value) => {
    if (!connected || !socketService.socket) {
      Alert.alert('Error', 'Connection not established. Please wait or check your internet.');
      return;
    }

    if (value) {
      console.log('📡 Going Online...');
      socketService.socket.emit('driver:goOnline');
    } else {
      console.log('📡 Going Offline...');
      socketService.socket.emit('driver:goOffline');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isOnline ? "radio" : "radio-outline"}
              size={120}
              color={isOnline ? COLORS.success : COLORS.textMuted}
            />
          </View>

          <Text style={styles.title}>Service Status</Text>
          <Text style={styles.description}>
            {isOnline
              ? "You are now visible to passengers. New ride requests will appear in your 'Requests' tab."
              : "You are currently offline. Go online to start receiving ride requests."
            }
          </Text>

          <View style={styles.statusBox}>
            <View>
              <Text style={styles.statusLabel}>Duty Status</Text>
              <Text style={[styles.statusValue, { color: isOnline ? COLORS.success : COLORS.error }]}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: "#333", true: COLORS.success }}
              thumbColor={"#fff"}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  content: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
  iconContainer: { marginBottom: 40 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 15 },
  description: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 50 },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    width: '100%',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  statusLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  statusValue: { fontSize: 20, fontWeight: '900', marginTop: 4 }
});
