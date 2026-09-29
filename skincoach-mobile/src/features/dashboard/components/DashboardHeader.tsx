import { Pressable, StyleSheet, View } from 'react-native';
import { Bell, Sparkles } from 'lucide-react-native';

import { Avatar } from '@/components/Avatar';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

type DashboardHeaderProps = {
  name?: string;
  onPressNotifications: () => void;
  onPressCoach: () => void;
};

// Top app bar for Home: user avatar (initials until a real photo exists) + "SkinCoach"
// wordmark on the left; a sage-tinted AI Coach shortcut and a notifications bell on the
// right (home_dashboard mockup + the Coach entry point, since Coach isn't a bottom tab).
export function DashboardHeader({
  name,
  onPressNotifications,
  onPressCoach,
}: DashboardHeaderProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.brand}>
        <Avatar name={name} size={40} />
        <Text variant="headlineMd" color="primary">
          SkinCoach
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="AI Skin Coach"
          onPress={onPressCoach}
          hitSlop={8}
          style={[styles.coach, { backgroundColor: theme.colors.secondaryContainer }]}
        >
          <Sparkles size={20} color={theme.colors.primary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={onPressNotifications}
          hitSlop={8}
          style={styles.iconButton}
        >
          <Bell size={24} color={theme.colors.onSurfaceVariant} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coach: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
