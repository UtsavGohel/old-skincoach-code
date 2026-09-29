import { useQuery } from '@tanstack/react-query';

import { getCoach } from '@/api/coach.api';

export const coachQueryKey = ['coach'] as const;

// docs/09: server state via React Query. The AI Coach hub reads its insight, weekly
// summary, recommendations, and articles through this so loading/error/refetch stay
// consistent with the rest of the app.
export function useCoach() {
  return useQuery({
    queryKey: coachQueryKey,
    queryFn: getCoach,
  });
}
