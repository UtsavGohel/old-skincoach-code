// Jest auto-applies node_modules mocks placed here (no jest.mock() call needed).
// The library's own jest/mock.tsx ships as a default export, but our app code uses
// named imports (`{ SafeAreaProvider }`) — re-export its members by name so both
// import styles resolve the same mocked implementation under test.
import mock from 'react-native-safe-area-context/jest/mock';

export const {
  SafeAreaProvider,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  initialWindowMetrics,
  useSafeAreaInsets,
  useSafeAreaFrame,
} = mock;
