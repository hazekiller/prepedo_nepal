// app/booking/payment.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import COLORS  from '../config/colors';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  // eSewa payment details (for demo)
  const [esewaPhone, setEsewaPhone] = useState('');
  const [esewaPin, setEsewaPin] = useState('');

  const { bookingId, totalAmount } = params;

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash',
      icon: 'cash-outline',
      description: 'Pay with cash after ride',
      available: true,
    },
    {
      id: 'esewa',
      name: 'eSewa',
      icon: 'wallet-outline',
      description: 'Pay with eSewa wallet',
      available: true,
    },
    {
      id: 'khalti',
      name: 'Khalti',
      icon: 'card-outline',
      description: 'Pay with Khalti',
      available: true,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'card',
      description: 'Pay with your card',
      available: false,
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment Method', 'Please select a payment method');
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (selectedMethod === 'cash') {
        Alert.alert(
          'Payment Method Selected',
          'You will pay cash after the ride is completed.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else if (selectedMethod === 'esewa') {
        if (!esewaPhone || !esewaPin) {
          Alert.alert('Error', 'Please enter your eSewa phone and PIN');
          setLoading(false);
          return;
        }

        // In production, integrate with actual eSewa API
        Alert.alert(
          'Payment Successful',
          'Your payment has been processed via eSewa.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Payment Successful',
          `Payment processed via ${paymentMethods.find(m => m.id === selectedMethod)?.name}`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Payment Method</Text>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>NPR {totalAmount || '0.00'}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected,
                !method.available && styles.methodCardDisabled,
              ]}
              onPress={() => method.available && setSelectedMethod(method.id)}
              disabled={!method.available}
            >
              <View style={styles.methodContent}>
                <View style={[styles.radioOuter, selectedMethod === method.id && styles.radioOuterSelected]}>
                  {selectedMethod === method.id && <View style={styles.radioInner} />}
                </View>

                <Ionicons
                  name={method.icon}
                  size={28}
                  color={method.available ? COLORS.primary : COLORS.textMuted}
                />

                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, !method.available && styles.methodNameDisabled]}>
                    {method.name}
                  </Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>

                {!method.available && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* eSewa Form (show only if eSewa is selected) */}
          {selectedMethod === 'esewa' && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>eSewa Payment Details</Text>
              
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="98XXXXXXXX"
                value={esewaPhone}
                onChangeText={setEsewaPhone}
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.inputLabel}>PIN</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your eSewa PIN"
                value={esewaPin}
                onChangeText={setEsewaPin}
                secureTextEntry
                keyboardType="numeric"
                placeholderTextColor={COLORS.textMuted}
              />

              <View style={styles.secureInfo}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                <Text style={styles.secureText}>Your payment information is secure</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, (!selectedMethod || loading) && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={!selectedMethod || loading}
        >
          <LinearGradient
            colors={selectedMethod && !loading ? [COLORS.primary, '#FFD700'] : ['#555', '#666']}
            style={styles.payGradient}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Text style={styles.payText}>
                  {selectedMethod === 'cash' ? 'Confirm' : 'Pay Now'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 20,
  },
  amountCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  methodCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  methodNameDisabled: {
    color: COLORS.textMuted,
  },
  methodDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  comingSoonBadge: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  secureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  secureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  payText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginRight: 8,
  },
});