import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';

type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    <Pressable style={styles.courseRow} onPress={() => onPress(id)}>
      <View style={styles.courseHeader}>
        <Text style={styles.courseTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
      <Text style={styles.courseInstructor} numberOfLines={1}>
        {instructor}
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
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

  const fetchCourses = useCallback(async (isRefresh = false) => {
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
  }, [loadCourses]);

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchCourses(true)} />
      }
    >
      <View style={styles.header} className="mb-4">
        <Text style={styles.greeting} className="text-slate-900">Welcome back{user?.name ? `, ${user.name}` : ''}</Text>
        <Text style={styles.subtext} className="text-slate-600">Track your learning and jump back into your courses.</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Enrolled" value={enrolledCourses.length} />
        <StatCard label="Bookmarked" value={bookmarks.length} />
        <StatCard label="Avg Progress" value={`${averageProgress}%`} />
        <StatCard label="Completed" value={completedCourses} />
      </View>

      <View style={styles.quickActions}>
        <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/courses')}>
          <Text style={styles.actionText}>Browse Courses</Text>
        </Pressable>
        <Pressable style={styles.actionButtonSecondary} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.actionTextSecondary}>Profile</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Continue Learning</Text>
        {continueLearning.length === 0 ? (
          <Text style={styles.emptyText}>Enroll in a course to start learning.</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bookmarked</Text>
        {bookmarkedCourses.length === 0 ? (
          <Text style={styles.emptyText}>You have no bookmarked courses yet.</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended For You</Text>
        {recommended.length === 0 ? (
          <Text style={styles.emptyText}>You are enrolled in all available courses.</Text>
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

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 18,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtext: {
    marginTop: 6,
    color: '#475569',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    marginTop: 4,
    color: '#64748b',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  actionTextSecondary: {
    color: '#0f172a',
    fontWeight: '600',
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 12,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748b',
  },
  courseRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  courseTitle: {
    flex: 1,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  courseInstructor: {
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#cbd5e1',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  logoutButton: {
    marginTop: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
});
