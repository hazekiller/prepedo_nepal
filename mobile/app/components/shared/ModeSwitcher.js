// components/shared/ModeSwitcher.js
// Component to switch between User and Driver modes
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { switchMode } from '../../store/slices/modeSlice';
import { COLORS } from '../../config/colors';

export default function ModeSwitcher() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { currentMode, canSwitchToDriver, driverProfile } = useSelector((state) => state.mode);
  const isUserMode = currentMode === 'user';

  const handleSwitchMode = () => {
    if (isUserMode && !canSwitchToDriver) {
      Alert.alert(
        'Driver Mode Unavailable',
        'You need to complete driver verification to access Driver Mode. Would you like to apply?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Apply Now', 
            onPress: () => router.push('/driver/application') 
          },
        ]
      );
      return;
    }

    const newMode = isUserMode ? 'driver' : 'user';
    dispatch(switchMode(newMode));
    
    // Navigate to the new mode's home
    if (newMode === 'driver') {
      router.replace('/(driver)/dashboard');
    } else {
      router.replace('/(user)/home');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Mode</Text>
      
      <TouchableOpacity
        style={styles.switcherCard}
        onPress={handleSwitchMode}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isUserMode ? ['#D4AF37', '#FFD700'] : ['#10B981', '#34D399']}
          style={styles.switcherGradient}
        >
          <View style={styles.switcherContent}>
            <View style={styles.switcherLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isUserMode ? 'person' : 'car-sport'}
                  size={32}
                  color="#000"
                />
              </View>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>
                  {isUserMode ? 'Passenger Mode' : 'Driver Mode'}
                </Text>
                <Text style={styles.modeSubtitle}>
                  {isUserMode ? 'Book rides' : 'Accept ride requests'}
                </Text>
              </View>
            </View>
            
            <View style={styles.switchButton}>
              <Ionicons name="swap-horizontal" size={24} color="#000" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Driver Status Info */}
      {!isUserMode && driverProfile && (
        <View style={styles.driverInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="star" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>Rating: {driverProfile.rating || '4.8'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="car" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>{driverProfile.vehicle || 'Vehicle not set'}</Text>
          </View>
        </View>
      )}

      {/* Switch Availability */}
      {isUserMode && !canSwitchToDriver && (
        <TouchableOpacity
          style={styles.applyCard}
          onPress={() => router.push('/driver/application')}
        >
          <View style={styles.applyContent}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <View style={styles.applyText}>
              <Text style={styles.applyTitle}>Want to become a driver?</Text>
              <Text style={styles.applySubtitle}>Complete verification to start earning</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  switcherCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  switcherGradient: {
    padding: 20,
  },
  switcherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switcherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  switchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  applyCard: {
    marginTop: 12,
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  applyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applyText: {
    flex: 1,
  },
  applyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 2,
  },
  applySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});