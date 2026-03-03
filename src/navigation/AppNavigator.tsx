import React, { useEffect } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermissions, scheduleLocalNotification, cancelAllScheduled, initializeNotifications } from '../services/notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isOnline = useNetworkStatus();

  const loadCourseStore = useCourseStore((state) => state.loadFromStorage);

  useEffect(() => {
    const init = async () => {
      await Promise.all([restoreSession(), loadCourseStore()]);

      // notifications - wrapped in try-catch to handle runtime errors
      try {
        await initializeNotifications();
        const granted = await requestNotificationPermissions();
        if (granted) {
          // schedule reminder for inactivity
          try {
            const now = Date.now();
            await AsyncStorage.setItem('last_opened', String(now));

            // clear previous reminders to avoid duplicates
            await cancelAllScheduled();

            // schedule 24h reminder from now
            await scheduleLocalNotification(
              'We miss you',
              "It's been a day since you opened the app",
              { seconds: 24 * 3600, repeats: false }
            );
          } catch (e) {
            console.warn('error scheduling inactivity reminder', e);
          }
        }
      } catch (e) {
        console.warn('error initializing notifications', e);
      }
    };
    init();
  }, [restoreSession, loadCourseStore]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      {!isOnline && (
        <View style={{ backgroundColor: '#ff3b30', padding: 6 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>You're offline</Text>
        </View>
      )}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          // authentication flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
