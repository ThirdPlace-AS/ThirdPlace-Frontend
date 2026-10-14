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
    // p3 (Mathallen Vinbar) has the most reviews in fixtures.
    expect(r.items[0]?.id).toBe("p3");
  });

  it("live returns only open/waitlist experiences", () => {
    const r = resultForMode({ ...base, mode: "live" });
    expect(r.items.every((i) => i.kind === "experience")).toBe(true);
    // e3 is "full" and must be excluded.
    expect(r.items.some((i) => i.id === "e3")).toBe(false);
  });

  it("forYou and friends are flagged as demo with a note", () => {
    const forYou = resultForMode({ ...base, mode: "forYou" });
    const friends = resultForMode({ ...base, mode: "friends" });
    expect(forYou.demo).toBe(true);
    expect(forYou.note).toBeTruthy();
    expect(friends.demo).toBe(true);
    expect(friends.note).toBeTruthy();
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
});
