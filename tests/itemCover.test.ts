import { describe, expect, it } from "@jest/globals";

import { coverForItem } from "@/components/map/services/itemCover";
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
});
