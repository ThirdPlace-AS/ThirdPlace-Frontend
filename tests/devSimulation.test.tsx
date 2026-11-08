// Dev-only switches (app/_sandbox/simulate): the slow-load switch added in
// Phase 12 H1 makes the skeleton → loader hand-off reachable on a device.
import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { setDevSimulation, useDevSimulation } from "@/lib/devSimulation";

describe("dev simulation", () => {
  it("starts with every switch off", () => {
    const { result } = renderHook(() => useDevSimulation());
    expect(result.current).toEqual({
      mapOffline: false,
      checkinFar: false,
      slowLoad: false,
    });
  });

  it("toggles one switch without touching the others", () => {
    const { result } = renderHook(() => useDevSimulation());
    act(() => setDevSimulation({ slowLoad: true }));
    expect(result.current.slowLoad).toBe(true);
    expect(result.current.mapOffline).toBe(false);
    act(() => setDevSimulation({ slowLoad: false }));
    expect(result.current.slowLoad).toBe(false);
  });
});
