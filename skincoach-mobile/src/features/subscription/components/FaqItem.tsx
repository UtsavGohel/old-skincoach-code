import { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { Faq } from '@/features/subscription/subscription.content';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FaqItemProps = {
  faq: Faq;
  isLast?: boolean;
};

// A collapsible FAQ row (docs/10 FAQ section) — taps expand the answer with a gentle
// layout animation. Local open/closed state; purely presentational content.
export function FaqItem({ faq, isLast = false }: FaqItemProps): React.JSX.Element {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const toggle = (): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  };

  return (
    <View
      style={[
        styles.item,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={faq.question}
        onPress={toggle}
        style={styles.questionRow}
      >
        <Text variant="bodyMd" color="textPrimary" style={styles.question}>
          {faq.question}
        </Text>
        <ChevronDown
          size={20}
          color={theme.colors.primary}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open ? (
        <Text variant="bodyMd" color="textSecondary" style={styles.answer}>
          {faq.answer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 4,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  question: {
    flex: 1,
    fontWeight: '600',
  },
  answer: {
    paddingBottom: 14,
    lineHeight: 24,
  },
});
