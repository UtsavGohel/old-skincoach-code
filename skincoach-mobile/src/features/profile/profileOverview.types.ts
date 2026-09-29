// Phase 10 — Profile & Achievements (design ref: profile_achievements; docs/02 Profile
// Flow, docs/03 Achievement Badge). The mock parts of the Profile screen (member-since,
// the profile badge, the stat grid, and achievements) — consumed via useProfileOverview().
// The name + Personal Skin Profile come from the real onboarding store, not this type.
// Icon keys are strings mapped to lucide icons in profile.meta.ts.

export type ProfileStatIconKey = 'streak' | 'scans' | 'highScore' | 'completion';

export type ProfileStat = {
  key: ProfileStatIconKey;
  value: string;
  label: string;
};

export type AchievementIconKey =
  'firstScan' | 'streak7' | 'routine30' | 'scans100' | 'skinExpert';

// State reuses the shared AchievementBadge's three states (locked/unlocked/completed).
export type AchievementState = 'locked' | 'unlocked' | 'completed';

export type ProfileAchievement = {
  id: string;
  title: string;
  icon: AchievementIconKey;
  state: AchievementState;
  date?: string;
};

export type ProfileOverview = {
  memberSince: string; // e.g. "June 2026"
  badgeLabel: string; // e.g. "Consistency Champion"
  stats: ProfileStat[];
  achievements: ProfileAchievement[];
};
