// app/(admin)/initiatives/create.js
import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../config/colors';
import { API_ENDPOINTS } from '../../config/api';

export default function CreateInitiativePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initiativeId = params.id;
  const isEdit = !!initiativeId;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website: '',
    description: '',
    display_order: '0',
    is_active: true,
  });

  useEffect(() => {
    if (isEdit) {
      fetchInitiative();
    }
  }, []);

  const fetchInitiative = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.initiatives}/${initiativeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setFormData({
          name: data.data.name || '',
          logo_url: data.data.logo_url || '',
          website: data.data.website || '',
          description: data.data.description || '',
          display_order: data.data.display_order?.toString() || '0',
          is_active: data.data.is_active,
        });
      }
    } catch (error) {
      console.error('Fetch initiative error:', error);
      Alert.alert('Error', 'Failed to fetch initiative details');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Initiative name is required');
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
        display_order: parseInt(formData.display_order) || 0,
      };

      const url = isEdit ? API_ENDPOINTS.updateInitiative(initiativeId) : API_ENDPOINTS.createInitiative;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', `Initiative ${isEdit ? 'updated' : 'created'} successfully`, [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', data.message || `Failed to ${isEdit ? 'update' : 'create'} initiative`);
      }
    } catch (error) {
      console.error('Submit initiative error:', error);
      Alert.alert('Error', `Failed to ${isEdit ? 'update' : 'create'} initiative`);
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
        <Text style={styles.headerTitle}>{isEdit ? 'Edit' : 'Create'} Initiative</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Initiative Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter initiative name"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          {/* Logo URL */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Logo URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/logo.png"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.logo_url}
              onChangeText={(value) => handleInputChange('logo_url', value)}
            />
          </View>

          {/* Website */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.website}
              onChangeText={(value) => handleInputChange('website', value)}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Brief description of the initiative"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Display Order */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Display Order</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.display_order}
              onChangeText={(value) => handleInputChange('display_order', value)}
              keyboardType="numeric"
            />
            <Text style={styles.helpText}>Lower numbers appear first</Text>
          </View>

          {/* Active Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Active</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) => handleInputChange('is_active', value)}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={formData.is_active ? '#fff' : '#f4f3f4'}
              />
            </View>
            <Text style={styles.helpText}>
              {formData.is_active
                ? 'Initiative is visible on the website'
                : 'Initiative is hidden'}
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
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update Initiative' : 'Create Initiative'}
              </Text>
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