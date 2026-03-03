import React from 'react';
import { View, Text, Button, Image, TouchableOpacity, Switch, ScrollView } from 'react-native';
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
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <View className="mb-4 items-center rounded-2xl border border-slate-200 bg-white py-4">
        <TouchableOpacity
          onPress={takePhoto}
          onLongPress={pickImage}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} className="mb-3 h-24 w-24 rounded-full" />
          ) : (
            <View className="mb-3 h-24 w-24 items-center justify-center rounded-full bg-blue-100">
              <Text className="font-semibold text-blue-900">Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">{user?.name || 'Guest'}</Text>
        <Text className="text-slate-500">{user?.email}</Text>
        <Text className="mt-2 text-xs text-slate-500">Tap avatar to capture, or choose from gallery</Text>
        <TouchableOpacity className="mt-2.5 rounded-lg bg-slate-200 px-3 py-2" onPress={pickImage}>
          <Text className="font-semibold text-slate-900">Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-3">
        <Text className="mb-2 text-base font-bold text-slate-900">Your Stats</Text>
        <Text>Courses enrolled: {enrolled.length}</Text>
        <Text>Bookmarks: {bookmarks.length}</Text>
        <Text>Average progress: {averageProgress}%</Text>
      </View>

      <View className="mb-5 rounded-2xl border border-slate-200 bg-white p-3">
        <Text className="mb-2.5 text-base font-bold text-slate-900">Preferences</Text>

        <View className="mb-2.5 flex-row items-center justify-between">
          <Text className="text-sm text-slate-700">Learning reminders</Text>
          <Switch value={remindersEnabled} onValueChange={(value) => setPreference('remindersEnabled', value)} />
        </View>

        <View className="mb-2.5 flex-row items-center justify-between">
          <Text className="text-sm text-slate-700">Autoplay videos</Text>
          <Switch value={autoplayVideos} onValueChange={(value) => setPreference('autoplayVideos', value)} />
        </View>

        <View className="mb-2.5 flex-row items-center justify-between">
          <Text className="text-sm text-slate-700">Download on Wi-Fi only</Text>
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
