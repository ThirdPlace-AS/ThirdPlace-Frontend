import { describe, expect, it } from "@jest/globals";

import {
  coverForItem,
  photosForItem,
} from "@/components/map/services/itemCover";
import { experiences, groups, places } from "@/fixtures";

describe("coverForItem", () => {
  it("returns a bundled photo for places, experiences and groups", () => {
    expect(coverForItem({ kind: "place", id: places[0]!.id })).toBeTruthy();
    expect(
      coverForItem({ kind: "experience", id: experiences[0]!.id }),
    ).toBeTruthy();
    expect(coverForItem({ kind: "group", id: groups[0]!.id })).toBeTruthy();
  });

  it("returns undefined for unknown items", () => {
    expect(coverForItem({ kind: "place", id: "nope" })).toBeUndefined();
  });

  it("photosForItem: the full gallery for every kind", () => {
    const exp = experiences.find((e) => e.photos.length > 1);
    expect(exp).toBeTruthy();
    expect(photosForItem({ kind: "experience", id: exp!.id })).toHaveLength(
      exp!.photos.length,
    );
    expect(
      photosForItem({ kind: "place", id: places[0]!.id }).length,
    ).toBeGreaterThanOrEqual(2);
    expect(photosForItem({ kind: "place", id: "nope" })).toEqual([]);
  });
});
