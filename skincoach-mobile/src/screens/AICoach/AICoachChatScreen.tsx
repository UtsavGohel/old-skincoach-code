import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { sendCoachMessage } from '@/api/coach.api';
import { AIChatBubble } from '@/components/AIChatBubble';
import { Text } from '@/components/Text';
import { coachGreeting, type ChatMessage } from '@/features/coach/coachChat';
import { useTheme } from '@/hooks/useTheme';
import type { RootStackParamList } from '@/navigation/types';

let messageCounter = 0;
const nextId = (): string => `m${(messageCounter += 1)}`;

// Opening transcript: greeting, plus the suggested question the user arrived with (its
// reply is fetched async in an effect below, so no reply is precomputed here).
function buildInitialMessages(initialQuestion?: string): ChatMessage[] {
  const messages: ChatMessage[] = [
    { id: nextId(), role: 'assistant', text: coachGreeting },
  ];
  if (initialQuestion) {
    messages.push({ id: nextId(), role: 'user', text: initialQuestion });
  }
  return messages;
}

// Phase 9 — AI Coach chat (docs/02 "Ask AI", docs/07 Prompt 4). A pushed screen reached
// from the coach hub's Ask input / suggested chips / history icon. Uses the shared
// AIChatBubble; replies are canned and docs/07-compliant (coachChat.ts) with a short
// simulated typing delay. No real LLM call until the backend lands.
export function AICoachChatScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AICoachChat'>>();
  const scrollRef = useRef<ScrollView>(null);

  const initialQuestion = route.params?.initialQuestion;
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(initialQuestion),
  );
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const initialFetched = useRef(false);

  // Sends `text` to the coach and appends the reply (or an error bubble).
  const fetchReply = async (text: string): Promise<void> => {
    setIsTyping(true);
    try {
      const { reply } = await sendCoachMessage(text);
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          text: 'Sorry, I couldn’t reach your coach just now. Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Answer the suggested question the user arrived with, once. Deferred to a microtask
  // so no state is set synchronously inside the effect (lint: no cascading renders).
  useEffect(() => {
    if (initialQuestion && !initialFetched.current) {
      initialFetched.current = true;
      void Promise.resolve().then(() => fetchReply(initialQuestion));
    }
  }, [initialQuestion]);

  const send = (): void => {
    const text = draft.trim();
    if (!text || isTyping) return;
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
    setDraft('');
    void fetchReply(text);
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.iconButton}
        >
          <ArrowLeft size={24} color={theme.colors.primary} />
        </Pressable>
        <Text variant="headlineMd" color="primary">
          Ask Skin Coach
        </Text>
        <View style={styles.iconButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <AIChatBubble key={message.id} role={message.role} message={message.text} />
          ))}
          {isTyping ? (
            <View style={styles.typing}>
              <Text variant="labelSm" color="textSecondary">
                Coach is typing…
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.composer,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask your Skin Coach..."
            placeholderTextColor={theme.colors.textSecondary}
            style={[
              styles.input,
              theme.typography.bodyMd,
              {
                backgroundColor: theme.colors.surfaceContainerLowest,
                borderColor: theme.colors.outlineVariant,
                color: theme.colors.textPrimary,
              },
            ]}
            returnKeyType="send"
            onSubmitEditing={send}
            multiline
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            onPress={send}
            disabled={!draft.trim()}
            style={[
              styles.sendButton,
              {
                backgroundColor: draft.trim()
                  ? theme.colors.primary
                  : theme.colors.surfaceContainerHigh,
              },
            ]}
          >
            <Send
              size={20}
              color={draft.trim() ? theme.colors.onPrimary : theme.colors.textSecondary}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  typing: {
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
