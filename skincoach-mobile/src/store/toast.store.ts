import { create } from 'zustand';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

type ToastState = {
  message: string | null;
  variant: ToastVariant;
};

type ToastActions = {
  showToast: (message: string, variant?: ToastVariant) => void;
  hideToast: () => void;
};

// Not persisted — a toast is inherently transient UI state (docs/09: never persist
// UI-only state).
export const useToastStore = create<ToastState & ToastActions>((set) => ({
  message: null,
  variant: 'info',
  showToast: (message, variant = 'info') => set({ message, variant }),
  hideToast: () => set({ message: null }),
}));
