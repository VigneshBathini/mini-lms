import React from 'react';
import { useRouter } from 'expo-router';
import LoginScreen from '../../src/features/auth/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  return <LoginScreen navigation={{ navigate: () => router.push('/(auth)/register') }} />;
}
