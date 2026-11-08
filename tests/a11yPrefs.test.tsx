// Phase 15: Tilgjengelighet's switches change the app — larger text, reduced
// motion and the step-free filter on the map and Sveip.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useMapFilters } from "@/components/map/hooks/useMapFilters";
import { DEFAULT_FILTERS } from "@/components/map/services/mapFilters";
import { Text } from "@/components/ui";
import { AccessibilitySettingsScreen } from "@/features/settings/SettingsPages";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  getA11yPrefs,
  resetA11yPrefs,
  setA11yPrefs,
  TEXT_SCALE,
  WHEELCHAIR_FEATURE,
  withWheelchair,
} from "@/lib/a11yPrefs";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: () => true },
}));

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

afterEach(() => resetA11yPrefs());

describe("Tilgjengelighet", () => {
  it("shows the switches that do something, wired to the prefs", () => {
    render(<AccessibilitySettingsScreen />, { wrapper });
    for (const label of [
      "Større tekst",
      "Reduser bevegelse",
      "Vis kun rullestolvennlige",
    ]) {
      fireEvent(
        screen.getByRole("switch", { name: label }),
        "valueChange",
        true,
      );
    }
    expect(getA11yPrefs()).toEqual({
      largerText: true,
      reduceMotion: true,
      wheelchairOnly: true,
    });
    expect(screen.queryByText("Høy kontrast")).toBeNull();
    expect(screen.queryByText("Skjermleser-optimalisert")).toBeNull();
  });

  it("Større tekst enlarges Text by one step", () => {
    const { rerender } = render(<Text variant="body">Hei</Text>);
    const size = () =>
      StyleSheet.flatten(screen.getByText("Hei").props.style)?.fontSize;
    expect(size()).toBeUndefined();
    act(() => setA11yPrefs({ largerText: true }));
    rerender(<Text variant="body">Hei</Text>);
    expect(size()).toBeCloseTo(16 * TEXT_SCALE);
  });

  it("Reduser bevegelse turns reduced motion on", () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => setA11yPrefs({ reduceMotion: true }));
    expect(result.current).toBe(true);
  });

  it("the step-free filter follows Vis kun rullestolvennlige", () => {
    expect(withWheelchair(DEFAULT_FILTERS, true).accessibility).toContain(
      WHEELCHAIR_FEATURE,
    );
    act(() => setA11yPrefs({ wheelchairOnly: true }));
    const { result } = renderHook(() => useMapFilters());
    expect(result.current.filters.accessibility).toContain(WHEELCHAIR_FEATURE);
    act(() => setA11yPrefs({ wheelchairOnly: false }));
    expect(result.current.filters.accessibility).not.toContain(
      WHEELCHAIR_FEATURE,
    );
  });
});
