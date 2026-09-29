import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

type SettingsRowProps = {
  icon: IconComponent;
  label: string;
  // Optional secondary line (e.g. the current email, or the selected value).
  value?: string;
  onPress?: () => void;
  // Overrides the trailing chevron (e.g. an "open in new" icon). Omit for the default.
  trailingIcon?: IconComponent;
  // Renders a destructive label colour (Delete Account / Log Out).
  destructive?: boolean;
  isLast?: boolean;
};

// A tappable settings row (settings mockup) — an icon tile, a label with an optional
// value line, and a trailing chevron. Used across the Account/Privacy/Preferences/Support
// sections. A hairline divider separates rows except the last in a section.
export function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  trailingIcon: TrailingIcon = ChevronRight,
  destructive = false,
  isLast = false,
}: SettingsRowProps): React.JSX.Element {
  const theme = useTheme();
  const iconColor = destructive ? theme.colors.error : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
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
        <Icon size={20} color={iconColor} strokeWidth={1.75} />
      </View>
      <View style={styles.body}>
        <Text variant="bodyMd" color={destructive ? 'error' : 'textPrimary'}>
          {label}
        </Text>
        {value ? (
          <Text variant="labelSm" color="textSecondary">
            {value}
          </Text>
        ) : null}
      </View>
      <TrailingIcon size={20} color={theme.colors.outline} />
    </Pressable>
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
