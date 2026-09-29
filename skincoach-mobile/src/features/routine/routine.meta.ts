import {
  Droplet,
  Droplets,
  FlaskConical,
  Moon,
  Pill,
  Sun,
  Waves,
} from 'lucide-react-native';

import type { RoutineIconKey } from '@/features/routine/routine.types';
import type { IconComponent } from '@/types/icon';

// Maps each routine step's icon key to a lucide icon (thin-stroke outline per DESIGN.md).
// The my_routine_tracker mockup uses Material Symbols (water_drop/science/opacity/...);
// these are the closest lucide equivalents, kept consistent with the rest of the app.
export const ROUTINE_ICON: Record<RoutineIconKey, IconComponent> = {
  cleanser: Droplet,
  serum: FlaskConical,
  moisturizer: Droplets,
  sunscreen: Sun,
  faceWash: Waves,
  retinol: Pill,
  nightCream: Moon,
};
