// Phase 14: Kartlag as a grid of map-style previews (founder reference,
// 2026-11-07). Auto first, Norwegian names, one radio selection, ⓘ explains Auto.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MapLayerSheet } from "@/components/map/MapLayerSheet";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

function setup(auto: boolean) {
  const onClose = jest.fn();
  const onSelect = jest.fn();
  const onEnableAuto = jest.fn();
  render(
    <MapLayerSheet
      visible
      active="style2"
      auto={auto}
      onClose={onClose}
      onSelect={onSelect}
      onEnableAuto={onEnableAuto}
    />,
    { wrapper },
  );
  // Tiles size themselves from the grid's width.
  fireEvent(screen.getByLabelText("Kartstil"), "layout", {
    nativeEvent: { layout: { width: 328, height: 300, x: 0, y: 0 } },
  });
  return { onClose, onSelect, onEnableAuto };
}

describe("Kartlag", () => {
  it("shows Auto and the four styles with Norwegian names", () => {
    setup(false);
    const names = screen
      .getAllByRole("radio")
      .map((r) => r.props.accessibilityLabel);
    expect(names).toEqual(["Auto", "Daggry", "Dag", "Skumring", "Natt"]);
  });

  it("marks only the style in use", () => {
    setup(false);
    expect(
      screen.getByRole("radio", { name: "Dag" }).props.accessibilityState,
    ).toMatchObject({ checked: true });
    expect(
      screen.getByRole("radio", { name: "Auto" }).props.accessibilityState,
    ).toMatchObject({ checked: false });
  });

  it("marks Auto when the map follows the clock", () => {
    setup(true);
    expect(
      screen.getByRole("radio", { name: "Auto" }).props.accessibilityState,
    ).toMatchObject({ checked: true });
    expect(
      screen.getByRole("radio", { name: "Dag" }).props.accessibilityState,
    ).toMatchObject({ checked: false });
  });

  it("picking a style selects it and closes; Auto turns the clock back on", () => {
    const { onClose, onSelect, onEnableAuto } = setup(false);
    fireEvent.press(screen.getByRole("radio", { name: "Natt" }));
    expect(onSelect).toHaveBeenCalledWith("style4");
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole("radio", { name: "Auto" }));
    expect(onEnableAuto).toHaveBeenCalledTimes(1);
  });

  it("ⓘ explains Auto", () => {
    setup(false);
    expect(screen.queryByText(/bytter kartstil etter tiden/)).toBeNull();
    fireEvent.press(screen.getByLabelText("Om Auto"));
    expect(screen.getByText(/bytter kartstil etter tiden/)).toBeTruthy();
  });
});
