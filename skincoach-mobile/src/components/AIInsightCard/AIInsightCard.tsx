import { Sparkles } from 'lucide-react-native';
import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

export type AIInsightCardProps = {
  title: string;
  message: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  badge?: string;
  icon?: IconComponent;
};

// docs/03 AI Insight Card: large premium card with illustration/title/message/CTA
// and an optional badge. Used on Home, AI Coach, and Results.
export function AIInsightCard({
  title,
  message,
  ctaLabel,
  onPressCta,
  badge,
  icon: Icon = Sparkles,
}: AIInsightCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Card
      style={{
        backgroundColor: theme.colors.tertiaryContainer,
        flexDirection: 'row',
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: theme.radius.smallComponent,
          backgroundColor: theme.colors.onTertiaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={24} color={theme.colors.tertiaryContainer} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="headlineMd" color="onTertiaryContainer" style={{ flex: 1 }}>
            {title}
          </Text>
          {badge ? (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.onTertiaryContainer,
              }}
            >
              <Text variant="labelSm" color="tertiaryContainer">
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="bodyMd" color="onTertiaryContainer">
          {message}
        </Text>
        {ctaLabel ? (
          <Text
            variant="labelMd"
            color="onTertiaryContainer"
            style={{ marginTop: 4, textDecorationLine: 'underline' }}
            onPress={onPressCta}
            accessibilityRole="button"
          >
            {ctaLabel}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
