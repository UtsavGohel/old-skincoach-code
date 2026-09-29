import { Pressable, StyleSheet, View } from 'react-native';

import { AchievementBadge } from '@/components/AchievementBadge';
import { Text } from '@/components/Text';
import { ACHIEVEMENT_ICON } from '@/features/profile/profile.meta';
import type { ProfileAchievement } from '@/features/profile/profileOverview.types';

type AchievementsSectionProps = {
  achievements: ProfileAchievement[];
  onPressViewAll: () => void;
};

// Achievements section (profile_achievements) — a header with "View All" and the earned/
// locked badges. Reuses the shared AchievementBadge, which renders all three states
// distinctly (docs/19: the mockup only distinguished two).
export function AchievementsSection({
  achievements,
  onPressViewAll,
}: AchievementsSectionProps): React.JSX.Element {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="headlineMd" color="textPrimary">
          Achievements
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all achievements"
          onPress={onPressViewAll}
          hitSlop={8}
        >
          <Text variant="labelMd" color="primary">
            View All
          </Text>
        </Pressable>
      </View>

      <View style={styles.badges}>
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            title={achievement.title}
            icon={ACHIEVEMENT_ICON[achievement.icon]}
            state={achievement.state}
            date={achievement.date}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
