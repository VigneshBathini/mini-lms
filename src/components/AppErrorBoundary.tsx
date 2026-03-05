import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { reportError } from '../services/errorReporter';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    reportError('app.errorBoundary', error);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-white p-5">
          <Text className="mb-1.5 text-xl font-bold text-slate-900">Something went wrong</Text>
          <Text className="mb-4 text-slate-600">Please try again.</Text>
          <Pressable className="rounded-lg bg-blue-700 px-3.5 py-2.5" onPress={this.reset}>
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
