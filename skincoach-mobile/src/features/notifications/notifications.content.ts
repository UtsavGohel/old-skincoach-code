import { CalendarClock, Moon, ScanFace, Sunrise } from 'lucide-react-native';

import type { ReminderKey } from '@/store/settings.store';
import type { IconComponent } from '@/types/icon';

// The customizable scheduled reminders (docs/11 Notification Timing). Each maps to a time
// in settings.store.reminderTimes. Weekly Summary is fixed to Sundays (docs/11).
export const REMINDER_SCHEDULE: {
  key: ReminderKey;
  label: string;
  description: string;
  icon: IconComponent;
}[] = [
  {
    key: 'dailyScan',
    label: 'Daily Scan',
    description: 'A nudge to complete your scan.',
    icon: ScanFace,
  },
  {
    key: 'morningRoutine',
    label: 'Morning Routine',
    description: 'Start your day with your AM routine.',
    icon: Sunrise,
  },
  {
    key: 'nightRoutine',
    label: 'Night Routine',
    description: 'Wind down with your PM routine.',
    icon: Moon,
  },
  {
    key: 'weeklySummary',
    label: 'Weekly Summary',
    description: 'Your recap every Sunday.',
    icon: CalendarClock,
  },
];

// Half-hour presets across the day, formatted as 12-hour display strings ("7:00 AM").
// Used by the TimePickerModal; the scheduler will parse these when real local
// notifications are wired (Phase 20).
export const TIME_PRESETS: string[] = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute} ${period}`;
});
