import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../../services/api/courseService';

export default function LessonsScreen({ route, navigation }: any) {
  const module = route?.params?.module;

  if (!module?.id) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mt-5 text-center text-slate-500">
          Invalid module. Please reopen lessons from the course page.
        </Text>
      </View>
    );
  }

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons', module.id],
    queryFn: () => courseService.getLessons(module.id),
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Text className="mb-3 text-xl font-bold text-slate-900">{module.title || 'Module Lessons'}</Text>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text className="mt-5 text-center text-slate-500">No lessons found for this module.</Text>}
        renderItem={({ item }) => (
          <Pressable
            className="mb-2.5 rounded-xl bg-slate-100 p-3"
            onPress={() => navigation.navigate('LessonDetails', { lesson: item })}
            accessibilityRole="button"
            accessibilityLabel={`Open lesson ${item.title}`}
          >
            <Text className="font-semibold text-slate-900">{item.title}</Text>
            <Text className="text-slate-500">{item.duration}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
