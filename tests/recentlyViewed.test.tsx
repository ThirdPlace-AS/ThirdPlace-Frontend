// "Nylig sett": newest first, no duplicates, at most six, clearable.
import { afterEach, describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import {
  clearViewed,
  markViewed,
  useRecentlyViewed,
} from "@/components/map/hooks/useRecentlyViewed";

afterEach(() => act(() => clearViewed()));

describe("useRecentlyViewed", () => {
  it("keeps the newest first and moves a repeat to the top", () => {
    const { result } = renderHook(() => useRecentlyViewed());
    act(() => {
      markViewed({ kind: "place", id: "p1", title: "Oslo Kaffebar" });
      markViewed({ kind: "experience", id: "e1", title: "Morgenkaffe" });
      markViewed({ kind: "place", id: "p1", title: "Oslo Kaffebar" });
    });
    expect(result.current.viewed.map((v) => v.id)).toEqual(["p1", "e1"]);
  });

  it("caps at six and clears", () => {
    const { result } = renderHook(() => useRecentlyViewed());
    act(() => {
      for (let i = 0; i < 8; i++)
        markViewed({ kind: "place", id: `p${i}`, title: `Sted ${i}` });
    });
    expect(result.current.viewed).toHaveLength(6);
    expect(result.current.viewed[0]?.id).toBe("p7");
    act(() => result.current.clear());
    expect(result.current.viewed).toHaveLength(0);
  });
});
