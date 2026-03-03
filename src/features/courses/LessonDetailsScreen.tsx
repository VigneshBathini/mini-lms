import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { courseService } from '../../services/api/courseService';

const { width } = Dimensions.get('window');

export default function LessonDetailsScreen({ route }: any) {
  const { lesson } = route.params;
  const queryClient = useQueryClient();

  const [completed, setCompleted] = useState(lesson.completed || false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

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
    const separator = lesson.videoUrl.includes('?') ? '&' : '?';
    return `${lesson.videoUrl}${separator}retry=${retryKey}`;
  }, [lesson.videoUrl, retryKey]);

  const player = useVideoPlayer(videoSource, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  useEffect(() => {
    const loadSubscription = player.addListener('sourceLoad', () => {
      setLoading(false);
      setError(false);
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
  }, [player, completed, mutation]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.duration}>Duration: {lesson.duration}</Text>

      <View style={styles.videoContainer}>
        {loading && !error && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loaderText}>Loading video...</Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load video</Text>
            <Text style={styles.errorSubText}>Please check your connection</Text>
            <TouchableOpacity onPress={handleRetry}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <VideoView
            key={retryKey}
            player={player}
            style={styles.video}
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
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>Lesson Completed</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  duration: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  videoContainer: {
    width: width - 32,
    height: 220,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1,
  },
  loaderText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  retryText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  completedText: {
    color: '#34c759',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
