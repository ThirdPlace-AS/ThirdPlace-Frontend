import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapDiscovery } from "@/components/map/hooks/useMapDiscovery";
import { places } from "@/fixtures";

describe("useMapDiscovery", () => {
  it("defaults to forYou (PDF p5) and marks it demo", () => {
    const { result } = renderHook(() =>
      useMapDiscovery({ places, query: "", savedIds: [] }),
    );
    expect(result.current.mode).toBe("forYou");
    expect(result.current.demo).toBe(true);
  });

  it("explore returns all places", () => {
    const { result } = renderHook(() =>
      useMapDiscovery({ places, query: "", savedIds: [] }),
    );
    act(() => result.current.setMode("explore"));
    expect(result.current.items).toHaveLength(places.length);
  });

  it("switching to live swaps to experience items", () => {
    const { result } = renderHook(() =>
      useMapDiscovery({ places, query: "", savedIds: [] }),
    );
    act(() => result.current.setMode("live"));
    expect(result.current.mode).toBe("live");
    expect(result.current.items.every((i) => i.kind === "experience")).toBe(
      true,
    );
  });

  it("switching to forYou flags demo", () => {
    const { result } = renderHook(() =>
      useMapDiscovery({ places, query: "", savedIds: [] }),
    );
    act(() => result.current.setMode("forYou"));
    expect(result.current.demo).toBe(true);
  });
});
