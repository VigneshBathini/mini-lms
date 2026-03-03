import React from 'react';
import { Text, Image, Pressable, View } from 'react-native';
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
      className="mb-4 rounded-2xl border border-slate-200 bg-white p-3"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open course ${course.title}`}
    >
      <Image
        source={{ uri: imageUri }}
        className="mb-2.5 h-40 rounded-xl"
        onError={() => setImageUri(FALLBACK_IMAGE)}
      />
      {onBookmark && (
        <Pressable
          className="absolute right-2.5 top-2.5 z-10 rounded-2xl bg-indigo-50 px-2.5 py-1.5"
          onPress={onBookmark}
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Save course'}
        >
          <Text className="text-xs font-bold text-blue-800">{isBookmarked ? 'Saved' : 'Save'}</Text>
        </Pressable>
      )}
      <Text className="mb-1.5 text-[17px] font-bold leading-6 text-slate-900" numberOfLines={2}>
        {course.title}
      </Text>
      <Text className="mb-1 text-sm font-semibold text-slate-700" numberOfLines={1}>
        {course.instructor}
      </Text>
      {!!course.description && (
        <Text className="text-sm leading-5 text-slate-600" numberOfLines={3}>
          {course.description}
        </Text>
      )}
      {!!course.label && (
        <View className="mt-2 self-start rounded-full bg-slate-100 px-2.5 py-1">
          <Text className="text-xs font-semibold text-slate-700">{course.label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default React.memo(CourseCard);
