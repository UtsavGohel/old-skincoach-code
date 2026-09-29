import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { BottomNavigation, type BottomNavRoute } from '@/components/BottomNavigation';
import { usePreferencesStore } from '@/store/preferences.store';
import type { RootStackParamList } from './types';

// Adapts React Navigation's tab bar contract to our design-system BottomNavigation
// component. "Scan" isn't a real tab (docs/02/docs/19) — pressing it pushes onto the
// parent stack instead of switching tabs.
export function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hasSeenScanGuidelines = usePreferencesStore((s) => s.hasSeenScanGuidelines);
  const activeRouteName = (state.routes[state.index]?.name ?? 'Home') as BottomNavRoute;

  const handleNavigate = (route: BottomNavRoute): void => {
    if (route === 'Scan') {
      // First scan shows the guidelines; after that, go straight to the camera (the
      // guidelines stay reachable from the camera's help button).
      rootNavigation.navigate(hasSeenScanGuidelines ? 'Camera' : 'ScanGuidelines');
      return;
    }
    navigation.navigate(route);
  };

  return <BottomNavigation activeRoute={activeRouteName} onNavigate={handleNavigate} />;
}
