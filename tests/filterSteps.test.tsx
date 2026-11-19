// Hvor/Når/Hvem step footer (benchmark W5): while "Når" is open the footer
// steps the flow (Hopp over / Neste, Nullstill once a date is picked);
// otherwise it is "Fjern alt / Vis N resultater".
import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Modal } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MapFilterSheet } from "@/components/map/MapFilterSheet";
import { DEFAULT_FILTERS } from "@/components/map/services/mapFilters";

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderSheet(onClose = jest.fn()) {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <MapFilterSheet
        visible
        filters={DEFAULT_FILTERS}
        mode="forYou"
        savedIds={[]}
        onClose={onClose}
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

  it("Nullstill after I kveld leaves no filter behind (Phase 19 fix)", () => {
    jest.useFakeTimers();
    renderSheet();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    const before = screen.getByText(/^Vis \d+ resultater$/).props.children;
    fireEvent.press(screen.getByText("Når"));
    fireEvent.press(screen.getByText("I kveld"));
    fireEvent.press(screen.getByText("Nullstill"));
    expect(screen.getByText("Hopp over")).toBeTruthy();
    fireEvent.press(screen.getByText("Neste"));
    // "I kveld" ticked Kveld under Tid på dagen; Nullstill takes it back.
    expect(screen.getByText(/^Vis \d+ resultater$/).props.children).toBe(
      before,
    );
    jest.useRealTimers();
  });
});

describe("Filtre system back (0454)", () => {
  it("closes an open section first, then the sheet", () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    renderSheet(onClose);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    const pressBack = () =>
      act(() => {
        screen.UNSAFE_getByType(Modal).props.onRequestClose();
      });

    fireEvent.press(screen.getByText("Når"));
    expect(screen.getByText("Hopp over")).toBeTruthy();
    pressBack();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Hopp over")).toBeNull();
    expect(screen.getByText(/^Vis \d+ resultater$/)).toBeTruthy();

    pressBack();
    expect(onClose).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
