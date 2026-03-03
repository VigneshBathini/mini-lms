// src/services/api/courseService.ts
import { Course, Lesson, Module } from '../../types/course';
import { apiClient } from './client';
import { endpoints } from './endpoints';
import { mockCourses } from '../../features/courses/mockCourses';
import { mockLessons } from '../../features/courses/mockLessons';
import { mockModules } from '../../features/courses/mockModules';

const FALLBACK_THUMBNAIL = 'https://picsum.photos/seed/course-learning-default/800/450';

const TECH_COURSE_TEMPLATES = [
  {
    title: 'React Native Fundamentals',
    label: 'React Native',
    description: 'Build cross-platform mobile apps with components, navigation, hooks, and state management.',
  },
  {
    title: 'Express.js API Development',
    label: 'Express.js',
    description: 'Design REST APIs with routing, middleware, authentication, and production-ready error handling.',
  },
  {
    title: 'TypeScript for Production Apps',
    label: 'TypeScript',
    description: 'Write safer frontend and backend code using strong typing, interfaces, and reusable utility types.',
  },
  {
    title: 'Node.js Backend Engineering',
    label: 'Node.js',
    description: 'Learn async workflows, module architecture, service layers, and scalable backend patterns.',
  },
  {
    title: 'MongoDB Data Modeling',
    label: 'MongoDB',
    description: 'Design document schemas, indexing strategies, and efficient query patterns for app backends.',
  },
  {
    title: 'Authentication & Security Essentials',
    label: 'Security',
    description: 'Implement JWT auth, token refresh, secure storage, and API protection best practices.',
  },
  {
    title: 'React Query & API State',
    label: 'React Query',
    description: 'Handle server-state caching, retries, invalidation, and optimistic UI updates in React apps.',
  },
  {
    title: 'Testing React Native Apps',
    label: 'Testing',
    description: 'Create reliable tests with Jest and Testing Library for components, hooks, and async flows.',
  },
  {
    title: 'CI/CD for Mobile Projects',
    label: 'DevOps',
    description: 'Set up automated lint, test, build, and deployment pipelines for React Native apps.',
  },
  {
    title: 'System Design for LMS Apps',
    label: 'Architecture',
    description: 'Model scalable learning platforms with modular architecture, observability, and resilience.',
  },
];

const deriveCourseContent = (index: number) => TECH_COURSE_TEMPLATES[index % TECH_COURSE_TEMPLATES.length];

const TECH_COURSE_IMAGES = [
  'https://picsum.photos/seed/react-native-course/800/450',
  'https://picsum.photos/seed/express-course/800/450',
  'https://picsum.photos/seed/typescript-course/800/450',
  'https://picsum.photos/seed/nodejs-course/800/450',
  'https://picsum.photos/seed/mongodb-course/800/450',
  'https://picsum.photos/seed/security-course/800/450',
  'https://picsum.photos/seed/react-query-course/800/450',
  'https://picsum.photos/seed/testing-course/800/450',
  'https://picsum.photos/seed/devops-course/800/450',
  'https://picsum.photos/seed/system-design-course/800/450',
];

const getThumbnailFromProduct = (product: any): string => {
  if (typeof product?.thumbnail === 'string' && product.thumbnail.length > 0) {
    return product.thumbnail;
  }

  if (typeof product?.image === 'string' && product.image.length > 0) {
    return product.image;
  }

  if (Array.isArray(product?.images) && typeof product.images[0] === 'string') {
    return product.images[0];
  }

  return FALLBACK_THUMBNAIL;
};

const buildCourseLessons = (courseId: string): Lesson[] => {
  const modules = mockModules[courseId] || [];
  if (modules.length === 0) {
    return [];
  }

  return modules.flatMap((module) => mockLessons[module.id] || []);
};

export const courseService = {
  async getCourses(): Promise<Course[]> {
    // fetch courses (random products) and instructors then merge
    try {
      const [productsRes, usersRes] = await Promise.all([
        apiClient.get(endpoints.randomProducts),
        apiClient.get(endpoints.randomUsers),
      ]);

      const rawProducts = productsRes.data;
      const rawUsers = usersRes.data;

      const products: any[] = Array.isArray(rawProducts?.data?.data)
        ? rawProducts.data.data
        : Array.isArray(rawProducts?.data)
          ? rawProducts.data
          : Array.isArray(rawProducts)
            ? rawProducts
            : [];

      const users: any[] = Array.isArray(rawUsers?.data?.data)
        ? rawUsers.data.data
        : Array.isArray(rawUsers?.data)
          ? rawUsers.data
          : Array.isArray(rawUsers)
            ? rawUsers
            : [];

      // map instructors list to simplified names
      const instructors = users.map((u) => {
        const firstName = u?.name?.first ?? '';
        const lastName = u?.name?.last ?? '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || 'Unknown';
      });

      const mappedCourses = products.map((p, idx) => {
        const instructor = instructors.length ? instructors[idx % instructors.length] : 'Unknown';
        const content = deriveCourseContent(idx);
        return {
          id: String(p.id || idx),
          title: content.title,
          label: content.label,
          instructor,
          thumbnail: TECH_COURSE_IMAGES[idx % TECH_COURSE_IMAGES.length] || getThumbnailFromProduct(p) || FALLBACK_THUMBNAIL,
          description: content.description,
          progress: Number.isFinite(p.rating) ? Math.round((p.rating / 5) * 100) : 0,
        } as Course;
      });

      if (mappedCourses.length > 0) {
        return mappedCourses;
      }

      return mockCourses;
    } catch (e) {
      console.error('courseService.getCourses error', e);
      return mockCourses;
    }
  },

  async getLessons(moduleId: string): Promise<Lesson[]> {
    return mockLessons[moduleId] || [];
  },

  async markLessonCompleted(_lessonId: string): Promise<void> {
    // no real endpoint, just pretend
    return;
  },

  async getModules(courseId: string): Promise<Module[]> {
    return mockModules[courseId] || [];
  },

  async enrollCourse(_courseId: string): Promise<{ success: boolean }> {
    // no server enroll; just resolve
    return { success: true };
  },

  async getCourseDetails(courseId: string): Promise<Course> {
    // fetch list and find one, then augment with local lesson catalog
    const courses = await this.getCourses();
    const course = courses.find((c) => c.id === courseId);

    if (course) {
      return {
        ...course,
        lessons: course.lessons && course.lessons.length > 0 ? course.lessons : buildCourseLessons(course.id),
      };
    }

    const fallback = mockCourses.find((c) => c.id === courseId) || mockCourses[0];
    if (!fallback) {
      throw new Error('Course not found');
    }

    return {
      ...fallback,
      lessons: buildCourseLessons(fallback.id),
    };
  },
};
