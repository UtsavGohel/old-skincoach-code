import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

// Scaffolding-only: every real screen's content lands in its own build phase
// (docs/19). This just proves navigation wiring works end to end until then.
export function ScreenPlaceholder({ title }: { title: string }): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      <Text variant="headlineMd" color="textPrimary">
        {title}
      </Text>
      <Text variant="bodyMd" color="textSecondary">
        Coming soon
      </Text>
    </View>
  );
}
