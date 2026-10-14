import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapDiscovery } from "@/components/map/hooks/useMapDiscovery";
import { useMapPresentation } from "@/components/map/hooks/useMapPresentation";
import { places } from "@/fixtures";

describe("useMapDiscovery", () => {
  it("defaults to explore with all places", () => {
    const { result } = renderHook(() =>
      useMapDiscovery({ places, query: "", savedIds: [] }),
    );
    expect(result.current.mode).toBe("explore");
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

describe("useMapPresentation", () => {
  it("toggles between map and list", () => {
    const { result } = renderHook(() => useMapPresentation());
    expect(result.current.view).toBe("map");
    act(() => result.current.toggle());
    expect(result.current.view).toBe("list");
    act(() => result.current.toggle());
    expect(result.current.view).toBe("map");
  });
});
