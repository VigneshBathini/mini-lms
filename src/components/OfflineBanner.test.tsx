import React from 'react';
import { render } from '@testing-library/react-native';
import OfflineBanner from './OfflineBanner';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

jest.mock('../hooks/useNetworkStatus');
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockedUseNetworkStatus = useNetworkStatus as jest.MockedFunction<typeof useNetworkStatus>;

describe('OfflineBanner', () => {
  const renderBanner = () => render(<OfflineBanner />);

  it('does not render when online', () => {
    mockedUseNetworkStatus.mockReturnValue(true);
    const { queryByText } = renderBanner();
    expect(queryByText("You're offline")).toBeNull();
  });

  it('renders warning text when offline', () => {
    mockedUseNetworkStatus.mockReturnValue(false);
    const { getByText } = renderBanner();
    expect(getByText("You're offline")).toBeTruthy();
  });
});
