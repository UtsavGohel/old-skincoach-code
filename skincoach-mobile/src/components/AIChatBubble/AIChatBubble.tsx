import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

export type ChatRole = 'user' | 'assistant';

export type AIChatBubbleProps = {
  role: ChatRole;
  message: string;
  timestamp?: string;
  suggestedReplies?: string[];
  onPressSuggestedReply?: (reply: string) => void;
};

// docs/03 AI Chat Bubble: rounded/large radius, user right-aligned, AI left-aligned,
// optional timestamp + suggested replies.
export function AIChatBubble({
  role,
  message,
  timestamp,
  suggestedReplies,
  onPressSuggestedReply,
}: AIChatBubbleProps): React.JSX.Element {
  const theme = useTheme();
  const isUser = role === 'user';

  return (
    <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start', gap: 6 }}>
      <View
        style={{
          maxWidth: '80%',
          borderRadius: theme.radius.card,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          backgroundColor: isUser ? theme.colors.primary : theme.colors.surfaceContainer,
          ...(isUser
            ? { borderBottomRightRadius: theme.radius.smallComponent }
            : { borderBottomLeftRadius: theme.radius.smallComponent }),
        }}
      >
        <Text variant="bodyMd" color={isUser ? 'onPrimary' : 'textPrimary'}>
          {message}
        </Text>
      </View>
      {timestamp ? (
        <Text variant="labelSm" color="textSecondary">
          {timestamp}
        </Text>
      ) : null}
      {suggestedReplies && suggestedReplies.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {suggestedReplies.map((reply) => (
            <Pressable
              key={reply}
              onPress={() => onPressSuggestedReply?.(reply)}
              accessibilityRole="button"
              accessibilityLabel={reply}
              style={{
                borderRadius: theme.radius.full,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text variant="labelMd" color="primary">
                {reply}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
