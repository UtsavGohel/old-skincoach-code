import type {
  ProfileAchievement,
  ProfileOverview,
  ProfileStat,
} from '@/features/profile/profileOverview.types';
import { mockProfileOverview } from '@/mocks/profile.mock';

import { isMockApiEnabled, mockRequest, request } from './client';

// Profile overview (design ref: profile_achievements). Consumed via useProfileOverview().
// Wired (Slice 4): composed from real endpoints — /users/me (member since), /progress/
// summary (scan count + best score), /routines/stats (streak + completion). Stats and
// achievements are all derived from real activity, never fabricated. The editable
// name/skin-type/goal come from the onboarding store, not here.
const WIRED_TO_BACKEND = true;

interface RawMe {
  createdAt: string;
}
interface RawSummary {
  overall: {
    bestScore: number | null;
    totalScans: number;
  };
}
interface RawRoutineStats {
  currentStreak: number;
  weeklyConsistency: number;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export async function getProfileOverview(): Promise<ProfileOverview> {
  if (isMockApiEnabled || !WIRED_TO_BACKEND) {
    return mockRequest(mockProfileOverview);
  }
  const [me, summary, stats] = await Promise.all([
    request<RawMe>('/users/me'),
    request<RawSummary>('/progress/summary'),
    request<RawRoutineStats>('/routines/stats'),
  ]);
  return mapOverview(me, summary, stats);
}

function memberSince(createdAt: string): string {
  const d = new Date(createdAt);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// A badge earned from real activity — never a fixed label. Falls back to a welcoming
// label for brand-new accounts rather than implying achievements they haven't earned.
function badgeFor(totalScans: number, streak: number, bestScore: number | null): string {
  if (totalScans === 0) return 'New Member';
  if (streak >= 7) return 'Consistency Champion';
  if ((bestScore ?? 0) >= 90) return 'Skin Star';
  return 'Rising Star';
}

function mapOverview(
  me: RawMe,
  summary: RawSummary,
  stats: RawRoutineStats,
): ProfileOverview {
  const totalScans = summary.overall.totalScans;
  const bestScore = summary.overall.bestScore;
  const streak = stats.currentStreak;

  const overviewStats: ProfileStat[] = [
    { key: 'streak', value: String(streak), label: 'Days Current Streak' },
    { key: 'scans', value: String(totalScans), label: 'Total Scans' },
    {
      key: 'highScore',
      value: bestScore !== null ? String(bestScore) : '—',
      label: 'Highest Skin Score',
    },
    {
      key: 'completion',
      value: `${stats.weeklyConsistency}%`,
      label: 'Routine Completion',
    },
  ];

  // Each achievement is genuinely earned (completed) or not (locked), from real
  // thresholds — no fabricated "unlocked" badges.
  const earned = (done: boolean): ProfileAchievement['state'] =>
    done ? 'completed' : 'locked';
  const achievements: ProfileAchievement[] = [
    {
      id: 'first-scan',
      title: 'First Scan',
      icon: 'firstScan',
      state: earned(totalScans >= 1),
    },
    {
      id: 'streak-7',
      title: '7 Day Streak',
      icon: 'streak7',
      state: earned(streak >= 7),
    },
    {
      id: 'routine-30',
      title: '30 Day Streak',
      icon: 'routine30',
      state: earned(streak >= 30),
    },
    {
      id: 'scans-100',
      title: '100 Scans',
      icon: 'scans100',
      state: earned(totalScans >= 100),
    },
    {
      id: 'skin-expert',
      title: 'Skin Expert',
      icon: 'skinExpert',
      state: earned((bestScore ?? 0) >= 90),
    },
  ];

  return {
    memberSince: memberSince(me.createdAt),
    badgeLabel: badgeFor(totalScans, streak, bestScore),
    stats: overviewStats,
    achievements,
  };
}
