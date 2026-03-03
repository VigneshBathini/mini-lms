import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen({ navigation }: any) {
  const register = useAuthStore((state) => state.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Set up your account to start learning.</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Your full name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          textContentType="name"
          accessibilityLabel="Name input"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          accessibilityLabel="Email input"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Create password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          textContentType="newPassword"
          accessibilityLabel="Password input"
        />

        <Pressable
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Register"
        >
          <Text style={styles.primaryButtonText}>{loading ? 'Registering...' : 'Register'}</Text>
        </Pressable>

        <View style={styles.loginLink}>
          <Text style={styles.helperText}>Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="button">
            <Text style={styles.linkText}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#f1f5f9', padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 18 },
  label: { color: '#334155', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  loginLink: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  helperText: { color: '#64748b' },
  linkText: { marginLeft: 4, color: '#1d4ed8', fontWeight: '700' },
});
