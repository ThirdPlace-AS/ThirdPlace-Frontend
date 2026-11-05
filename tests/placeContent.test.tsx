import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { PlaceContent } from "@/components/map/content/PlaceContent";

describe("PlaceContent", () => {
  it("renders vibes, price band and the save action for a place", () => {
    render(<PlaceContent id="p1" push={jest.fn()} />);
    // Vibe tags from the fixture (p1 = Rolig/Koselig).
    expect(screen.getByText("Rolig")).toBeTruthy();
    expect(screen.getByText("Vibe")).toBeTruthy();
    // Save action from DetailActions.
    expect(screen.getByText("Lagre")).toBeTruthy();
    expect(screen.getByText("Del")).toBeTruthy();
  });

  it("shows a not-found message for an unknown id", () => {
    render(<PlaceContent id="nope" push={jest.fn()} />);
    expect(screen.getByText("Fant ikke stedet.")).toBeTruthy();
  });
});
