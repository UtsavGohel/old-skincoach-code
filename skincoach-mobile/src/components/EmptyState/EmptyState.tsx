import { View } from 'react-native';
import { Sparkle } from 'lucide-react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { IconComponent } from '@/types/icon';

export type EmptyStateProps = {
  title: string;
  description: string;
  icon?: IconComponent;
  primaryCtaLabel?: string;
  onPressPrimaryCta?: () => void;
  secondaryCtaLabel?: string;
  onPressSecondaryCta?: () => void;
};

// docs/03 Empty State: illustration, title, description, primary CTA, optional
// secondary CTA. Used on Progress/Routine/History/AI Coach (copy per docs/02).
export function EmptyState({
  title,
  description,
  icon: Icon = Sparkle,
  primaryCtaLabel,
  onPressPrimaryCta,
  secondaryCtaLabel,
  onPressSecondaryCta,
}: EmptyStateProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{ alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.xl }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: theme.colors.secondaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={32} color={theme.colors.onSecondaryContainer} />
      </View>
      <Text variant="headlineMd" color="textPrimary" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      <Text variant="bodyMd" color="textSecondary" style={{ textAlign: 'center' }}>
        {description}
      </Text>
      {primaryCtaLabel ? (
        <Button
          label={primaryCtaLabel}
          onPress={onPressPrimaryCta}
          style={{ marginTop: theme.spacing.sm }}
        />
      ) : null}
      {secondaryCtaLabel ? (
        <Button label={secondaryCtaLabel} variant="text" onPress={onPressSecondaryCta} />
      ) : null}
    </View>
  );
}
