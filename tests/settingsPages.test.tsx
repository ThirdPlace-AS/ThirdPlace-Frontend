// Phase 12 H4c: settings sub-screens, privacy data screens and Rediger
// profil are pages; Eksporter data is one shared sheet with no delivery rule.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import EditProfileScreen from "@/features/profile/EditProfileScreen";
import { ExportSheet } from "@/features/settings/ExportSheet";
import PrivacyScreen from "@/features/settings/PrivacyScreen";
import {
  BlockedUsersScreen,
  DeleteAccountScreen,
} from "@/features/settings/SettingsPages";
import SettingsScreen from "@/features/settings/SettingsScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: () => mockBack(),
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

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
});

describe("settings pages", () => {
  it("rows open their pages", () => {
    render(<SettingsScreen />, { wrapper });
    for (const [label, href] of [
      ["Kontoinformasjon", "/settings/account"],
      ["Koblede kontoer", "/settings/linked"],
      ["Varsler", "/settings/notifications"],
      ["Språk og region", "/settings/language"],
      ["Tilgjengelighet", "/settings/accessibility"],
      ["Hjelp og støtte", "/settings/help"],
    ] as const) {
      fireEvent.press(screen.getByText(label));
      expect(mockPush).toHaveBeenLastCalledWith(href);
    }
  });

  it("guests are asked to sign in before account pages", () => {
    const g = renderHook(() => useGuestMode());
    act(() => g.result.current.setGuest(true));
    try {
      render(<SettingsScreen />, { wrapper });
      fireEvent.press(screen.getByText("Kontoinformasjon"));
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText(/for å se kontoinformasjon/)).toBeTruthy();
    } finally {
      act(() => g.result.current.setGuest(false));
    }
  });

  it("privacy opens blocked users and delete account as pages", () => {
    render(<PrivacyScreen />, { wrapper });
    fireEvent.press(screen.getByText("Blokkerte brukere"));
    expect(mockPush).toHaveBeenLastCalledWith("/settings/blocked");
    fireEvent.press(screen.getByText("Slett konto"));
    expect(mockPush).toHaveBeenLastCalledWith("/settings/delete");
  });

  it("export is one sheet without a delivery rule", () => {
    render(<ExportSheet visible onClose={jest.fn()} />, { wrapper });
    expect(screen.getByText("Be om eksport")).toBeTruthy();
    expect(screen.queryByText(/e-post/)).toBeNull();
  });

  it("delete needs «SLETT» before it goes back", () => {
    render(<DeleteAccountScreen />, { wrapper });
    fireEvent.press(screen.getByText("Slett kontoen min"));
    expect(mockBack).not.toHaveBeenCalled();
    fireEvent.changeText(
      screen.getByLabelText("Skriv «SLETT» for å bekrefte"),
      "SLETT",
    );
    fireEvent.press(screen.getByText("Slett kontoen min"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("unblock flips locally", () => {
    render(<BlockedUsersScreen />, { wrapper });
    fireEvent.press(screen.getByLabelText("Avblokkér SpamKonto42"));
    expect(screen.getByLabelText("Blokker SpamKonto42 igjen")).toBeTruthy();
  });

  it("Rediger profil saves and goes back", () => {
    render(<EditProfileScreen />, { wrapper });
    fireEvent.press(screen.getByText("Lagre"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
