import { Bell, CalendarCheck, ScanFace, Sparkles, TrendingUp } from 'lucide-react-native';

import type { NotificationType } from '@/store/settings.store';
import type { IconComponent } from '@/types/icon';

// Display label + icon per notification type (docs/11), shown as the Notifications
// toggle rows. One icon library (lucide) throughout, consistent with the rest of the app.
export const NOTIFICATION_META: {
  type: NotificationType;
  label: string;
  description: string;
  icon: IconComponent;
}[] = [
  {
    type: 'dailyScan',
    label: 'Daily Scan Reminder',
    description: "A nudge to complete today's skin scan.",
    icon: ScanFace,
  },
  {
    type: 'routine',
    label: 'Routine Reminder',
    description: 'Morning and evening routine check-ins.',
    icon: CalendarCheck,
  },
  {
    type: 'aiInsight',
    label: 'AI Insight',
    description: 'New personalized tips from your Coach.',
    icon: Sparkles,
  },
  {
    type: 'weeklySummary',
    label: 'Weekly Summary',
    description: 'Your progress recap every week.',
    icon: TrendingUp,
  },
  {
    type: 'achievement',
    label: 'Achievement',
    description: 'When you earn a new badge or milestone.',
    icon: Bell,
  },
];
