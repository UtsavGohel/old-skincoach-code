import { useQuery } from '@tanstack/react-query';

import { getScanResult } from '@/api/scan.api';
import { isMockApiEnabled } from '@/api/client';

export const analysisQueryKey = (scanId: string | null) =>
  ['analysis', scanId ?? 'mock'] as const;

// docs/09: server state via React Query. Results/AnalysisComplete read the completed
// scan's analysis by id (set during the scan flow). In mock mode the id is irrelevant —
// getScanResult returns the fixture — so the query still runs without one.
export function useAnalysis(scanId: string | null) {
  return useQuery({
    queryKey: analysisQueryKey(scanId),
    queryFn: () => getScanResult(scanId ?? ''),
    enabled: isMockApiEnabled || !!scanId,
  });
}
