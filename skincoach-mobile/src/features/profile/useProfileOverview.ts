import { useQuery } from '@tanstack/react-query';

import { getProfileOverview } from '@/api/profile.api';

export const profileOverviewQueryKey = ['profile', 'overview'] as const;

// docs/09: server state via React Query. The Profile screen reads its stat grid and
// achievements through this so loading/error/refetch stay consistent with the rest of
// the app. The editable profile fields come from the onboarding store separately.
export function useProfileOverview() {
  return useQuery({
    queryKey: profileOverviewQueryKey,
    queryFn: getProfileOverview,
  });
}
