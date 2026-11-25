// Phase 12 H5d (user 2026-11-06: places on Sveip must look and work exactly
// like experiences): one card model for both kinds, one deck; a like on a
// place saves it and offers its chat; experiences show places left, never a
// status word.
import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { markerId } from "@/components/map/types/mapPresentation";
import {
  experienceToDeckItem,
  placeToDeckItem,
  spotsLine,
} from "@/components/swipe/deckItems";
import { infoPages, pagesForPhoto } from "@/components/swipe/SwipeCard";
import { useSwipeDeck } from "@/components/swipe/useSwipeDeck";
import {
  chatForPlace,
  experiences,
  places,
  ratingOf,
  reviewsForPlace,
} from "@/fixtures";
import { formatRating } from "@/lib/format";
import { isPlaceOpen } from "@/lib/openingHours";

describe("deck items", () => {
  it("experiences show where, when and places left, no status word", () => {
    for (const e of experiences) {
      const item = experienceToDeckItem(e);
      expect(item.kind).toBe("experience");
      expect(item.lines).toHaveLength(3);
      const text = item.lines.map((l) => l.text).join(" ");
      expect(text).not.toMatch(/\b(Venteliste|Fullt|Åpen|Påmeldt)\b/);
      expect(item.lines[2]!.text).toBe(spotsLine(e));
    }
    // Phase 16: "N skal" counts everyone going, then the places left.
    expect(spotsLine({ capacity: 8, going: 5 })).toBe(
      "5 skal · 3 plasser igjen",
    );
    expect(spotsLine({ capacity: 8, going: 8 })).toBe(
      "8 skal · ingen ledige plasser",
    );
  });

  it("places use the same card fields, rating from their reviews", () => {
    const now = new Date(2026, 10, 12, 19, 0); // a Thursday evening
    for (const p of places) {
      const item = placeToDeckItem(p, now);
      expect(item.kind).toBe("place");
      expect(item.photos.length).toBeGreaterThanOrEqual(1);
      expect(item.scrims).toHaveLength(item.photos.length);
      // type, where, rating, open now
      expect(item.lines).toHaveLength(4);
      expect(item.lines[0]!.text.length).toBeGreaterThan(0);
      const { score, count } = ratingOf(reviewsForPlace(p.id));
      if (count)
        expect(item.lines[2]!.text.startsWith(formatRating(score))).toBe(true);
      expect(item.lines[3]!.text).toBe(
        isPlaceOpen(p, now) ? "Åpent nå" : "Stengt nå",
      );
      expect(item.chatId).toBe(chatForPlace(p.id)?.id);
    }
  });
});

describe("one deck for places", () => {
  it("a like on a place saves it; undo takes the save back", () => {
    const items = places.map((p) => placeToDeckItem(p));
    const saved = renderHook(() => useMapSaved());
    const { result } = renderHook(() =>
      useSwipeDeck({ items, filterKey: "places" }),
    );
    const first = result.current.current!;
    const key = markerId("place", first.id);
    expect(saved.result.current.isSaved(key)).toBe(false);
    act(() => result.current.commit("like"));
    expect(result.current.isSaved(key)).toBe(true);
    expect(result.current.index).toBe(1);
    act(() => result.current.undo());
    expect(result.current.isSaved(key)).toBe(false);
  });

  it("a like on an experience does not save it", () => {
    const { result } = renderHook(() => useSwipeDeck());
    const first = result.current.current!;
    act(() => result.current.commit("like"));
    expect(result.current.isSaved(markerId("experience", first.id))).toBe(
      false,
    );
  });
});

describe("card info per photo (user 2026-11-18)", () => {
  it("basics, then about, then tags; empty pages are skipped", () => {
    expect(infoPages({ about: "Om", chips: ["Kaffe"] })).toEqual([
      "basics",
      "about",
      "tags",
    ]);
    expect(infoPages({ about: " ", chips: ["Kaffe"] })).toEqual([
      "basics",
      "tags",
    ]);
    expect(infoPages({ about: "", chips: [] })).toEqual(["basics"]);
  });

  it("the last photo takes every page left over", () => {
    const item = { about: "Om", chips: ["Kaffe"] };
    // Two photos (most cards): basics, then about + tags together.
    expect(pagesForPhoto(item, 0, 2)).toEqual(["basics"]);
    expect(pagesForPhoto(item, 1, 2)).toEqual(["about", "tags"]);
    // Three photos: one page each.
    expect(pagesForPhoto(item, 1, 3)).toEqual(["about"]);
    expect(pagesForPhoto(item, 2, 3)).toEqual(["tags"]);
    // More photos than pages: the rest show the title alone.
    expect(pagesForPhoto(item, 3, 5)).toEqual([]);
    expect(pagesForPhoto(item, 4, 5)).toEqual([]);
    // One photo: everything on it.
    expect(pagesForPhoto(item, 0, 1)).toEqual(["basics", "about", "tags"]);
  });

  it("every fixture card carries its about text and tags", () => {
    const e = experienceToDeckItem(experiences[0]!);
    expect(e.about).toBe(experiences[0]!.about);
    const p = placeToDeckItem(places[0]!);
    expect(p.about).toBe(places[0]!.about);
  });
});
