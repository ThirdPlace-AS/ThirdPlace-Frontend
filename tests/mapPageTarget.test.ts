// Which map details open as the page sheet, and what its top bar says:
// experiences (Phase 11 G5) and places of every kind (user 2026-11-09).
import { describe, expect, it } from "@jest/globals";

import {
  experienceCaption,
  placeCaption,
} from "@/components/experience/experienceMeta";
import { isPageKind, pageInfoFor } from "@/components/map/pageTarget";
import {
  experienceKindLabel,
  placeTypeLabel,
} from "@/components/map/services/itemType";
import type { SheetKind } from "@/components/map/sheetTypes";
import { experienceById, placeById, places } from "@/fixtures";

const KINDS: SheetKind[] = [
  "place",
  "experience",
  "reviews",
  "attendees",
  "guests",
  "host",
  "group",
  "checkin",
];

describe("page sheet targets", () => {
  it("experiences and places are pages; everything else keeps the sheet", () => {
    for (const kind of KINDS)
      expect(isPageKind(kind)).toBe(kind === "experience" || kind === "place");
    expect(isPageKind(undefined)).toBe(false);
  });

  it("a place's top bar: what it is and where, its link and its saved key", () => {
    for (const kind of ["bedrift", "organisasjon", "byrom"] as const) {
      const p = places.find((x) => x.kind === kind)!;
      expect(pageInfoFor({ kind: "place", id: p.id })).toEqual({
        caption: placeCaption(p),
        typeLabel: placeTypeLabel(p),
        shareMessage: `${p.name} på ThirdPlace: thirdplace.app/place/${p.id}`,
        savedKey: `place:${p.id}`,
      });
    }
    // A business by its kind of business (2026-11-11).
    expect(placeCaption(placeById("p1")!)).toMatch(/^Kafé · /);
  });

  it("an experience's top bar is as before", () => {
    const e1 = experienceById("e1")!;
    expect(pageInfoFor({ kind: "experience", id: "e1" })).toEqual({
      caption: experienceCaption(e1),
      typeLabel: experienceKindLabel(e1),
      shareMessage: `${e1.title} på ThirdPlace: thirdplace.app/experience/e1`,
      savedKey: "experience:e1",
    });
  });

  // User 2026-11-11: "at the top left of the details sheet it should say the
  // type of the city space, business or experiance".
  it("the sheet header says what the item is, as the caption starts", () => {
    expect(pageInfoFor({ kind: "place", id: "p1" })?.typeLabel).toBe("Kafé");
    const park = places.find(
      (x) => x.kind === "byrom" && x.category === "Park",
    )!;
    expect(pageInfoFor({ kind: "place", id: park.id })?.typeLabel).toBe("Park");
    for (const t of [
      { kind: "place" as const, id: "p1" },
      { kind: "experience" as const, id: "e1" },
    ]) {
      const info = pageInfoFor(t)!;
      expect(info.caption.startsWith(`${info.typeLabel} · `)).toBe(true);
    }
  });

  it("other targets, and unknown ids, have no page", () => {
    expect(pageInfoFor({ kind: "group", id: "g1" })).toBeNull();
    expect(pageInfoFor({ kind: "place", id: "nope" })).toBeNull();
    expect(pageInfoFor(undefined)).toBeNull();
  });
});
