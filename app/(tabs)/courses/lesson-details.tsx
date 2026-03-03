import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import LessonDetailsScreen from '../../../src/features/courses/LessonDetailsScreen';

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

export default function LessonDetailsRoute() {
  const params = useLocalSearchParams<{ lesson?: string }>();
  const parsedLesson = safeParse<{
    id: string;
    title: string;
    duration: string;
    videoUrl: string;
  }>(params.lesson ? String(params.lesson) : undefined);

  const route = {
    params: {
      lesson:
        parsedLesson || {
          id: 'fallback-lesson',
          title: 'Lesson',
          duration: '0:00',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
    },
  };

  return <LessonDetailsScreen route={route} />;
}
