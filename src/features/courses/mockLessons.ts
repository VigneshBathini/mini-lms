import { Lesson } from '../../types/course';

export const mockLessons: Record<string, Lesson[]> = {
  m1: [
    {
      id: 'l1',
      title: 'Welcome Overview',
      duration: '5:20',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      id: 'l2',
      title: 'Setup Guide',
      duration: '8:45',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
  ],
  m2: [
    {
      id: 'l3',
      title: 'Core Deep Dive',
      duration: '12:10',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    },
  ],
  m3: [
    {
      id: 'l4',
      title: 'Installation Steps',
      duration: '7:00',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
  ],
  m4: [
    {
      id: 'l5',
      title: 'Advanced Patterns',
      duration: '15:00',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
  ],
};
