import React from 'react';
import { useRouter } from 'expo-router';
import RegisterScreen from '../../src/features/auth/RegisterScreen';

export default function RegisterRoute() {
  const router = useRouter();

  return <RegisterScreen navigation={{ navigate: () => router.push('/(auth)/login') }} />;
}
