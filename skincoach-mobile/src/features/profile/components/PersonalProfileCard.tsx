import { Pressable, StyleSheet, View } from 'react-native';
import { Droplet, Pencil, Signal, Target } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import {
  EXPERIENCE_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  SKIN_TYPE_OPTIONS,
} from '@/features/profile/onboarding.options';
import { useUserStore } from '@/store/user.store';
import type { IconComponent } from '@/types/icon';

type PersonalProfileCardProps = {
  onPressEdit: () => void;
};

const NOT_SET = 'Not set';

function labelFor<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T | undefined,
): string {
  return options.find((option) => option.value === value)?.label ?? NOT_SET;
}

// Personal Skin Profile card (profile_achievements) — Skin Type / Goal / Level read
// from the real onboarding store (docs/09 persisted profileDraft), mapped to their
// display labels via the same option sets the onboarding wizard uses. An edit affordance
// routes back into onboarding to change them.
export function PersonalProfileCard({
  onPressEdit,
}: PersonalProfileCardProps): React.JSX.Element {
  const theme = useTheme();
  const profile = useUserStore((state) => state.profileDraft);

  const rows: { icon: IconComponent; label: string; value: string }[] = [
    {
      icon: Droplet,
      label: 'Skin Type',
      value: labelFor(SKIN_TYPE_OPTIONS, profile.skinType),
    },
    {
      icon: Target,
      label: 'Goal',
      value: labelFor(PRIMARY_GOAL_OPTIONS, profile.primaryGoal),
    },
    {
      icon: Signal,
      label: 'Level',
      value: labelFor(EXPERIENCE_OPTIONS, profile.experienceLevel),
    },
  ];

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="headlineMd" color="textPrimary">
          Personal Skin Profile
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit skin profile"
          onPress={onPressEdit}
          hitSlop={8}
        >
          <Pencil size={20} color={theme.colors.primary} />
        </Pressable>
      </View>

      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <View
              style={[
                styles.iconTile,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <row.icon size={20} color={theme.colors.primary} strokeWidth={1.75} />
            </View>
            <View style={styles.rowText}>
              <Text variant="labelSm" color="textSecondary">
                {row.label}
              </Text>
              <Text variant="bodyMd" color="textPrimary">
                {row.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rows: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    gap: 2,
  },
});
