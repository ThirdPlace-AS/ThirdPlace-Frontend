// Phase 18 (screen benchmark, "Feature info"): "Nytt i ThirdPlace" once
// after an app update, never on a first install, at most one hint per
// session, and only for a signed-in person.
import AsyncStorage from "@react-native-async-storage/async-storage";
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

import { WhatsNewOnFocus } from "@/components/WhatsNewSheet";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { WHATS_NEW } from "@/copy/whatsNew";
import {
  DEVICE_SETTINGS_KEY,
  hydrateDeviceSettings,
  resetDeviceSettings,
} from "@/lib/deviceSettings";
import { claimHint, resetHintSession, restoreHints } from "@/lib/hints";
import {
  claimWhatsNew,
  getWhatsNewSeen,
  markWhatsNewSeen,
  restoreWhatsNew,
} from "@/lib/whatsNew";

let mockVersion: string | undefined = "1.2.0";
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return { version: mockVersion };
    },
  },
}));
jest.mock("expo-router", () => {
  const { useEffect } = jest.requireActual<typeof import("react")>("react");
  return {
    // Focus = mount here (no navigator under Jest).
    useFocusEffect: (run: () => void) => useEffect(run, [run]),
  };
});

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

const savedVersion = async () =>
  (
    JSON.parse((await AsyncStorage.getItem(DEVICE_SETTINGS_KEY)) ?? "{}") as {
      whatsNew?: unknown;
    }
  ).whatsNew;

beforeEach(async () => {
  resetDeviceSettings();
  await AsyncStorage.clear();
  restoreHints(undefined);
  restoreWhatsNew(undefined);
  resetHintSession();
  mockVersion = "1.2.0";
});
afterEach(() => {
  resetDeviceSettings();
});

describe("Nytt i ThirdPlace", () => {
  it("a first install records its version and shows nothing", async () => {
    await hydrateDeviceSettings();
    expect(getWhatsNewSeen()).toBe("1.2.0");
    expect(claimWhatsNew("1.2.0")).toBe(false);
    await new Promise((r) => setTimeout(r, 0));
    expect(await savedVersion()).toBe("1.2.0");
  });

  it("shows once after an update, then remembers the new version", async () => {
    await AsyncStorage.setItem(
      DEVICE_SETTINGS_KEY,
      JSON.stringify({ whatsNew: "1.1.0" }),
    );
    await hydrateDeviceSettings();
    expect(claimWhatsNew("1.2.0")).toBe(true);
    markWhatsNewSeen("1.2.0");
    resetHintSession();
    expect(claimWhatsNew("1.2.0")).toBe(false);
    await new Promise((r) => setTimeout(r, 0));
    expect(await savedVersion()).toBe("1.2.0");
  });

  it("waits when another hint has had the session", () => {
    restoreWhatsNew("1.1.0");
    expect(claimHint("chatLongPress")).toBe(true);
    expect(claimWhatsNew("1.2.0")).toBe(false);
    resetHintSession();
    expect(claimWhatsNew("1.2.0")).toBe(true);
    // An unknown version never shows.
    resetHintSession();
    expect(claimWhatsNew(null)).toBe(false);
  });

  it("opens on the map for a signed-in person; Fortsett records it", () => {
    restoreWhatsNew("1.1.0");
    render(<WhatsNewOnFocus />, { wrapper });
    expect(screen.getByText(WHATS_NEW.title)).toBeTruthy();
    for (const item of WHATS_NEW.items) {
      expect(screen.getByText(item.title)).toBeTruthy();
    }
    fireEvent.press(screen.getByText(WHATS_NEW.done));
    expect(getWhatsNewSeen()).toBe("1.2.0");
  });

  it("not for guests", () => {
    restoreWhatsNew("1.1.0");
    const g = renderHook(() => useGuestMode());
    act(() => g.result.current.setGuest(true));
    try {
      render(<WhatsNewOnFocus />, { wrapper });
      expect(screen.queryByText(WHATS_NEW.title)).toBeNull();
      expect(getWhatsNewSeen()).toBe("1.1.0");
    } finally {
      act(() => g.result.current.setGuest(false));
    }
  });
});
