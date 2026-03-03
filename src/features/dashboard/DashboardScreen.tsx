import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function DashboardScreen() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Dashboard</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}