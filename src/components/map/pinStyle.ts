// Map pin paint. Phase 7 (review M20) made pins calm: white places, ink
// experiences, ember only for the selection ring. Since 2026-11-11 (user: "the
// colors need to change too"; "familiar map colours") a pin's fill is its pin
// group, what it is (services/pinGroup.ts: a place by its kind, an experience
// by its activity; colours in tokens.js `mapPalette`, never pink or red); the
// ring tells the kind (places white, experiences ink, wrapped in a thin white
// edge so the ink ring shows on night maps); every pin has a soft dark edge so
// light fills stand off pale map areas; the selected pin keeps the pink ring.
// Pin titles turn light with a dark halo on dusk/night basemaps. Pure, so both
// renderers (Mapbox + SoftMap) and the tests share it.
import { mapPalette } from "@/theme";

import {
  PIN_GROUP_TONE,
  pinGroupFill,
  pinGroupFor,
  type PinGroup,
} from "./services/pinGroup";
import type { DiscoveryItem } from "./types/mapPresentation";

/** Category every experience marker carries (see mapFixtureAdapter). */
export const EXPERIENCE_CATEGORY = "Opplevelse";

export type PinPalette = { ink: string; surface: string; onInk: string };

export function isExperience(category: string): boolean {
  return category === EXPERIENCE_CATEGORY;
}

/** Per-marker paint: fill by pin group, ring by kind, glyph tone by
 *  contrast; `edge` is the experiences' white edge outside their ink ring. */
export function markerPaint(
  item: Pick<DiscoveryItem, "kind" | "id"> & { category?: string },
  p: PinPalette,
): {
  group: PinGroup;
  fill: string;
  ring: string;
  edge: string | null;
  glyph: string;
  glyphTone: "light" | "dark";
} {
  const group = pinGroupFor(item);
  const glyphTone = PIN_GROUP_TONE[group];
  const experience = item.kind === "experience";
  return {
    group,
    fill: pinGroupFill(group),
    ring: experience ? p.ink : p.surface,
    edge: experience ? p.surface : null,
    glyph: glyphTone === "light" ? p.surface : p.ink,
    glyphTone,
  };
}

/** The zoom levels the pin sizes below interpolate between: small dots
 *  across Akershus at 8, full pins from 11. */
export const PIN_ZOOMS = [8, 11] as const;

/** Pin sizes (dp) at PIN_ZOOMS: the circle, its ring, the experiences'
 *  white edge outside the ring, and the soft dark edge beyond that. */
export const PIN_SIZE = {
  radius: [6, 14],
  ring: [1.5, 2.5],
  edge: [1, 1.5],
  shadow: [2.5, 3],
} as const;

/** The selected pin's ember ring at full size (its stroke is drawn outside
 *  its radius), outside both edges. */
export const PIN_SELECTED_RING = { radius: 19, width: 3 } as const;

/** The soft dark edge's look. */
export const PIN_SHADOW = { opacity: 0.25, blur: 0.35 } as const;

type Pair = readonly [number, number];
const sum = (...pairs: Pair[]): [number, number] => [
  pairs.reduce((s, v) => s + v[0], 0),
  pairs.reduce((s, v) => s + v[1], 0),
];

/** Radii (dp, at PIN_ZOOMS) of the two edge layers drawn under the pins:
 *  the white edge's circle reaches the ring's outside (its stroke is the
 *  edge), the shadow reaches past the white edge. */
export const PIN_EDGE_RADIUS: { edge: Pair; shadow: Pair } = {
  edge: sum(PIN_SIZE.radius, PIN_SIZE.ring),
  shadow: sum(PIN_SIZE.radius, PIN_SIZE.ring, PIN_SIZE.edge, PIN_SIZE.shadow),
};

/** Mapbox style values (expressions where they depend on the feature). */
export function pinPaint(p: PinPalette, darkBasemap: boolean) {
  return {
    pointFill: ["get", "fill"] as unknown as string,
    pointStroke: ["get", "ring"] as unknown as string,
    edge: p.surface,
    shadow: mapPalette.pinShadow ?? p.ink,
    clusterFill: darkBasemap ? p.surface : p.ink,
    clusterStroke: darkBasemap ? p.ink : p.surface,
    clusterText: darkBasemap ? p.ink : p.onInk,
    // Titles: ink on a white halo by day; light on a dark halo at dusk/night.
    labelText: darkBasemap ? (mapPalette.labelLight ?? p.surface) : p.ink,
    labelHalo: darkBasemap ? (mapPalette.labelHaloDark ?? p.ink) : p.surface,
  };
}
