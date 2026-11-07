// Phase 12 H5d: the place page follows the experience page's video layout,
// every fact once; the rating comes from the place's reviews (not the stored
// count), and the sections each appear once.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  nearbyPlaces,
  placeChips,
  PlacePage,
  placeThingsToKnow,
} from "@/components/place/PlacePage";
import { placeById, places, ratingOf, reviewsForPlace } from "@/fixtures";
import { formatRating } from "@/lib/format";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

const p1 = placeById("p1")!;

describe("PlacePage", () => {
  it("has every section once", () => {
    render(<PlacePage place={p1} onNavigate={jest.fn()} />, { wrapper });
    for (const text of [
      p1.about,
      "Prisnivå",
      "Siste anmeldelse",
      "Hvor du finner oss",
      "Samtalen",
      "Flere steder i nærheten",
      "Ting å vite",
      "Tilgjengelighet",
      "Kilde",
      "Rapporter stedet",
    ]) {
      expect(screen.getAllByText(text)).toHaveLength(1);
    }
  });

  it("the rating line counts the reviews, not a stored number", () => {
    render(<PlacePage place={p1} onNavigate={jest.fn()} />, { wrapper });
    const { score, count } = ratingOf(reviewsForPlace(p1.id));
    expect(screen.getAllByText(formatRating(score)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(`${count} vurderinger`).length).toBeGreaterThan(
      0,
    );
    // No stored count anywhere (the old fixtures said e.g. "(128)").
    expect(screen.queryByText(/\(\d{3,}\)/)).toBeNull();
  });

  it("links to all reviews, writing a review and nearby places", () => {
    const onNavigate = jest.fn();
    render(<PlacePage place={p1} onNavigate={onNavigate} />, { wrapper });
    fireEvent.press(screen.getByText("Vis alle vurderinger"));
    expect(onNavigate).toHaveBeenCalledWith("/place/p1/reviews");
    fireEvent.press(screen.getByText("Skriv en anmeldelse"));
    expect(onNavigate).toHaveBeenCalledWith("/review/place/p1");
    const near = nearbyPlaces(p1)[0]!;
    fireEvent.press(
      screen.getByRole("button", { name: `${near.name}, ${near.category}` }),
    );
    expect(onNavigate).toHaveBeenCalledWith(`/place/${near.id}`);
  });
});

describe("place helpers", () => {
  it("chips list each vibe/tag once", () => {
    for (const p of places) {
      const c = placeChips(p);
      expect(new Set(c.map((x) => x.toLowerCase())).size).toBe(c.length);
    }
  });

  it("nearby places exclude the place itself", () => {
    expect(nearbyPlaces(p1).some((p) => p.id === p1.id)).toBe(false);
  });

  it("things to know come from the listing", () => {
    const k = placeThingsToKnow(p1);
    expect(k[0]!.title).toBe("Tilgjengelighet");
    expect(k.at(-1)!.summary).toBe(p1.source);
  });
});
