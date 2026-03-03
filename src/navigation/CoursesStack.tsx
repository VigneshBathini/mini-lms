import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CoursesScreen from '../features/courses/CoursesScreen';
import CourseDetailsScreen from '../features/courses/CourseDetailsScreen';
import LessonDetailsScreen from '@/features/courses/LessonDetailsScreen';
import LessonsScreen from '@/features/courses/LessonsScreen';
import WebViewScreen from '../features/webview/WebViewScreen';

const Stack = createNativeStackNavigator();

export default function CoursesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CoursesList" component={CoursesScreen} options={{ title: 'Courses' }} />
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} options={{ title: 'Details' }} />
      <Stack.Screen name="Lessons" component={LessonsScreen} />
      <Stack.Screen name="LessonDetails" component={LessonDetailsScreen} />
      <Stack.Screen name="WebView" component={WebViewScreen} options={{ title: 'Content' }} />
    </Stack.Navigator>
  );
}