import {
  CircleDot,
  Droplet,
  Droplets,
  Eye,
  Flame,
  Grip,
  Sparkles,
  Sun,
  Waves,
} from 'lucide-react-native';

import type { IconComponent } from '@/types/icon';
import type { MetricKey } from './analysis.types';

// Display metadata per metric — a distinct lucide thin-stroke icon + label (the mockup
// uses Material Symbols; docs/19 cross-cutting deviation → lucide throughout).
export const METRIC_META: Record<MetricKey, { label: string; icon: IconComponent }> = {
  acne: { label: 'Acne', icon: CircleDot },
  hydration: { label: 'Hydration', icon: Droplet },
  redness: { label: 'Redness', icon: Flame },
  pigmentation: { label: 'Pigmentation', icon: Sun },
  texture: { label: 'Texture', icon: Sparkles },
  oiliness: { label: 'Oiliness', icon: Droplets },
  pores: { label: 'Pores', icon: Grip },
  wrinkles: { label: 'Wrinkles', icon: Waves },
  darkCircles: { label: 'Dark Circles', icon: Eye },
};
