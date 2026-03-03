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

export default function LoginScreen({ navigation }: any) {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Unknown error');
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
        <Text className="mb-2 text-3xl font-bold text-slate-900">Welcome Back</Text>
        <Text className="mb-5 text-sm text-slate-500">Sign in to continue your learning journey.</Text>

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
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          className="mb-3 rounded-xl border border-slate-300 bg-slate-50 p-3"
          secureTextEntry
          textContentType="password"
          accessibilityLabel="Password input"
        />

        <Pressable
          className={`mt-1 items-center rounded-xl py-3 ${loading ? 'bg-slate-500' : 'bg-slate-900'}`}
          onPress={handleLogin}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Login"
        >
          <Text className="font-bold text-white">{loading ? 'Logging in...' : 'Login'}</Text>
        </Pressable>

        <View className="mt-4 flex-row items-center justify-center">
          <Text className="text-slate-500">Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Register')} accessibilityRole="button">
            <Text className="ml-1 font-bold text-blue-700">Create one</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
