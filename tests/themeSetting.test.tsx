// Innstillinger → Utseende (user request 2026-11-24): follow the phone, or
// keep the app light or dark. The choice is the scheme store's preference,
// which the theme root, status bar and native colours already read; the
// device settings keep it (tests/deviceSettings.test.ts).
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import SettingsScreen from "@/features/settings/SettingsScreen";
import {
  getSchemePreference,
  restoreSchemePreference,
  useScheme,
} from "@/theme/scheme";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
    canDismiss: () => false,
    dismissAll: jest.fn(),
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
  act(() => restoreSchemePreference(undefined));
});

describe("Utseende", () => {
  it("shows the current choice on its row, System by default", () => {
    render(<SettingsScreen />, { wrapper });
    expect(screen.getByText("Utseende")).toBeTruthy();
    expect(screen.getByText("System")).toBeTruthy();
  });

  it("picks Lys, Mørk or System from a short sheet", () => {
    const scheme = renderHook(() => useScheme());
    render(<SettingsScreen />, { wrapper });
    fireEvent.press(screen.getByText("Utseende"));

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(
      screen.getByRole("radio", { name: "System" }).props.accessibilityState,
    ).toMatchObject({ checked: true });

    fireEvent.press(screen.getByRole("radio", { name: "Mørk" }));
    expect(getSchemePreference()).toBe("dark");
    expect(scheme.result.current).toBe("dark");
    expect(
      screen.getByRole("radio", { name: "Mørk" }).props.accessibilityState,
    ).toMatchObject({ checked: true });

    fireEvent.press(screen.getByRole("radio", { name: "Lys" }));
    expect(getSchemePreference()).toBe("light");
    expect(scheme.result.current).toBe("light");

    fireEvent.press(screen.getByRole("radio", { name: "System" }));
    expect(getSchemePreference()).toBe("system");
  });

  it("names the choice on the row once picked", () => {
    act(() => restoreSchemePreference("dark"));
    render(<SettingsScreen />, { wrapper });
    expect(screen.getByText("Mørk")).toBeTruthy();
  });

  it("search finds the options and opens the sheet", () => {
    render(<SettingsScreen />, { wrapper });
    fireEvent.changeText(screen.getByLabelText("Søk i innstillinger"), "mørk");
    fireEvent.press(screen.getByText("Mørk"));
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });
});
