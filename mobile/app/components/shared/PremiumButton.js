// app/components/shared/PremiumButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import COLORS  from '../../config/colors';

export default function PremiumButton({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, text
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'right', // left, right
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'text' ? COLORS.primary : '#000'} 
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Ionicons 
            name={icon} 
            size={getSizeConfig(size).iconSize} 
            color={getIconColor(variant)} 
          />
        )}
        <Text style={[
          styles.text,
          getSizeConfig(size).textStyle,
          getTextStyle(variant),
          textStyle,
        ]}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <Ionicons 
            name={icon} 
            size={getSizeConfig(size).iconSize} 
            color={getIconColor(variant)} 
          />
        )}
      </View>
    );
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.buttonBase, style]}
      >
        <LinearGradient
          colors={disabled ? ['#555', '#777'] : ['#D4AF37', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradientButton,
            getSizeConfig(size).buttonStyle,
            disabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.buttonBase,
          styles.secondaryButton,
          getSizeConfig(size).buttonStyle,
          disabled && styles.disabled,
          style,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.buttonBase,
          styles.outlineButton,
          getSizeConfig(size).buttonStyle,
          disabled && styles.disabled,
          style,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  if (variant === 'text') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.6}
        style={[
          styles.textButton,
          getSizeConfig(size).buttonStyle,
          disabled && styles.disabled,
          style,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return null;
}

// Helper functions
const getSizeConfig = (size) => {
  const configs = {
    small: {
      buttonStyle: { paddingHorizontal: 16, paddingVertical: 8 },
      textStyle: { fontSize: 12, fontWeight: '700' },
      iconSize: 14,
    },
    medium: {
      buttonStyle: { paddingHorizontal: 24, paddingVertical: 14 },
      textStyle: { fontSize: 14, fontWeight: '800' },
      iconSize: 16,
    },
    large: {
      buttonStyle: { paddingHorizontal: 32, paddingVertical: 18 },
      textStyle: { fontSize: 16, fontWeight: '900' },
      iconSize: 20,
    },
  };
  return configs[size] || configs.medium;
};

const getTextStyle = (variant) => {
  const styles = {
    primary: { color: '#000' },
    secondary: { color: COLORS.text },
    outline: { color: COLORS.primary },
    text: { color: COLORS.primary },
  };
  return styles[variant];
};

const getIconColor = (variant) => {
  const colors = {
    primary: '#000',
    secondary: COLORS.text,
    outline: COLORS.primary,
    text: COLORS.primary,
  };
  return colors[variant];
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});