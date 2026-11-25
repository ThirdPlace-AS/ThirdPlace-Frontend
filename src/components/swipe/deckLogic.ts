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
  commitRatio: number; // × width: a slow drag commits past this
  assistRatio: number; // × width: a flick commits once it has travelled this
  vertCommitRatio: number; // × height
  velocity: number; // px/s: horizontal flick speed
  vertVelocity: number; // px/s: upward flick speed
  // A really fast flick needs less travel: past `fastVelocity` px/s the card
  // only has to have moved `fastAssistRatio`×width (chosen from the finger log
  // 2026-11-20: a 2360 px/s flick that travelled 20 % of the width sprang back).
  fastVelocity?: number;
  fastAssistRatio?: number;
};

function clamp(n: number, lo: number, hi: number): number {
  "worklet";
  return Math.min(hi, Math.max(lo, n));
}

// Card rotation (deg): `degPerWidth` per card width of horizontal drag,
// clamped to ±maxDeg.
export function rotationFor(
  dx: number,
  w: number,
  degPerWidth: number,
  maxDeg: number,
  // +1 when the card was grabbed in its top half (or moved by a button), -1
  // in its bottom half: the card swings the other way, about the finger, as
  // the reference does (user 2026-11-18).
  grab = 1,
): number {
  "worklet";
  if (w <= 0) return 0;
  return clamp((dx / w) * degPerWidth, -maxDeg, maxDeg) * (grab < 0 ? -1 : 1);
}

// Decide whether a release commits, and in which direction. Returns null to
// spring back. A slow drag commits on distance alone; a flick commits earlier,
// but only after some travel and only in the direction the card already went
// (a flick back towards the centre is a change of mind). An up-swipe only wins
// when the card went further up than sideways, so a diagonal fling still reads
// as like/nope.
export function decideCommit(
  i: CommitInput,
  t: CommitThresholds,
): SwipeAction | null {
  "worklet";
  const upTravel = -i.dy; // positive when dragged up
  const up = upTravel > i.h * t.vertCommitRatio || i.vy < -t.vertVelocity;
  const far = Math.abs(i.dx) > i.w * t.commitRatio;
  const flick =
    Math.abs(i.vx) > t.velocity &&
    Math.abs(i.dx) >
      i.w *
        (t.fastVelocity != null &&
        t.fastAssistRatio != null &&
        Math.abs(i.vx) > t.fastVelocity
          ? t.fastAssistRatio
          : t.assistRatio) &&
    Math.sign(i.vx) === Math.sign(i.dx);
  const horiz = far || flick;

  if (up && upTravel > Math.abs(i.dx)) return "save";
  if (horiz) return i.dx > 0 ? "like" : "nope";
  if (up) return "save";
  return null;
}

// Swipe stamp opacity for a drag `d` px in the stamp's own direction (pass tx
// for like, -tx for nope): hidden for the first `start`×width, then fades in
// over the next `ramp`×width.
export function stampOpacity(
  d: number,
  w: number,
  start: number,
  ramp: number,
): number {
  "worklet";
  if (w <= 0 || d <= 0) return 0;
  return clamp((d / w - start) / ramp, 0, 1);
}

// Fill of the action disc for a drag `d` px in its direction: most of the fill
// comes in the first `snap`×width (the disc answers the moment the card moves),
// the last 15 % over the next `ramp`×width.
export function buttonProgress(
  d: number,
  w: number,
  snap: number,
  ramp: number,
): number {
  "worklet";
  if (w <= 0 || d <= 0) return 0;
  const s = snap * w;
  return 0.85 * Math.min(1, d / s) + 0.15 * clamp((d - s) / (ramp * w), 0, 1);
}

// Whether an up drag leads over the sideways one, so only the save disc
// lights. Judged on the finger, as decideCommit does: the card's `ty` is the
// finger's travel × `damp`. Ties and a downward drag go to the sides.
export function upDragLeads(tx: number, ty: number, damp: number): boolean {
  "worklet";
  const up = damp > 0 ? -ty / damp : -ty;
  return up > 0 && up > Math.abs(tx);
}

// Fill of the save disc for an up-drag `up` px: the same quick first fill as
// the side discs (`snap`×width), then the rest by the commit line
// (`commitRatio`×height), as the reference's disc answers an up-drag at once.
export function saveButtonProgress(
  up: number,
  w: number,
  h: number,
  snap: number,
  commitRatio: number,
): number {
  "worklet";
  if (w <= 0 || up <= 0) return 0;
  const s = snap * w;
  const rest = Math.max(1, (h > 0 ? h : 480) * commitRatio - s);
  return buttonProgress(up, w, snap, rest / w);
}

// Fly-off time (ms) for a card with `remaining` px to go: it starts at its
// release speed (never slower than `minSpeed` px/s), within [minMs, maxMs].
// `startShare` is the easing's starting slope (1 = linear; the deck's ease-in
// starts at 2/3 of its average speed, so its time is 2/3 of the linear one).
export function flyDuration(
  remaining: number,
  v: number,
  minSpeed: number,
  minMs: number,
  maxMs: number,
  startShare = 1,
): number {
  "worklet";
  const speed = Math.max(Math.abs(v), minSpeed);
  return clamp(
    ((startShare * Math.abs(remaining)) / speed) * 1000,
    minMs,
    maxMs,
  );
}

// The next card's scale under the top card (measured on the reference
// 2026-11-18): `rest` while the top card is at rest, growing in a straight
// line with how far the top card has moved, full size from `growPx` on. The
// same in every direction and in reverse (a snap-back or an undo).
export function nextCardScale(
  moved: number,
  growPx: number,
  rest: number,
): number {
  "worklet";
  if (growPx <= 0) return 1;
  return rest + (1 - rest) * clamp(Math.abs(moved) / growPx, 0, 1);
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
