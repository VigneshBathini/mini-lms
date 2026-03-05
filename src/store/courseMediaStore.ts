import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { create } from 'zustand';
import { reportError } from '../services/errorReporter';

const STORAGE_KEY = 'course_media_store';
const mediaDirectory = new Directory(Paths.document, 'course-photos');
const MEDIA_DIR = mediaDirectory.uri;

interface CourseMediaState {
  photosByCourse: Record<string, string[]>;
  loadFromStorage: () => Promise<void>;
  addPhoto: (courseId: string, uri: string) => Promise<void>;
}

const persist = async (photosByCourse: Record<string, string[]>) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photosByCourse));
};

const ensureMediaDir = async () => {
  if (!mediaDirectory.exists) {
    mediaDirectory.create({ idempotent: true, intermediates: true });
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
  const sourceFile = new File(uri);
  const destinationFile = new File(mediaDirectory, filename);
  sourceFile.copy(destinationFile);
  return destinationFile.uri;
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
      reportError('courseMedia.loadFromStorage', error);
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
