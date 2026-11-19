// Kartlag: Karttype (Standard / Satellitt / Terreng, Phase 15) above Kartstil
// (Auto + four times of day, Phase 14), Norwegian names, one radio selection
// per group, the sheet stays open on a pick, ⓘ explains Auto.
import { describe, expect, it, jest } from "@jest/globals";
import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  MAP_PREVIEW_CREDIT,
  MapLayerSheet,
} from "@/components/map/MapLayerSheet";

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
  const onSelectType = jest.fn();
  render(
    <MapLayerSheet
      visible
      active="style2"
      auto={auto}
      mapType="standard"
      onClose={onClose}
      onSelect={onSelect}
      onEnableAuto={onEnableAuto}
      onSelectType={onSelectType}
    />,
    { wrapper },
  );
  // Tiles size themselves from the sheet body's width.
  fireEvent(screen.getByTestId("kartlag-body"), "layout", {
    nativeEvent: { layout: { width: 328, height: 600, x: 0, y: 0 } },
  });
  return { onClose, onSelect, onEnableAuto, onSelectType };
}

const radiosIn = (group: string) =>
  within(screen.getByLabelText(group))
    .getAllByRole("radio")
    .map((r) => r.props.accessibilityLabel);

describe("Kartlag", () => {
  it("shows Karttype first, then Auto and the four styles", () => {
    setup(false);
    expect(radiosIn("Karttype")).toEqual(["Standard", "Satellitt", "Terreng"]);
    expect(radiosIn("Kartstil")).toEqual([
      "Auto",
      "Daggry",
      "Dag",
      "Skumring",
      "Natt",
    ]);
  });

  it("marks the type and the style in use", () => {
    setup(false);
    expect(
      screen.getByRole("radio", { name: "Standard" }).props.accessibilityState,
    ).toMatchObject({ checked: true });
    expect(
      screen.getByRole("radio", { name: "Satellitt" }).props.accessibilityState,
    ).toMatchObject({ checked: false });
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

  it("picks change the map and keep the sheet open", () => {
    const { onClose, onSelect, onEnableAuto, onSelectType } = setup(false);
    fireEvent.press(screen.getByRole("radio", { name: "Satellitt" }));
    expect(onSelectType).toHaveBeenCalledWith("satellite");
    fireEvent.press(screen.getByRole("radio", { name: "Natt" }));
    expect(onSelect).toHaveBeenCalledWith("style4");
    fireEvent.press(screen.getByRole("radio", { name: "Auto" }));
    expect(onEnableAuto).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("ⓘ explains Auto, including dark mode", () => {
    setup(false);
    expect(screen.queryByText(/bytter kartstil etter tiden/)).toBeNull();
    fireEvent.press(screen.getByLabelText("Om kartstilene og kildene"));
    expect(screen.getByText(/bytter kartstil etter tiden/)).toBeTruthy();
    expect(screen.getByText(/mørk modus, viser Auto natt/)).toBeTruthy();
  });

  it("credits the map sources behind ⓘ, not under the grids", () => {
    // User 2026-11-11: "remove the text at the bottom of the map layer
    // modal"; the credit moved into ⓘ, as the map's own ⓘ holds its credits.
    setup(false);
    expect(screen.queryByText(MAP_PREVIEW_CREDIT)).toBeNull();
    fireEvent.press(screen.getByLabelText("Om kartstilene og kildene"));
    expect(screen.getByText(MAP_PREVIEW_CREDIT)).toBeTruthy();
    expect(screen.getByText(/© Mapbox © OpenStreetMap/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Skjul forklaringen"));
    expect(screen.queryByText(MAP_PREVIEW_CREDIT)).toBeNull();
  });
});
