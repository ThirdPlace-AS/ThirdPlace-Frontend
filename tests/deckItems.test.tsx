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
import { useSwipeDeck } from "@/components/swipe/useSwipeDeck";
import {
  chatForPlace,
  experiences,
  places,
  ratingOf,
  reviewsForPlace,
} from "@/fixtures";
import { formatRating } from "@/lib/format";

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
    expect(spotsLine({ capacity: 8, going: 5 })).toBe("3 plasser igjen · 5/8");
    expect(spotsLine({ capacity: 8, going: 8 })).toBe(
      "Ingen ledige plasser · 8/8",
    );
  });

  it("places use the same card fields, rating from their reviews", () => {
    for (const p of places) {
      const item = placeToDeckItem(p);
      expect(item.kind).toBe("place");
      expect(item.photos.length).toBeGreaterThanOrEqual(1);
      expect(item.scrims).toHaveLength(item.photos.length);
      expect(item.lines).toHaveLength(3);
      const { score, count } = ratingOf(reviewsForPlace(p.id));
      if (count)
        expect(item.lines[1]!.text.startsWith(formatRating(score))).toBe(true);
      expect(item.lines[2]!.text).toBe(p.openNow ? "Åpent nå" : "Stengt nå");
      expect(item.chatId).toBe(chatForPlace(p.id)?.id);
    }
  });
});

describe("one deck for places", () => {
  it("a like on a place saves it; undo takes the save back", () => {
    const items = places.map(placeToDeckItem);
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
