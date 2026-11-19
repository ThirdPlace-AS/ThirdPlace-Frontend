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
  // R1b (0363): the coordinate travels with the request, so a fly can never
  // fall back to a default centre.
  it("flies at area zoom by default and at street zoom on request", () => {
    const { result } = renderHook(() => useMapCamera());
    expect(result.current.target).toBeNull();
    const area: [number, number] = [10.52, 59.89];
    act(() => {
      result.current.flyTo(area);
    });
    expect(result.current.target).toMatchObject({ coord: area, zoom: 13 });
    const me: [number, number] = [11.0496, 59.956];
    let first = 0;
    act(() => {
      first = result.current.flyTo(me, USER_PUCK.locateZoom);
    });
    expect(result.current.target).toMatchObject({ coord: me, zoom: 15 });
    expect(first).toBe(2);
  });

  it("names the fly a follow-up refines", () => {
    const { result } = renderHook(() => useMapCamera());
    let seq = 0;
    act(() => {
      seq = result.current.flyTo([11.0496, 59.956], 15);
    });
    act(() => {
      result.current.flyTo([11.05, 59.957], 15, { followUp: seq });
    });
    expect(result.current.target).toMatchObject({
      followUp: seq,
      seq: seq + 1,
    });
  });
});
