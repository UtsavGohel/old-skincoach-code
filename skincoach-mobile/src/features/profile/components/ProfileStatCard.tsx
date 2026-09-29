import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { PROFILE_STAT_ICON } from '@/features/profile/profile.meta';
import type { ProfileStat } from '@/features/profile/profileOverview.types';

type ProfileStatCardProps = {
  stat: ProfileStat;
};

// A single tile in the Profile stat grid (profile_achievements) — a lucide icon, a large
// value, and a caption. Rendered 2-up by the screen.
export function ProfileStatCard({ stat }: ProfileStatCardProps): React.JSX.Element {
  const theme = useTheme();
  const Icon = PROFILE_STAT_ICON[stat.key];

  return (
    <Card style={styles.card}>
      <Icon size={28} color={theme.colors.primary} strokeWidth={1.75} />
      <Text style={[theme.typography.headlineLg, { color: theme.colors.primary }]}>
        {stat.value}
      </Text>
      <Text variant="labelMd" color="textSecondary" style={styles.label}>
        {stat.label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  label: {
    textTransform: 'uppercase',
  },
});
