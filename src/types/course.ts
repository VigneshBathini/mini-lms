export interface Module {
  id: string;
  title: string;
  lessons: number;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress?: number;
  description?: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed?: boolean;
}
