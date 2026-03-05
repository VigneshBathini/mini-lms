import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useCourseStore } from '../../store/courseStore';
import { useCourseMediaStore } from '../../store/courseMediaStore';
import { courseService } from '../../services/api/courseService';
import { reportError } from '../../services/errorReporter';

export default function CourseDetailsScreen({ route, navigation }: any) {
  const courseId = String(route?.params?.courseId ?? route?.params?.course?.id ?? '');
  const queryClient = useQueryClient();

  const bookmarks = useCourseStore((state) => state.bookmarks);
  const enrolledCourses = useCourseStore((state) => state.enrolled);
  const toggleBookmarkStore = useCourseStore((state) => state.toggleBookmark);
  const enrollCourseStore = useCourseStore((state) => state.enrollCourse);
  const [enrolled, setEnrolled] = useState(false);
  const photosByCourse = useCourseMediaStore((state) => state.photosByCourse);
  const addPhoto = useCourseMediaStore((state) => state.addPhoto);

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseDetails(courseId),
    enabled: Boolean(courseId),
  });
  const { data: modules = [] } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => courseService.getModules(courseId),
    enabled: Boolean(courseId),
  });

  const toggleBookmark = async () => {
    try {
      await toggleBookmarkStore(courseId);
    } catch (err) {
      reportError('courseDetails.toggleBookmark', err);
      Alert.alert('Error', 'Could not update bookmarks');
    }
  };

  const enrollMutation = useMutation({
    mutationFn: () => courseService.enrollCourse(courseId),
    onSuccess: async () => {
      setEnrolled(true);
      await enrollCourseStore(courseId);
      Alert.alert('Success', 'Enrolled in course!');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
    onError: (err) => {
      reportError('courseDetails.enroll', err);
      Alert.alert('Error', 'Failed to enroll');
    },
  });

  const handleEnroll = () => {
    if (!enrolled) {
      enrollMutation.mutate();
    }
  };

  const handleCaptureCoursePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to capture notes.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await addPhoto(courseId, result.assets[0].uri);
      Alert.alert('Saved', 'Course note photo captured successfully.');
    }
  };

  const renderLesson = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="mb-2 rounded-xl border border-slate-200 bg-white p-3"
      onPress={() => navigation.navigate('LessonDetails', { lesson: item })}
      accessibilityRole="button"
      accessibilityLabel={`Open lesson ${item.title}`}
    >
      <Text className="text-base font-bold">{item.title}</Text>
      <Text className="mt-1 text-sm text-slate-500">Duration: {item.duration}</Text>
    </TouchableOpacity>
  );

  const isBookmarked = bookmarks.includes(courseId);
  const capturedPhotos = photosByCourse[courseId] || [];

  useEffect(() => {
    setEnrolled(enrolledCourses.includes(courseId));
  }, [enrolledCourses, courseId]);

  if (!courseId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Invalid course id.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !course) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Failed to load course details.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Image source={{ uri: course.thumbnail }} className="mb-3 h-48 w-full rounded-xl bg-slate-200" />
      <Text className="mb-2 text-2xl font-bold text-slate-900">{course.title}</Text>
      <Text className="mb-2 text-base text-slate-500">Instructor: {course.instructor}</Text>
      <Text className="mb-4 text-sm text-slate-700">{course.description}</Text>
      <Text className="mb-3 font-semibold text-blue-700">Progress: {course.progress ?? 0}%</Text>

      <View className="mb-4 flex-row flex-wrap">
        <TouchableOpacity
          onPress={handleEnroll}
          className={`mb-2 mr-2 rounded-lg px-3 py-2 ${enrolled ? 'bg-slate-400' : 'bg-slate-900'}`}
          disabled={enrolled}
          accessibilityRole="button"
          accessibilityLabel={enrolled ? 'Already enrolled' : 'Enroll in this course'}
        >
          <Text className="font-bold text-white">{enrolled ? 'Enrolled' : 'Enroll'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleBookmark}
          className="mb-2 mr-2 rounded-lg bg-slate-900 px-3 py-2"
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark this course'}
        >
          <Text className="font-bold text-white">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('WebView', {
              courseId,
              title: course.title,
              thumbnail: course.thumbnail,
              instructor: course.instructor,
              description: course.description || '',
            })
          }
          className="mb-2 mr-2 rounded-lg bg-slate-900 px-3 py-2"
          accessibilityRole="button"
          accessibilityLabel="Open course content web view"
        >
          <Text className="font-bold text-white">View Content</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCaptureCoursePhoto}
          className="mb-2 mr-2 rounded-lg bg-slate-900 px-3 py-2"
          accessibilityRole="button"
          accessibilityLabel="Capture a note photo for this course"
        >
          <Text className="font-bold text-white">Capture Note Photo</Text>
        </TouchableOpacity>
      </View>

      <Text className="mb-2 text-lg font-bold text-slate-900">Modules</Text>
      {modules.length === 0 ? (
        <Text className="mb-4 text-slate-500">No modules available for this course yet.</Text>
      ) : (
        <View className="mb-4">
          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              className="mb-2 rounded-xl border border-slate-200 bg-white p-3"
              onPress={() => navigation.navigate('Lessons', { module })}
              accessibilityRole="button"
              accessibilityLabel={`Open module ${module.title} lessons`}
            >
              <Text className="text-base font-bold text-slate-900">{module.title}</Text>
              <Text className="mt-1 text-sm text-slate-500">{module.lessons} lessons</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text className="mb-2 text-lg font-bold text-slate-900">Course Snapshots</Text>
      {capturedPhotos.length === 0 ? (
        <Text className="mt-1 text-slate-500">No snapshots yet. Capture one from camera.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {capturedPhotos.map((uri, index) => (
            <Image key={`${uri}-${index}`} source={{ uri }} className="mr-2.5 h-28 w-28 rounded-xl bg-slate-200" />
          ))}
        </ScrollView>
      )}

      <Text className="mb-2 text-xl font-bold text-slate-900">Lessons</Text>
      {(course.lessons || []).length === 0 ? (
        <Text className="mt-1 text-slate-500">No lessons available for this course yet.</Text>
      ) : (
        <View>
          {(course.lessons || []).map((lesson) => (
            <View key={lesson.id}>{renderLesson({ item: lesson })}</View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
