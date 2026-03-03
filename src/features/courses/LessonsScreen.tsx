import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../../services/api/courseService';

export default function LessonsScreen({ route, navigation }: any) {
  const module = route?.params?.module;

  if (!module?.id) {
    return (
      <View style={styles.loader}>
        <Text style={styles.emptyText}>Invalid module. Please reopen lessons from the course page.</Text>
      </View>
    );
  }

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons', module.id],
    queryFn: () => courseService.getLessons(module.id),
  });

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.moduleTitle}>{module.title || 'Module Lessons'}</Text>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No lessons found for this module.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('LessonDetails', { lesson: item })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.duration}>{item.duration}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },
  title: { fontWeight: '600' },
  duration: { color: '#666' },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  },
});
