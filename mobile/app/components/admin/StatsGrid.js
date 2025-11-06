// app/components/admin/StatsGrid.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../config/colors';

export default function StatsGrid({ overview }) {
  const stats = [
    { label: 'Total Stories', value: overview?.totalStories || 0, icon: '📖' },
    { label: 'Published', value: overview?.publishedStories || 0, icon: '✅' },
    { label: 'Total Views', value: overview?.totalViews || 0, icon: '👁️' },
    { label: 'Waitlist', value: overview?.waitlistTotal || 0, icon: '⏳' },
    { label: 'New Today', value: overview?.waitlistToday || 0, icon: '🆕' },
    { label: 'Contacts', value: overview?.contactTotal || 0, icon: '📧' },
    { label: 'Unread', value: overview?.contactUnread || 0, icon: '🔔' },
    { label: 'Pending Suggestions', value: overview?.suggestionsPending || 0, icon: '💡' },
  ];

  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});