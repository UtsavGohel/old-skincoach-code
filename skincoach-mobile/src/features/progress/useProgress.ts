import { useQuery } from '@tanstack/react-query';

import { getProgress } from '@/api/progress.api';

export const progressQueryKey = ['progress'] as const;

// docs/09: server state via React Query. The Progress screen reads trends/milestones
// through this so loading/error/refetch stay consistent with the rest of the app.
export function useProgress() {
  return useQuery({
    queryKey: progressQueryKey,
    queryFn: getProgress,
  });
}
