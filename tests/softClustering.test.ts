import { describe, expect, it } from "@jest/globals";

import {
  clusterByGrid,
  SOFT_BBOX,
} from "@/components/map/services/softClustering";
import type { DiscoveryItem } from "@/components/map/types/mapPresentation";
import { experiences, places } from "@/fixtures";

// Build DiscoveryItem-shaped points from the demo places' coords.
const items: DiscoveryItem[] = places.map((p) => ({
  markerId: `place:${p.id}`,
  kind: "place",
  id: p.id,
  coord: p.coord,
  category: p.category,
  title: p.name,
  subtitle: p.distance,
}));

describe("clusterByGrid", () => {
  it("keeps the demo places as individually tappable single clusters", () => {
    const clusters = clusterByGrid(items);
    // Tighter default cell (0.08) stops the 4 demo pins collapsing into one
    // untappable badge — each gets its own target.
    expect(clusters).toHaveLength(items.length);
    expect(clusters.every((c) => c.items.length === 1)).toBe(true);
  });

  it("merges points that share a grid cell at a coarse cell size", () => {
    const clusters = clusterByGrid(items, 1);
    expect(clusters.length).toBeLessThan(items.length);
  });
});

describe("fallback map box", () => {
  it("holds every place and meeting point without clamping", () => {
    const coords = [
      ...places.map((p) => p.coord),
      ...experiences.map((e) => e.meetingPoint.coord),
    ];
    for (const [lng, lat] of coords) {
      expect(lng).toBeGreaterThan(SOFT_BBOX.minLng);
      expect(lng).toBeLessThan(SOFT_BBOX.maxLng);
      expect(lat).toBeGreaterThan(SOFT_BBOX.minLat);
      expect(lat).toBeLessThan(SOFT_BBOX.maxLat);
    }
  });
});
