import { useQuery } from '@tanstack/react-query';

import { getDashboard } from '@/api/dashboard.api';

export const dashboardQueryKey = ['dashboard'] as const;

// docs/09: server state goes through React Query, not Zustand. Screens read the
// dashboard via this hook so loading/error/refetch are handled consistently.
export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: getDashboard,
  });
}
