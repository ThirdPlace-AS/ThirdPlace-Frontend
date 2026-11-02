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
  snappy: { damping: 20, stiffness: 220, mass: 1 }, // preview / sheet settle / undo
  gentle: { damping: 26, stiffness: 160, mass: 1 }, // content settle
  card: { damping: 16, stiffness: 240, mass: 1 }, // swipe-card spring-back (crisp, tiny overshoot — matches the reference)
} as const;

// Gesture commit thresholds.
export const gesture = {
  flingVelocity: 600, // px/s past which a drag commits regardless of distance
  dragCommitPx: 72, // px a card must travel to commit at low velocity
  // Swipe deck (docs/design/research 03 §5 + 07/09). PROVISIONAL — tuned against
  // the reference clip: commits a touch earlier, flicks easier, swings more.
  swipeCommitRatio: 0.28, // fraction of card width a swipe must travel to commit (03 §5)
  swipeVelocity: 800, // px/s swipe velocity that commits regardless of distance (03 §5)
  swipeMaxRotateDeg: 14, // card rotation clamp while dragging (03 §5)
  swipeVertCommitRatio: 0.22, // fraction of card height an up-swipe must travel
  swipeVertDamp: 0.35, // vertical drag follows the finger, damped
} as const;

export const motion = { duration, spring, gesture } as const;
export default motion;
