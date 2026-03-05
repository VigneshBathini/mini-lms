import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity, Pressable } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { courseService } from '../../services/api/courseService';
import { downloadLessonVideo, getDownloadedLessonUri } from '../../services/downloads';
import { usePreferencesStore } from '../../store/preferencesStore';
import ProgressBar from '../../components/ProgressBar';

export default function LessonDetailsScreen({ route }: any) {
  const { lesson } = route.params;
  const queryClient = useQueryClient();
  const autoplayVideos = usePreferencesStore((state) => state.autoplayVideos);
  const downloadOnWifiOnly = usePreferencesStore((state) => state.downloadOnWifiOnly);

  const [completed, setCompleted] = useState(lesson.completed || false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => courseService.markLessonCompleted(lesson.id),
    onSuccess: () => {
      setCompleted(true);
      Alert.alert('Success', 'Lesson completed!');
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to mark lesson completed.');
    },
  });

  const videoSource = useMemo(() => {
    const baseSource = downloadedUri || lesson.videoUrl;
    const separator = lesson.videoUrl.includes('?') ? '&' : '?';
    if (downloadedUri) {
      return downloadedUri;
    }
    return `${baseSource}${separator}retry=${retryKey}`;
  }, [lesson.videoUrl, retryKey, downloadedUri]);

  const player = useVideoPlayer(videoSource, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  useEffect(() => {
    getDownloadedLessonUri(lesson.id)
      .then((uri) => setDownloadedUri(uri))
      .catch(() => setDownloadedUri(null));
  }, [lesson.id]);

  useEffect(() => {
    const loadSubscription = player.addListener('sourceLoad', () => {
      setLoading(false);
      setError(false);
      if (autoplayVideos) {
        player.play();
      }
    });

    const statusSubscription = player.addListener('statusChange', ({ status, error: playerError }) => {
      if (status === 'error' || playerError) {
        setError(true);
        setLoading(false);
      }
    });

    const endSubscription = player.addListener('playToEnd', () => {
      if (!completed) {
        mutation.mutate();
      }
    });

    return () => {
      loadSubscription.remove();
      statusSubscription.remove();
      endSubscription.remove();
    };
  }, [player, completed, mutation, autoplayVideos]);

  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setRetryKey((prev) => prev + 1);
  };

  const handleFullscreenEnter = () => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  };

  const handleFullscreenExit = () => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  };

  const handleDownload = async () => {
    if (downloading || downloadedUri) {
      return;
    }

    try {
      setDownloading(true);
      setDownloadProgress(0);
      const uri = await downloadLessonVideo({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        url: lesson.videoUrl,
        wifiOnly: downloadOnWifiOnly,
        onProgress: (percent) => setDownloadProgress(percent),
      });
      setDownloadedUri(uri);
      Alert.alert('Download complete', 'Lesson saved for offline access.');
    } catch (downloadError: any) {
      Alert.alert('Download failed', downloadError?.message || 'Unable to download lesson video.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="mb-2 text-2xl font-bold">{lesson.title}</Text>
      <Text className="mb-5 text-base text-slate-500">Duration: {lesson.duration}</Text>

      <View className="h-56 overflow-hidden rounded-xl bg-black">
        {loading && !error && (
          <View className="absolute inset-0 z-10 items-center justify-center bg-black/70">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="mt-2 text-white">Loading video...</Text>
          </View>
        )}

        {error ? (
          <View className="flex-1 items-center justify-center bg-black">
            <Text className="mb-1 text-lg font-bold text-red-500">Failed to load video</Text>
            <Text className="mb-3 text-white">Please check your connection</Text>
            <TouchableOpacity onPress={handleRetry}>
              <Text className="text-base font-bold text-blue-500">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <VideoView
            key={retryKey}
            player={player}
            style={{ flex: 1 }}
            contentFit="contain"
            nativeControls
            fullscreenOptions={{
              enable: true,
              orientation: 'landscape',
              autoExitOnRotate: true,
            }}
            onFullscreenEnter={handleFullscreenEnter}
            onFullscreenExit={handleFullscreenExit}
          />
        )}
      </View>

      {completed && (
        <View className="mt-5 items-center">
          <Text className="text-lg font-bold text-green-500">Lesson Completed</Text>
        </View>
      )}

      <View className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3">
        <Text className="text-base font-bold text-slate-900">Offline Access</Text>
        <Text className="mb-2.5 mt-1 text-slate-500">
          {downloadOnWifiOnly ? 'Wi-Fi only downloads enabled' : 'Downloads allowed on any network'}
        </Text>
        {downloading ? (
          <View className="mb-2.5">
            <Text className="text-sm text-slate-600">Downloading... {downloadProgress}%</Text>
            <ProgressBar progress={downloadProgress} />
          </View>
        ) : null}
        <Pressable
          className={`items-center rounded-lg py-2.5 ${downloading || downloadedUri ? 'bg-slate-400' : 'bg-blue-700'}`}
          onPress={handleDownload}
          disabled={downloading || Boolean(downloadedUri)}
        >
          <Text className="font-bold text-white">
            {downloadedUri ? 'Downloaded' : downloading ? 'Downloading...' : 'Download Lesson'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
