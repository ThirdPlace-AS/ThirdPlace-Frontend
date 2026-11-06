// Hvor/Når/Hvem step footer (benchmark W5): while "Når" is open the footer
// steps the flow (Hopp over / Neste, Nullstill once a date is picked);
// otherwise it is "Fjern alt / Vis N resultater".
import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MapFilterSheet } from "@/components/map/MapFilterSheet";
import { DEFAULT_FILTERS } from "@/components/map/services/mapFilters";

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderSheet() {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <MapFilterSheet
        visible
        filters={DEFAULT_FILTERS}
        mode="forYou"
        savedIds={[]}
        onClose={jest.fn()}
        onApply={jest.fn()}
      />
    </SafeAreaProvider>,
  );
}

describe("Filtre step footer", () => {
  it("shows Hopp over / Neste while Når is open, Nullstill once a date is picked", () => {
    jest.useFakeTimers();
    renderSheet();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByText(/^Vis \d+ resultater$/)).toBeTruthy();

    fireEvent.press(screen.getByText("Når"));
    expect(screen.getByText("Hopp over")).toBeTruthy();
    expect(screen.getByText("Neste")).toBeTruthy();

    fireEvent.press(screen.getByText("I dag"));
    expect(screen.getByText("Nullstill")).toBeTruthy();

    fireEvent.press(screen.getByText("Neste"));
    expect(screen.queryByText("Neste")).toBeNull();
    expect(screen.getByText(/^Vis \d+ resultater$/)).toBeTruthy();
    jest.useRealTimers();
  });
});
