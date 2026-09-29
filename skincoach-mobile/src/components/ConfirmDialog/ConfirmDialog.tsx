import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // Styles the confirm button as destructive (Delete Account, Log Out).
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// docs/03 Modal: centered confirmation dialog for destructive/irreversible actions
// (delete account, log out). Built on the shared Modal so the blur/backdrop/dismiss
// behaviour is consistent app-wide.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <Modal visible={visible} onRequestClose={onCancel}>
      <Text variant="headlineMd" color="textPrimary" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMd" color="textSecondary" style={styles.message}>
        {message}
      </Text>
      <View style={styles.actions}>
        <Button
          label={confirmLabel}
          variant="primary"
          fullWidth
          style={destructive ? { backgroundColor: theme.colors.error } : undefined}
          onPress={onConfirm}
          accessibilityLabel={confirmLabel}
        />
        <Button
          label={cancelLabel}
          variant="text"
          fullWidth
          onPress={onCancel}
          accessibilityLabel={cancelLabel}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 20,
    lineHeight: 24,
  },
  actions: {
    gap: 4,
  },
});
