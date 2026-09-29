import { StyleSheet, Switch, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

type SettingsToggleRowProps = {
  icon: IconComponent;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  isLast?: boolean;
};

// A settings row with a Switch (settings mockup Notifications) — icon tile, label +
// description, and a native toggle tinted to the sage palette.
export function SettingsToggleRow({
  icon: Icon,
  label,
  description,
  value,
  onValueChange,
  isLast = false,
}: SettingsToggleRowProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <View
        style={[styles.iconTile, { backgroundColor: theme.colors.secondaryContainer }]}
      >
        <Icon size={20} color={theme.colors.primary} strokeWidth={1.75} />
      </View>
      <View style={styles.body}>
        <Text variant="bodyMd" color="textPrimary">
          {label}
        </Text>
        {description ? (
          <Text variant="labelSm" color="textSecondary">
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.surfaceVariant,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.surfaceContainerLowest}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
});
