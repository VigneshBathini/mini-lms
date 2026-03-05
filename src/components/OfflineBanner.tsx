import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const insets = useSafeAreaInsets();
  if (isOnline) return null;
  return (
    <View className="bg-red-500 p-1.5" style={{ paddingTop: Math.max(6, insets.top) }}>
      <Text className="text-center text-white">You're offline</Text>
    </View>
  );
}
