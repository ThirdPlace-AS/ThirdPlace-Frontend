// Phase 13 J2: Preferanser (PDF p13) and Rediger profil per PDF p13 write
// shared in-memory stores, and onboarding answers carry into them.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Onboarding from "../app/onboarding";
import EditProfileScreen from "@/features/profile/EditProfileScreen";
import PreferencesScreen from "@/features/settings/PreferencesScreen";
import { getMyProfile, resetMyProfile } from "@/lib/myProfile";
import {
  getPreferences,
  PREFERENCE_ROWS,
  resetPreferences,
  setPreferences,
} from "@/lib/preferences";
import { resetSignupProgress } from "@/lib/signupProgress";

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
afterEach(() => {
  act(() => {
    resetPreferences();
    resetMyProfile();
    resetSignupProgress();
  });
});

describe("preferences store", () => {
  it("drops empty choices and resets", () => {
    setPreferences({ "Sosial komfort": "Middels", Alkohol: "" });
    expect(getPreferences()).toEqual({ "Sosial komfort": "Middels" });
    resetPreferences();
    expect(getPreferences()).toEqual({});
  });

  it("Preferanser rows follow PDF p13", () => {
    expect(PREFERENCE_ROWS.map((r) => r.label)).toEqual([
      "Sosial komfort",
      "Forbruksstil",
      "Energinivå",
      "Gruppestørrelse",
      "Alkohol",
    ]);
  });
});

describe("Preferanser page", () => {
  it("shows every row, saves the choice and goes back", () => {
    render(<PreferencesScreen />, { wrapper });
    for (const r of PREFERENCE_ROWS)
      expect(screen.getAllByText(r.label).length).toBeGreaterThan(0);
    fireEvent.press(screen.getByText("Middels"));
    fireEvent.press(screen.getByText("2–4"));
    fireEvent.press(screen.getByText("Lagre"));
    expect(getPreferences()).toEqual({
      "Sosial komfort": "Middels",
      Gruppestørrelse: "2–4",
    });
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("makes no claim about recommendations or scores", () => {
    render(<PreferencesScreen />, { wrapper });
    expect(screen.queryByText(/anbefaling/i)).toBeNull();
    expect(screen.queryByText(/[Ss]core/)).toBeNull();
  });

  it("a second tap clears a row", () => {
    render(<PreferencesScreen />, { wrapper });
    fireEvent.press(screen.getByText("Rolig"));
    fireEvent.press(screen.getByText("Rolig"));
    fireEvent.press(screen.getByText("Lagre"));
    expect(getPreferences()).toEqual({});
  });
});

describe("Rediger profil", () => {
  it("saves name, interests and photo to the shared profile", () => {
    render(<EditProfileScreen />, { wrapper });
    fireEvent.changeText(screen.getByDisplayValue("Ola Nordmann"), "Sara Berg");
    fireEvent.press(screen.getByText("+ Legg til"));
    fireEvent.press(screen.getByText("Yoga"));
    fireEvent.press(screen.getByText("Ferdig"));
    fireEvent.press(screen.getByLabelText("Bytt bilde"));
    fireEvent.press(screen.getByText("Fjern bildet"));
    fireEvent.press(screen.getByText("Lagre"));
    const me = getMyProfile();
    expect(me.name).toBe("Sara Berg");
    expect(me.interests).toContain("Yoga");
    expect(me.avatar).toBeNull();
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("Lagre needs a name", () => {
    render(<EditProfileScreen />, { wrapper });
    fireEvent.changeText(screen.getByDisplayValue("Ola Nordmann"), "  ");
    fireEvent.press(screen.getByText("Lagre"));
    expect(mockBack).not.toHaveBeenCalled();
    expect(getMyProfile().name).toBe("Ola Nordmann");
  });
});

describe("onboarding answers carry over", () => {
  it("name, interests and preferences reach the profile and Preferanser", () => {
    render(<Onboarding />, { wrapper });
    const next = () => fireEvent.press(screen.getByText("Fortsett"));
    next(); // role
    fireEvent.changeText(
      screen.getByPlaceholderText("Fornavn Etternavn"),
      "Kari Nordmann",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("dd.mm.åååå"),
      "12.05.1990",
    );
    next(); // Dette er deg
    next(); // Hvem er du?
    next(); // Hva ser du etter?
    for (const i of ["Kaffe", "Jazz", "Løping", "Fotografi", "Keramikk"])
      fireEvent.press(screen.getByText(i));
    next(); // Hva liker du?
    fireEvent.press(screen.getByText("Stor"));
    next(); // Dine preferanser
    fireEvent.press(screen.getByText("Gi tillatelser"));
    fireEvent.press(screen.getByText("Utforsk byen din"));
    expect(getMyProfile().name).toBe("Kari Nordmann");
    expect(getMyProfile().interests).toEqual([
      "Kaffe",
      "Jazz",
      "Løping",
      "Fotografi",
      "Keramikk",
    ]);
    expect(getMyProfile().avatar).toBeNull();
    expect(getPreferences()).toEqual({ "Sosial komfort": "Stor" });
    expect(mockPush).toHaveBeenLastCalledWith("/register");
  });
});
