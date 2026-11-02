import { describe, expect, it } from "@jest/globals";

import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import { places } from "@/fixtures";

const base = { places, query: "", savedIds: [] as string[] };

describe("resultForMode", () => {
  it("explore returns all places, not demo", () => {
    const r = resultForMode({ ...base, mode: "explore" });
    expect(r.items).toHaveLength(places.length);
    expect(r.items.every((i) => i.kind === "place")).toBe(true);
    expect(r.demo).toBe(false);
  });

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
});
