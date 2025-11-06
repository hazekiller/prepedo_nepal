// app/about.js - Prepedo Nepal
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './config/colors';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(212,175,55,0.2)', 'rgba(0,0,0,0)']}
            style={styles.heroGradient}
          >
            <Ionicons name="diamond" size={64} color={COLORS.primary} />
            <Text style={styles.heroTitle}>Nepal's Premier{'\n'}Luxury Transport</Text>
            <Text style={styles.heroSubtitle}>
              Redefining travel with elegance and sophistication
            </Text>
          </LinearGradient>
        </View>

        {/* Story Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.paragraph}>
            Founded in 2023, Prepedo Nepal emerged from a vision to transform luxury transportation 
            in Nepal. We recognized the need for a premium, reliable, and safe ride-sharing service 
            that caters to discerning travelers and business professionals.
          </Text>
          <Text style={styles.paragraph}>
            Today, we operate a fleet of over 50 luxury vehicles, serving 500+ satisfied clients 
            across Nepal's major cities and tourist destinations.
          </Text>
        </View>

        {/* Mission & Vision */}
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="flag" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Our Mission</Text>
            <Text style={styles.cardText}>
              To provide unparalleled luxury transportation services with unwavering commitment 
              to safety, comfort, and customer satisfaction.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="eye" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Our Vision</Text>
            <Text style={styles.cardText}>
              To become Nepal's most trusted and preferred luxury transport partner, 
              setting new standards in premium mobility services.
            </Text>
          </View>
        </View>

        {/* Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Values</Text>
          
          <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Safety First</Text>
              <Text style={styles.valueText}>
                All vehicles are regularly maintained and fully insured
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
              <Ionicons name="star" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Excellence</Text>
              <Text style={styles.valueText}>
                We strive for perfection in every journey
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Customer Focus</Text>
              <Text style={styles.valueText}>
                Your satisfaction is our top priority
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
              <Ionicons name="leaf" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Sustainability</Text>
              <Text style={styles.valueText}>
                Committed to eco-friendly luxury transportation
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Happy Clients</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Luxury Vehicles</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10+</Text>
              <Text style={styles.statLabel}>Cities Served</Text>
            </View>
          </LinearGradient>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/ride-booking')}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Book Your Luxury Ride</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
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
  heroGradient: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#000',
    opacity: 0.8,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  ctaButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});