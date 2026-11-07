import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapLocation } from "@/components/map/hooks/useMapLocation";
import { MAP_CENTER, OSLO_AREAS } from "@/fixtures";

describe("useMapLocation", () => {
  it("starts idle, centered on the demo default, no area", () => {
    const { result } = renderHook(() => useMapLocation());
    expect(result.current.status).toBe("idle");
    expect(result.current.center).toEqual(MAP_CENTER);
    expect(result.current.areaLabel).toBeNull();
  });

  it("selecting a manual area centers on it without fabricating GPS", () => {
    const { result } = renderHook(() => useMapLocation());
    const area = OSLO_AREAS[0]!;
    act(() => result.current.selectArea(area));
    expect(result.current.center).toEqual(area.coord);
    expect(result.current.areaLabel).toBe(area.name);
    expect(result.current.area?.name).toBe(area.name);
    // Manual area is a fallback, not a GPS fix.
    expect(result.current.coord).toBeNull();
  });
});
