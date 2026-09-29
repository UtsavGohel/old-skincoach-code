import { Image, View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

export type TimelineEntry = {
  id: string;
  date: string;
  title: string;
  description?: string;
  icon?: IconComponent;
  imageUri?: string;
};

export type TimelineProps = {
  entries: TimelineEntry[];
};

// docs/03 Progress Timeline / Timeline Card: vertical layout, connected line,
// floating cards, supports milestones/achievements/historical scans.
export function Timeline({ entries }: TimelineProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View>
      {entries.map((entry, index) => {
        const Icon = entry.icon;
        const isLast = index === entries.length - 1;

        return (
          <View key={entry.id} style={{ flexDirection: 'row' }}>
            <View style={{ alignItems: 'center', width: 40 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.secondaryContainer,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {Icon ? (
                  <Icon size={16} color={theme.colors.onSecondaryContainer} />
                ) : null}
              </View>
              {!isLast ? (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    backgroundColor: theme.colors.outlineVariant,
                    marginVertical: 4,
                  }}
                />
              ) : null}
            </View>
            <View
              style={{
                flex: 1,
                paddingBottom: theme.spacing.md,
                paddingLeft: theme.spacing.sm,
              }}
            >
              <Text variant="labelSm" color="textSecondary">
                {entry.date}
              </Text>
              <Card style={{ marginTop: 4 }}>
                <Text variant="bodyMd" color="textPrimary" style={{ fontWeight: '600' }}>
                  {entry.title}
                </Text>
                {entry.description ? (
                  <Text variant="bodyMd" color="textSecondary" style={{ marginTop: 2 }}>
                    {entry.description}
                  </Text>
                ) : null}
                {entry.imageUri ? (
                  <Image
                    source={{ uri: entry.imageUri }}
                    style={{
                      width: '100%',
                      height: 120,
                      borderRadius: theme.radius.smallComponent,
                      marginTop: theme.spacing.sm,
                    }}
                  />
                ) : null}
              </Card>
            </View>
          </View>
        );
      })}
    </View>
  );
}
