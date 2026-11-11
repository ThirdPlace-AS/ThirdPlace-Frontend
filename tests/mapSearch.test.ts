import { describe, expect, it } from "@jest/globals";

import {
  experienceMatchesQuery,
  placeMatchesQuery,
  searchFixtures,
} from "@/components/map/services/mapSearch";
import { experienceById, placeById } from "@/fixtures";

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

  it("matches places by tag (not just name/category)", () => {
    // p1 tag "Studievennlig" is in neither its name nor category.
    const r = searchFixtures("studievennlig");
    expect(r.places.some((p) => p.id === "p1")).toBe(true);
  });

  it("matches experiences by host (not just title)", () => {
    // e1 host "Maria M." — title does not contain "maria".
    const r = searchFixtures("maria");
    expect(r.experiences.some((e) => e.id === "e1")).toBe(true);
  });
});

describe("shared query matchers", () => {
  it("placeMatchesQuery matches name, category and tags", () => {
    const p1 = placeById("p1")!;
    expect(placeMatchesQuery(p1, "oslo")).toBe(true); // name
    expect(placeMatchesQuery(p1, "kafé")).toBe(true); // category
    expect(placeMatchesQuery(p1, "studievennlig")).toBe(true); // tag
    expect(placeMatchesQuery(p1, "zzzzzz")).toBe(false);
  });

  it("experienceMatchesQuery matches title, host and tags", () => {
    const e1 = experienceById("e1")!;
    expect(experienceMatchesQuery(e1, "morgenkaffe")).toBe(true); // title
    expect(experienceMatchesQuery(e1, "maria")).toBe(true); // host
    expect(experienceMatchesQuery(e1, "sosialt")).toBe(true); // tag
    expect(experienceMatchesQuery(e1, "zzzzzz")).toBe(false);
  });
});
