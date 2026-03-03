import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebViewScreen({ route }: any) {
  const courseId = route?.params?.courseId || 'unknown';
  const courseTitle = route?.params?.title || 'Course Content';
  const courseThumbnail = route?.params?.thumbnail || '';
  const instructor = route?.params?.instructor || 'Unknown';
  const description = route?.params?.description || 'No description available.';
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const html = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        html, body { height: 100%; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        body { background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; }
        .card { width: min(92vw, 520px); background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; }
        .title { font-size: 22px; font-weight: 700; margin: 0 0 10px; }
        .meta { color: #475569; margin: 0; }
        .thumb { width: 100%; height: 180px; object-fit: cover; border-radius: 10px; margin-bottom: 12px; background: #e2e8f0; }
        .desc { color: #334155; margin: 8px 0 0; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="card">
        ${courseThumbnail ? `<img class="thumb" src="${escapeHtml(courseThumbnail)}" alt="Course thumbnail" />` : ''}
        <h1 class="title">${escapeHtml(courseTitle)}</h1>
        <p class="meta">Instructor: ${escapeHtml(instructor)}</p>
        <p id="course" class="meta">Course ID: ${escapeHtml(courseId)}</p>
        <p class="desc">${escapeHtml(description)}</p>
      </div>
      <script>
        // Notify react native that the page has loaded
        window.ReactNativeWebView.postMessage('loaded:' + ${JSON.stringify(courseTitle)});
      </script>
    </body>
    </html>
  `, [courseId, courseTitle, courseThumbnail, instructor, description]);

  const [loadError, setLoadError] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState('Loading content...');
  const webViewRef = React.useRef<WebView>(null);

  const handleMessage = (event: any) => {
    const data = String(event?.nativeEvent?.data || '');
    setStatusMessage(data);
  };

  const handleRetry = () => {
    setLoadError(false);
    setStatusMessage('Reloading content...');
    webViewRef.current?.reload();
  };

  return (
    <View style={styles.container}>
      {loadError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load content.</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.webViewWrapper}>
          <Text style={styles.statusText}>{statusMessage}</Text>
          <WebView
            ref={webViewRef}
            style={styles.webview}
            originWhitelist={['*']}
            source={{ html, headers: { 'X-Course-Id': courseId } }}
            onMessage={handleMessage}
            onLoadStart={() => setStatusMessage('Loading content...')}
            onLoadEnd={() => setStatusMessage(`Ready: ${courseTitle || courseId || 'unknown'}`)}
            onError={() => setLoadError(true)}
            startInLoadingState
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webViewWrapper: { flex: 1 },
  webview: { flex: 1 },
  statusText: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#475569',
    backgroundColor: '#f1f5f9',
  },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#b91c1c', marginBottom: 10 },
  retryButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});
