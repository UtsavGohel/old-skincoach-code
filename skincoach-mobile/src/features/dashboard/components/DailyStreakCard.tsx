import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

type DailyStreakCardProps = {
  streak: number;
  onPress: () => void;
};

// Daily streak card (home_dashboard) — flame emoji, day count, an encouragement line,
// a left accent border, and a chevron into the fuller progress view.
export function DailyStreakCard({
  streak,
  onPress,
}: DailyStreakCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${streak} day streak`}
      onPress={onPress}
      style={[
        styles.card,
        theme.shadow.card,
        {
          backgroundColor: theme.colors.surfaceContainerLowest,
          borderLeftColor: theme.colors.primary,
        },
      ]}
    >
      <View style={styles.left}>
        <Text style={styles.flame}>🔥</Text>
        <View>
          <Text variant="headlineMd" color="textPrimary">
            {`${streak} Day Streak`}
          </Text>
          <Text variant="labelMd" color="textSecondary">
            Consistency is key!
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    borderLeftWidth: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flame: {
    fontSize: 28,
  },
});
