import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { Modal } from '@/components/Modal';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { TIME_PRESETS } from '@/features/notifications/notifications.content';

type TimePickerModalProps = {
  visible: boolean;
  title: string;
  value: string;
  onSelect: (time: string) => void;
  onClose: () => void;
};

// A preset time picker (docs/11 — users can customize reminder times). Uses the shared
// Modal with a scrollable list of half-hour options; no native date picker dependency.
export function TimePickerModal({
  visible,
  title,
  value,
  onSelect,
  onClose,
}: TimePickerModalProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <Text variant="headlineMd" color="textPrimary" style={styles.title}>
        {title}
      </Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {TIME_PRESETS.map((time) => {
          const selected = time === value;
          return (
            <Pressable
              key={time}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={time}
              onPress={() => {
                onSelect(time);
                onClose();
              }}
              style={[
                styles.option,
                selected && { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <Text variant="bodyMd" color={selected ? 'primary' : 'textPrimary'}>
                {time}
              </Text>
              {selected ? <Check size={18} color={theme.colors.primary} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 12,
  },
  list: {
    maxHeight: 320,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
