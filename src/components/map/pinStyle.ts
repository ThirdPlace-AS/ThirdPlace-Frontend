// Map pin paint. Phase 7 (review M20) made pins calm: white places, ink
// experiences, ember only for the selection ring. Phase 12 H3b (founder,
// 2026-11-06): every marker gets its own colour by the category it fits
// (markerCategory.ts, colours in tokens.js `mapPalette`, never the brand
// pink); the ring tells the kind (places white, experiences ink); the
// selected pin keeps the pink ring. Pin titles turn light with a dark halo on
// dusk/night basemaps so they stay readable at night. Pure, so both renderers
// (Mapbox + SoftMap) and the tests share it.
import { mapPalette } from "@/theme";

import {
  MARKER_GLYPH_TONE,
  markerCategoryFor,
  markerFill,
  type MarkerCategory,
} from "./services/markerCategory";
import type { DiscoveryItem } from "./types/mapPresentation";

/** Category every experience marker carries (see mapFixtureAdapter). */
export const EXPERIENCE_CATEGORY = "Opplevelse";

export type PinPalette = { ink: string; surface: string; onInk: string };

export function isExperience(category: string): boolean {
  return category === EXPERIENCE_CATEGORY;
}

/** Per-marker paint: fill by category, ring by kind, glyph tone by contrast. */
export function markerPaint(
  item: Pick<DiscoveryItem, "kind" | "id"> & { category?: string },
  p: PinPalette,
): {
  category: MarkerCategory;
  fill: string;
  ring: string;
  glyph: string;
  glyphTone: "light" | "dark";
} {
  const category = markerCategoryFor(item);
  const glyphTone = MARKER_GLYPH_TONE[category];
  return {
    category,
    fill: markerFill(category),
    ring: item.kind === "experience" ? p.ink : p.surface,
    glyph: glyphTone === "light" ? p.surface : p.ink,
    glyphTone,
  };
}

/** Mapbox style values (expressions where they depend on the feature). */
export function pinPaint(p: PinPalette, darkBasemap: boolean) {
  return {
    pointFill: ["get", "fill"] as unknown as string,
    pointStroke: ["get", "ring"] as unknown as string,
    clusterFill: darkBasemap ? p.surface : p.ink,
    clusterStroke: darkBasemap ? p.ink : p.surface,
    clusterText: darkBasemap ? p.ink : p.onInk,
    // Titles: ink on a white halo by day; light on a dark halo at dusk/night.
    labelText: darkBasemap ? (mapPalette.labelLight ?? p.surface) : p.ink,
    labelHalo: darkBasemap ? (mapPalette.labelHaloDark ?? p.ink) : p.surface,
  };
}
