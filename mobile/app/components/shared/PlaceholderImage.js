// app/components/shared/PlaceholderImage.js
// Temporary component until real images are added

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../config/colors';

export default function PlaceholderImage({ width = 200, height = 200, text = 'Image' }) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});

/* 
===========================================
IMAGE SETUP INSTRUCTIONS
===========================================

Create the following folder structure in your project:

app/
  assets/
    icon.png (app icon)
    splash.png (splash screen)
    story1.jpg (hero carousel image 1)
    story2.jpg (hero carousel image 2)
    saalik-logo.png (main logo for About section)
    heritage-image.png (heritage image for Stories Preview)
    guide.png (guide image for Guide Booking section)
    saalik-main.png (Saalik group logo)
    saalik-designs.png (Saalik Designs logo)
    
    partners/
      archaeology.png
      archives.png
      municipality1.png
      municipality2.png
    
    initiatives/
      openlipi.png
      openabhilekh.png
      sanket.png
      risti.png

TEMPORARY SOLUTION:
Until you have real images, you can:

1. Use this PlaceholderImage component
2. Use online image URLs
3. Use placeholder services like:
   - https://via.placeholder.com/400x300
   - https://picsum.photos/400/300

EXAMPLE USAGE WITH URLS:

Instead of:
  source={require('../../assets/story1.jpg')}

Use:
  source={{ uri: 'https://picsum.photos/800/400' }}

Or use the PlaceholderImage component:
  <PlaceholderImage width={200} height={200} text="Logo" />

RECOMMENDED IMAGE SIZES:
- App Icon: 1024x1024px
- Splash Screen: 1242x2436px
- Story Images: 1920x1080px (landscape)
- Logo Images: 512x512px (square)
- Guide Image: 400x600px (portrait)
- Partner Logos: 200x200px (square)
- Initiative Logos: 400x100px (landscape)
*/