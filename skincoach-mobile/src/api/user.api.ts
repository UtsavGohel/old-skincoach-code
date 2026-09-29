import type { UserProfileDraft } from '@/features/profile/profile.types';

import { isMockApiEnabled, mockRequest, request } from './client';

// Backend GET/PATCH /users/me (docs/05). `profile` mirrors the user_profiles columns;
// stored as free text so the client's typed option values round-trip unchanged.
export interface MeResponse {
  id: string;
  email: string;
  fullName: string | null;
  profileImage: string | null;
  createdAt: string;
  profile: {
    age: number | null;
    gender: string | null;
    skinType: string | null;
    primaryGoal: string | null;
    experienceLevel: string | null;
    timezone: string | null;
    country: string | null;
  } | null;
}

const mockMe: MeResponse = {
  id: 'mock-user',
  email: 'demo@skincoach.app',
  fullName: 'SkinCoach User',
  profileImage: null,
  createdAt: new Date().toISOString(),
  profile: null,
};

export async function getMe(): Promise<MeResponse> {
  if (isMockApiEnabled) {
    return mockRequest(mockMe);
  }
  return request<MeResponse>('/users/me');
}

// Maps the onboarding draft onto the PATCH body. Undefined fields are omitted (the
// backend does a partial update), so a half-finished draft still saves cleanly.
export async function updateMe(draft: UserProfileDraft): Promise<MeResponse> {
  const body = {
    fullName: draft.name,
    age: draft.age,
    gender: draft.gender,
    skinType: draft.skinType,
    primaryGoal: draft.primaryGoal,
    experienceLevel: draft.experienceLevel,
  };
  if (isMockApiEnabled) {
    return mockRequest({ ...mockMe, fullName: draft.name ?? mockMe.fullName });
  }
  return request<MeResponse>('/users/me', { method: 'PATCH', body });
}

// Onboarding finish: a brand-new user can reach here before Clerk's user.created
// webhook has synced their row (so PATCH /users/me would 404). Retry a few times so
// first-run onboarding saves reliably.
export async function saveOnboardingProfile(draft: UserProfileDraft): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await updateMe(draft);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }
  throw lastError;
}
