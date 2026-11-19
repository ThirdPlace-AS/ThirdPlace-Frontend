import { mapPalette, palette } from "@/theme";

// Paint for Terreng (founder 2026-11-07): hill shading and contour lines drawn
// over the Standard Studio style, so Kartstil (incl. night) keeps working.
// Contours come from Mapbox Terrain v2 (`contour` layer: `ele` in metres,
// `index` 5 or 10 on every 5th / 10th line); relief from Terrain-DEM v1.
export const TERRAIN_DEM_URL = "mapbox://mapbox.mapbox-terrain-dem-v1";
export const TERRAIN_VECTOR_URL = "mapbox://mapbox.mapbox-terrain-v2";

/** Contour lines are heavier and labelled from every 5th line up. */
export const INDEX_CONTOUR = 5;

export type TerrainPaint = {
  hillShadow: string;
  hillHighlight: string;
  hillAccent: string;
  contour: string;
  labelText: string;
  labelHalo: string;
};

// Map art keeps the light palette in every app theme (as the pins do).
const ink = palette.light.ink as string;
const surface = palette.light.surface as string;
const tone = (key: string, fallback: string) => mapPalette[key] ?? fallback;

export function terrainPaint(darkBasemap: boolean): TerrainPaint {
  return {
    hillShadow: tone("hillShadow", ink),
    hillHighlight: tone("hillHighlight", surface),
    hillAccent: tone("hillAccent", ink),
    contour: tone("contour", ink),
    // Metre labels follow the pin titles: light on a dark halo at dusk/night.
    labelText: darkBasemap
      ? tone("contourLabelNight", surface)
      : tone("contourLabel", ink),
    labelHalo: darkBasemap ? tone("labelHaloDark", ink) : surface,
  };
}
