import { createContext, useContext } from "react";

// R3a (user 2026-11-10: the app still reacts slowly; a pin tap took ~0.5 s to
// show the sheet, a page's render and commit 200–390 ms of it). The map's
// detail sheet opens with the first screen of a page (gallery, title, the
// first rows) and the rest mounts once the sheet has come to rest at its snap,
// never during the open animation or a drag (0348's deferral committed inside
// the animation and was dropped). Pages outside the map sheet (/place,
// /experience) have no provider and render everything at once.

/** Whether the page in the map's detail sheet may render everything. */
export const SheetStageContext = createContext(true);

export function useSheetStageReady(): boolean {
  return useContext(SheetStageContext);
}

/** The rest mounts at the latest this long after the sheet opened, should
 *  the snap event not come (a re-tap on a sheet already at its snap). */
export const STAGE_FALLBACK_MS = 1200;

/** Ready when a sub-view was pushed (the sheet is already open) or the sheet
 *  has settled since this open (`settledNonce` caught up with `openNonce`). */
export function stageReady({
  nested,
  openNonce,
  settledNonce,
}: {
  nested: boolean;
  openNonce: number;
  settledNonce: number | null;
}): boolean {
  return nested || settledNonce === openNonce;
}
