import { describe, expect, it } from "@jest/globals";

import {
  clusterByGrid,
  projectToUnit,
  SOFT_BBOX,
} from "@/components/map/services/softClustering";
import type { DiscoveryItem } from "@/components/map/types/mapPresentation";

function item(id: string, coord: [number, number]): DiscoveryItem {
  return {
    markerId: `place:${id}`,
    kind: "place",
    id,
    coord,
    category: "Kafé",
    title: id,
    subtitle: "",
  };
}

describe("projectToUnit", () => {
  it("maps the bbox corners into [0,1] with north up", () => {
    const sw = projectToUnit([SOFT_BBOX.minLng, SOFT_BBOX.minLat]);
    expect(sw.x).toBeCloseTo(0);
    expect(sw.y).toBeCloseTo(1); // min lat is bottom
    const ne = projectToUnit([SOFT_BBOX.maxLng, SOFT_BBOX.maxLat]);
    expect(ne.x).toBeCloseTo(1);
    expect(ne.y).toBeCloseTo(0);
  });

  it("clamps out-of-box coordinates", () => {
    const p = projectToUnit([0, 0]);
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeLessThanOrEqual(1);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(1);
  });
});

describe("clusterByGrid", () => {
  it("merges markers in the same cell into one cluster", () => {
    const a = item("a", [10.7579, 59.9227]);
    const b = item("b", [10.758, 59.9228]); // ~same spot
    const clusters = clusterByGrid([a, b]);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.items).toHaveLength(2);
  });

  it("keeps distant markers in separate clusters", () => {
    const a = item("a", [SOFT_BBOX.minLng, SOFT_BBOX.minLat]);
    const b = item("b", [SOFT_BBOX.maxLng, SOFT_BBOX.maxLat]);
    const clusters = clusterByGrid([a, b]);
    expect(clusters).toHaveLength(2);
  });
});
