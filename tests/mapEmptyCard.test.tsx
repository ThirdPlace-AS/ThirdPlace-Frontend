// 0465: an empty Lagret on the map says nothing is saved and offers no reset;
// the other modes keep "Ingen treff" with Nullstill.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { MapEmptyCard } from "@/components/map/MapStateCard";

describe("MapEmptyCard", () => {
  it("Lagret: says nothing is saved, no Nullstill", () => {
    render(<MapEmptyCard mode="saved" message="x" onReset={jest.fn()} />);
    expect(screen.getByText("Ingenting lagret – ennå")).toBeTruthy();
    expect(screen.queryByText("Ingen treff")).toBeNull();
    expect(screen.queryByText("Nullstill")).toBeNull();
  });

  it("other modes: Ingen treff, and Nullstill resets", () => {
    const onReset = jest.fn();
    render(
      <MapEmptyCard
        mode="forYou"
        message="Prøv færre filtre."
        onReset={onReset}
      />,
    );
    expect(screen.getByText("Ingen treff")).toBeTruthy();
    expect(screen.getByText("Prøv færre filtre.")).toBeTruthy();
    fireEvent.press(screen.getByText("Nullstill"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
