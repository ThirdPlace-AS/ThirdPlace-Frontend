// Phase 11 G8: the user's location marker looks the same on every basemap and
// app theme (fixed light-palette colours), and "Posisjon" flies in to street
// level.
import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapCamera } from "@/components/map/hooks/useMapCamera";
import { USER_PUCK } from "@/components/map/userPuck";
import { palette } from "@/theme";

describe("USER_PUCK", () => {
  it("uses the fixed light palette, not the theme", () => {
    const light = palette.light as unknown as Record<string, string>;
    expect(USER_PUCK.dot).toBe(light.ember);
    expect(USER_PUCK.ring).toBe(light.surface);
    expect(USER_PUCK.locateZoom).toBeGreaterThanOrEqual(15);
  });
});

describe("useMapCamera", () => {
  it("recenters at area zoom by default and at street zoom on request", () => {
    const { result } = renderHook(() => useMapCamera());
    expect(result.current.recenterSignal).toBe(0);
    act(() => result.current.recenter());
    expect(result.current.recenterZoom).toBe(13);
    act(() => result.current.recenter(USER_PUCK.locateZoom));
    expect(result.current.recenterSignal).toBe(2);
    expect(result.current.recenterZoom).toBe(15);
  });
});
