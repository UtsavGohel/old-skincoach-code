import { create } from 'zustand';

type AuthState = {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
};

type AuthActions = {
  setAuthState: (state: AuthState) => void;
};

// Not MMKV-persisted (unlike docs/09's other "Global State" stores): Clerk's own
// tokenCache (SecureStore-backed) is already the durable session store, so this is
// just a live in-memory mirror of Clerk's auth state, kept simple to read elsewhere
// in the app via the same Zustand pattern as the rest of the domain stores.
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isLoaded: false,
  isSignedIn: false,
  userId: null,
  setAuthState: (state) => set(state),
}));
