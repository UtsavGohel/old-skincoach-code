// Phase 8 — Routine Tracker (design ref: my_routine_tracker; docs/02 Routine Flow,
// docs/03 Routine Item). API-shaped types consumed via useRoutine(); the icon key is a
// string here (a real API returns a key, not a component) and is mapped to a lucide icon
// in routine.meta.ts, mirroring the analysis feature's METRIC_META pattern.

export type RoutineTimeOfDay = 'morning' | 'night';

// Keys map to lucide icons in routine.meta.ts (ROUTINE_ICON).
export type RoutineIconKey =
  | 'cleanser'
  | 'serum'
  | 'moisturizer'
  | 'sunscreen'
  | 'faceWash'
  | 'retinol'
  | 'nightCream';

export type RoutineStep = {
  id: string;
  productName: string;
  // The specific product ("Gentle Milk Cleanser") — shown as the item's notes line.
  productDetail: string;
  icon: RoutineIconKey;
  // docs/03 Routine Item requires a reminder time (missing from the mockup).
  reminderTime: string;
  completed: boolean;
};

export type RoutineSectionData = {
  timeOfDay: RoutineTimeOfDay;
  steps: RoutineStep[];
};

// A single day in the Weekly Consistency strip. 'today' renders the dashed ring, past
// days are complete/missed, future days are upcoming.
export type WeeklyConsistencyStatus = 'complete' | 'missed' | 'today' | 'upcoming';

export type WeeklyConsistencyDay = {
  label: string; // 'M', 'T', ...
  status: WeeklyConsistencyStatus;
};

export type RoutineData = {
  sections: RoutineSectionData[];
  streakDays: number;
  weeklyConsistencyPct: number;
  weeklyDays: WeeklyConsistencyDay[];
  tip: { title: string; message: string };
};
