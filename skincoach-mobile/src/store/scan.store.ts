import { create } from 'zustand';

// Transient state for one scan session (capture → analyzing → complete). Not persisted
// (docs/09: UI/session state stays in memory) — a fresh scan starts clean each time.
export type ScanStatus = 'idle' | 'processing' | 'complete' | 'failed';

type ScanState = {
  photoUri: string | null;
  // The backend scan id, set once POST /scans returns (Slice 3). Null in mock mode and
  // before the scan record exists. Results/AnalysisComplete read the result by this id.
  scanId: string | null;
  status: ScanStatus;
};

type ScanActions = {
  startScan: (photoUri: string) => void;
  setScanId: (scanId: string) => void;
  setStatus: (status: ScanStatus) => void;
  reset: () => void;
};

const initialState: ScanState = {
  photoUri: null,
  scanId: null,
  status: 'idle',
};

export const useScanStore = create<ScanState & ScanActions>((set) => ({
  ...initialState,
  // A fresh scan clears any prior id/status so the flow can't read a stale result.
  startScan: (photoUri) => set({ photoUri, scanId: null, status: 'processing' }),
  setScanId: (scanId) => set({ scanId }),
  setStatus: (status) => set({ status }),
  reset: () => set(initialState),
}));
