import React from 'react';
import { Text, Image, StyleSheet, Pressable } from 'react-native';
import { Course } from '../types/course';
import ProgressBar from './ProgressBar';

const FALLBACK_IMAGE = 'https://picsum.photos/seed/course-thumb/400/220';

interface Props {
  course: Course;
  onPress: () => void;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

function CourseCard({ course, onPress, isBookmarked = false, onBookmark }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: course.thumbnail || FALLBACK_IMAGE }} style={styles.image} />
      {onBookmark && (
        <Pressable style={styles.bookmark} onPress={onBookmark}>
          <Text style={styles.bookmarkText}>{isBookmarked ? 'Saved' : 'Save'}</Text>
        </Pressable>
      )}
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.instructor}>{course.instructor}</Text>
      <ProgressBar progress={course.progress ?? 0} />
    </Pressable>
  );
}

export default React.memo(CourseCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 3,
  },
  bookmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookmarkText: {
    color: '#1e40af',
    fontWeight: '600',
    fontSize: 12,
  },
  image: {
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  instructor: { color: '#666' },
});
