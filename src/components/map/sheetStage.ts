import { createContext, useContext } from "react";

// R3a (user 2026-11-10: the app still reacts slowly; a pin tap took ~0.5 s to
// show the sheet, a page's render and commit 200–390 ms of it) and 0381 (user
// 2026-11-11: "the details modal sheet is should slide in before the screen is
// done redericting to the newly clicked marker"). The map's detail sheet opens
// in three stages, so its open commit is small and the slide starts at once:
//   0  the open: only what the peek shows (the header and the gallery);
//   1  the sheet has come to rest: the title block and the first rows;
//   2  a moment later (STAGE_REST_DELAY_MS): everything else.
// Nothing mounts during the open animation or a drag (0348's deferral
// committed inside the animation and was dropped). Pages outside the map
// sheet (/place, /experience) have no provider and render everything.

export type SheetStage = 0 | 1 | 2;

/** The stage of the page in the map's detail sheet; 2 outside it. */
export const SheetStageContext = createContext<SheetStage>(2);

/** The title block and first rows may render (the sheet is at rest). */
export function useSheetStageFirst(): boolean {
  return useContext(SheetStageContext) >= 1;
}

/** Everything below the first screen may render. */
export function useSheetStageReady(): boolean {
  return useContext(SheetStageContext) >= 2;
}

/** The sheet counts as at rest this long after it opened, should no snap
 *  event come (a sheet already at its snap has nothing to animate). */
export const STAGE_FALLBACK_MS = 1200;

/** Between the first screen and the rest: the first screen's commit paints
 *  before the rest's longer render starts. */
export const STAGE_REST_DELAY_MS = 50;

/** A swap while the sheet rests at its snap (a tap on another pin at the
 *  peek): the new page is at rest once FadeSwap has faded it in. */
export const STAGE_SWAP_MS = 220;

/**
 * The stage for the item on top. Keyed on the item the sheet opened for, not
 * on each tap: a second tap on the open pin keeps its page. A pushed view
 * (the sheet is already open) renders everything.
 */
export function sheetStage({
  nested,
  rootKey,
  settledKey,
  restKey,
}: {
  nested: boolean;
  rootKey: string | null;
  settledKey: string | null;
  restKey: string | null;
}): SheetStage {
  if (nested) return 2;
  if (rootKey === null || settledKey !== rootKey) return 0;
  return restKey === rootKey ? 2 : 1;
}
