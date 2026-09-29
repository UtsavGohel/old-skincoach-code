import { Droplets, Moon, Spline, Sun } from 'lucide-react-native';

import type { RecommendationIconKey } from '@/features/coach/coach.types';
import type { IconComponent } from '@/types/icon';

// Maps each recommendation's icon key to a lucide icon (thin-stroke outline per
// DESIGN.md). The ai_skin_coach mockup uses Material Symbols (water_drop/wb_sunny/
// bedtime); these are the closest lucide equivalents, consistent with the rest of the app.
export const RECOMMENDATION_ICON: Record<RecommendationIconKey, IconComponent> = {
  water: Droplets,
  sun: Sun,
  sleep: Moon,
  routine: Spline,
};
