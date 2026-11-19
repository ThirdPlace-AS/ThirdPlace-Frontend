// The user's location marker (Phase 11 G8, founder 2026-11-06: "the user's
// icon needs to look the same even when the map changes"). One spec for both
// renderers: an ember dot in a white ring with a soft ember halo and, when a
// heading is known, a small ember wedge. Fixed light-palette colours (never
// the app theme or the basemap preset); the native layers are fully emissive
// so dawn/day/dusk/night presets cannot dim them.
import { palette } from "@/theme";

const light = palette.light as unknown as Record<"ember" | "surface", string>;

export const USER_PUCK = {
  dot: light.ember,
  ring: light.surface,
  halo: light.ember,
  haloOpacity: 0.18,
  dotRadius: 7,
  ringWidth: 3,
  haloRadius: 22,
  /** Zoom the locate button flies to (street level). */
  locateZoom: 15,
} as const;
