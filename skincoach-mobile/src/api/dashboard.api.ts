import type { DashboardResponse } from '@/features/dashboard/dashboard.types';
import { mockDashboardResponse } from '@/mocks/dashboard.mock';

import { isMockApiEnabled, mockRequest, request } from './client';

// GET /api/v1/dashboard (docs/05). Branches on the mock flag like every api/* function
// (docs/18: never fetch() from screens/hooks). Screens consume this via useDashboard().
// Wired to the real aggregate (Slice 4); mock only serves EXPO_PUBLIC_USE_MOCK_API mode.
const WIRED_TO_BACKEND = true;

export async function getDashboard(): Promise<DashboardResponse> {
  if (isMockApiEnabled || !WIRED_TO_BACKEND) {
    return mockRequest(mockDashboardResponse);
  }
  return request<DashboardResponse>('/dashboard');
}
