// app/(admin)/stories/create.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { COLORS } from '../../config/colors';
import { API_ENDPOINTS } from '../../config/api';

export default function CreateStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    location: '',
    summary: '',
    content: '',
    featured_image: '',
    image_alt: '',
    is_published: false,
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }
    if (!formData.slug.trim()) {
      Alert.alert('Validation Error', 'Slug is required');
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert('Validation Error', 'Content is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');

      const payload = {
        ...formData,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      const response = await fetch(API_ENDPOINTS.createStory, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Story created successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to create story');
      }
    } catch (error) {
      console.error('Create story error:', error);
      Alert.alert('Error', 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Story</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter story title"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
            />
          </View>

          {/* Slug */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Slug *</Text>
            <TextInput
              style={styles.input}
              placeholder="auto-generated-slug"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.slug}
              onChangeText={(value) => handleInputChange('slug', value)}
            />
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Patan, Bagmati"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
            />
          </View>

          {/* Summary */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Summary</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Brief summary of the story"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.summary}
              onChangeText={(value) => handleInputChange('summary', value)}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Content */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { height: 200 }]}
              placeholder="Write your story content here..."
              placeholderTextColor={COLORS.textSecondary}
              value={formData.content}
              onChangeText={(value) => handleInputChange('content', value)}
              multiline
              numberOfLines={10}
            />
          </View>

          {/* Featured Image URL */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Featured Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.featured_image}
              onChangeText={(value) => handleInputChange('featured_image', value)}
            />
          </View>

          {/* Image Alt Text */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Image Alt Text</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe the image"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.image_alt}
              onChangeText={(value) => handleInputChange('image_alt', value)}
            />
          </View>

          {/* Publish Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Publish Story</Text>
              <Switch
                value={formData.is_published}
                onValueChange={(value) => handleInputChange('is_published', value)}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={formData.is_published ? '#fff' : '#f4f3f4'}
              />
            </View>
            <Text style={styles.helpText}>
              {formData.is_published
                ? 'Story will be visible to the public'
                : 'Story will be saved as draft'}
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Story</Text>
            )}
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});