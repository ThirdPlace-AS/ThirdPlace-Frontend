import { describe, expect, it } from "@jest/globals";

import {
  advanceHint,
  canAdvance,
  EMPTY_DRAFT,
  stepsFor,
} from "@/features/add/types";

// Step order follows the design (PDF p10–p12).
describe("Add flow steps", () => {
  it("menu first, with only Sted / Opplevelse kinds", () => {
    expect(stepsFor(null)).toEqual(["kind"]);
  });

  it("place = 5 steps ending in review (Send inn til vurdering)", () => {
    expect(stepsFor("place")).toEqual([
      "about",
      "where",
      "photos",
      "details",
      "review",
    ]);
  });

  // PDF p11–p12: seven steps, plus the optional "plan" step (Phase 12 H5b:
  // what is included / what you will do) before the photos.
  it("experience = 7 PDF steps + optional plan, ending in review", () => {
    const s = stepsFor("experience");
    expect(s).toHaveLength(8);
    expect(s.indexOf("plan")).toBe(s.indexOf("photos") - 1);
    expect(s[0]).toBe("about");
    expect(s[1]).toBe("when");
    expect(s[s.length - 1]).toBe("review");
  });
});

describe("Add flow hints", () => {
  it("says why Neste is off, and nothing once the step is filled", () => {
    expect(advanceHint("about", EMPTY_DRAFT)).toBe(
      "Navnet trenger minst 3 tegn.",
    );
    expect(advanceHint("about", { ...EMPTY_DRAFT, title: "Kaffe" })).toBe(
      "Velg en kategori.",
    );
    const filled = { ...EMPTY_DRAFT, title: "Kaffe", category: "Kafé" };
    expect(canAdvance("about", filled as typeof EMPTY_DRAFT)).toBe(true);
    expect(advanceHint("about", filled as typeof EMPTY_DRAFT)).toBeNull();
  });
});

describe("Add flow validation", () => {
  const d = { ...EMPTY_DRAFT, kind: "experience" as const };

  it("about needs a name (3+) and a category", () => {
    expect(canAdvance("about", d)).toBe(false);
    expect(
      canAdvance("about", { ...d, title: "Jazz", category: "Musikk" }),
    ).toBe(true);
  });

  it("when needs a date and a start time", () => {
    expect(canAdvance("when", { ...d, date: "2026-07-25" })).toBe(false);
    expect(
      canAdvance("when", { ...d, date: "2026-07-25", startTime: "14:00" }),
    ).toBe(true);
  });

  it("frame needs a positive whole-number capacity", () => {
    expect(canAdvance("frame", { ...d, capacity: "" })).toBe(false);
    expect(canAdvance("frame", { ...d, capacity: "0" })).toBe(false);
    expect(canAdvance("frame", { ...d, capacity: "12" })).toBe(true);
  });

  it("photos needs at least one", () => {
    expect(canAdvance("photos", d)).toBe(false);
    expect(canAdvance("photos", { ...d, photos: [0] })).toBe(true);
  });
});
