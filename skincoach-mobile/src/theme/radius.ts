// Source: docs/03 Border Radius. DESIGN.md describes buttons as "pill-shaped" in
// prose, but docs/03 gives an exact 20px figure — the numeric spec wins (docs/19
// Known Mockup Deviations: mockups themselves don't even agree with each other on
// button radius, so there's no single mockup value to defer to instead).
export const radius = {
  smallComponent: 12,
  input: 16,
  button: 20,
  card: 24,
  bottomSheet: 32,
  modal: 32,
  full: 9999,
} as const;
