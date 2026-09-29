import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from './Skeleton';

// Convenience composition matching docs/03's "Skeleton Cards" loading pattern —
// a Card-shaped placeholder for list/grid loading states.
export function SkeletonCard(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderRadius: theme.radius.card,
        padding: theme.spacing.screenPadding,
        gap: theme.spacing.sm,
        ...theme.shadow.card,
      }}
    >
      <Skeleton width="60%" height={20} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="80%" height={14} />
    </View>
  );
}
