import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { MiniPin } from "@/components/map/MiniPin";
import { places } from "@/fixtures";
import { mapPalette, palette } from "@/theme";

// User 2026-11-11: with no colour key on the map, the detail sheet shows the
// pin's colour and icon by its type label ("a green tree before Park"). The
// mini pin is hidden from screen readers (the label says it), so queries
// include hidden elements.
describe("MiniPin", () => {
  const fill = () =>
    StyleSheet.flatten(
      screen.getByTestId("mini-pin", { includeHiddenElements: true }).props
        .style,
    ).backgroundColor;
  const ring = () =>
    StyleSheet.flatten(
      screen.getByTestId("mini-pin", { includeHiddenElements: true }).props
        .style,
    ).borderColor;

  it("draws a café in the eat colour with a place's white ring", () => {
    render(<MiniPin target={{ kind: "place", id: "p1" }} />);
    expect(fill()).toBe(mapPalette.eat);
    expect(ring()).toBe(palette.light.surface);
  });

  it("draws a park green", () => {
    const park = places.find((p) => p.category === "Park")!;
    render(<MiniPin target={{ kind: "place", id: park.id }} />);
    expect(fill()).toBe(mapPalette.nature);
  });

  it("draws an experience with its ink ring", () => {
    render(<MiniPin target={{ kind: "experience", id: "e4" }} />);
    expect(fill()).toBe(mapPalette.sport);
    expect(ring()).toBe(palette.light.ink);
  });

  it("draws nothing for a target that has no pin", () => {
    render(<MiniPin target={{ kind: "group", id: "g1" }} />);
    expect(
      screen.queryByTestId("mini-pin", { includeHiddenElements: true }),
    ).toBeNull();
  });
});
