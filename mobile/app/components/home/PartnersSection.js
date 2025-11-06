// app/components/home/PartnersSection.js - Prepedo Nepal
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/colors';

const PARTNERS = [
  { id: 1, name: 'Soaltee Hotel', icon: 'business' },
  { id: 2, name: 'Hyatt Regency', icon: 'home' },
  { id: 3, name: 'Marriott', icon: 'bed' },
  { id: 4, name: 'Radisson', icon: 'star' },
  { id: 5, name: 'Shangri-La', icon: 'diamond' },
];

export default function PartnersSection() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trusted By Premium Brands</Text>
        <Text style={styles.subtitle}>
          Official transport partner for Nepal's finest establishments
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.partnersContainer}
      >
        {PARTNERS.map((partner) => (
          <View key={partner.id} style={styles.partnerCard}>
            <View style={styles.iconContainer}>
              <Ionicons name={partner.icon} size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.partnerName}>{partner.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  partnersContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  partnerCard: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});