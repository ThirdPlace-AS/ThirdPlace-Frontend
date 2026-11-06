// Map pin paint (Phase 7, review M20). The PDF (p5) draws white round pins
// with a dark outline and a few dark pins; it never colour-codes categories.
// Five category colours (ember twice, ink twice) competed with the basemap's
// own POI colours, and dark pins vanished on the dusk/night basemaps. Now:
// places = white fill + ink ring, experiences = ink fill + white ring, ember
// only for the selection ring. Clusters flip to white over dark basemaps.
// Pure, so both renderers (Mapbox + SoftMap) and the tests share it.

/** Category every experience marker carries (see mapFixtureAdapter). */
export const EXPERIENCE_CATEGORY = "Opplevelse";

export type PinPalette = { ink: string; surface: string; onInk: string };

export function isExperience(category: string): boolean {
  return category === EXPERIENCE_CATEGORY;
}

/** Mapbox style values (expressions where they depend on the feature). */
export function pinPaint(p: PinPalette, darkBasemap: boolean) {
  const exp = ["==", ["get", "category"], EXPERIENCE_CATEGORY];
  return {
    pointFill: ["case", exp, p.ink, p.surface] as unknown as string,
    pointStroke: ["case", exp, p.surface, p.ink] as unknown as string,
    clusterFill: darkBasemap ? p.surface : p.ink,
    clusterStroke: darkBasemap ? p.ink : p.surface,
    clusterText: darkBasemap ? p.ink : p.onInk,
  };
}

/** SoftMap (themed fallback): classes for the pin body and its centre dot. */
export function softPin(category: string): { body: string; dot: string } {
  return isExperience(category)
    ? { body: "bg-ink border-surface", dot: "bg-onInk" }
    : { body: "bg-surface border-ink", dot: "bg-ink" };
}
