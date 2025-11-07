// app/user/settings.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../config/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              // Dispatch logout action if you have one
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/user/profile')}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available soon.')}>
            <View style={styles.settingLeft}>
              <Ionicons name="card-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Coming Soon', 'Saved addresses will be available soon.')}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Saved Addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Email Alerts</Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="navigate-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Location Tracking</Text>
            </View>
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Coming Soon', 'Privacy policy will be available soon.')}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Coming Soon', 'Terms of service will be available soon.')}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/support')}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Coming Soon', 'FAQ will be available soon.')}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubble-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/about')}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
              <Text style={[styles.settingText, { color: '#FF6B6B' }]}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
              <Text style={[styles.settingText, { color: '#FF6B6B' }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Prepedo Nepal v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});