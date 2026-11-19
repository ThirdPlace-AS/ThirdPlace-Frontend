// Phase 15: Om ThirdPlace (version, Lisenser) and the licence pages.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  AboutScreen,
  LicenseScreen,
  LicensesScreen,
} from "@/features/settings/AboutScreens";

const mockPush = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
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

beforeEach(() => {
  mockPush.mockClear();
  mockParams = {};
});

describe("Om ThirdPlace", () => {
  it("shows the version and opens Lisenser", () => {
    render(<AboutScreen />, { wrapper });
    expect(screen.getByText(/^Versjon /)).toBeTruthy();
    fireEvent.press(screen.getByText("Lisenser"));
    expect(mockPush).toHaveBeenCalledWith("/settings/licenses");
  });

  it("Lisenser credits map data and photos, and searches packages", () => {
    render(<LicensesScreen />, { wrapper });
    expect(screen.getByText(/© Mapbox © OpenStreetMap/)).toBeTruthy();
    expect(screen.getByText(/Unsplash/)).toBeTruthy();
    fireEvent.changeText(screen.getByPlaceholderText("Søk pakker …"), "zzzz");
    expect(screen.getByText("Ingen treff")).toBeTruthy();
  });

  it("a package page shows its licence text", () => {
    mockParams = { name: "react" };
    render(<LicenseScreen />, { wrapper });
    expect(screen.getByText(/Permission is hereby granted/)).toBeTruthy();
  });
});
