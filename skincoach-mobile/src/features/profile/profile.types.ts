// Onboarding profile shape. Mirrors the `user_profiles` columns in docs/04 /
// schema.prisma (age Int, gender/skinType/primaryGoal/experienceLevel as strings) —
// the DB stores these as free text, so the canonical option sets live here on the
// client (see onboarding.options.ts) and are transcribed from the onboarding mockups.
export type Gender = 'female' | 'male' | 'non-binary' | 'prefer-not-to-say';

export type SkinType =
  'normal' | 'dry' | 'oily' | 'combination' | 'sensitive' | 'not-sure';

export type PrimaryGoal =
  | 'clear-acne'
  | 'reduce-dark-spots'
  | 'hydration'
  | 'reduce-redness'
  | 'even-skin-tone'
  | 'brightening'
  | 'anti-aging'
  | 'better-routine'
  | 'overall-healthy-skin';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

// The draft is built up across the two onboarding steps; fields are optional until the
// user has answered each one (validation gates each step's Continue button).
export type UserProfileDraft = {
  name?: string;
  age?: number;
  gender?: Gender;
  skinType?: SkinType;
  // docs/04 / schema.prisma: `primary_goal` is a single column (heading also reads
  // "What's your primary goal?"), so this is single-select — see docs/19 deviation note
  // (the mockup's chips visually toggle multiple, but the doc + copy are singular).
  primaryGoal?: PrimaryGoal;
  experienceLevel?: ExperienceLevel;
};
