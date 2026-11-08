// Phase 18 (screen benchmark, "Profile and settings"): "Fullfør profilen" on
// Profil, "Forhåndsvis" on Rediger profil, and "Forkaste endringene?" before
// a page with unsaved changes is left.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useNavigation, usePreventRemove } from "expo-router/react-navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ProfileScreen from "../app/(tabs)/profile";
import EditProfileScreen from "@/features/profile/EditProfileScreen";
import {
  getMyProfile,
  profileDraftChanged,
  resetMyProfile,
  updateMyProfile,
} from "@/lib/myProfile";
import { openProfileSteps } from "@/lib/profileSteps";

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

const preventRemove = jest.mocked(usePreventRemove);
const dispatch = jest.mocked(
  (useNavigation as () => { dispatch: (a: unknown) => void })().dispatch,
);
/** The guard's latest arguments: is leaving blocked, and its callback. */
const guard = () => {
  const last = preventRemove.mock.calls.at(-1);
  if (!last) throw new Error("usePreventRemove was not called");
  return { blocked: last[0], tryLeave: last[1] };
};
const BACK = { type: "GO_BACK" } as const;

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
  preventRemove.mockClear();
  dispatch.mockClear();
});
afterEach(() => {
  act(() => resetMyProfile());
  jest.useRealTimers();
});

describe("Fullfør profilen", () => {
  it("lists the empty Rediger profil fields, none when all are filled", () => {
    expect(openProfileSteps(getMyProfile())).toEqual([]);
    const open = openProfileSteps({
      ...getMyProfile(),
      avatar: null,
      bio: "  ",
    });
    expect(open.map((s) => s.label)).toEqual([
      "Legg til et profilbilde",
      "Skriv litt om deg selv",
    ]);
  });

  it("shows on Profil while a step is open and opens Rediger profil", () => {
    render(<ProfileScreen />, { wrapper });
    expect(screen.queryByText("Fullfør profilen")).toBeNull();
    act(() => updateMyProfile({ avatar: null }));
    expect(screen.getByText("Fullfør profilen")).toBeTruthy();
    expect(screen.getByText("3 av 4 er på plass")).toBeTruthy();
    fireEvent.press(screen.getByText("Legg til et profilbilde"));
    expect(mockPush).toHaveBeenCalledWith("/profile/edit");
    // "Vis meg som deltaker" is a privacy choice, never a step.
    expect(screen.queryByText(/Vis meg som deltaker/)).toBeNull();
  });
});

describe("Rediger profil", () => {
  it("compares interests by content", () => {
    const me = getMyProfile();
    const draft = { ...me, interests: [...me.interests].reverse() };
    expect(profileDraftChanged(me, draft)).toBe(false);
    expect(profileDraftChanged(me, { ...me, bio: "Ny bio" })).toBe(true);
  });

  it("Forhåndsvis shows the unsaved draft as others see it", () => {
    render(<EditProfileScreen />, { wrapper });
    fireEvent.changeText(screen.getByDisplayValue("Ola Nordmann"), "Ola N.");
    fireEvent.press(screen.getByLabelText("Forhåndsvis"));
    expect(screen.getByText("Slik ser andre profilen din.")).toBeTruthy();
    expect(screen.getByText("Ola N.")).toBeTruthy();
    expect(screen.getByText("Offentlige opplevelser")).toBeTruthy();
    // Nothing was saved, and there is no Følg / Melding on your own page.
    expect(getMyProfile().name).toBe("Ola Nordmann");
    expect(screen.queryByText("Melding")).toBeNull();
  });

  it("asks before leaving with changes, and leaves on Forkast", () => {
    jest.useFakeTimers();
    render(<EditProfileScreen />, { wrapper });
    expect(guard().blocked).toBe(false);
    fireEvent.changeText(screen.getByDisplayValue("Ola Nordmann"), "Ola N.");
    expect(guard().blocked).toBe(true);
    act(() => guard().tryLeave({ data: { action: BACK } }));
    expect(screen.getByText("Forkaste endringene?")).toBeTruthy();
    fireEvent.press(screen.getByText("Forkast"));
    act(() => jest.advanceTimersByTime(300));
    expect(dispatch).toHaveBeenCalledWith(BACK);
    expect(getMyProfile().name).toBe("Ola Nordmann");
  });

  it("stays on Fortsett å redigere; Lagre leaves without asking", () => {
    render(<EditProfileScreen />, { wrapper });
    fireEvent.changeText(screen.getByDisplayValue("Ola Nordmann"), "Ola N.");
    act(() => guard().tryLeave({ data: { action: BACK } }));
    fireEvent.press(screen.getByText("Fortsett å redigere"));
    expect(dispatch).not.toHaveBeenCalled();
    fireEvent.press(screen.getByText("Lagre"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    // The back from Lagre reaches the guard before the next render: it goes.
    act(() => guard().tryLeave({ data: { action: BACK } }));
    expect(dispatch).toHaveBeenCalledWith(BACK);
    expect(getMyProfile().name).toBe("Ola N.");
  });
});
