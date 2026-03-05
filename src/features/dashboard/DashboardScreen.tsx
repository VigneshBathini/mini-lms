import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';

type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <View className="mb-2.5 w-[48%] rounded-xl border border-slate-200 bg-white px-3 py-3.5">
      <Text className="text-xl font-bold text-slate-900">{value}</Text>
      <Text className="mt-1 text-slate-500">{label}</Text>
    </View>
  );
}

type CourseRowProps = {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  onPress: (courseId: string) => void;
};

function CourseRow({ id, title, instructor, progress, onPress }: CourseRowProps) {
  return (
    <Pressable
      className="mb-2 rounded-xl bg-slate-50 p-2.5"
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={`Open course ${title}`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="mr-2 flex-1 font-semibold text-slate-800" numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-bold text-blue-700">{progress}%</Text>
      </View>
      <Text className="mb-2 mt-0.5 text-slate-500" numberOfLines={1}>
        {instructor}
      </Text>
      <View className="h-2 w-full overflow-hidden rounded-full bg-slate-300">
        <View className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const courses = useCourseStore((state) => state.courses);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const enrolled = useCourseStore((state) => state.enrolled);
  const loadCourses = useCourseStore((state) => state.loadCourses);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      try {
        await loadCourses();
      } catch (err: any) {
        setError(err?.message || 'Could not load dashboard data.');
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [loadCourses]
  );

  useEffect(() => {
    if (courses.length === 0) {
      fetchCourses();
    }
  }, [courses.length, fetchCourses]);

  const enrolledCourses = useMemo(
    () => courses.filter((course) => enrolled.includes(course.id)),
    [courses, enrolled]
  );

  const bookmarkedCourses = useMemo(
    () => courses.filter((course) => bookmarks.includes(course.id)),
    [courses, bookmarks]
  );

  const averageProgress = useMemo(() => {
    if (enrolledCourses.length === 0) {
      return 0;
    }
    return Math.round(
      enrolledCourses.reduce((sum, course) => sum + (course.progress ?? 0), 0) / enrolledCourses.length
    );
  }, [enrolledCourses]);

  const completedCourses = useMemo(
    () => enrolledCourses.filter((course) => (course.progress ?? 0) >= 100).length,
    [enrolledCourses]
  );

  const continueLearning = useMemo(
    () =>
      [...enrolledCourses]
        .filter((course) => (course.progress ?? 0) < 100)
        .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
        .slice(0, 3),
    [enrolledCourses]
  );

  const recommended = useMemo(
    () => courses.filter((course) => !enrolled.includes(course.id)).slice(0, 3),
    [courses, enrolled]
  );

  const openCourse = (courseId: string) => {
    router.push({ pathname: '/(tabs)/courses/course-details', params: { courseId } });
  };

  if (loading && courses.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchCourses(true)} />}
    >
      <View className="mb-4">
        <Text className="text-3xl font-bold text-slate-900">Welcome back{user?.name ? `, ${user.name}` : ''}</Text>
        <Text className="mt-1.5 text-slate-600">Track your learning and jump back into your courses.</Text>
      </View>

      <View className="mb-4 flex-row flex-wrap justify-between">
        <StatCard label="Enrolled" value={enrolledCourses.length} />
        <StatCard label="Bookmarked" value={bookmarks.length} />
        <StatCard label="Avg Progress" value={`${averageProgress}%`} />
        <StatCard label="Completed" value={completedCourses} />
      </View>

      <View className="mb-3 flex-row">
        <Pressable
          className="mr-2 flex-1 items-center rounded-xl bg-slate-900 py-3"
          onPress={() => router.push('/(tabs)/courses')}
          accessibilityRole="button"
          accessibilityLabel="Browse courses"
        >
          <Text className="font-semibold text-white">Browse Courses</Text>
        </Pressable>
        <Pressable
          className="ml-2 flex-1 items-center rounded-xl bg-slate-200 py-3"
          onPress={() => router.push('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Text className="font-semibold text-slate-900">Profile</Text>
        </Pressable>
      </View>

      {error ? <Text className="mb-3 text-red-700">{error}</Text> : null}

      <View className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
        <Text className="mb-2 text-base font-bold text-slate-900">Continue Learning</Text>
        {continueLearning.length === 0 ? (
          <Text className="text-slate-500">Enroll in a course to start learning.</Text>
        ) : (
          continueLearning.map((course) => (
            <CourseRow
              key={course.id}
              id={course.id}
              title={course.title}
              instructor={course.instructor}
              progress={course.progress ?? 0}
              onPress={openCourse}
            />
          ))
        )}
      </View>

      <View className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
        <Text className="mb-2 text-base font-bold text-slate-900">Bookmarked</Text>
        {bookmarkedCourses.length === 0 ? (
          <Text className="text-slate-500">You have no bookmarked courses yet.</Text>
        ) : (
          bookmarkedCourses.slice(0, 3).map((course) => (
            <CourseRow
              key={course.id}
              id={course.id}
              title={course.title}
              instructor={course.instructor}
              progress={course.progress ?? 0}
              onPress={openCourse}
            />
          ))
        )}
      </View>

      <View className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
        <Text className="mb-2 text-base font-bold text-slate-900">Recommended For You</Text>
        {recommended.length === 0 ? (
          <Text className="text-slate-500">You are enrolled in all available courses.</Text>
        ) : (
          recommended.map((course) => (
            <CourseRow
              key={course.id}
              id={course.id}
              title={course.title}
              instructor={course.instructor}
              progress={course.progress ?? 0}
              onPress={openCourse}
            />
          ))
        )}
      </View>

      <Pressable
        className="mt-1 rounded-xl bg-red-100 py-3"
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <Text className="text-center font-bold text-red-700">Logout</Text>
      </Pressable>
    </ScrollView>
  );
}
