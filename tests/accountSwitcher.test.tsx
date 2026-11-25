// Review 2026-11-18 PR-08 (0526), «Aktiv konto i toppen»: Profil names the
// account you act as in a chip at the top; the chip and the Profil tab's long
// press open one sheet with the linked accounts, a ✓ on the active one and
// «Administrer kontoer». The old mid-page card and the long-press tip are gone.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ProfileScreen from "../app/(tabs)/profile";
import {
  closeAccountSheet,
  openAccountSheet,
} from "@/components/AccountSwitcher";
import { businesses } from "@/fixtures";
import { getActiveBusinessId, resetActiveAccount } from "@/lib/activeAccount";
import { getMyProfile } from "@/lib/myProfile";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
  },
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
  act(() => {
    closeAccountSheet();
    resetActiveAccount();
  });
  mockPush.mockClear();
  jest.useRealTimers();
});

const me = () => getMyProfile().name;
const biz = businesses[0]!;

describe("Aktiv konto", () => {
  it("names the personal account and opens the sheet", () => {
    render(<ProfileScreen />, { wrapper });
    fireEvent.press(screen.getByLabelText(`Aktiv konto: ${me()}`));
    expect(screen.getByText("Bytt konto")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: `${me()}, Utforsker` }).props
        .accessibilityState,
    ).toMatchObject({ selected: true });
    expect(
      screen.getByRole("button", { name: `${biz.name}, Bedrift` }).props
        .accessibilityState,
    ).toMatchObject({ selected: false });
    // The old card and tip are gone.
    expect(screen.queryByText("Bytt til personlig")).toBeNull();
    expect(
      screen.queryByText("Hold inne Profil nederst for å bytte konto."),
    ).toBeNull();
  });

  it("picking the business switches and opens Arbeidsflate", () => {
    jest.useFakeTimers();
    render(<ProfileScreen />, { wrapper });
    fireEvent.press(screen.getByLabelText(`Aktiv konto: ${me()}`));
    fireEvent.press(
      screen.getByRole("button", { name: `${biz.name}, Bedrift` }),
    );
    expect(getActiveBusinessId()).toBe(biz.id);
    expect(screen.getByLabelText(`Aktiv konto: ${biz.name}`)).toBeTruthy();
    act(() => jest.advanceTimersByTime(300));
    expect(mockPush).toHaveBeenLastCalledWith("/workspace");
  });

  it("picking personal switches back and stays", () => {
    render(<ProfileScreen />, { wrapper });
    act(() => openAccountSheet());
    fireEvent.press(
      screen.getByRole("button", { name: `${biz.name}, Bedrift` }),
    );
    act(() => openAccountSheet());
    fireEvent.press(screen.getByRole("button", { name: `${me()}, Utforsker` }));
    expect(getActiveBusinessId()).toBeNull();
    expect(screen.getByLabelText(`Aktiv konto: ${me()}`)).toBeTruthy();
  });

  it("opens from outside (the tab's long press) and manages accounts", () => {
    jest.useFakeTimers();
    render(<ProfileScreen />, { wrapper });
    expect(screen.queryByText("Administrer kontoer")).toBeNull();
    act(() => openAccountSheet());
    fireEvent.press(screen.getByText("Administrer kontoer"));
    act(() => jest.advanceTimersByTime(300));
    expect(mockPush).toHaveBeenLastCalledWith("/settings/linked");
  });
});
