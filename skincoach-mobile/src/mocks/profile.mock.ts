import type { ProfileOverview } from '@/features/profile/profileOverview.types';

// Fixture for the Profile screen's mock sections, transcribed from the
// profile_achievements mockup: member-since, the "Consistency Champion" badge, the 2×2
// stat grid (streak / total scans / highest score / routine completion), and the
// achievements (First Scan, 7 Day Streak, 30 Day Routine unlocked; 100 Scans, Skin
// Expert still locked). Returned by getProfileOverview() while EXPO_PUBLIC_USE_MOCK_API
// is on. Name + Personal Skin Profile come from the real onboarding store, not here.
export const mockProfileOverview: ProfileOverview = {
  memberSince: 'June 2026',
  badgeLabel: 'Consistency Champion',
  stats: [
    { key: 'streak', value: '18', label: 'Days Current Streak' },
    { key: 'scans', value: '62', label: 'Total Scans' },
    { key: 'highScore', value: '91', label: 'Highest Skin Score' },
    { key: 'completion', value: '94%', label: 'Routine Completion' },
  ],
  achievements: [
    {
      id: 'first-scan',
      title: 'First Scan',
      icon: 'firstScan',
      state: 'completed',
      date: 'Jun 2026',
    },
    {
      id: 'streak-7',
      title: '7 Day Streak',
      icon: 'streak7',
      state: 'completed',
      date: 'Jun 2026',
    },
    { id: 'routine-30', title: '30 Day Routine', icon: 'routine30', state: 'unlocked' },
    { id: 'scans-100', title: '100 Scans', icon: 'scans100', state: 'locked' },
    { id: 'skin-expert', title: 'Skin Expert', icon: 'skinExpert', state: 'locked' },
  ],
};
