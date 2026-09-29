import { useQuery } from '@tanstack/react-query';

import { getRoutine } from '@/api/routine.api';

export const routineQueryKey = ['routine'] as const;

// docs/09: server state via React Query. The Routine screen reads the day's steps,
// streak, and weekly consistency through this so loading/error/refetch stay consistent
// with the rest of the app. Local check-off state is layered on top in the screen.
export function useRoutine() {
  return useQuery({
    queryKey: routineQueryKey,
    queryFn: getRoutine,
  });
}
