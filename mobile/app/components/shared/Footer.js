// app/components/shared/Footer.js - Prepedo Nepal (CLEANED)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import  COLORS  from '../../config/colors';

export default function Footer() {
  const router = useRouter();

  const handleSocialPress = (platform) => {
    const urls = {
      facebook: 'https://facebook.com/prepedonepal',
      instagram: 'https://instagram.com/prepedonepal',
      twitter: 'https://twitter.com/prepedonepal',
      linkedin: 'https://linkedin.com/company/prepedonepal',
    };
    Linking.openURL(urls[platform]);
  };

  return (
    <View style={styles.container}>
      {/* Brand Section */}
      <View style={styles.brandSection}>
        <View style={styles.logoRow}>
          <Ionicons name="car-sport" size={32} color={COLORS.primary} />
          <Text style={styles.brandName}>PREPEDO NEPAL</Text>
        </View>
        <Text style={styles.brandDescription}>
          Experience luxury transportation across Nepal with professional chauffeurs and premium vehicles.
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Links Section - ONLY EXISTING PAGES */}
      <View style={styles.linksSection}>
        <View style={styles.linkColumn}>
          <Text style={styles.columnTitle}>COMPANY</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.linkText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/about')}>
            <Text style={styles.linkText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/fleet')}>
            <Text style={styles.linkText}>Our Fleet</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkColumn}>
          <Text style={styles.columnTitle}>SUPPORT</Text>
          <TouchableOpacity onPress={() => router.push('/support')}>
            <Text style={styles.linkText}>Help Center</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/contact')}>
            <Text style={styles.linkText}>Contact Us</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkColumn}>
          <Text style={styles.columnTitle}>ACCOUNT</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <View style={styles.contactItem}>
          <Ionicons name="call" size={18} color={COLORS.primary} />
          <Text style={styles.contactText}>+977 970-3350007</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail" size={18} color={COLORS.primary} />
          <Text style={styles.contactText}>info@prepedo.com.np</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="location" size={18} color={COLORS.primary} />
          <Text style={styles.contactText}>Kathmandu, Nepal</Text>
        </View>
      </View>

      {/* Social Media */}
      <View style={styles.socialSection}>
        <Text style={styles.socialTitle}>FOLLOW US</Text>
        <View style={styles.socialIcons}>
          {[
            { icon: 'logo-facebook', name: 'facebook' },
            { icon: 'logo-instagram', name: 'instagram' },
            { icon: 'logo-twitter', name: 'twitter' },
            { icon: 'logo-linkedin', name: 'linkedin' },
          ].map((social, index) => (
            <TouchableOpacity
              key={index}
              style={styles.socialButton}
              onPress={() => handleSocialPress(social.name)}
            >
              <Ionicons name={social.icon} size={20} color={COLORS.text} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.copyrightText}>
          © 2024 Prepedo Nepal. All rights reserved.
        </Text>
        <View style={styles.premiumBadge}>
          <Ionicons name="diamond" size={14} color={COLORS.primary} />
          <Text style={styles.premiumText}>PREMIUM SERVICE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  brandSection: {
    marginBottom: 30,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  brandDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 30,
  },
  linksSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  linkColumn: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  linkText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  contactSection: {
    marginBottom: 30,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  socialTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: 1,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 16,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  premiumText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});