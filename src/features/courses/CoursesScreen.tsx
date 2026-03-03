import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Text,
  Button,
} from 'react-native';
import { LegendList, LegendListRenderItemProps } from '@legendapp/list';

import CourseCard from '../../components/CourseCard';
import { useCourseStore } from '../../store/courseStore';
import { Course } from '../../types/course';

export default function CoursesScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courses = useCourseStore((state) => state.courses);
  const loadCourses = useCourseStore((state) => state.loadCourses);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);

  const filteredCourses = useMemo(
    () => courses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase())),
    [courses, search]
  );

  const loadInitialCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadCourses();
    } catch (err: any) {
      setError(err?.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, [loadCourses]);

  useEffect(() => {
    loadInitialCourses();
  }, [loadInitialCourses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await loadCourses();
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh courses.');
    } finally {
      setRefreshing(false);
    }
  }, [loadCourses]);

  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Course>) => {
      const isBookmarked = bookmarks.includes(item.id);
      return (
        <CourseCard
          course={item}
          isBookmarked={isBookmarked}
          onBookmark={() => toggleBookmark(item.id)}
          onPress={() => navigation.navigate('CourseDetails', { courseId: item.id, course: item })}
        />
      );
    },
    [bookmarks, navigation, toggleBookmark]
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && filteredCourses.length === 0) {
    return (
      <View style={styles.loader}>
        <Text>{error}</Text>
        <Button title="Retry" onPress={loadInitialCourses} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search courses..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <LegendList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        estimatedItemSize={230}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  search: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
