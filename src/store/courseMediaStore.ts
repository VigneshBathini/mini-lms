import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { create } from 'zustand';

const STORAGE_KEY = 'course_media_store';
const MEDIA_DIR = `${FileSystem.documentDirectory}course-photos/`;

interface CourseMediaState {
  photosByCourse: Record<string, string[]>;
  loadFromStorage: () => Promise<void>;
  addPhoto: (courseId: string, uri: string) => Promise<void>;
}

const persist = async (photosByCourse: Record<string, string[]>) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photosByCourse));
};

const ensureMediaDir = async () => {
  const info = await FileSystem.getInfoAsync(MEDIA_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
  }
};

const persistPhotoUri = async (courseId: string, uri: string) => {
  if (uri.startsWith(MEDIA_DIR)) {
    return uri;
  }

  await ensureMediaDir();
  const fileExtMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const ext = fileExtMatch?.[1] || 'jpg';
  const filename = `${courseId}-${Date.now()}.${ext}`;
  const destination = `${MEDIA_DIR}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
};

export const useCourseMediaStore = create<CourseMediaState>((set, get) => ({
  photosByCourse: {},

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Record<string, string[]>;
      set({ photosByCourse: parsed || {} });
    } catch (error) {
      console.warn('failed to load course media', error);
    }
  },

  addPhoto: async (courseId, uri) => {
    const stableUri = await persistPhotoUri(courseId, uri);
    const current = get().photosByCourse;
    const nextForCourse = [stableUri, ...(current[courseId] || [])];
    const next = {
      ...current,
      [courseId]: nextForCourse,
    };
    set({ photosByCourse: next });
    await persist(next);
  },
}));
