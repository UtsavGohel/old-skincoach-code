import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '@/screens/Home';
import { ProfileScreen } from '@/screens/Profile';
import { ProgressScreen } from '@/screens/Progress';
import { RoutineScreen } from '@/screens/Routine';

import { CustomTabBar } from './CustomTabBar';
import type { HomeTabParamList } from './types';

const Tab = createBottomTabNavigator<HomeTabParamList>();

// docs/02/PROJECT_CONTEXT: Home, Progress, Routine, Profile are the 4 real tabs;
// the 5th "Scan" button (rendered by CustomTabBar/BottomNavigation) pushes onto the
// parent stack rather than being a tab screen itself.
export function HomeTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Routine" component={RoutineScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
