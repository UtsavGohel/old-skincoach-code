import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

type GuidelineCardProps = {
  icon: IconComponent;
  title: string;
  description: string;
};

// A single scan-guideline tile (scan_guidelines mockup): rounded icon chip + title +
// description in a white Card. Used in the guidelines grid.
export function GuidelineCard({
  icon: Icon,
  title,
  description,
}: GuidelineCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <View
        style={[styles.iconTile, { backgroundColor: theme.colors.secondaryContainer }]}
      >
        <Icon size={26} color={theme.colors.primary} strokeWidth={1.75} />
      </View>
      <View style={styles.textBlock}>
        <Text variant="headlineMd" color="textPrimary" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMd" color="textSecondary">
          {description}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
});
