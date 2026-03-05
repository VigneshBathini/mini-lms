import React from 'react';
import { View } from 'react-native';

interface Props {
  progress: number; // 0–100
}

export default function ProgressBar({ progress }: Props) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  return (
    <View className="mt-2 h-2 overflow-hidden rounded-md bg-slate-200">
      <View className="h-full bg-blue-500" style={{ width: `${safeProgress}%` }} />
    </View>
  );
}
