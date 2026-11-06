import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PlaceContent } from "@/components/map/content/PlaceContent";

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
  it("renders vibes, price band and the save action for a place", () => {
    render(<PlaceContent id="p1" push={jest.fn()} />, { wrapper });
    // Vibe tags from the fixture (p1 = Rolig/Koselig).
    expect(screen.getByText("Rolig")).toBeTruthy();
    expect(screen.getByText("Vibe")).toBeTruthy();
    // Save action from DetailActions.
    expect(screen.getByText("Lagre")).toBeTruthy();
    expect(screen.getByText("Del")).toBeTruthy();
  });

  it("shows a not-found message for an unknown id", () => {
    render(<PlaceContent id="nope" push={jest.fn()} />, { wrapper });
    expect(screen.getByText("Fant ikke stedet.")).toBeTruthy();
  });
});
