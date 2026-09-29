import {
  Award,
  Calendar,
  Camera,
  Flame,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react-native';

import type {
  AchievementIconKey,
  ProfileStatIconKey,
} from '@/features/profile/profileOverview.types';
import type { IconComponent } from '@/types/icon';

// One icon library throughout (lucide) — docs/19's audit flagged the mockup for mixing
// emoji stat icons (🔥 📷 🏆 ⭐) with Material Symbols badge icons. These are the sage
// thin-stroke equivalents used consistently across the app.
export const PROFILE_STAT_ICON: Record<ProfileStatIconKey, IconComponent> = {
  streak: Flame,
  scans: Camera,
  highScore: Trophy,
  completion: Star,
};

export const ACHIEVEMENT_ICON: Record<AchievementIconKey, IconComponent> = {
  firstScan: Camera,
  streak7: Calendar,
  routine30: Sparkles,
  scans100: Star,
  skinExpert: Award,
};
