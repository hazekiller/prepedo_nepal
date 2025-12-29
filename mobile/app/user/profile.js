import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../store/slices/authSlice';
import { COLORS } from '../config/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logoutUser());
          router.replace('/');
        }
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.gradient}>
          <Text style={styles.infoText}>User not logged in.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Go to Login</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 130 }}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: user.profile_image
                ? user.profile_image
                : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.full_name || 'Passenger'}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Rides</Text>
        </View>
        <View style={[styles.statBox, styles.statDivider]}>
          <Text style={styles.statValue}>4.9</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>Rs. 0</Text>
          <Text style={styles.statLabel}>Wallet</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="person-outline" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Personal Details</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="card-outline" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/user/bookings')}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="time-outline" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Ride History</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/user/settings')}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          </View>
          <Text style={[styles.menuText, { color: '#FF3B30' }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  profileHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  menuContainer: {
    padding: 20,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  logoutItem: {
    marginTop: 10,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  }
});
