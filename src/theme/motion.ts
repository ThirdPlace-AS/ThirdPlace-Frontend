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
  focus: 450, // map camera to a tapped pin (centred above the sheet; a pan, or a short zoom to street level)
  focusFar: 650, // the same when the tap also zooms in (the first one): the sheet arrives before the map rests
  shimmer: 800, // skeleton pulse
} as const;

// Spring presets for `withSpring`.
export const spring = {
  snappy: { damping: 20, stiffness: 220, mass: 1 }, // preview / sheet settle / undo
  gentle: { damping: 26, stiffness: 160, mass: 1 }, // content settle
  card: { damping: 16, stiffness: 240, mass: 1 }, // swipe-card spring-back (crisp, tiny overshoot — matches the reference)
} as const;

// Cubic-bezier control points (plain data — components build the curve with
// Reanimated's `Easing.bezier(...easing.standard)`).
export const easing = {
  standard: [0.2, 0, 0, 1], // most moves on screen
  enter: [0.05, 0.7, 0.1, 1], // things arriving (sheets, overlays)
  exit: [0.3, 0, 0.8, 0.15], // things leaving — quick, accelerating
} as const;

// Sheet / overlay presentation.
export const presentation = {
  enter: 320, // = duration.slow
  exit: 200,
  dismissRatio: 0.25, // drag past this fraction of the sheet height closes it
  dismissVelocity: 900, // px/s
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

export const motion = {
  duration,
  spring,
  easing,
  presentation,
  gesture,
} as const;
export default motion;
