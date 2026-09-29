import {
  Blend,
  Droplet,
  Droplets,
  FlaskConical,
  Flower2,
  HelpCircle,
  Smile,
  Sparkles,
  Sprout,
} from 'lucide-react-native';

import type { IconComponent } from '@/types/icon';
import type { ExperienceLevel, Gender, PrimaryGoal, SkinType } from './profile.types';

// Option sets transcribed from the onboarding mockups (onboarding_let_s_get_started,
// onboarding_skin_profile_goals). Icons are lucide thin-stroke outlines standing in
// for the mockups' Material Symbols per docs/19's cross-cutting deviation ("avoid the
// Material Design look" — PROJECT_CONTEXT.md / docs/03).

export type Option<T extends string> = {
  value: T;
  label: string;
};

export type IconOption<T extends string> = Option<T> & {
  icon: IconComponent;
};

export type ExperienceOptionData = IconOption<ExperienceLevel> & {
  description: string;
};

export const GENDER_OPTIONS: Option<Gender>[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export const SKIN_TYPE_OPTIONS: IconOption<SkinType>[] = [
  { value: 'normal', label: 'Normal', icon: Smile },
  { value: 'dry', label: 'Dry', icon: Droplet },
  { value: 'oily', label: 'Oily', icon: Droplets },
  { value: 'combination', label: 'Combination', icon: Blend },
  { value: 'sensitive', label: 'Sensitive', icon: Flower2 },
  { value: 'not-sure', label: 'Not Sure', icon: HelpCircle },
];

export const PRIMARY_GOAL_OPTIONS: Option<PrimaryGoal>[] = [
  { value: 'clear-acne', label: 'Clear Acne' },
  { value: 'reduce-dark-spots', label: 'Reduce Dark Spots' },
  { value: 'hydration', label: 'Hydration' },
  { value: 'reduce-redness', label: 'Reduce Redness' },
  { value: 'even-skin-tone', label: 'Even Skin Tone' },
  { value: 'brightening', label: 'Brightening' },
  { value: 'anti-aging', label: 'Anti-Aging' },
  { value: 'better-routine', label: 'Better Routine' },
  { value: 'overall-healthy-skin', label: 'Overall Healthy Skin' },
];

export const EXPERIENCE_OPTIONS: ExperienceOptionData[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: "I'm just starting my skincare journey.",
    icon: Sprout,
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'I have a routine but want better results.',
    icon: FlaskConical,
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: "I'm well-versed in ingredients and actives.",
    icon: Sparkles,
  },
];

// Age wheel bounds. docs/01 targets 18–40 but the picker allows a wider realistic
// range; 26 is the mockup's centered default.
export const AGE_MIN = 13;
export const AGE_MAX = 90;
export const AGE_DEFAULT = 26;
