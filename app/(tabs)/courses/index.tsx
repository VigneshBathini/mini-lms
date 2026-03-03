import React from 'react';
import { useRouter } from 'expo-router';
import CoursesScreen from '../../../src/features/courses/CoursesScreen';

export default function CoursesRoute() {
  const router = useRouter();

  return (
    <CoursesScreen
      navigation={{
        navigate: (_name: string, params: { courseId?: string }) => {
          router.push({ pathname: '/(tabs)/courses/course-details', params: { courseId: params?.courseId || '' } });
        },
      }}
    />
  );
}
