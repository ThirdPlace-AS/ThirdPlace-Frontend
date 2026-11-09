// Which map details open as the page sheet, and what its top bar shows
// (pure). Experiences since Phase 11 (G5, the founder's reference video);
// places of every kind since 2026-11-09 (user: "make businesses and places
// the same map details sheet as experience"). Groups and the pushed
// sub-views keep the plain sheet header.
import {
  experienceCaption,
  placeCaption,
} from "@/components/experience/experienceMeta";
import { experienceById, placeById } from "@/fixtures";

import type { SheetKind, SheetTarget } from "./sheetTypes";
import { markerId } from "./types/mapPresentation";

export function isPageKind(kind: SheetKind | undefined): boolean {
  return kind === "experience" || kind === "place";
}

/** The page sheet's top snap index (100 %: the full-screen page). */
export const PAGE_SNAP = 2;
/** animatedIndex where the page chrome starts to grow in on the way up. */
export const PAGE_FROM = 1.7;
// Within a hair of the top snap counts as the top: a drag that reaches the
// top and carries on into the content scroll never "snaps" (gorhom reports
// no index), and the sheet can rest just short of 2.
const PAGE_TOP = PAGE_SNAP - 0.02;

/** The sheet is at the top snap (full screen), read from its position. A
 *  worklet: the sheet's animated reactions call it on the UI thread. */
export function atPageTop(index: number): boolean {
  "worklet";
  return index > PAGE_TOP;
}

/** How far the floating action card has faded in: 0 below PAGE_FROM, 1 once
 *  the sheet counts as at the top (a card resting at 0.95 let the page text
 *  show through). A worklet, for its animated style. */
export function pageReveal(index: number): number {
  "worklet";
  return Math.min(1, Math.max(0, (index - PAGE_FROM) / (PAGE_TOP - PAGE_FROM)));
}

export type PageInfo = {
  /** The small centred caption: "Sosialt · Grünerløkka", "Byrom · Kolsås". */
  caption: string;
  /** What Del shares. */
  shareMessage: string;
  /** markerId for the shared Saved store (Lagre). */
  savedKey: string;
};

/** The page top bar's caption, Del text and Lagre key; null when the target
 *  is not a page (or not found). */
export function pageInfoFor(t: SheetTarget | undefined): PageInfo | null {
  if (!t) return null;
  if (t.kind === "experience") {
    const exp = experienceById(t.id);
    return exp
      ? {
          caption: experienceCaption(exp),
          shareMessage: `${exp.title} på ThirdPlace: thirdplace.app/experience/${exp.id}`,
          savedKey: markerId("experience", exp.id),
        }
      : null;
  }
  if (t.kind === "place") {
    const place = placeById(t.id);
    return place
      ? {
          caption: placeCaption(place),
          shareMessage: `${place.name} på ThirdPlace: thirdplace.app/place/${place.id}`,
          savedKey: markerId("place", place.id),
        }
      : null;
  }
  return null;
}
