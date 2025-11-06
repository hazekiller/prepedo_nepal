// app/components/home/AboutSection.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../config/colors';

export default function AboutSection() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left Side - Image / Logo */}
        <View style={styles.imageContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoEmoji}>🚗</Text>
            <Text style={styles.logoPlaceholderText}>PREPEDO</Text>
          </View>
        </View>

        {/* Right Side - Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            WHAT IS <Text style={styles.titleHighlight}>PREPEDO NEPAL?</Text>
          </Text>
          <Text style={styles.description}>
            Prepedo Nepal is a <Text style={styles.highlight}>luxury ride-sharing platform</Text> 
            designed to provide travelers with <Text style={styles.highlight}>premium vehicles</Text>, 
            professional drivers, and <Text style={styles.highlight}>safe & comfortable journeys</Text> 
            across Nepal. From Kathmandu to Pokhara, Chitwan, and beyond, we ensure an 
            unmatched travel experience.
          </Text>
          <Text style={styles.description}>
            Our goal is to redefine transportation with <Text style={styles.highlight}>timely service</Text>, 
            <Text style={styles.highlight}> transparent pricing</Text>, and <Text style={styles.highlight}>luxury comfort</Text>. 
            Prepedo Nepal connects you to the best vehicles and drivers, giving you a travel experience 
            that is <Text style={styles.highlight}>safe, efficient, and memorable</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, paddingVertical: 60, paddingHorizontal: 20 },
  content: { flexDirection: 'row', alignItems: 'center', maxWidth: 1200, marginHorizontal: 'auto', gap: 40 },
  imageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoPlaceholder: { width: 250, height: 250, backgroundColor: COLORS.primary, borderRadius: 125, justifyContent: 'center', alignItems: 'center', opacity: 0.9 },
  logoEmoji: { fontSize: 80, marginBottom: 10 },
  logoPlaceholderText: { fontSize: 24, fontWeight: 'bold', color: COLORS.background, letterSpacing: 3 },
  textContainer: { flex: 1.5 },
  title: { fontSize: 42, fontWeight: 'bold', color: COLORS.text, marginBottom: 25, letterSpacing: 2 },
  titleHighlight: { color: COLORS.primary },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 26, marginBottom: 20 },
  highlight: { color: COLORS.primary, fontWeight: '600' },
});
