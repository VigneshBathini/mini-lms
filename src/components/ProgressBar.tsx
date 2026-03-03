import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  progress: number; // 0–100
}

export default function ProgressBar({ progress }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${progress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
  },
  fill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
});