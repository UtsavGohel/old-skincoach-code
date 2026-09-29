import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Camera, Home, LineChart, Sparkles, User } from 'lucide-react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

export type BottomNavRoute = 'Home' | 'Progress' | 'Scan' | 'Routine' | 'Profile';

export type BottomNavigationProps = {
  activeRoute: BottomNavRoute;
  onNavigate: (route: BottomNavRoute) => void;
};

const TABS: { route: BottomNavRoute; label: string; icon: IconComponent }[] = [
  { route: 'Home', label: 'Home', icon: Home },
  { route: 'Progress', label: 'Progress', icon: LineChart },
  { route: 'Scan', label: 'Scan', icon: Camera },
  { route: 'Routine', label: 'Routine', icon: Sparkles },
  { route: 'Profile', label: 'Profile', icon: User },
];

// docs/03 Bottom Navigation: 5 fixed tabs, floating/larger center Scan button.
// docs/19's audit found every mockup gets this wrong in some way (dropped tabs,
// non-floating Scan) — this is the single correctly-built version everything reuses.
export function BottomNavigation({
  activeRoute,
  onNavigate,
}: BottomNavigationProps): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handlePress = (route: BottomNavRoute) => {
    void Haptics.selectionAsync();
    onNavigate(route);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceContainerLowest,
          paddingBottom: Math.max(insets.bottom, theme.spacing.safeAreaBottom),
          ...theme.shadow.card,
        },
      ]}
    >
      {TABS.map(({ route, label, icon: Icon }) => {
        const isActive = route === activeRoute;

        if (route === 'Scan') {
          return (
            <View key={route} style={styles.scanSlot}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Scan today"
                onPress={() => handlePress(route)}
                style={[
                  styles.scanButton,
                  { backgroundColor: theme.colors.primary, ...theme.shadow.button },
                ]}
              >
                <Icon size={28} color={theme.colors.onPrimary} />
              </Pressable>
            </View>
          );
        }

        return (
          <Pressable
            key={route}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
            onPress={() => handlePress(route)}
            style={styles.tab}
          >
            <Icon
              size={24}
              color={isActive ? theme.colors.primary : theme.colors.textSecondary}
              fill={isActive ? theme.colors.primary : 'none'}
            />
            <Text variant="labelSm" color={isActive ? 'primary' : 'textSecondary'}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  scanSlot: {
    flex: 1,
    alignItems: 'center',
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
});
