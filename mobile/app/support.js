// app/support.js - Prepedo Nepal
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './config/colors';

const FAQ_DATA = [
  {
    id: 1,
    question: 'How do I book a ride?',
    answer: 'You can book a ride through our app by selecting your desired vehicle, entering pickup and drop-off locations, choosing date and time, and confirming your booking. Our team will contact you for confirmation.',
  },
  {
    id: 2,
    question: 'What payment methods do you accept?',
    answer: 'We accept cash, all major credit/debit cards, eSewa, Khalti, and bank transfers. Payment can be made before or after your journey.',
  },
  {
    id: 3,
    question: 'Can I cancel or modify my booking?',
    answer: 'Yes, you can cancel or modify your booking up to 24 hours before your scheduled ride time without any charges. For changes within 24 hours, a 20% fee applies.',
  },
  {
    id: 4,
    question: 'Are your drivers professional?',
    answer: 'Absolutely! All our chauffeurs are professionally trained, licensed, and have extensive experience. They undergo regular background checks and training programs.',
  },
  {
    id: 5,
    question: 'What areas do you serve?',
    answer: 'We currently serve Kathmandu, Pokhara, Chitwan, and major tourist destinations across Nepal. Inter-city travel is also available.',
  },
  {
    id: 6,
    question: 'Is insurance included?',
    answer: 'Yes, all our vehicles and passengers are fully insured. Your safety is our top priority.',
  },
];

const SUPPORT_OPTIONS = [
  {
    id: 1,
    icon: 'call',
    title: '24/7 Phone Support',
    description: 'Call us anytime',
    action: '+977-9876543210',
  },
  {
    id: 2,
    icon: 'chatbubbles',
    title: 'Live Chat',
    description: 'Chat with our team',
    action: 'Open Chat',
  },
  {
    id: 3,
    icon: 'mail',
    title: 'Email Support',
    description: 'Response within 2 hours',
    action: 'support@prepedo.com.np',
  },
  {
    id: 4,
    icon: 'book',
    title: 'Help Center',
    description: 'Browse articles',
    action: 'View Articles',
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Ionicons name="help-circle" size={64} color={COLORS.primary} />
          <Text style={styles.heroTitle}>How Can We Help?</Text>
          <Text style={styles.heroSubtitle}>
            We're here to assist you 24/7
          </Text>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.optionsGrid}>
            {SUPPORT_OPTIONS.map((option) => (
              <TouchableOpacity key={option.id} style={styles.optionCard}>
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
                <Text style={styles.optionAction}>{option.action}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {FAQ_DATA.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFAQ(faq.id)}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              
              {expandedId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="warning" size={32} color={COLORS.error} />
            </View>
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
              <Text style={styles.emergencyText}>
                For urgent matters during your ride
              </Text>
              <TouchableOpacity style={styles.emergencyButton}>
                <Text style={styles.emergencyButtonText}>Call Emergency: 100</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  optionAction: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  faqItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  emergencySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  emergencyCard: {
    backgroundColor: 'rgba(231,76,60,0.1)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emergencyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(231,76,60,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});