import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { CoachArticle } from '@/features/coach/coach.types';

type ArticleCardProps = {
  article: CoachArticle;
  onPress: () => void;
};

// A Learn article card (ai_skin_coach) — a horizontally-scrolling tile with the
// article's illustration, title, and read time. Uses the mockup's own hosted image URL
// as the placeholder (docs/19 convention for marketing imagery).
export function ArticleCard({ article, onPress }: ArticleCardProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}, ${article.readTime}`}
      style={[styles.card, { backgroundColor: theme.colors.surfaceContainerLow }]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Text variant="bodyMd" color="primary" style={styles.title}>
        {article.title}
      </Text>
      <Text variant="labelSm" color="textSecondary">
        {article.readTime}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: 24,
    padding: 20,
    gap: 4,
  },
  imageWrap: {
    height: 96,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontWeight: '600',
  },
});
