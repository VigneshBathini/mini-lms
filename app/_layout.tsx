import React, { useEffect } from 'react';
import '../global.css';
import { ActivityIndicator, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OfflineBanner from '../src/components/OfflineBanner';
import AppErrorBoundary from '../src/components/AppErrorBoundary';
import { useAuthStore } from '../src/store/authStore';
import { useCourseStore } from '../src/store/courseStore';
import { useCourseMediaStore } from '../src/store/courseMediaStore';
import { usePreferencesStore } from '../src/store/preferencesStore';
import {
  cancelAllScheduled,
  initializeNotifications,
  requestNotificationPermissions,
  scheduleLocalNotification,
} from '../src/services/notifications';

const queryClient = new QueryClient();

function AppBootstrap() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const loadCourseStore = useCourseStore((state) => state.loadFromStorage);
  const loadCourseMediaStore = useCourseMediaStore((state) => state.loadFromStorage);
  const loadPreferencesStore = usePreferencesStore((state) => state.loadFromStorage);
  const remindersEnabled = usePreferencesStore((state) => state.remindersEnabled);

  useEffect(() => {
    const init = async () => {
      await Promise.all([restoreSession(), loadCourseStore(), loadCourseMediaStore(), loadPreferencesStore()]);

      try {
        if (!remindersEnabled) {
          await cancelAllScheduled();
          return;
        }

        await initializeNotifications();
        const granted = await requestNotificationPermissions();
        if (!granted) {
          return;
        }

        const now = Date.now();
        await AsyncStorage.setItem('last_opened', String(now));
        await cancelAllScheduled();
        await scheduleLocalNotification('We miss you', "It's been a day since you opened the app", {
          seconds: 24 * 3600,
          repeats: false,
        });
      } catch {
        // Notification APIs are optional per runtime (e.g., Expo Go on SDK 53+).
      }
    };

    init();
  }, [restoreSession, loadCourseStore, loadCourseMediaStore, loadPreferencesStore, remindersEnabled]);

  return null;
}

export default function RootLayout() {
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary>
          <AppBootstrap />
          <OfflineBanner />
          {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <Stack screenOptions={{ headerShown: false }} />
          )}
        </AppErrorBoundary>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
