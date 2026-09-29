import type { ProgressData } from '@/features/progress/progress.types';
import { mockProgressData } from '@/mocks/progress.mock';

import { isMockApiEnabled, mockRequest, request } from './client';

// GET /api/v1/progress (docs/05 Progress APIs). Consumed via useProgress().
// Wired to the real backend (Slice 4); mock only serves EXPO_PUBLIC_USE_MOCK_API mode.
const WIRED_TO_BACKEND = true;

export async function getProgress(): Promise<ProgressData> {
  if (isMockApiEnabled || !WIRED_TO_BACKEND) {
    return mockRequest(mockProgressData);
  }
  return request<ProgressData>('/progress');
}
