// src/services/api/courseService.ts
import { Course, Lesson, Module } from '../../types/course';
import { apiClient } from './client';
import { endpoints } from './endpoints';
import { mockCourses } from '../../features/courses/mockCourses';
import { mockLessons } from '../../features/courses/mockLessons';
import { mockModules } from '../../features/courses/mockModules';

const FALLBACK_THUMBNAIL = 'https://picsum.photos/seed/course/400/220';

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
        return {
          id: String(p.id || idx),
          title: p.title || p.name || 'Untitled course',
          instructor,
          thumbnail: p.image || p.thumbnail || FALLBACK_THUMBNAIL,
          description: p.description || p.body || '',
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
