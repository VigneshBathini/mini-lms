import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const insets = useSafeAreaInsets();
  if (isOnline) return null;
  return (
    <View style={[styles.banner, { paddingTop: Math.max(6, insets.top) }]}>
      <Text style={styles.text}>You're offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ff3b30',
    padding: 6,
  },
  text: { color: '#fff', textAlign: 'center' },
});
