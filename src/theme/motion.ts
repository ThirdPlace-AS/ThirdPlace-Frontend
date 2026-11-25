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
  card: { damping: 16, stiffness: 240, mass: 1 }, // crisp, tiny overshoot; Sveip's spring-back uses gesture.swipeReturnMs since 2026-11-18
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

// Surfaces that open from the tap (0457): start scales and how long a press
// still counts as the one that opened a surface.
export const origin = {
  zoomFrom: 0.85, // Overlay "zoom" from the press point
  sheetFrom: 0.94, // Sheet grows about the tap while it slides up
  pressMaxAge: 600, // ms; older presses did not open the surface
} as const;

// Gesture commit thresholds.
export const gesture = {
  flingVelocity: 600, // px/s past which a drag commits regardless of distance
  dragCommitPx: 72, // px a card must travel to commit at low velocity
  // Swipe deck. Measured from a frame-by-frame screen recording of the
  // reference deck on the phone (2026-11-18) unless marked "chosen".
  swipeCommitRatio: 0.45, // × card width a slow drag must travel to commit (chosen; the clip had no slow drag-commit to read it from)
  swipeAssistRatio: 0.15, // × card width a flick must travel before its speed counts (chosen 2026-11-20 from the finger log: measured 0.22 sprang back two mid-card flicks of 18–21 % at 1100–1400 px/s)
  swipeVelocity: 450, // px/s horizontal flick speed that commits (with the travel above)
  swipeFastVelocity: 1500, // px/s: a flick this fast needs only the shorter travel below (chosen, finger log 2026-11-20)
  swipeFastAssistRatio: 0.1, // × card width that fast flick must have travelled (chosen)
  swipeVertVelocity: 600, // px/s upward flick speed that saves (800 until 2026-11-24, lowered so a short flick saves; not measured)
  swipeRotatePerWidth: 40, // deg of swing per card width of drag (~0.11°/dp)
  swipeMaxRotateDeg: 15.5, // swing clamp (reached at ~155 dp of drag)
  swipeReturnMs: 165, // spring-back: ease-in, no overshoot
  // Fly-off: starts at the release speed and speeds up to about twice it
  // (1100–1800 dp/s at release, 2500–3400 at the edge), in a straight line
  // at the release angle; the edge leaves the screen ~100–115 ms after release.
  swipeFlyMinSpeed: 1400, // px/s starting speed of a slow release or a button press
  swipeFlyMinMs: 90,
  swipeFlyMaxMs: 200,
  swipeUndoSlow: 1.25, // × the fly-off's time for the rewind's slide-in, "a bit slower" (chosen, user 2026-11-20)
  swipeFlyTravel: 1.3, // × width (height for a save): past the rotated far corner
  // The next card under the top one: 95 % at rest (extrapolated, it is covered
  // there), full size once the top card has moved 80 dp; no dimming, no lag.
  swipeNextRestScale: 0.95,
  swipeNextGrowPx: 80,
  swipeStampStart: 0.06, // × width before a stamp starts to show (measured 2026-11-20 on the reference's X: faint at ~9 %, full by ~14 %; it was 0.15)
  swipeStampRamp: 0.08, // × width over which it fades in and grows from swipeStampFrom to full
  swipeStampFrom: 0, // × its size when it first shows: from nothing, growing with the swipe (user 2026-11-20)
  swipeButtonSnap: 0.035, // × width in which a disc fills to 85 %
  swipeButtonRamp: 0.21, // × width for the last 15 %
  swipeWashRatio: 0.28, // × width for the colour wash to reach full (kept, not measured)
  swipeVertCommitRatio: 0.14, // fraction of card height the finger must travel up to save (0.18 on 2026-11-20; lowered 2026-11-24 after the user found the up swipe hard work)
  swipeVertDamp: 0.8, // vertical drag follows the finger, lightly damped (0.35 made an up drag feel heavy, user 2026-11-24)
} as const;

export const motion = {
  duration,
  spring,
  easing,
  presentation,
  origin,
  gesture,
} as const;
export default motion;
