import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import {
  mapBackAction,
  SNAP_MID,
  SNAP_PEEK,
  useMapSelection,
} from "@/components/map/hooks/useMapSelection";
import type { DiscoveryItem } from "@/components/map/types/mapPresentation";

const item: DiscoveryItem = {
  markerId: "place:p1",
  kind: "place",
  id: "p1",
  coord: [10.7579, 59.9227],
  category: "Kafé",
  title: "Oslo Kaffebar",
  subtitle: "120 m",
};

describe("useMapSelection", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useMapSelection());
    expect(result.current.sheetStack).toHaveLength(0);
    expect(result.current.selectedMarkerId).toBeNull();
  });

  it("selectMarker opens the sheet at the peek snap and drives selectedMarkerId", () => {
    const { result } = renderHook(() => useMapSelection());
    act(() => result.current.selectMarker(item));
    expect(result.current.sheetStack).toEqual([{ kind: "place", id: "p1" }]);
    expect(result.current.openIndex).toBe(SNAP_PEEK);
    // Selection tracked via the sheet root (map/list stay in sync).
    expect(result.current.selectedMarkerId).toBe("place:p1");
  });

  it("openTarget opens the sheet at the mid snap", () => {
    const { result } = renderHook(() => useMapSelection());
    act(() => result.current.openTarget({ kind: "group", id: "g1" }));
    expect(result.current.sheetStack).toEqual([{ kind: "group", id: "g1" }]);
    expect(result.current.openIndex).toBe(SNAP_MID);
    expect(result.current.selectedMarkerId).toBe("group:g1");
  });

  it("push/back/close manage the in-sheet stack", () => {
    const { result } = renderHook(() => useMapSelection());
    act(() => result.current.openTarget({ kind: "place", id: "p1" }));
    act(() => result.current.push({ kind: "reviews", id: "p1" }));
    expect(result.current.sheetStack).toHaveLength(2);
    act(() => result.current.back());
    expect(result.current.sheetStack).toHaveLength(1);
    act(() => result.current.close());
    expect(result.current.sheetStack).toHaveLength(0);
    expect(result.current.selectedMarkerId).toBeNull();
  });
});

describe("mapBackAction", () => {
  it("steps back in a nested sheet, closes a single one, else passes through", () => {
    expect(mapBackAction(3)).toBe("back");
    expect(mapBackAction(2)).toBe("back");
    expect(mapBackAction(1)).toBe("close");
    expect(mapBackAction(0)).toBe("none");
  });

  it("collapses the full-screen experience page before closing", () => {
    expect(mapBackAction(1, true)).toBe("collapse");
    expect(mapBackAction(2, true)).toBe("back");
    expect(mapBackAction(0, true)).toBe("none");
  });
});
