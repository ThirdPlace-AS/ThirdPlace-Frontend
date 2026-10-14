// Central motion tokens (PROVISIONAL — not founder-final).
//
// One source of truth for durations, springs, and gesture thresholds so motion
// feels coherent across the app instead of per-component magic numbers. Values
// are plain data: components pass them to Reanimated `withTiming` / `withSpring`,
// and should fall back to instant/no transform when `useReducedMotion()` is on.

// Durations in milliseconds.
export const duration = {
  instant: 0,
  fast: 150,
  base: 220,
  slow: 320,
  fling: 180, // card/preview flung off-screen
  recenter: 500, // map camera recenter
  shimmer: 800, // skeleton pulse
} as const;

// Spring presets for `withSpring`.
export const spring = {
  snappy: { damping: 20, stiffness: 220, mass: 1 }, // preview / sheet settle
  gentle: { damping: 26, stiffness: 160, mass: 1 }, // content settle
} as const;

// Gesture commit thresholds.
export const gesture = {
  flingVelocity: 600, // px/s past which a drag commits regardless of distance
  dragCommitPx: 72, // px a card must travel to commit at low velocity
} as const;

export const motion = { duration, spring, gesture } as const;
export default motion;
