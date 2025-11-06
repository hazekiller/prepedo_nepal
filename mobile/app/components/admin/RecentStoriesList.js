// app/components/admin/RecentStoriesList.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../config/colors';

export default function RecentStoriesList({ stories, router }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Stories</Text>
      {stories.map((story) => (
        <TouchableOpacity
          key={story.id}
          style={styles.storyCard}
          onPress={() => router.push(`/admin/stories/${story.id}`)}
        >
          <View style={styles.storyHeader}>
            <Text style={styles.storyTitle} numberOfLines={1}>
              {story.title}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: story.is_published ? '#10b981' : '#f59e0b' }
            ]}>
              <Text style={styles.statusText}>
                {story.is_published ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>
          <View style={styles.storyMeta}>
            <Text style={styles.metaText}>👁️ {story.views || 0} views</Text>
            <Text style={styles.metaText}>
              {new Date(story.created_at).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  storyCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});