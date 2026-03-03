import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeNotifications } from './src/services/notifications';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    initializeNotifications().catch(() => {
      // Avoid crashing render flow if notifications are unavailable on current runtime.
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
}
