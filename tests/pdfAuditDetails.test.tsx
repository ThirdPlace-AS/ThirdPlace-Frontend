// Phase 14 audit details: Personvern carries p21's data-sharing toggles, and
// check-in at the place reads "Du er fremme!" (p7).
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CheckinContent } from "@/components/map/content/CheckinContent";
import PrivacyScreen from "@/features/settings/PrivacyScreen";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: () => true },
}));

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

describe("Personvern (PDF p19 + p21)", () => {
  it("has the p21 data-sharing toggles, as drawn", () => {
    render(<PrivacyScreen />, { wrapper });
    expect(screen.getByText("Datadeling")).toBeTruthy();
    for (const [label, on] of [
      ["Del aktivitet med venner", true],
      ["Personalisert innhold", true],
      ["Analytiske data", false],
    ] as const) {
      const sw = screen.getByRole("switch", { name: label });
      expect(sw.props.accessibilityState?.checked ?? sw.props.value).toBe(on);
    }
  });

  it("a toggle flips locally", () => {
    render(<PrivacyScreen />, { wrapper });
    const sw = screen.getByRole("switch", { name: "Analytiske data" });
    fireEvent(sw, "valueChange", true);
    const after = screen.getByRole("switch", { name: "Analytiske data" });
    expect(after.props.accessibilityState?.checked ?? after.props.value).toBe(
      true,
    );
  });
});

describe("Check-in (PDF p7)", () => {
  it("reads 'Du er fremme!' at the place", () => {
    render(<CheckinContent id="e1" />, { wrapper });
    expect(screen.getByText("Du er fremme!")).toBeTruthy();
    expect(screen.getByText("Sjekk inn")).toBeTruthy();
  });
});
