// Phase 18 (screen benchmark, "Profile and settings"): search in
// Innstillinger, Personvern grouped by question, and the Personvernsjekk walk
// over the same switches.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { AboutScreen } from "@/features/settings/AboutScreens";
import PreferencesScreen from "@/features/settings/PreferencesScreen";
import PrivacyCheckScreen from "@/features/settings/PrivacyCheckScreen";
import PrivacyScreen from "@/features/settings/PrivacyScreen";
import {
  AccessibilitySettingsScreen,
  AccountScreen,
  HelpScreen,
  LanguageScreen,
  NotificationSettingsScreen,
} from "@/features/settings/SettingsPages";
import SettingsScreen from "@/features/settings/SettingsScreen";
import { PAGE_ROWS, searchSettings } from "@/features/settings/settingsIndex";
import { setShowMeAsAttendee } from "@/lib/going";
import {
  DEFAULT_PRIVACY_PREFS,
  getPrivacyPrefs,
  resetPrivacyPrefs,
  setPrivacyPref,
} from "@/lib/privacyPrefs";
import { signOut } from "@/lib/signOut";

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: () => mockBack(),
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
    canDismiss: () => false,
    dismissAll: jest.fn(),
  },
  useLocalSearchParams: () => ({}),
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

const search = (text: string) =>
  fireEvent.changeText(screen.getByLabelText("Søk i innstillinger"), text);
const checked = (label: string) => {
  const sw = screen.getByRole("switch", { name: label });
  return sw.props.accessibilityState?.checked ?? sw.props.value;
};

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
});
afterEach(() => {
  act(() => {
    resetPrivacyPrefs();
    setShowMeAsAttendee(false);
  });
});

describe("settings search", () => {
  it("finds a row on a page and opens that page", () => {
    render(<SettingsScreen />, { wrapper });
    search("større");
    expect(screen.getByText("Større tekst")).toBeTruthy();
    expect(screen.getByText("Tilgjengelighet")).toBeTruthy();
    expect(screen.queryByText("Logg ut")).toBeNull();
    fireEvent.press(screen.getByText("Større tekst"));
    expect(mockPush).toHaveBeenCalledWith("/settings/accessibility");
  });

  it("finds Innstillinger's own rows and says when nothing matches", () => {
    render(<SettingsScreen />, { wrapper });
    search("varsler");
    fireEvent.press(screen.getByText("Varsler"));
    expect(mockPush).toHaveBeenCalledWith("/settings/notifications");
    search("xyz");
    expect(
      screen.getByText("Fant ingen innstillinger for «xyz»."),
    ).toBeTruthy();
    search("");
    expect(screen.getByText("Logg ut")).toBeTruthy();
  });

  it("a result keeps the row's sign-in gate for guests", () => {
    const g = renderHook(() => useGuestMode());
    act(() => g.result.current.setGuest(true));
    try {
      render(<SettingsScreen />, { wrapper });
      search("passord");
      fireEvent.press(screen.getByText("Passord"));
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText(/for å se kontoinformasjon/)).toBeTruthy();
    } finally {
      act(() => g.result.current.setGuest(false));
    }
  });

  it("every label it searches is on its page, word for word", () => {
    const pages: Record<keyof typeof PAGE_ROWS, () => React.JSX.Element> = {
      Kontoinformasjon: () => <AccountScreen />,
      Preferanser: () => <PreferencesScreen />,
      Varsler: () => <NotificationSettingsScreen />,
      Personvern: () => <PrivacyScreen />,
      "Språk og region": () => <LanguageScreen />,
      Tilgjengelighet: () => <AccessibilitySettingsScreen />,
      "Hjelp og støtte": () => <HelpScreen />,
      "Om ThirdPlace": () => <AboutScreen />,
    };
    const missing: string[] = [];
    for (const [page, labels] of Object.entries(PAGE_ROWS)) {
      render(pages[page as keyof typeof PAGE_ROWS](), { wrapper });
      for (const label of labels) {
        if (screen.queryAllByText(label).length === 0) {
          missing.push(`${page}: ${label}`);
        }
      }
      screen.unmount();
    }
    expect(missing).toEqual([]);
  });

  it("matches without case and lists where each hit is", () => {
    const hits = searchSettings(
      [
        {
          title: "App",
          rows: [{ label: "Personvern", inside: ["Datadeling"] }],
        },
      ],
      "  DATA ",
    );
    expect(hits.map((h) => [h.title, h.where])).toEqual([
      ["Datadeling", "Personvern"],
    ]);
  });
});

describe("Personvern grouped by question", () => {
  it("has the groups, with Blokkerte brukere under who can contact you", () => {
    render(<PrivacyScreen />, { wrapper });
    for (const title of [
      "Hvem kan se deg",
      "Hvem kan finne og kontakte deg",
      "Datadeling",
      "Data",
    ]) {
      expect(screen.getByText(title)).toBeTruthy();
    }
    expect(screen.getByText("Blokkerte brukere")).toBeTruthy();
    fireEvent.press(screen.getByText("Personvernsjekk"));
    expect(mockPush).toHaveBeenCalledWith("/settings/privacy-check");
  });

  it("guests are asked to sign in before the check", () => {
    const g = renderHook(() => useGuestMode());
    act(() => g.result.current.setGuest(true));
    try {
      render(<PrivacyScreen />, { wrapper });
      fireEvent.press(screen.getByText("Personvernsjekk"));
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText(/for å gå gjennom personvernet/)).toBeTruthy();
    } finally {
      act(() => g.result.current.setGuest(false));
    }
  });
});

describe("Personvernsjekk", () => {
  it("walks the same switches as Personvern, one group at a time", () => {
    render(<PrivacyCheckScreen />, { wrapper });
    expect(screen.getByText("1 av 3")).toBeTruthy();
    expect(screen.getByText("Hvem kan se deg")).toBeTruthy();
    fireEvent(
      screen.getByRole("switch", { name: "Synlig på kartet" }),
      "valueChange",
      false,
    );
    expect(getPrivacyPrefs().mapVisible).toBe(false);
    fireEvent.press(screen.getByText("Neste"));
    expect(screen.getByText("Hvem kan finne og kontakte deg")).toBeTruthy();
    expect(
      screen.getByRole("switch", { name: "Vis i Utforsk folk" }),
    ).toBeTruthy();
    fireEvent.press(screen.getByText("Neste"));
    expect(screen.getByText("Hva du deler")).toBeTruthy();
    fireEvent(
      screen.getByRole("switch", { name: "Analytiske data" }),
      "valueChange",
      true,
    );
    fireEvent.press(screen.getByText("Forrige"));
    expect(screen.getByText("2 av 3")).toBeTruthy();
    fireEvent.press(screen.getByText("Neste"));
    fireEvent.press(screen.getByText("Ferdig"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    screen.unmount();
    // Personvern shows what the walk chose.
    render(<PrivacyScreen />, { wrapper });
    expect(checked("Synlig på kartet")).toBe(false);
    expect(checked("Analytiske data")).toBe(true);
  });

  it("logout brings back the switches as drawn", () => {
    act(() => setPrivacyPref("analytics", true));
    act(() => signOut());
    expect(getPrivacyPrefs()).toEqual(DEFAULT_PRIVACY_PREFS);
  });
});
