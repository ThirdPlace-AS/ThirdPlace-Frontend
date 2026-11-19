import { describe, expect, it } from "@jest/globals";

import {
  clusterByGrid,
  SOFT_BBOX,
} from "@/components/map/services/softClustering";
import type { DiscoveryItem } from "@/components/map/types/mapPresentation";
import { COVERAGE_BBOX, experiences, inCoverage, places } from "@/fixtures";

// The legacy places (p1–p14) sit in inner Oslo; Phase 19's catalogue spreads
// across Akershus. SoftMap frames the markers on screen since S4b (tests/
// countyMap.test.ts); these checks keep the legacy set inside the old inner
// box (the default when there is nothing to frame) and every item inside
// the Akershus coverage box.
const legacy = places.filter((p) => /^p\d+$/.test(p.id));
const legacyExperiences = experiences.filter((e) => /^e\d+$/.test(e.id));

// Build DiscoveryItem-shaped points from the demo places' coords.
const items: DiscoveryItem[] = legacy.map((p) => ({
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
  it("every place and meeting point lies in Oslo and Akershus", () => {
    for (const c of [
      ...places.map((p) => p.coord),
      ...experiences.map((e) => e.meetingPoint.coord),
    ])
      expect(inCoverage(c)).toBe(true);
    expect(COVERAGE_BBOX.north).toBeGreaterThan(COVERAGE_BBOX.south);
  });

  it("holds every legacy place and meeting point without clamping", () => {
    const coords = [
      ...legacy.map((p) => p.coord),
      ...legacyExperiences.map((e) => e.meetingPoint.coord),
    ];
    for (const [lng, lat] of coords) {
      expect(lng).toBeGreaterThan(SOFT_BBOX.minLng);
      expect(lng).toBeLessThan(SOFT_BBOX.maxLng);
      expect(lat).toBeGreaterThan(SOFT_BBOX.minLat);
      expect(lat).toBeLessThan(SOFT_BBOX.maxLat);
    }
  });
});
