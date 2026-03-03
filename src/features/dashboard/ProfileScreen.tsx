import React from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';
import { usePreferencesStore } from '../../store/preferencesStore';

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const enrolled = useCourseStore((state) => state.enrolled);
  const courses = useCourseStore((state) => state.courses);
  const remindersEnabled = usePreferencesStore((state) => state.remindersEnabled);
  const autoplayVideos = usePreferencesStore((state) => state.autoplayVideos);
  const downloadOnWifiOnly = usePreferencesStore((state) => state.downloadOnWifiOnly);
  const setPreference = usePreferencesStore((state) => state.setPreference);

  const enrolledCourses = courses.filter((course) => enrolled.includes(course.id));
  const averageProgress = enrolledCourses.length
    ? Math.round(
        enrolledCourses.reduce((total, course) => total + (course.progress ?? 0), 0) / enrolledCourses.length
      )
    : 0;

  const setUser = useAuthStore((s) => s.setUser);
  const saveAvatar = (uri: string) => {
    if (setUser && user) {
      setUser({ ...user, avatar: uri });
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      saveAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      saveAvatar(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} className="flex-1 bg-slate-50">
      <View style={styles.header} className="rounded-2xl border border-slate-200 bg-white">
        <TouchableOpacity
          onPress={takePhoto}
          onLongPress={pickImage}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
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
        <Text style={styles.avatarHint}>Tap avatar to capture, or choose from gallery</Text>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats} className="rounded-2xl border border-slate-200 bg-white">
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <Text>Courses enrolled: {enrolled.length}</Text>
        <Text>Bookmarks: {bookmarks.length}</Text>
        <Text>Average progress: {averageProgress}%</Text>
      </View>

      <View style={styles.preferences} className="rounded-2xl border border-slate-200 bg-white">
        <Text style={styles.preferencesTitle}>Preferences</Text>

        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Learning reminders</Text>
          <Switch value={remindersEnabled} onValueChange={(value) => setPreference('remindersEnabled', value)} />
        </View>

        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Autoplay videos</Text>
          <Switch value={autoplayVideos} onValueChange={(value) => setPreference('autoplayVideos', value)} />
        </View>

        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Download on Wi-Fi only</Text>
          <Switch
            value={downloadOnWifiOnly}
            onValueChange={(value) => setPreference('downloadOnWifiOnly', value)}
          />
        </View>
      </View>

      <Button title="Logout" onPress={logout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 24 },
  header: {
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 16,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#1e3a8a', fontWeight: '600' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  email: { fontSize: 14, color: '#64748b' },
  avatarHint: { fontSize: 12, color: '#64748b', marginTop: 8 },
  galleryButton: {
    marginTop: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  galleryButtonText: { color: '#0f172a', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#0f172a' },
  stats: {
    marginBottom: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  preferences: { marginBottom: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, padding: 12 },
  preferencesTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  preferenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  preferenceLabel: { color: '#333', fontSize: 14 },
});
