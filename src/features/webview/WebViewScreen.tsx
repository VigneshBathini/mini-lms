import React, { useMemo } from 'react';
import { View, Alert, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebViewScreen({ route }: any) {
  const courseId = route?.params?.courseId || 'unknown';

  const html = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body>
      <h1>Course Content Viewer</h1>
      <p id="course">Course ID: ${courseId}</p>
      <script>
        // Notify react native that the page has loaded
        window.ReactNativeWebView.postMessage('loaded:' + ${JSON.stringify(courseId)});
      </script>
    </body>
    </html>
  `, [courseId]);

  const handleMessage = (event: any) => {
    const data = event.nativeEvent.data;
    Alert.alert('WebView message', data);
  };

  const [loadError, setLoadError] = React.useState(false);

  return (
    <View style={styles.container}>
      {loadError ? (
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <Text>Failed to load content.</Text>
        </View>
      ) : (
        <WebView
          originWhitelist={["*"]}
          source={{ html, headers: { 'X-Course-Id': courseId } }}
          onMessage={handleMessage}
          onError={() => setLoadError(true)}
          startInLoadingState
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});