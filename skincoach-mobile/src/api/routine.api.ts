import type {
  RoutineData,
  RoutineIconKey,
  RoutineSectionData,
  RoutineStep,
  RoutineTimeOfDay,
  WeeklyConsistencyDay,
} from '@/features/routine/routine.types';
import { mockRoutineData } from '@/mocks/routine.mock';

import { isMockApiEnabled, mockRequest, request } from './client';

// Routine Tracker (docs/05 Routine APIs). Consumed via useRoutine(). Wired to the real
// backend (Slice 4): composes GET /routines (the steps) + GET /routines/stats (streak,
// consistency, this week's per-day status) into the screen's RoutineData shape.
const WIRED_TO_BACKEND = true;

interface RawRoutineItem {
  id: string;
  productName: string;
  stepOrder: number;
  productType: string | null;
  instructions: string | null;
  reminderTime: string | null;
  completedToday: boolean;
}

interface RawRoutine {
  id: string;
  name: string;
  timeOfDay: string;
  isActive: boolean;
  items: RawRoutineItem[];
}

interface RawStats {
  currentStreak: number;
  weeklyConsistency: number;
  completedThisWeek: number;
  activeItems: number;
  weeklyDays: WeeklyConsistencyDay[];
}

export async function getRoutine(): Promise<RoutineData> {
  if (isMockApiEnabled || !WIRED_TO_BACKEND) {
    return mockRequest(mockRoutineData);
  }
  const [routines, stats] = await Promise.all([
    request<RawRoutine[]>('/routines'),
    request<RawStats>('/routines/stats'),
  ]);
  return mapRoutine(routines, stats);
}

// POST /routines/items/:id/complete — persists a single step's completion for today
// (upsert on the backend, so it's idempotent). No-op in mock mode.
export async function completeRoutineItem(
  itemId: string,
  completed: boolean,
): Promise<void> {
  if (isMockApiEnabled) {
    await mockRequest(null, { delayMs: 200 });
    return;
  }
  await request(`/routines/items/${itemId}/complete`, {
    method: 'POST',
    body: { completed },
  });
}

// ---- Routine creation / editing --------------------------------------------------

export interface RoutineStepInput {
  productName: string;
  productType?: string;
  reminderTime?: string; // "HH:mm"
}

const STARTER: {
  name: string;
  timeOfDay: 'morning' | 'night';
  steps: RoutineStepInput[];
}[] = [
  {
    name: 'Morning Routine',
    timeOfDay: 'morning',
    steps: [
      { productName: 'Gentle Cleanser', productType: 'Cleanser', reminderTime: '08:00' },
      { productName: 'Vitamin C Serum', productType: 'Serum', reminderTime: '08:05' },
      { productName: 'Moisturizer', productType: 'Moisturizer', reminderTime: '08:10' },
      {
        productName: 'Sunscreen SPF 50',
        productType: 'Sunscreen',
        reminderTime: '08:15',
      },
    ],
  },
  {
    name: 'Night Routine',
    timeOfDay: 'night',
    steps: [
      { productName: 'Gentle Cleanser', productType: 'Cleanser', reminderTime: '21:00' },
      { productName: 'Treatment Serum', productType: 'Retinol', reminderTime: '21:05' },
      { productName: 'Night Cream', productType: 'Night Cream', reminderTime: '21:10' },
    ],
  },
];

function toCreateBody(
  name: string,
  timeOfDay: 'morning' | 'night',
  steps: RoutineStepInput[],
): unknown {
  return {
    name,
    timeOfDay,
    items: steps.map((s, i) => ({
      productName: s.productName,
      stepOrder: i + 1,
      productType: s.productType || undefined,
      reminderTime: s.reminderTime || undefined,
    })),
  };
}

// Creates a sensible default AM + PM routine so a new user has something real to track
// immediately (they can edit it afterwards).
export async function createStarterRoutine(): Promise<void> {
  if (isMockApiEnabled) {
    await mockRequest(null, { delayMs: 300 });
    return;
  }
  await Promise.all(
    STARTER.map((r) =>
      request('/routines', {
        method: 'POST',
        body: toCreateBody(r.name, r.timeOfDay, r.steps),
      }),
    ),
  );
}

// Replaces the user's routine with the given morning/night steps. The backend PATCH only
// edits routine-level fields (not items), so an edit is a delete-then-recreate: remove
// the existing routines, then create one per non-empty section.
export async function saveRoutine(
  morning: RoutineStepInput[],
  night: RoutineStepInput[],
): Promise<void> {
  if (isMockApiEnabled) {
    await mockRequest(null, { delayMs: 300 });
    return;
  }
  const existing = await request<RawRoutine[]>('/routines');
  await Promise.all(
    existing.map((r) => request(`/routines/${r.id}`, { method: 'DELETE' })),
  );
  const creates: Promise<unknown>[] = [];
  if (morning.length) {
    creates.push(
      request('/routines', {
        method: 'POST',
        body: toCreateBody('Morning Routine', 'morning', morning),
      }),
    );
  }
  if (night.length) {
    creates.push(
      request('/routines', {
        method: 'POST',
        body: toCreateBody('Night Routine', 'night', night),
      }),
    );
  }
  await Promise.all(creates);
}

// The raw routines, used to pre-fill the editor when editing an existing routine.
export async function getRawRoutines(): Promise<
  { timeOfDay: RoutineTimeOfDay; steps: RoutineStepInput[] }[]
> {
  if (isMockApiEnabled) {
    return mockRequest([]);
  }
  const routines = await request<RawRoutine[]>('/routines');
  return routines
    .filter((r) => r.isActive)
    .map((r) => ({
      timeOfDay: normalizeTimeOfDay(r.timeOfDay),
      steps: [...r.items]
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((it) => ({
          productName: it.productName,
          productType: it.productType ?? undefined,
          reminderTime: it.reminderTime ?? undefined,
        })),
    }));
}

// ---- Backend → UI mapping --------------------------------------------------------

function normalizeTimeOfDay(timeOfDay: string): RoutineTimeOfDay {
  return /night|evening|pm/i.test(timeOfDay) ? 'night' : 'morning';
}

// Best-effort icon from the product type/name (backend stores free text, the UI wants a
// known key). Falls back to a serum flask when nothing matches.
function iconFor(item: RawRoutineItem): RoutineIconKey {
  const text = `${item.productType ?? ''} ${item.productName}`.toLowerCase();
  if (/sunscreen|spf|sun/.test(text)) return 'sunscreen';
  if (/retinol|retinoid/.test(text)) return 'retinol';
  if (/night\s*cream/.test(text)) return 'nightCream';
  if (/moistur|cream|lotion|ceramide/.test(text)) return 'moisturizer';
  if (/wash|foam/.test(text)) return 'faceWash';
  if (/cleanser|cleanse/.test(text)) return 'cleanser';
  return 'serum';
}

function toStep(item: RawRoutineItem): RoutineStep {
  return {
    id: item.id,
    productName: item.productName,
    productDetail: item.instructions ?? item.productType ?? '',
    icon: iconFor(item),
    reminderTime: item.reminderTime ?? '',
    completed: item.completedToday,
  };
}

function tipFor(streak: number): { title: string; message: string } {
  if (streak >= 7) {
    return {
      title: "You're on a roll",
      message: `A ${streak}-day streak — your skin thrives on this consistency.`,
    };
  }
  if (streak === 0) {
    return {
      title: 'Start today',
      message: 'Complete your routine to begin a fresh streak.',
    };
  }
  return {
    title: 'Keep it going',
    message: `You're ${streak} day${streak === 1 ? '' : 's'} in — small habits compound.`,
  };
}

function mapRoutine(routines: RawRoutine[], stats: RawStats): RoutineData {
  // Merge every routine's items into its morning/night section (steps ordered).
  const byTime: Record<RoutineTimeOfDay, RoutineStep[]> = { morning: [], night: [] };
  for (const routine of routines.filter((r) => r.isActive)) {
    const time = normalizeTimeOfDay(routine.timeOfDay);
    const steps = [...routine.items]
      .sort((a, b) => a.stepOrder - b.stepOrder)
      .map(toStep);
    byTime[time].push(...steps);
  }

  const sections: RoutineSectionData[] = (['morning', 'night'] as const)
    .filter((time) => byTime[time].length > 0)
    .map((time) => ({ timeOfDay: time, steps: byTime[time] }));

  return {
    sections,
    streakDays: stats.currentStreak,
    weeklyConsistencyPct: stats.weeklyConsistency,
    weeklyDays: stats.weeklyDays,
    tip: tipFor(stats.currentStreak),
  };
}
