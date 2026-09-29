import { Pressable, StyleSheet, View } from 'react-native';
import { Monitor, Moon, Sun } from 'lucide-react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore, type ThemePreference } from '@/store/settings.store';
import type { IconComponent } from '@/types/icon';

const OPTIONS: { value: ThemePreference; label: string; icon: IconComponent }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

// Appearance selector (settings mockup) — a three-way segmented control wired to the
// persisted themePreference. Selecting Light/Dark immediately re-themes the whole app via
// ThemeProvider (docs/19: wires up the Phase-1 dark palette).
export function ThemeModeSelector(): React.JSX.Element {
  const theme = useTheme();
  const preference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);

  return (
    <View style={styles.container}>
      <Text variant="bodyMd" color="textPrimary" style={styles.label}>
        Appearance
      </Text>
      <View
        style={[styles.segment, { backgroundColor: theme.colors.surfaceContainerHigh }]}
      >
        {OPTIONS.map((option) => {
          const selected = preference === option.value;
          const OptionIcon = option.icon;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${option.label} theme`}
              onPress={() => setThemePreference(option.value)}
              style={[
                styles.option,
                selected && {
                  backgroundColor: theme.colors.surfaceContainerLowest,
                  ...theme.shadow.card,
                },
              ]}
            >
              <OptionIcon
                size={18}
                color={selected ? theme.colors.primary : theme.colors.textSecondary}
                strokeWidth={1.75}
              />
              <Text variant="labelMd" color={selected ? 'primary' : 'textSecondary'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  label: {
    fontWeight: '600',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 9999,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9999,
  },
});
