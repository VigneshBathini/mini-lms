import React from 'react';
import { Stack } from 'expo-router';

export default function CoursesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0f172a',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Courses' }} />
      <Stack.Screen name="course-details" options={{ title: 'Details' }} />
      <Stack.Screen name="lessons" options={{ title: 'Lessons' }} />
      <Stack.Screen name="lesson-details" options={{ title: 'Lesson' }} />
      <Stack.Screen name="webview" options={{ title: 'Content' }} />
    </Stack>
  );
}
