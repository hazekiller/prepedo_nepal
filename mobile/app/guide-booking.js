// mobile/app/guide-booking.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import { COLORS } from './config/colors';
import { API_ENDPOINTS } from './config/api';

export default function GuideBookingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleNavigate = (route) => {
    const routeMap = {
      Home: '/',
      Stories: '/stories',
      GuideBooking: '/guide-booking',
      Contact: '/contact',
      AdminLogin: '/admin-login',
    };
    router.push(routeMap[route] || '/');
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.waitlist, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success!',
          data.message || 'You have been added to the waitlist. We will notify you when guide booking is available!',
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  name: '',
                  email: '',
                  message: '',
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to join waitlist. Please try again.');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      Alert.alert('Error', 'Failed to submit. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Navbar activeRoute="GUIDE BOOKING" onNavigate={handleNavigate} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            <Text style={styles.titleHighlight}>GUIDE</Text> BOOKING
          </Text>
          <Text style={styles.subtitle}>Join the Waitlist</Text>
          <Text style={styles.description}>
            Our verified guide booking system is launching soon! Be the first to know when you can
            book expert local guides for authentic heritage experiences across Nepal.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>JOIN THE WAITLIST</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textMuted}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about your travel plans or any specific requirements..."
                placeholderTextColor={COLORS.textMuted}
                value={formData.message}
                onChangeText={(value) => handleInputChange('message', value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={styles.submitButtonText}>JOIN WAITLIST</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What to Expect</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Verified Local Guides</Text>
                <Text style={styles.featureDescription}>
                  All guides are thoroughly verified and trained in heritage tourism
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Personalized Itineraries</Text>
                <Text style={styles.featureDescription}>
                  Customized tours based on your interests and schedule
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Emergency Support</Text>
                <Text style={styles.featureDescription}>
                  24/7 assistance and safety support during your journey
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Cultural Immersion</Text>
                <Text style={styles.featureDescription}>
                  Deep dive into Nepal's rich heritage with expert storytelling
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Footer onNavigate={handleNavigate} />
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
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    maxWidth: 800,
    alignSelf: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 2,
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 24,
    color: COLORS.primary,
    marginBottom: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 30,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.background,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  featuresTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 40,
    textAlign: 'center',
  },
  featuresList: {
    gap: 30,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 15,
  },
  featureIcon: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});