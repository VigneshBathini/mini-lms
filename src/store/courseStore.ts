import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { retryRequest } from '../services/api/retry';
import { scheduleLocalNotification } from '../services/notifications';
import { courseService } from '../services/api/courseService';
import { Course } from '../types/course';

interface CourseStore {
  courses: Course[];
  bookmarks: string[];
  enrolled: string[];
  bookmarkMilestoneNotified: boolean;
  loadCourses: () => Promise<void>;
  addBookmark: (id: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  toggleBookmark: (id: string) => Promise<void>;
  enrollCourse: (id: string) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

type PersistedCourseState = Pick<CourseStore, 'courses' | 'bookmarks' | 'enrolled' | 'bookmarkMilestoneNotified'>;

const STORAGE_KEY = 'course_store';

const persistCourseState = async (state: PersistedCourseState) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: [],
  bookmarks: [],
  enrolled: [],
  bookmarkMilestoneNotified: false,

  addBookmark: async (id) => {
    const { bookmarks, courses, enrolled, bookmarkMilestoneNotified } = get();
    if (!bookmarks.includes(id)) {
      const updatedBookmarks = [...bookmarks, id];
      set({ bookmarks: updatedBookmarks });
      await persistCourseState({
        courses,
        bookmarks: updatedBookmarks,
        enrolled,
        bookmarkMilestoneNotified,
      });
    }
  },

  removeBookmark: async (id) => {
    const { bookmarks, courses, enrolled, bookmarkMilestoneNotified } = get();
    const updatedBookmarks = bookmarks.filter((bookmarkId) => bookmarkId !== id);
    set({ bookmarks: updatedBookmarks });
    await persistCourseState({
      courses,
      bookmarks: updatedBookmarks,
      enrolled,
      bookmarkMilestoneNotified,
    });
  },

  toggleBookmark: async (id) => {
    const { bookmarks, bookmarkMilestoneNotified } = get();

    if (bookmarks.includes(id)) {
      await get().removeBookmark(id);
      return;
    }

    await get().addBookmark(id);

    const newBookmarkCount = bookmarks.length + 1;
    if (newBookmarkCount >= 5 && !bookmarkMilestoneNotified) {
      await scheduleLocalNotification('Nice job!', 'You have bookmarked 5 courses.', { seconds: 2 });

      const nextState: PersistedCourseState = {
        courses: get().courses,
        bookmarks: get().bookmarks,
        enrolled: get().enrolled,
        bookmarkMilestoneNotified: true,
      };

      set({ bookmarkMilestoneNotified: true });
      await persistCourseState(nextState);
    }
  },

  loadCourses: async () => {
    try {
      const courses = await retryRequest(() => courseService.getCourses());
      set({ courses });

      await persistCourseState({
        courses,
        bookmarks: get().bookmarks,
        enrolled: get().enrolled,
        bookmarkMilestoneNotified: get().bookmarkMilestoneNotified,
      });
    } catch (error) {
      console.error('failed to load courses', error);
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored) as Partial<PersistedCourseState>;
        if (parsed.courses) {
          set({ courses: parsed.courses });
        }
      } catch {
        // no-op: keep current in-memory state on storage parse/read errors
      }
    }
  },

  enrollCourse: async (id) => {
    const { enrolled, courses, bookmarks, bookmarkMilestoneNotified } = get();
    if (!enrolled.includes(id)) {
      const updatedEnrolled = [...enrolled, id];
      set({ enrolled: updatedEnrolled });
      await persistCourseState({
        courses,
        bookmarks,
        enrolled: updatedEnrolled,
        bookmarkMilestoneNotified,
      });
    }
  },

  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as Partial<PersistedCourseState>;
      set({
        bookmarks: parsed.bookmarks || [],
        enrolled: parsed.enrolled || [],
        courses: parsed.courses || [],
        bookmarkMilestoneNotified: Boolean(parsed.bookmarkMilestoneNotified),
      });
    } catch (error) {
      console.warn('failed to load course store', error);
    }
  },
}));
