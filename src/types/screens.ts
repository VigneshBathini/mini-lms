import { Course, Lesson, Module } from './course';

export type AuthNavigation = {
  navigate: (screen: 'Login' | 'Register') => void;
};

export type CoursesNavigation = {
  navigate: (screen: 'CourseDetails', params: { courseId: string; course?: Course }) => void;
};

export type CourseDetailsNavigation = {
  navigate: (
    screen: 'LessonDetails' | 'WebView' | 'Lessons',
    params?: {
      lesson?: Lesson;
      module?: Module;
      courseId?: string;
      title?: string;
      thumbnail?: string;
      instructor?: string;
      description?: string;
    }
  ) => void;
};

export type LessonsNavigation = {
  navigate: (screen: 'LessonDetails', params: { lesson: Lesson }) => void;
};

export type CourseDetailsRoute = {
  params?: {
    courseId?: string;
    course?: Course;
  };
};

export type LessonsRoute = {
  params?: {
    module?: Module;
  };
};

export type LessonDetailsRoute = {
  params: {
    lesson: Lesson;
  };
};

export type WebViewRoute = {
  params?: {
    courseId?: string;
    title?: string;
    thumbnail?: string;
    instructor?: string;
    description?: string;
  };
};
