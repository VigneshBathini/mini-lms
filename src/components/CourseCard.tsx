import React from 'react';
import { Text, Image, StyleSheet, Pressable } from 'react-native';
import { Course } from '../types/course';

const FALLBACK_IMAGE = 'https://picsum.photos/seed/course-thumb/400/220';

interface Props {
  course: Course;
  onPress: () => void;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

function CourseCard({ course, onPress, isBookmarked = false, onBookmark }: Props) {
  const [imageUri, setImageUri] = React.useState(course.thumbnail || FALLBACK_IMAGE);

  React.useEffect(() => {
    setImageUri(course.thumbnail || FALLBACK_IMAGE);
  }, [course.thumbnail]);

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open course ${course.title}`}
    >
      <Image source={{ uri: imageUri }} style={styles.image} onError={() => setImageUri(FALLBACK_IMAGE)} />
      {onBookmark && (
        <Pressable
          style={styles.bookmark}
          onPress={onBookmark}
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Save course'}
        >
          <Text style={styles.bookmarkText}>{isBookmarked ? 'Saved' : 'Save'}</Text>
        </Pressable>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {course.title}
      </Text>
      {!!course.description && (
        <Text style={styles.description} numberOfLines={3}>
          {course.description}
        </Text>
      )}
    </Pressable>
  );
}

export default React.memo(CourseCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  bookmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  bookmarkText: {
    color: '#1e40af',
    fontWeight: '700',
    fontSize: 12,
  },
  image: {
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  description: {
    color: '#475569',
    marginTop: 0,
    lineHeight: 18,
  },
});
