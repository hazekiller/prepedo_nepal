import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS } from './config/colors';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleRegister = () => {
    // TODO: handle registration API
    alert(`Account created for ${form.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>🚖</Text>
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subText}>Join the <Text style={styles.brand}>Prepedo Nepal</Text> community</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#999"
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          value={form.password}
          onChangeText={(t) => setForm({ ...form, password: t })}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.switchText}>
          Already have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => router.push('/login')}
          >
            Login
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  heading: {
    fontSize: 28,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 8,
  },
  subText: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  brand: {
    color: '#FFD700',
    fontWeight: '600',
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    color: '#FFF',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 10,
  },
  buttonText: {
    color: '#0D0D0D',
    fontWeight: '700',
    fontSize: 16,
  },
  switchText: {
    color: '#CCC',
    marginTop: 20,
  },
  link: {
    color: '#FFD700',
    fontWeight: '600',
  },
});
