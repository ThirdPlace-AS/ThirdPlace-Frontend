// App-wide constants. Phase 0: minimum-age gate is a founder-locked product
// basic (18+ launch, per CANONICAL decisions). Nothing here defines a public
// API contract.
export const MINIMUM_AGE = 18;

// The five primary surfaces are named in the source of truth; this is a UI
// navigation reference only, not an API/entity declaration.
export const PRIMARY_SURFACES = [
  "map",
  "swipe",
  "add",
  "chat",
  "profile",
] as const;

export type PrimarySurface = (typeof PRIMARY_SURFACES)[number];
