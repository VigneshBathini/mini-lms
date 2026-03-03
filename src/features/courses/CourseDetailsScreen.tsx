import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCourseStore } from '../../store/courseStore';
import { courseService } from '../../services/api/courseService';

export default function CourseDetailsScreen({ route, navigation }: any) {
  const courseId = String(route?.params?.courseId ?? route?.params?.course?.id ?? '');
  const queryClient = useQueryClient();

  const bookmarks = useCourseStore((state) => state.bookmarks);
  const enrolledCourses = useCourseStore((state) => state.enrolled);
  const toggleBookmarkStore = useCourseStore((state) => state.toggleBookmark);
  const enrollCourseStore = useCourseStore((state) => state.enrollCourse);
  const [enrolled, setEnrolled] = useState(false);
  // no need for storageLoaded now

  // Fetch course details (modules + lessons)
  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseDetails(courseId),
    enabled: Boolean(courseId),
  });

  // toggle bookmark using global store
  const toggleBookmark = async () => {
    try {
      await toggleBookmarkStore(courseId);
    } catch (err) {
      console.error('bookmark error', err);
      Alert.alert('Error', 'Could not update bookmarks');
    }
  };

  // Enroll mutation
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
    if (!enrolled) enrollMutation.mutate();
  };

  // Render lessons
  const renderLesson = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() =>
        navigation.navigate('LessonDetails', { lesson: item })
      }
    >
      <Text style={styles.lessonTitle}>{item.title}</Text>
      <Text style={styles.lessonDuration}>Duration: {item.duration}</Text>
    </TouchableOpacity>
  );

  const isBookmarked = bookmarks.includes(courseId);

  useEffect(() => {
    setEnrolled(enrolledCourses.includes(courseId));
  }, [enrolledCourses, courseId]);

  if (!courseId) return <Text style={{ marginTop: 40 }}>Invalid course id.</Text>;
  if (isLoading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  if (isError || !course) return <Text style={{ marginTop: 40 }}>Failed to load course details.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.courseTitle}>{course.title}</Text>
      <Text style={styles.instructor}>Instructor: {course.instructor}</Text>
      <Text style={styles.description}>{course.description}</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleEnroll}
          style={[styles.button, enrolled && styles.disabledButton]}
          disabled={enrolled}
        >
          <Text style={styles.buttonText}>{enrolled ? 'Enrolled ✅' : 'Enroll'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleBookmark} style={styles.button}>
          <Text style={styles.buttonText}>
            {isBookmarked ? 'Bookmarked 🔖' : 'Bookmark 📑'}
          </Text>
        </TouchableOpacity>

        {course && (
          <TouchableOpacity
            onPress={() => navigation.navigate('WebView', { courseId })}
            style={styles.button}
          >
            <Text style={styles.buttonText}>View Content</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.lessonsHeader}>Lessons</Text>
      <FlatList
  data={course.lessons || []} // fallback to empty array
  keyExtractor={(item) => item.id}
  renderItem={renderLesson}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  courseTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  instructor: { fontSize: 16, color: '#666', marginBottom: 12 },
  description: { fontSize: 14, color: '#333', marginBottom: 16 },
  buttonsContainer: { flexDirection: 'row', marginBottom: 16 },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  disabledButton: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  lessonsHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  lessonCard: {
    padding: 12,
    backgroundColor: '#f7f7f7',
    marginBottom: 8,
    borderRadius: 10,
  },
  lessonTitle: { fontSize: 16, fontWeight: 'bold' },
  lessonDuration: { fontSize: 14, color: '#666', marginTop: 4 },
});
