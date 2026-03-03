import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TextInput,
  ActivityIndicator,
  Text,
  Pressable,
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
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && filteredCourses.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="mb-3 text-center text-slate-700">{error}</Text>
        <Pressable className="rounded-lg bg-slate-900 px-4 py-2" onPress={loadInitialCourses}>
          <Text className="font-semibold text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <TextInput
        placeholder="Search courses..."
        value={search}
        onChangeText={setSearch}
        className="mb-4 rounded-xl border border-slate-200 bg-white p-3"
        accessibilityLabel="Search courses"
      />
      {filteredCourses.length === 0 ? (
        <View className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
          <Text className="font-bold text-slate-900">No matching courses</Text>
          <Text className="mt-1 text-slate-500">Try a different keyword or clear your search.</Text>
          <Pressable className="mt-2.5 self-start rounded-lg bg-slate-200 px-3 py-2" onPress={() => setSearch('')}>
            <Text className="font-semibold text-slate-900">Clear search</Text>
          </Pressable>
        </View>
      ) : null}

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
