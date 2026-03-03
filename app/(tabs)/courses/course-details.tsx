import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CourseDetailsScreen from '../../../src/features/courses/CourseDetailsScreen';

export default function CourseDetailsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string }>();

  const navigation = {
    navigate: (name: string, navParams?: Record<string, unknown>) => {
      if (name === 'LessonDetails') {
        router.push({
          pathname: '/(tabs)/courses/lesson-details',
          params: { lesson: JSON.stringify(navParams?.lesson ?? null) },
        });
        return;
      }

      if (name === 'WebView') {
        router.push({
          pathname: '/(tabs)/courses/webview',
          params: {
            courseId: String(navParams?.courseId ?? params.courseId ?? ''),
            title: String(navParams?.title ?? ''),
            thumbnail: String(navParams?.thumbnail ?? ''),
            instructor: String(navParams?.instructor ?? ''),
            description: String(navParams?.description ?? ''),
          },
        });
        return;
      }

      if (name === 'Lessons') {
        router.push({
          pathname: '/(tabs)/courses/lessons',
          params: { module: JSON.stringify(navParams?.module ?? null) },
        });
      }
    },
  };

  const route = { params: { courseId: String(params.courseId ?? '') } };

  return <CourseDetailsScreen navigation={navigation} route={route} />;
}
