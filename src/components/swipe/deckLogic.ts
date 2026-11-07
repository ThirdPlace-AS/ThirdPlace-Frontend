// Pure, worklet-safe helpers for the swipe deck. No React, no Reanimated — so the
// commit/rotation/undo logic is unit-testable in isolation and can also run
// inside a Gesture.Pan() worklet. All geometry is in px; thresholds come from
// motion.gesture (callers pass the resolved numbers). DEMO only — no scoring or
// backend (BLOCKED_CONTRACT_GAP).

// Left = pass ("Hopp over"), right = join ("Bli med"), up = save ("Lagre").
export type SwipeAction = "like" | "nope" | "save";

export type CommitInput = {
  dx: number; // horizontal offset from rest (px)
  dy: number; // vertical offset from rest (px, up is negative)
  vx: number; // horizontal velocity (px/s)
  vy: number; // vertical velocity (px/s)
  w: number; // card width (px)
  h: number; // card height (px)
};

export type CommitThresholds = {
  commitRatio: number; // × width
  vertCommitRatio: number; // × height
  velocity: number; // px/s
};

function clamp(n: number, lo: number, hi: number): number {
  "worklet";
  return Math.min(hi, Math.max(lo, n));
}

// Card rotation (deg) as a function of horizontal drag, clamped to ±maxDeg.
export function rotationFor(dx: number, w: number, maxDeg: number): number {
  "worklet";
  if (w <= 0) return 0;
  return clamp((dx / w) * maxDeg, -maxDeg, maxDeg);
}

// Decide whether a release commits, and in which direction. Returns null to
// spring back. An up-swipe only wins when the gesture is dominantly vertical so a
// diagonal fling still reads as like/nope.
export function decideCommit(
  i: CommitInput,
  t: CommitThresholds,
): SwipeAction | null {
  "worklet";
  const upTravel = -i.dy; // positive when dragged up
  const up = upTravel > i.h * t.vertCommitRatio || i.vy < -t.velocity;
  const horiz =
    Math.abs(i.dx) > i.w * t.commitRatio || Math.abs(i.vx) > t.velocity;

  if (up && upTravel > Math.abs(i.dx)) return "save";
  if (horiz) return i.dx > 0 ? "like" : "nope";
  if (up) return "save";
  return null;
}

// ── Deck / one-level-undo state (pure reducer) ──────────────────────────────

export type DeckState = {
  index: number;
  // The single undoable step: which card index was acted on and how.
  last: { index: number; action: SwipeAction } | null;
};

export const initialDeck: DeckState = { index: 0, last: null };

export function applyAction(s: DeckState, action: SwipeAction): DeckState {
  return { index: s.index + 1, last: { index: s.index, action } };
}

// One level only: restore the last acted-on card; clears the history.
export function applyUndo(s: DeckState): DeckState {
  return s.last ? { index: s.last.index, last: null } : s;
}

export function canUndo(s: DeckState): boolean {
  return s.last !== null;
}
