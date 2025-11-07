// app/contact.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import COLORS  from './config/colors';

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    // Simulate sending message
    setTimeout(() => {
      Alert.alert(
        'Success',
        'Thank you for contacting us! We will get back to you shortly.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Get In Touch</Text>
          <Text style={styles.subtitle}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </Text>

          <View style={styles.contactInfoSection}>
            <View style={styles.contactInfoCard}>
              <Ionicons name="mail" size={24} color={COLORS.primary} />
              <View style={styles.contactInfoContent}>
                <Text style={styles.contactInfoLabel}>Email</Text>
                <Text style={styles.contactInfoText}>info@prepedonepal.com</Text>
              </View>
            </View>

            <View style={styles.contactInfoCard}>
              <Ionicons name="call" size={24} color={COLORS.primary} />
              <View style={styles.contactInfoContent}>
                <Text style={styles.contactInfoLabel}>Phone</Text>
                <Text style={styles.contactInfoText}>+977 980-1234567</Text>
              </View>
            </View>

            <View style={styles.contactInfoCard}>
              <Ionicons name="location" size={24} color={COLORS.primary} />
              <View style={styles.contactInfoContent}>
                <Text style={styles.contactInfoLabel}>Address</Text>
                <Text style={styles.contactInfoText}>Kathmandu, Nepal</Text>
              </View>
            </View>
          </View>

          <Text style={styles.formTitle}>Send us a Message</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="What is this about?"
              placeholderTextColor={COLORS.textMuted}
              value={subject}
              onChangeText={setSubject}
            />

            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your message..."
              placeholderTextColor={COLORS.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#555', '#666'] : [COLORS.primary, '#FFD700']}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Text>
                <Ionicons name="send" size={20} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
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
  contactInfoSection: {
    marginBottom: 32,
  },
  contactInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactInfoContent: {
    flex: 1,
    marginLeft: 16,
  },
  contactInfoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  contactInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginRight: 8,
  },
});