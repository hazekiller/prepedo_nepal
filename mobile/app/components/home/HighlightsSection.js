// app/components/home/HighlightsSection.js - Prepedo Nepal
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/colors';

const HIGHLIGHTS = [
  {
    id: 1,
    icon: 'shield-checkmark',
    title: 'Safety First',
    description: 'All vehicles are regularly maintained and fully insured for your peace of mind',
  },
  {
    id: 2,
    icon: 'people',
    title: 'Professional Chauffeurs',
    description: 'Experienced, licensed drivers with extensive knowledge of Nepal',
  },
  {
    id: 3,
    icon: 'time',
    title: '24/7 Availability',
    description: 'Book anytime, anywhere. We\'re always ready to serve you',
  },
  {
    id: 4,
    icon: 'diamond',
    title: 'Premium Experience',
    description: 'Complimentary amenities and luxury interiors in every ride',
  },
];

export default function HighlightsSection() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Why Choose Prepedo Nepal?</Text>
        <Text style={styles.subtitle}>
          Experience the difference with Nepal's premium ride-sharing service
        </Text>
      </View>

      <View style={styles.grid}>
        {HIGHLIGHTS.map((highlight, index) => (
          <View key={highlight.id} style={styles.card}>
            <LinearGradient
              colors={['rgba(26,26,26,1)', 'rgba(20,20,20,1)']}
              style={styles.cardGradient}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name={highlight.icon} size={32} color={COLORS.primary} />
              </View>

              {/* Content */}
              <Text style={styles.cardTitle}>{highlight.title}</Text>
              <Text style={styles.cardDescription}>{highlight.description}</Text>

              {/* Number Badge */}
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>0{index + 1}</Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Bottom Banner */}
      <View style={styles.banner}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.bannerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.bannerContent}>
            <Ionicons name="trophy" size={40} color="#000" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Awarded Best Luxury Transport 2024</Text>
              <Text style={styles.bannerSubtitle}>
                By Nepal Tourism Board
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardGradient: {
    padding: 24,
    position: 'relative',
    minHeight: 180,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  numberBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212,175,55,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  numberText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  banner: {
    marginTop: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerGradient: {
    padding: 24,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#000',
    opacity: 0.8,
  },
});