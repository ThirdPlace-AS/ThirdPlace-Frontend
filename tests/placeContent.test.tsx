// The map's place detail is the PlacePage in the page sheet, as experiences
// have ExperiencePage (user 2026-11-09: "make businesses and places the same
// map details sheet as experience"). Del and Lagre live in the sheet header
// and page top bar; "Drives av" opens the business on the sheet's stack.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PlaceContent } from "@/components/map/content/PlaceContent";
import { businessForPlace, placeById, places } from "@/fixtures";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

describe("PlaceContent", () => {
  it("renders the place page for a place", () => {
    const p1 = placeById("p1")!;
    render(<PlaceContent id="p1" push={jest.fn()} />, { wrapper });
    expect(screen.getByRole("header", { name: p1.name })).toBeTruthy();
    expect(screen.getByText("Hvor du finner oss")).toBeTruthy();
    // Vibe chips from the fixture (p1 = Rolig/Koselig).
    expect(screen.getByText("Rolig")).toBeTruthy();
    // Del and Lagre moved to the sheet header / page top bar.
    expect(screen.queryByText("Del")).toBeNull();
  });

  it("opens the business behind a Bedrift on the sheet's stack", () => {
    const place = places.find(
      (p) => p.kind === "bedrift" && businessForPlace(p.id),
    )!;
    const business = businessForPlace(place.id)!;
    const push = jest.fn();
    render(<PlaceContent id={place.id} push={push} />, { wrapper });
    fireEvent.press(screen.getByText(`Drives av ${business.name}`));
    expect(push).toHaveBeenCalledWith({ kind: "business", id: business.id });
  });

  it("shows a not-found message for an unknown id", () => {
    render(<PlaceContent id="nope" push={jest.fn()} />, { wrapper });
    expect(screen.getByText("Fant ikke stedet.")).toBeTruthy();
  });
});
