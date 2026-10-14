// Map presentation models — a layer BETWEEN the MOCK domain fixtures and how the
// map renders them. Nothing here is a canonical contract; it exists so markers,
// clusters, the preview card, and the list all read from one shape.

import type { SheetKind } from "../sheetTypes";

// The six documented discovery modes.
export const DISCOVERY_MODES = [
  "forYou",
  "trending",
  "live",
  "explore",
  "friends",
  "saved",
] as const;
export type DiscoveryMode = (typeof DISCOVERY_MODES)[number];

// Norwegian labels for the mode selector.
export const DISCOVERY_MODE_LABELS: Record<DiscoveryMode, string> = {
  forYou: "For deg",
  trending: "Populært",
  live: "Live",
  explore: "Utforsk",
  friends: "Venner",
  saved: "Lagret",
};

// Modes that are NON-PERSONALIZED demo shells pending a V2.2 contract. The UI
// must mark these (DemoBadge + note) and never present invented personalization
// or real friend data. See docs/map/MAP_BLOCKERS.md (CB-1, CB-2).
export const DEMO_MODES: readonly DiscoveryMode[] = ["forYou", "friends"];

// A single discoverable item projected onto the map. `kind` + `id` decide which
// detail sheet opens; `markerId` is the stable key for selection/rendering.
export type DiscoveryItem = {
  markerId: string; // `${kind}:${id}`
  kind: SheetKind;
  id: string;
  coord: [number, number]; // [lng, lat] — MOCK demo point
  category: string; // drives pin color / icon
  title: string;
  subtitle: string; // distance or time
  meta?: string; // price tier / status / rating
};

// Result of resolving a discovery mode over the fixtures.
export type ModeResult = {
  items: DiscoveryItem[];
  demo: boolean; // show DemoBadge + note (For You / Friends)
  note?: string; // e.g. "Ikke personalisert (demo)"
  emptyMessage: string;
};

export function markerId(kind: SheetKind, id: string): string {
  return `${kind}:${id}`;
}
