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
