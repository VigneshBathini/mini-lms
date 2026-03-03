import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useCourseStore } from '../../store/courseStore';
import { useCourseMediaStore } from '../../store/courseMediaStore';
import { courseService } from '../../services/api/courseService';

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

  const toggleBookmark = async () => {
    try {
      await toggleBookmarkStore(courseId);
    } catch (err) {
      console.error('bookmark error', err);
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
      console.error('Enroll error:', err);
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
      style={styles.lessonCard}
      onPress={() => navigation.navigate('LessonDetails', { lesson: item })}
    >
      <Text style={styles.lessonTitle}>{item.title}</Text>
      <Text style={styles.lessonDuration}>Duration: {item.duration}</Text>
    </TouchableOpacity>
  );

  const isBookmarked = bookmarks.includes(courseId);
  const capturedPhotos = photosByCourse[courseId] || [];

  useEffect(() => {
    setEnrolled(enrolledCourses.includes(courseId));
  }, [enrolledCourses, courseId]);

  if (!courseId) {
    return (
      <View style={styles.centered}>
        <Text>Invalid course id.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !course) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load course details.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} className="flex-1 bg-slate-50">
      <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.courseTitle}>{course.title}</Text>
      <Text style={styles.instructor}>Instructor: {course.instructor}</Text>
      <Text style={styles.description}>{course.description}</Text>
      <Text style={styles.progress}>Progress: {course.progress ?? 0}%</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleEnroll}
          style={[styles.button, enrolled && styles.disabledButton]}
          disabled={enrolled}
        >
          <Text style={styles.buttonText}>{enrolled ? 'Enrolled' : 'Enroll'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleBookmark} style={styles.button}>
          <Text style={styles.buttonText}>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</Text>
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
          style={styles.button}
        >
          <Text style={styles.buttonText}>View Content</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCaptureCoursePhoto} style={styles.button}>
          <Text style={styles.buttonText}>Capture Note Photo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.mediaHeader}>Course Snapshots</Text>
      {capturedPhotos.length === 0 ? (
        <Text style={styles.emptyLessons}>No snapshots yet. Capture one from camera.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
          {capturedPhotos.map((uri, index) => (
            <Image key={`${uri}-${index}`} source={{ uri }} style={styles.photoItem} />
          ))}
        </ScrollView>
      )}

      <Text style={styles.lessonsHeader}>Lessons</Text>
      {(course.lessons || []).length === 0 ? (
        <Text style={styles.emptyLessons}>No lessons available for this course yet.</Text>
      ) : (
        <FlatList
          data={course.lessons || []}
          keyExtractor={(item) => item.id}
          renderItem={renderLesson}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thumbnail: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#e2e8f0',
  },
  courseTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8, color: '#0f172a' },
  instructor: { fontSize: 16, color: '#64748b', marginBottom: 12 },
  description: { fontSize: 14, color: '#333', marginBottom: 16 },
  progress: { color: '#1d4ed8', fontWeight: '600', marginBottom: 12 },
  buttonsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  button: {
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  disabledButton: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  lessonsHeader: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#0f172a' },
  lessonCard: {
    padding: 12,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  lessonTitle: { fontSize: 16, fontWeight: 'bold' },
  lessonDuration: { fontSize: 14, color: '#64748b', marginTop: 4 },
  mediaHeader: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#0f172a' },
  photoStrip: { marginBottom: 16 },
  photoItem: {
    width: 110,
    height: 110,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#e2e8f0',
  },
  emptyLessons: { color: '#666', marginTop: 8 },
});
