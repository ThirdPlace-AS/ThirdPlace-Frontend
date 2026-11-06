// "Du er nå Skaper!" (PDF p14): a review-only success screen. It must say it is
// a preview and that the role's access is not decided, and its rows navigate.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";

import CreatorWelcomeScreen from "@/features/creators/CreatorWelcomeScreen";

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <CreatorWelcomeScreen />
    </SafeAreaProvider>,
  );

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (...a: unknown[]) => mockPush(...a),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  },
}));

describe("CreatorWelcomeScreen", () => {
  it("shows the success title with honest demo copy", () => {
    renderScreen();
    expect(screen.getByText("Du er nå Skaper!")).toBeTruthy();
    expect(screen.getByText(/Ingen søknad er sendt/)).toBeTruthy();
    expect(screen.getByText(/ikke bestemt ennå/)).toBeTruthy();
  });

  it("rows are buttons that open the matching screens", () => {
    renderScreen();
    fireEvent.press(screen.getByRole("button", { name: /Dashbord/ }));
    expect(mockPush).toHaveBeenCalledWith("/workspace/analytics");
  });
});
