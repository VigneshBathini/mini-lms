import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LessonsScreen from '../../../src/features/courses/LessonsScreen';

const safeParse = <T,>(value?: string): T | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export default function LessonsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ module?: string }>();

  const module = safeParse<{ id?: string; title?: string }>(
    params.module ? String(params.module) : undefined
  );

  const navigation = {
    navigate: (name: string, navParams?: Record<string, unknown>) => {
      if (name === 'LessonDetails') {
        router.push({
          pathname: '/(tabs)/courses/lesson-details',
          params: { lesson: JSON.stringify(navParams?.lesson ?? null) },
        });
      }
    },
  };

  const route = { params: { module } };

  return <LessonsScreen navigation={navigation} route={route} />;
}
