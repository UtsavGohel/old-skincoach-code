import { CheckCircle2, Lock } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/theme';
import type { IconComponent } from '@/types/icon';

export type AchievementState = 'locked' | 'unlocked' | 'completed';

export type AchievementBadgeProps = {
  title: string;
  icon: IconComponent;
  state: AchievementState;
  date?: string;
};

// docs/03 Achievement Badge: rounded pill, small icon, title, optional date, and
// three distinct states — docs/19's audit found the mockups only ever visually
// distinguish 2 of the 3, so this renders all three unambiguously: locked (greyed,
// lock icon), unlocked (full color), completed (full color + checkmark).
export function AchievementBadge({
  title,
  icon: Icon,
  state,
  date,
}: AchievementBadgeProps): React.JSX.Element {
  const theme = useTheme();
  const palette = statePalette(theme.colors, state);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: theme.radius.full,
        backgroundColor: palette.background,
        opacity: state === 'locked' ? 0.6 : 1,
      }}
      accessibilityLabel={`${title}, ${state}`}
    >
      {state === 'locked' ? (
        <Lock size={16} color={palette.foreground} />
      ) : (
        <Icon size={16} color={palette.foreground} />
      )}
      <Text variant="labelMd" color={palette.textToken}>
        {title}
      </Text>
      {state === 'completed' ? (
        <CheckCircle2 size={16} color={theme.colors.success} />
      ) : null}
      {date && state !== 'locked' ? (
        <Text variant="labelSm" color="textSecondary">
          {date}
        </Text>
      ) : null}
    </View>
  );
}

function statePalette(
  colors: ColorScheme,
  state: AchievementState,
): { background: string; foreground: string; textToken: keyof ColorScheme } {
  if (state === 'locked') {
    return {
      background: colors.surfaceContainer,
      foreground: colors.textSecondary,
      textToken: 'textSecondary',
    };
  }
  if (state === 'completed') {
    return {
      background: colors.secondaryContainer,
      foreground: colors.onSecondaryContainer,
      textToken: 'onSecondaryContainer',
    };
  }
  return {
    background: colors.primaryFixed,
    foreground: colors.onPrimaryFixedVariant,
    textToken: 'onPrimaryFixedVariant',
  };
}
