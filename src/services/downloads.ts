import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const DOWNLOAD_MAP_KEY = 'lesson_download_map';

type DownloadMap = Record<string, string>;

const ensureDownloadDir = async () => {
  const baseDir = FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error('File system is unavailable on this device.');
  }

  const downloadDir = `${baseDir}downloads/`;
  const info = await FileSystem.getInfoAsync(downloadDir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
  }
  return downloadDir;
};

const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();

const readDownloadMap = async (): Promise<DownloadMap> => {
  const raw = await AsyncStorage.getItem(DOWNLOAD_MAP_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as DownloadMap;
  } catch {
    return {};
  }
};

const saveDownloadMap = async (map: DownloadMap) => {
  await AsyncStorage.setItem(DOWNLOAD_MAP_KEY, JSON.stringify(map));
};

export const getDownloadedLessonUri = async (lessonId: string) => {
  const map = await readDownloadMap();
  const uri = map[lessonId];
  if (!uri) {
    return null;
  }

  const info = await FileSystem.getInfoAsync(uri);
  return info.exists ? uri : null;
};

const validateNetworkForDownload = async (wifiOnly: boolean) => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    throw new Error('No internet connection. Connect and try again.');
  }

  if (wifiOnly && state.type !== 'wifi') {
    throw new Error('Downloads are limited to Wi-Fi. Disable the preference to continue.');
  }
};

type DownloadOptions = {
  lessonId: string;
  lessonTitle: string;
  url: string;
  wifiOnly: boolean;
  onProgress?: (value: number) => void;
};

export const downloadLessonVideo = async ({
  lessonId,
  lessonTitle,
  url,
  wifiOnly,
  onProgress,
}: DownloadOptions) => {
  await validateNetworkForDownload(wifiOnly);

  const downloadDir = await ensureDownloadDir();
  const targetUri = `${downloadDir}${sanitizeName(lessonTitle || lessonId)}-${lessonId}.mp4`;

  const task = FileSystem.createDownloadResumable(
    url,
    targetUri,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      if (!onProgress || !totalBytesExpectedToWrite) {
        return;
      }
      onProgress(Math.min(1, totalBytesWritten / totalBytesExpectedToWrite));
    }
  );

  const result = await task.downloadAsync();
  if (!result?.uri) {
    throw new Error('Download failed. Please try again.');
  }

  const map = await readDownloadMap();
  map[lessonId] = result.uri;
  await saveDownloadMap(map);
  return result.uri;
};
