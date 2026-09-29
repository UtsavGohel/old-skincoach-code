import { Pressable, StyleSheet, View } from 'react-native';
import { Leaf, Pencil } from 'lucide-react-native';

import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

type ProfileCardProps = {
  name: string;
  memberSince: string;
  badgeLabel: string;
  onPressEdit: () => void;
};

// Profile hero card (profile_achievements) — a ringed avatar with an edit affordance,
// the user's name, member-since line, and a highlight badge pill.
export function ProfileCard({
  name,
  memberSince,
  badgeLabel,
  onPressEdit,
}: ProfileCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.avatarWrap}>
        <View style={[styles.ring, { borderColor: theme.colors.secondaryContainer }]}>
          <Avatar name={name} size={120} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile photo"
          onPress={onPressEdit}
          hitSlop={8}
          style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
        >
          <Pencil size={16} color={theme.colors.onPrimary} />
        </Pressable>
      </View>

      <Text variant="headlineLg" color="textPrimary" style={styles.name}>
        {name}
      </Text>
      <Text variant="bodyMd" color="textSecondary">
        {`SkinCoach Member Since ${memberSince}`}
      </Text>

      <View style={[styles.badge, { borderColor: theme.colors.outlineVariant }]}>
        <Leaf size={18} color={theme.colors.primary} />
        <Text variant="labelMd" color="primary">
          {badgeLabel}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 4,
  },
  avatarWrap: {
    marginBottom: 12,
  },
  ring: {
    padding: 4,
    borderRadius: 9999,
    borderWidth: 3,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
  },
});
