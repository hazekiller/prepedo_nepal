// app/support.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import  COLORS  from './config/colors';

export default function SupportScreen() {
  const router = useRouter();

  const handleCall = () => {
    Linking.openURL('tel:+9779801234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@prepedonepal.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/9779801234567');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>How Can We Help?</Text>
          <Text style={styles.subtitle}>
            We're here to help you 24/7. Choose the best way to reach us.
          </Text>

          <Text style={styles.sectionTitle}>Quick Contact</Text>

          <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactDescription}>
                +977 980-1234567
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDescription}>
                support@prepedonepal.com
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
            <View style={styles.contactIcon}>
              <Ionicons name="logo-whatsapp" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactDescription}>
                Chat with us instantly
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => router.push('/contact')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Contact Form</Text>
              <Text style={styles.contactDescription}>
                Send us a detailed message
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I book a ride?</Text>
            <Text style={styles.faqAnswer}>
              Tap the "Book" button, enter your pickup and drop-off locations, select a vehicle,
              choose your date/time, and confirm your booking.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>What payment methods are accepted?</Text>
            <Text style={styles.faqAnswer}>
              We accept cash, eSewa, Khalti, and major credit/debit cards.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Can I cancel my booking?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your booking from the "My Bookings" section. Cancellation
              charges may apply based on timing.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I track my ride?</Text>
            <Text style={styles.faqAnswer}>
              Once your booking is confirmed, you can track your driver's location in real-time
              from the active ride screen.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Are the drivers verified?</Text>
            <Text style={styles.faqAnswer}>
              Yes, all our drivers undergo thorough background checks and verification before
              joining our platform.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>What if I leave something in the vehicle?</Text>
            <Text style={styles.faqAnswer}>
              Contact support immediately with your ride details. We'll help you connect with
              your driver to retrieve lost items.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.guideButton}
            onPress={() => router.push('/guide-booking')}
          >
            <Text style={styles.guideButtonText}>View Booking Guide</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>

          <View style={styles.emergencyCard}>
            <Ionicons name="warning" size={24} color="#FF6B6B" />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Emergency?</Text>
              <Text style={styles.emergencyText}>
                For urgent safety issues during a ride, use the in-app emergency button or call
                our 24/7 hotline.
              </Text>
              <TouchableOpacity style={styles.emergencyButton} onPress={handleCall}>
                <Text style={styles.emergencyButtonText}>Call Emergency Line</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  faqCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  guideButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 18,
    marginTop: 24,
  },
  guideButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    marginRight: 8,
  },
  emergencyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});