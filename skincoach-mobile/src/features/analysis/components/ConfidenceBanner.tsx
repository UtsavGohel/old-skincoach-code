import { StyleSheet, View } from 'react-native';
import { AlertTriangle, CircleCheck, Info } from 'lucide-react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/theme';
import { getConfidenceTier } from '@/features/analysis/confidence';

type ConfidenceBannerProps = {
  confidence: number;
  onRetake: () => void;
};

// Surfaces the docs/06 confidence tier for a scan. High confidence is a quiet reassurance
// pill; moderate is a soft note; retake/reject is a prominent banner with a Retake CTA so
// a low-confidence result is never presented as reliable fact (AI safety).
export function ConfidenceBanner({
  confidence,
  onRetake,
}: ConfidenceBannerProps): React.JSX.Element {
  const theme = useTheme();
  const tier = getConfidenceTier(confidence);

  const palette: Record<
    typeof tier.level,
    { bg: keyof ColorScheme; fg: keyof ColorScheme; icon: typeof Info }
  > = {
    high: { bg: 'secondaryContainer', fg: 'primary', icon: CircleCheck },
    moderate: { bg: 'surfaceContainer', fg: 'textSecondary', icon: Info },
    retake: { bg: 'errorContainer', fg: 'error', icon: AlertTriangle },
    reject: { bg: 'errorContainer', fg: 'error', icon: AlertTriangle },
  };
  const { bg, fg, icon: Icon } = palette[tier.level];

  return (
    <View style={[styles.banner, { backgroundColor: theme.colors[bg] }]}>
      <View style={styles.row}>
        <Icon size={20} color={theme.colors[fg]} />
        <View style={styles.text}>
          <Text variant="labelMd" color={fg}>
            {tier.label}
          </Text>
          <Text variant="bodyMd" color="textSecondary">
            {tier.description}
          </Text>
        </View>
      </View>
      {tier.suggestRetake ? (
        <Button
          label="Retake photo"
          variant="secondary"
          onPress={onRetake}
          style={styles.retake}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  retake: {
    marginTop: 0,
  },
});
