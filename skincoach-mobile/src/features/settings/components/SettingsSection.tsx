import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';

type SettingsSectionProps = PropsWithChildren<{
  title: string;
}>;

// A titled group of settings rows (settings mockup) — an uppercase section label above a
// single Card that holds the rows.
export function SettingsSection({
  title,
  children,
}: SettingsSectionProps): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text variant="labelMd" color="textSecondary" style={styles.title}>
        {title}
      </Text>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  title: {
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  card: {
    paddingVertical: 4,
  },
});
