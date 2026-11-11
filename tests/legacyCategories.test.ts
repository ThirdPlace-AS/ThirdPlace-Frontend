// 0371: the fourteen legacy places kept one of the old four pin categories
// ("Kafé", "Bokcafé", "Vinbar", "Verksted") after Phase 19 gave them their
// interests, even where it did not describe them: a sail trip was a "Vinbar",
// a beauty salon a "Bokcafé". The category shows on the place page ("Seilturer
// · Aker brygge") and feeds search, so "kafe" found a river walk. Each now
// says what it is, and so does its business record.
import { describe, expect, it } from "@jest/globals";

import { placeMatchesQuery } from "@/components/map/services/mapSearch";
import { businessForPlace, placeById } from "@/fixtures";

const WHAT_IT_IS: Record<string, string> = {
  p1: "Kafé",
  p2: "Bokcafé",
  p3: "Vinbar",
  p4: "Verksted",
  p5: "Vandrelag",
  p6: "Verksted",
  p7: "Matturer",
  p8: "Hageomvisninger",
  p9: "Yogastudio",
  p10: "Seilturer",
  p11: "Galleri",
  p12: "Arkitekturturer",
  p13: "Verksted",
  p14: "Skjønnhetssalong",
};

describe("legacy place categories", () => {
  it("each legacy place, and its business record, says what it is", () => {
    for (const [id, category] of Object.entries(WHAT_IT_IS)) {
      const p = placeById(id)!;
      expect(p.category).toBe(category);
      const b = businessForPlace(id);
      if (b) expect(b.category).toBe(category);
    }
  });

  it("a search for a café finds the cafés, not a walk or a tour", () => {
    const hits = Object.keys(WHAT_IT_IS).filter((id) =>
      placeMatchesQuery(placeById(id)!, "kafe"),
    );
    expect(hits).toContain("p1");
    for (const id of ["p5", "p8", "p12"]) expect(hits).not.toContain(id);
    expect(placeMatchesQuery(placeById("p10")!, "vinbar")).toBe(false);
    expect(placeMatchesQuery(placeById("p10")!, "seiltur")).toBe(true);
  });
});
