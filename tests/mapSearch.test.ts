import { describe, expect, it } from "@jest/globals";

import {
  searchFixtures,
  suggestFixtures,
} from "@/components/map/services/mapSearch";

describe("searchFixtures", () => {
  it("returns no results for an empty query", () => {
    const r = searchFixtures("");
    expect(r.total).toBe(0);
  });

  it("returns no results for a non-matching query", () => {
    expect(searchFixtures("zzzzzz").total).toBe(0);
  });

  it("matches places by name", () => {
    const r = searchFixtures("kaffe");
    expect(r.places.some((p) => /kaffe/i.test(p.title))).toBe(true);
  });

  it("groups experiences and groups separately", () => {
    const r = searchFixtures("lese");
    // "Lesesirkel" experience + "Løkka Lesesirkel" group both match.
    expect(r.experiences.length).toBeGreaterThan(0);
    expect(r.groups.length).toBeGreaterThan(0);
    expect(r.total).toBe(
      r.places.length + r.experiences.length + r.groups.length,
    );
  });

  it("result kinds route to the right sheet", () => {
    const r = searchFixtures("kaffe");
    expect(r.places.every((p) => p.kind === "place")).toBe(true);
    expect(r.experiences.every((e) => e.kind === "experience")).toBe(true);
  });
});

describe("suggestFixtures", () => {
  it("returns up to the limit of title suggestions", () => {
    const s = suggestFixtures("a", 3);
    expect(s.length).toBeLessThanOrEqual(3);
  });
});
