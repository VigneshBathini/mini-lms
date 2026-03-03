import React from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const enrolled = useCourseStore((state) => state.enrolled);
  const courses = useCourseStore((state) => state.courses);

  const enrolledCourses = courses.filter((course) => enrolled.includes(course.id));
  const averageProgress = enrolledCourses.length
    ? Math.round(
        enrolledCourses.reduce((total, course) => total + (course.progress ?? 0), 0) / enrolledCourses.length
      )
    : 0;

  const setUser = useAuthStore((s) => s.setUser);
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (setUser && user) {
        setUser({ ...user, avatar: uri });
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name || 'Guest'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.stats}>
        <Text>Courses enrolled: {enrolled.length}</Text>
        <Text>Bookmarks: {bookmarks.length}</Text>
        <Text>Average progress: {averageProgress}%</Text>
      </View>

      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#666' },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#666' },
  stats: { marginBottom: 24 },
});
