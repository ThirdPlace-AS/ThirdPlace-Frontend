// Review 2026-11-18 PR-09 (0527), «Bedrift: sjekkliste først»: Arbeidsflate
// opens on what is left to do (and drops the list once it is done), a
// business waiting on verification says so without promising a time, and
// business onboarding ends on the business's own pin.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PinPreview } from "@/components/map/PinPreview";
import { businessSteps } from "@/features/workspace/businessSteps";
import {
  WorkspaceHub,
  WorkspaceLocations,
} from "@/features/workspace/WorkspaceScreens";
import { setDevSimulation } from "@/lib/devSimulation";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({}),
  useFocusEffect: () => {},
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

afterEach(() => {
  act(() => setDevSimulation({ newBusiness: false }));
  mockPush.mockClear();
});

describe("businessSteps", () => {
  it("verification waits, the first experience leads to Legg til", () => {
    const steps = businessSteps({
      businessId: "b1",
      verified: false,
      hasExperience: false,
    });
    expect(steps.map((s) => [s.key, s.done, s.status, s.href])).toEqual([
      ["verify", false, "Venter", "/workspace/verification/b1"],
      ["experience", false, undefined, "/add"],
    ]);
    const done = businessSteps({
      businessId: "b1",
      verified: true,
      hasExperience: true,
    });
    expect(done.every((s) => s.done && !s.status)).toBe(true);
  });
});

describe("Arbeidsflate", () => {
  it("a set-up business opens on I dag, with no checklist", () => {
    render(<WorkspaceHub />, { wrapper });
    expect(screen.getByText("Verifisert bedrift")).toBeTruthy();
    expect(screen.queryByText("Kom i gang")).toBeNull();
    expect(screen.getByText("I dag")).toBeTruthy();
  });

  it("a new business opens on Kom i gang, waiting on verification", () => {
    act(() => setDevSimulation({ newBusiness: true }));
    render(<WorkspaceHub />, { wrapper });
    expect(screen.getByText("Venter på verifisering")).toBeTruthy();
    expect(screen.getByText("0 av 2 er på plass")).toBeTruthy();
    // The checklist comes before I dag.
    const texts = screen.UNSAFE_root.findAll(
      (n) => typeof n.props.children === "string",
    ).map((n) => n.props.children as string);
    expect(texts.indexOf("Kom i gang")).toBeLessThan(texts.indexOf("I dag"));
    fireEvent.press(screen.getByLabelText("Verifiser bedriften: venter"));
    expect(mockPush).toHaveBeenLastCalledWith("/workspace/verification/b1");
    fireEvent.press(screen.getByLabelText("Legg til en opplevelse: gjenstår"));
    expect(mockPush).toHaveBeenLastCalledWith("/add");
  });

  it("Lokasjoner shows the same waiting state", () => {
    act(() => setDevSimulation({ newBusiness: true }));
    render(<WorkspaceLocations />, { wrapper });
    expect(
      screen.getAllByText("Venter på verifisering").length,
    ).toBeGreaterThan(0);
  });
});

describe("onboarding's last step", () => {
  it("shows the business on its own pin", () => {
    render(<PinPreview name="Bakeriet" category="Kafé" />);
    expect(screen.getByLabelText("Bakeriet på kartet")).toBeTruthy();
    expect(screen.getByText("Bakeriet")).toBeTruthy();
  });
});
