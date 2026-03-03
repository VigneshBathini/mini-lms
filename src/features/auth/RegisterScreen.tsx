import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
      className="flex-1 justify-center bg-slate-100 p-4"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="rounded-2xl border border-slate-200 bg-white p-5">
        <Text className="mb-2 text-3xl font-bold text-slate-900">Create Account</Text>
        <Text className="mb-5 text-sm text-slate-500">Set up your account to start learning.</Text>

        <Text className="mb-1.5 font-semibold text-slate-700">Name</Text>
        <TextInput
          placeholder="Your full name"
          value={name}
          onChangeText={setName}
          className="mb-3 rounded-xl border border-slate-300 bg-slate-50 p-3"
          textContentType="name"
          accessibilityLabel="Name input"
        />

        <Text className="mb-1.5 font-semibold text-slate-700">Email</Text>
        <TextInput
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          className="mb-3 rounded-xl border border-slate-300 bg-slate-50 p-3"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          accessibilityLabel="Email input"
        />

        <Text className="mb-1.5 font-semibold text-slate-700">Password</Text>
        <TextInput
          placeholder="Create password"
          value={password}
          onChangeText={setPassword}
          className="mb-3 rounded-xl border border-slate-300 bg-slate-50 p-3"
          secureTextEntry
          textContentType="newPassword"
          accessibilityLabel="Password input"
        />

        <Pressable
          className={`mt-1 items-center rounded-xl py-3 ${loading ? 'bg-slate-500' : 'bg-slate-900'}`}
          onPress={handleRegister}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Register"
        >
          <Text className="font-bold text-white">{loading ? 'Registering...' : 'Register'}</Text>
        </Pressable>

        <View className="mt-4 flex-row items-center justify-center">
          <Text className="text-slate-500">Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="button">
            <Text className="ml-1 font-bold text-blue-700">Sign in</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
