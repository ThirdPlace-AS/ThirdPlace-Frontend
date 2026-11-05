import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useRecentSearches } from "@/components/map/hooks/useRecentSearches";

describe("useRecentSearches", () => {
  it("adds, de-duplicates, caps, removes and clears", () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.clear());

    act(() => result.current.add("kaffe"));
    act(() => result.current.add("vin"));
    expect(result.current.recent).toEqual(["vin", "kaffe"]);

    // Re-adding moves to front without duplicating.
    act(() => result.current.add("kaffe"));
    expect(result.current.recent).toEqual(["kaffe", "vin"]);

    // Blank is ignored.
    act(() => result.current.add("   "));
    expect(result.current.recent).toEqual(["kaffe", "vin"]);

    act(() => result.current.remove("vin"));
    expect(result.current.recent).toEqual(["kaffe"]);

    act(() => result.current.clear());
    expect(result.current.recent).toEqual([]);
  });

  it("caps at six entries", () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.clear());
    act(() => {
      for (let i = 0; i < 8; i++) result.current.add(`q${i}`);
    });
    expect(result.current.recent).toHaveLength(6);
    // Most recent first.
    expect(result.current.recent[0]).toBe("q7");
  });
});
