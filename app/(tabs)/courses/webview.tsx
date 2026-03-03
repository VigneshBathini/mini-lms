import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import WebViewScreen from '../../../src/features/webview/WebViewScreen';

export default function WebViewRoute() {
  const params = useLocalSearchParams<{
    courseId?: string;
    title?: string;
    thumbnail?: string;
    instructor?: string;
    description?: string;
  }>();
  const route = {
    params: {
      courseId: String(params.courseId ?? ''),
      title: String(params.title ?? ''),
      thumbnail: String(params.thumbnail ?? ''),
      instructor: String(params.instructor ?? ''),
      description: String(params.description ?? ''),
    },
  };

  return <WebViewScreen route={route} />;
}
