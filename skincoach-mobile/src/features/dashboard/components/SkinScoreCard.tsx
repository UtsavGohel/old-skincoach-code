import { Pressable, StyleSheet, View } from 'react-native';
import { Sparkles, TrendingUp } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { ProgressRing } from '@/components/ProgressRing';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

type SkinScoreCardProps = {
  score: number;
  scoreDelta: number;
  radianceLabel: string;
  onPressHistory: () => void;
};

// Hero card (home_dashboard): large animated Skin Score ring, a "+N since yesterday"
// trend chip pinned top-right, and a footer row with the qualitative radiance label +
// a View History link.
export function SkinScoreCard({
  score,
  scoreDelta,
  radianceLabel,
  onPressHistory,
}: SkinScoreCardProps): React.JSX.Element {
  const theme = useTheme();
  const deltaText = `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} since yesterday`;

  return (
    <Card variant="hero">
      <View style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}>
        <TrendingUp size={14} color={theme.colors.primary} />
        <Text variant="labelSm" color="primary">
          {deltaText}
        </Text>
      </View>

      <ProgressRing progress={score} valueLabel={String(score)} label="SKIN SCORE" />

      <View style={styles.footer}>
        <View style={styles.radiance}>
          <Sparkles size={20} color={theme.colors.primary} strokeWidth={1.75} />
          <Text variant="bodyMd" color="primary" style={styles.radianceLabel}>
            {radianceLabel}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onPressHistory} hitSlop={8}>
          <Text variant="labelMd" color="primary">
            View History
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  radiance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radianceLabel: {
    fontWeight: '700',
  },
});
