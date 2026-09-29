import type { PropsWithChildren } from 'react';
import { Modal as RNModal, Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/hooks/useTheme';

export type ModalProps = PropsWithChildren<{
  visible: boolean;
  onRequestClose: () => void;
}>;

// docs/03 Modal: centered, blurred background, rounded, large padding. Used for
// confirmations, delete account, logout, subscription success.
export function Modal({
  visible,
  onRequestClose,
  children,
}: ModalProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={onRequestClose}
        accessibilityLabel="Dismiss dialog"
        accessibilityRole="button"
      >
        <BlurView
          intensity={30}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.lg,
          }}
        >
          {/* Stops the dismiss-on-backdrop-press from also firing when tapping content */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              style={{
                backgroundColor: theme.colors.surfaceContainerLowest,
                borderRadius: theme.radius.modal,
                padding: theme.spacing.xl,
                maxWidth: 400,
                width: '100%',
                ...theme.shadow.card,
              }}
            >
              {children}
            </View>
          </Pressable>
        </BlurView>
      </Pressable>
    </RNModal>
  );
}
