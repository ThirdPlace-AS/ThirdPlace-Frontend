// The selected pin's ring shows with the tap (user 2026-11-11: "the red
// focus on the marker must be instant on click"): the pin press sets the
// selected layers' filter natively, before the selection renders.
import { describe, expect, it } from "@jest/globals";

import {
  filterAfterPress,
  selectionFilter,
} from "@/components/map/services/pinSelection";

describe("selectionFilter", () => {
  it("matches one marker id", () => {
    expect(selectionFilter("place:p1")).toEqual([
      "==",
      ["get", "markerId"],
      "place:p1",
    ]);
  });

  it("matches no marker when nothing is selected", () => {
    const none = selectionFilter(null);
    expect(none[2]).not.toBe("");
    expect(selectionFilter(undefined)).toEqual(none);
    // No real marker id looks like it.
    expect(none[2]).not.toMatch(/^(place|experience):/);
  });
});

describe("filterAfterPress", () => {
  it("keeps the pressed pin when the screen took the selection", () => {
    expect(filterAfterPress(true, "place:p2", "place:p1")).toEqual(
      selectionFilter("place:p2"),
    );
    expect(filterAfterPress(true, "place:p2", null)).toEqual(
      selectionFilter("place:p2"),
    );
  });

  it("puts the earlier selection back when the press was declined", () => {
    expect(filterAfterPress(false, "place:zz", "place:p1")).toEqual(
      selectionFilter("place:p1"),
    );
    expect(filterAfterPress(false, "place:zz", null)).toEqual(
      selectionFilter(null),
    );
  });
});
