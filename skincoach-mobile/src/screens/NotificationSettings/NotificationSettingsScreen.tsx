import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, BellRing, Clock, MoonStar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { TimePickerModal } from '@/features/notifications/components/TimePickerModal';
import { REMINDER_SCHEDULE } from '@/features/notifications/notifications.content';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { SettingsToggleRow } from '@/features/settings/components/SettingsToggleRow';
import { NOTIFICATION_META } from '@/features/settings/settings.meta';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore, type ReminderKey } from '@/store/settings.store';
import type { RootStackParamList } from '@/navigation/types';

type ActivePicker =
  | { kind: 'reminder'; key: ReminderKey; title: string; value: string }
  | { kind: 'quiet'; bound: 'start' | 'end'; title: string; value: string }
  | null;

// Phase 13 — Notification Settings (no mockup; built per docs/11). Reached from the
// Settings "Notifications" row. The five notification-type toggles (docs/11, matching the
// Phase-11 list), customizable reminder times (via a preset TimePickerModal), and quiet
// hours. All state persists to settings.store.
export function NotificationSettingsScreen(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const notifications = useSettingsStore((s) => s.notifications);
  const toggleNotification = useSettingsStore((s) => s.toggleNotification);
  const reminderTimes = useSettingsStore((s) => s.reminderTimes);
  const setReminderTime = useSettingsStore((s) => s.setReminderTime);
  const quietHoursEnabled = useSettingsStore((s) => s.quietHoursEnabled);
  const quietHoursStart = useSettingsStore((s) => s.quietHoursStart);
  const quietHoursEnd = useSettingsStore((s) => s.quietHoursEnd);
  const toggleQuietHours = useSettingsStore((s) => s.toggleQuietHours);
  const setQuietHours = useSettingsStore((s) => s.setQuietHours);

  const [picker, setPicker] = useState<ActivePicker>(null);

  const onPickTime = (time: string): void => {
    if (!picker) return;
    if (picker.kind === 'reminder') {
      setReminderTime(picker.key, time);
    } else {
      setQuietHours(picker.bound, time);
    }
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
          Notifications
        </Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.banner}>
          <View
            style={[
              styles.bannerIcon,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
          >
            <BellRing size={20} color={theme.colors.primary} strokeWidth={1.75} />
          </View>
          <Text variant="labelMd" color="textSecondary" style={styles.bannerText}>
            Notifications are enabled for this device. We&apos;ll only send what helps —
            never during quiet hours.
          </Text>
        </Card>

        <SettingsSection title="Reminders">
          {NOTIFICATION_META.map((meta, index) => (
            <SettingsToggleRow
              key={meta.type}
              icon={meta.icon}
              label={meta.label}
              description={meta.description}
              value={notifications[meta.type]}
              onValueChange={() => toggleNotification(meta.type)}
              isLast={index === NOTIFICATION_META.length - 1}
            />
          ))}
        </SettingsSection>

        <SettingsSection title="Schedule">
          {REMINDER_SCHEDULE.map((reminder, index) => (
            <SettingsRow
              key={reminder.key}
              icon={reminder.icon}
              label={reminder.label}
              value={reminderTimes[reminder.key]}
              trailingIcon={Clock}
              onPress={() =>
                setPicker({
                  kind: 'reminder',
                  key: reminder.key,
                  title: `${reminder.label} reminder`,
                  value: reminderTimes[reminder.key],
                })
              }
              isLast={index === REMINDER_SCHEDULE.length - 1}
            />
          ))}
        </SettingsSection>

        <SettingsSection title="Quiet Hours">
          <SettingsToggleRow
            icon={MoonStar}
            label="Quiet Hours"
            description="Pause reminders overnight."
            value={quietHoursEnabled}
            onValueChange={toggleQuietHours}
            isLast={!quietHoursEnabled}
          />
          {quietHoursEnabled ? (
            <>
              <SettingsRow
                icon={Clock}
                label="From"
                value={quietHoursStart}
                trailingIcon={Clock}
                onPress={() =>
                  setPicker({
                    kind: 'quiet',
                    bound: 'start',
                    title: 'Quiet hours start',
                    value: quietHoursStart,
                  })
                }
              />
              <SettingsRow
                icon={Clock}
                label="Until"
                value={quietHoursEnd}
                trailingIcon={Clock}
                onPress={() =>
                  setPicker({
                    kind: 'quiet',
                    bound: 'end',
                    title: 'Quiet hours end',
                    value: quietHoursEnd,
                  })
                }
                isLast
              />
            </>
          ) : null}
        </SettingsSection>

        <Text variant="labelSm" color="textSecondary" style={styles.footer}>
          We never send more than a few reminders a day, and skip a reminder if
          you&apos;ve already completed that activity.
        </Text>
      </ScrollView>

      <TimePickerModal
        visible={picker !== null}
        title={picker?.title ?? ''}
        value={picker?.value ?? ''}
        onSelect={onPickTime}
        onClose={() => setPicker(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 24,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});
