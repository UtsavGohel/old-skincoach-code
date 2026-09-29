import type { ComponentType } from 'react';

// lucide-react-native's per-icon prop type (LucideProps) isn't exported by name from
// the package, so this is a minimal structural type covering what components in this
// app actually pass to icons — shared here so every component that accepts an icon
// prop (Input, MetricCard, AchievementBadge, ...) uses the same type.
export type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  fill?: string;
  // DESIGN.md: thin-stroke (1.5–2pt) rounded outline icons — some usages tune this.
  strokeWidth?: number;
}>;
