import { describe, expect, it } from "@jest/globals";

import {
  applyFilters,
  DEFAULT_FILTERS,
} from "@/components/map/services/mapFilters";
import {
  countResults,
  resultForMode,
} from "@/components/map/services/mapFixtureAdapter";
import { boundsOf } from "@/components/map/services/bounds";
import { markerId } from "@/components/map/types/mapPresentation";
import { experiences, places } from "@/fixtures";

const base = { places, query: "", savedIds: [] as string[] };

describe("resultForMode", () => {
  it("explore returns every place and every bookable experience", () => {
    const r = resultForMode({ ...base, mode: "explore" });
    const live = experiences.filter((e) => e.status !== "cancelled");
    expect(r.items).toHaveLength(places.length + live.length);
    expect(r.items.filter((i) => i.kind === "place")).toHaveLength(
      places.length,
    );
    expect(r.items.filter((i) => i.kind === "experience")).toHaveLength(
      live.length,
    );
    expect(r.demo).toBe(false);
  });

  it("experience pins sit at their meeting point", () => {
    const r = resultForMode({ ...base, mode: "explore" });
    for (const e of experiences) {
      const item = r.items.find((i) => i.id === e.id);
      expect(item?.coord).toEqual(e.meetingPoint.coord);
    }
  });

  it.each(["forYou", "trending", "saved"] as const)(
    "%s can hold both places and experiences",
    (mode) => {
      const savedIds = [markerId("place", "p1"), markerId("experience", "e1")];
      const r = resultForMode({ ...base, mode, savedIds });
      expect(r.items.some((i) => i.kind === "place")).toBe(true);
      expect(r.items.some((i) => i.kind === "experience")).toBe(true);
    },
  );

  it("trending sorts places by mock review count desc", () => {
    const r = resultForMode({ ...base, mode: "trending" });
    // p11 (Munch-galleriet Kveldstur) has the most reviews in fixtures.
    expect(r.items[0]?.id).toBe("p11");
    const reviews = r.items.map((i) => i.reviewCount ?? 0);
    expect([...reviews].sort((a, b) => b - a)).toEqual(reviews);
  });

  it("live returns only open/waitlist experiences", () => {
    const r = resultForMode({ ...base, mode: "live" });
    expect(r.items.every((i) => i.kind === "experience")).toBe(true);
    // e3 is "full" and must be excluded.
    expect(r.items.some((i) => i.id === "e3")).toBe(false);
  });

  it("forYou and friends are flagged as demo (shells)", () => {
    const forYou = resultForMode({ ...base, mode: "forYou" });
    const friends = resultForMode({ ...base, mode: "friends" });
    expect(forYou.demo).toBe(true);
    expect(friends.demo).toBe(true);
  });

  it("saved returns only items whose markerId is saved", () => {
    const r = resultForMode({
      ...base,
      mode: "saved",
      savedIds: ["place:p1"],
    });
    expect(r.items).toHaveLength(1);
    expect(r.items[0]?.markerId).toBe("place:p1");
  });

  it("saved is empty when nothing is saved", () => {
    const r = resultForMode({ ...base, mode: "saved" });
    expect(r.items).toHaveLength(0);
  });

  it("live respects the search query", () => {
    const r = resultForMode({ ...base, mode: "live", query: "lese" });
    expect(r.items.every((i) => i.title.toLowerCase().includes("lese"))).toBe(
      true,
    );
    expect(r.items.length).toBeGreaterThan(0);
  });

  it("live matches experiences by host and tag, not just title", () => {
    // e1 "Morgenkaffe & prat" — host "Maria M.", tag "Sosialt". Title contains
    // neither term; the shared matcher must still find it.
    const byHost = resultForMode({ ...base, mode: "live", query: "maria" });
    expect(byHost.items.some((i) => i.id === "e1")).toBe(true);
    const byTag = resultForMode({ ...base, mode: "live", query: "sosialt" });
    expect(byTag.items.some((i) => i.id === "e1")).toBe(true);
  });

  it("live respects the time filter", () => {
    // Every TimeWindow is populated (fixtures spread across day values): "Helg"
    // holds the waitlist e2; "Denne uka" holds the open e1/e4 (the full e3 is
    // excluded by live). The filter must keep each window's own items and no
    // other window's.
    const helg = resultForMode({ ...base, mode: "live", time: "Helg" });
    expect(helg.items.some((i) => i.id === "e2")).toBe(true);
    expect(helg.items.some((i) => i.id === "e1")).toBe(false);

    const weekday = resultForMode({ ...base, mode: "live", time: "Denne uka" });
    expect(weekday.items.some((i) => i.id === "e1")).toBe(true);
    expect(weekday.items.some((i) => i.id === "e4")).toBe(true);
    expect(weekday.items.some((i) => i.id === "e2")).toBe(false);
    expect(weekday.items.some((i) => i.id === "e3")).toBe(false); // full → not live
  });

  it("saved shows every saved item, ignoring filters, search and status", () => {
    const r = resultForMode({
      ...base,
      mode: "saved",
      places: [], // the screen's filtered place list is empty
      query: "finnes-ikke",
      time: "Helg",
      hasSpots: true,
      savedIds: ["experience:e3", `place:${places[0]!.id}`],
    });
    const ids = r.items.map((i) => i.id);
    expect(ids).toContain("e3"); // status "full", day/spots don't match
    expect(ids).toContain(places[0]!.id);
  });
});

describe("countResults (Filtre footer = list, benchmark F11)", () => {
  const base = { allPlaces: places, query: "", savedIds: [] as string[] };

  it("Live follows Ledige plasser, which the old places-only count ignored", () => {
    const all = countResults({
      ...base,
      mode: "live",
      filters: DEFAULT_FILTERS,
    });
    const withSpots = countResults({
      ...base,
      mode: "live",
      filters: { ...DEFAULT_FILTERS, hasSpots: true },
    });
    const expected = experiences.filter(
      (e) =>
        (e.status === "open" || e.status === "waitlist") &&
        e.capacity - e.going > 0,
    ).length;
    expect(withSpots).toBe(expected);
    expect(withSpots).toBeLessThanOrEqual(all);
  });

  it("For deg counts the filtered places plus the experiences", () => {
    const filters = { ...DEFAULT_FILTERS, minRating: 4.5 };
    expect(countResults({ ...base, mode: "forYou", filters })).toBe(
      applyFilters(places, "", filters).length +
        experiences.filter((e) => e.status !== "cancelled").length,
    );
  });

  it("equals the list the screen renders for every mode", () => {
    const filters = { ...DEFAULT_FILTERS, time: "I dag" as const };
    for (const mode of [
      "forYou",
      "trending",
      "live",
      "explore",
      "saved",
      "friends",
    ] as const) {
      const list = resultForMode({
        mode,
        places: applyFilters(places, "", filters),
        query: "",
        savedIds: [],
        time: filters.time,
        hasSpots: filters.hasSpots,
      }).items.length;
      expect(countResults({ ...base, mode, filters })).toBe(list);
    }
  });
});

describe("boundsOf (first map view fits every pin)", () => {
  it("spans every place and meeting point", () => {
    const r = resultForMode({ ...base, mode: "forYou" });
    const b = boundsOf(r.items.map((i) => i.coord))!;
    const [[maxLng, maxLat], [minLng, minLat]] = b;
    for (const i of r.items) {
      expect(i.coord[0]).toBeGreaterThanOrEqual(minLng);
      expect(i.coord[0]).toBeLessThanOrEqual(maxLng);
      expect(i.coord[1]).toBeGreaterThanOrEqual(minLat);
      expect(i.coord[1]).toBeLessThanOrEqual(maxLat);
    }
  });

  it("needs at least two points", () => {
    expect(boundsOf([[10.7, 59.9]])).toBeNull();
  });
});
