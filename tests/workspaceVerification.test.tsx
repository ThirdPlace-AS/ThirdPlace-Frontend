// A business has one public profile, its place page (user 2026-11-10), so the
// owner's Verifisering (PDF p7) moved out of the map sheet into Arbeidsflate
// → Lokasjoner, with each business's own state.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { WorkspaceLocations } from "@/features/workspace/WorkspaceScreens";
import VerificationScreen, {
  verificationDocs,
  verificationSteps,
} from "@/features/workspace/VerificationScreen";
import { OWNED_BUSINESS_IDS, businessById } from "@/fixtures";

const mockPush = jest.fn();
let mockParams: { id?: string } = {};
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => mockParams,
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
  mockPush.mockClear();
  mockParams = {};
});

describe("verification state", () => {
  it("a verified business has every step done and its documents approved", () => {
    expect(verificationSteps(true).map((s) => s.state)).toEqual([
      "done",
      "done",
      "done",
    ]);
    expect(verificationDocs(true).every((d) => d.status === "Godkjent")).toBe(
      true,
    );
  });

  it("a business waiting is under review, as PDF p7 draws it", () => {
    expect(verificationSteps(false).map((s) => s.state)).toEqual([
      "done",
      "current",
      "todo",
    ]);
    expect(verificationDocs(false).map((d) => d.status)).toEqual([
      "Godkjent",
      "Vurderes",
    ]);
  });
});

describe("the Verifisering page", () => {
  it("shows the business, its documents and a way to support", () => {
    const b = businessById(OWNED_BUSINESS_IDS[0]!)!;
    mockParams = { id: b.id };
    render(<VerificationScreen />, { wrapper });
    expect(screen.getByText(b.name)).toBeTruthy();
    expect(screen.getByText("Firmaattest.pdf")).toBeTruthy();
    fireEvent.press(screen.getByText("Trenger du hjelp? Kontakt support"));
    expect(mockPush).toHaveBeenCalledWith("/settings/support");
  });

  it("says so for an unknown business", () => {
    mockParams = { id: "nope" };
    render(<VerificationScreen />, { wrapper });
    expect(screen.getByText("Fant ikke bedriften.")).toBeTruthy();
  });

  it("opens from each location in Lokasjoner", () => {
    render(<WorkspaceLocations />, { wrapper });
    const b = businessById(OWNED_BUSINESS_IDS[0]!)!;
    fireEvent.press(
      screen.getByRole("button", { name: new RegExp(`^${b.name}, `) }),
    );
    expect(mockPush).toHaveBeenCalledWith(`/workspace/verification/${b.id}`);
  });
});
