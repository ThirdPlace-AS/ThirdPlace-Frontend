// Phase 18 (screen benchmark, "Profile and settings"): "Fullfør profilen" on
// Profil, "Forhåndsvis" on Rediger profil, and "Forkaste endringene?" before
// a page with unsaved changes is left. Review PR-06 (0524): «Kom i gang»
// comes first, and replaces the "Veien til Skaper" card.
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
import { useNavigation, usePreventRemove } from "expo-router/react-navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ProfileScreen from "../app/(tabs)/profile";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { groupById } from "@/fixtures";
import EditProfileScreen from "@/features/profile/EditProfileScreen";
import {
  getMyProfile,
  profileDraftChanged,
  resetMyProfile,
  updateMyProfile,
} from "@/lib/myProfile";
import {
  joinGroup,
  leaveGroup,
  resetGroupMembership,
} from "@/lib/groupMembership";
import { openProfileSteps } from "@/lib/profileSteps";
import { starterSteps, suggestedGroupId } from "@/lib/starterSteps";

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
  act(() => {
    resetMyProfile();
    resetGroupMembership();
  });
  clearSaved();
  jest.useRealTimers();
});

/** Saves through the one saved store the map, pages and Lagret share. */
function save(id: string) {
  const { result } = renderHook(() => useMapSaved());
  act(() => result.current.toggle(id));
}
function clearSaved() {
  const { result } = renderHook(() => useMapSaved());
  for (const id of [...result.current.savedIds]) {
    act(() => result.current.toggle(id));
  }
}
/** Every «Kom i gang» step done: a place saved, in a group, a photo. */
function finishStarter() {
  save("place:p1");
  const id = suggestedGroupId(getMyProfile().interests);
  if (!id) throw new Error("no group to join");
  act(() => joinGroup(id));
}

describe("Kom i gang", () => {
  it("marks each step done from what the app holds", () => {
    const base = {
      savedIds: [] as string[],
      inGroup: false,
      avatar: null,
      interests: [] as string[],
    };
    expect(starterSteps(base).map((s) => [s.label, s.done])).toEqual([
      ["Lagre et sted", false],
      ["Bli med i en gruppe", false],
      ["Legg til et profilbilde", false],
    ]);
    // A saved experience is not a saved place.
    expect(
      starterSteps({ ...base, savedIds: ["experience:e1"] })[0]?.done,
    ).toBe(false);
    const all = starterSteps({
      ...base,
      savedIds: ["place:p1"],
      inGroup: true,
      avatar: getMyProfile().avatar,
    });
    expect(all.every((s) => s.done)).toBe(true);
  });

  it("suggests a group that shares an interest, never your own", () => {
    const id = suggestedGroupId(getMyProfile().interests);
    const group = id ? groupById(id) : undefined;
    expect(group).toBeDefined();
    expect(group?.mine).not.toBe(true);
  });

  it("shows on Profil first, opens each step, and gives way when done", () => {
    render(<ProfileScreen />, { wrapper });
    // The Skaper criteria card is gone (founder 2026-11-19 #15).
    expect(screen.queryByText("Veien til Skaper")).toBeNull();
    // The demo account has a photo, nothing saved and no group yet.
    expect(screen.getByText("Kom i gang")).toBeTruthy();
    expect(screen.getByText("1 av 3 er på plass")).toBeTruthy();
    expect(screen.queryByText("Legg til et profilbilde")).toBeNull();
    fireEvent.press(screen.getByText("Lagre et sted"));
    expect(mockPush).toHaveBeenCalledWith("/map");
    fireEvent.press(screen.getByText("Bli med i en gruppe"));
    expect(mockPush).toHaveBeenCalledWith(
      `/group/${suggestedGroupId(getMyProfile().interests)}`,
    );
    // One checklist at a time: an empty field waits for «Kom i gang».
    act(() => updateMyProfile({ bio: "" }));
    expect(screen.queryByText("Fullfør profilen")).toBeNull();
    // renderHook (in finishStarter) takes over `screen`: keep Profil's.
    const profil = screen;
    finishStarter();
    expect(profil.queryByText("Kom i gang")).toBeNull();
    expect(profil.getByText("Fullfør profilen")).toBeTruthy();
  });

  it("opens again when the only group is left", () => {
    finishStarter();
    render(<ProfileScreen />, { wrapper });
    expect(screen.queryByText("Kom i gang")).toBeNull();
    const id = suggestedGroupId(getMyProfile().interests) ?? "";
    act(() => leaveGroup(id));
    expect(screen.getByText("Kom i gang")).toBeTruthy();
    expect(screen.getByText("2 av 3 er på plass")).toBeTruthy();
  });
});

describe("Fullfør profilen", () => {
  it("lists the empty Rediger profil fields, none when all are filled", () => {
    expect(openProfileSteps(getMyProfile())).toEqual([]);
    const open = openProfileSteps({
      ...getMyProfile(),
      // The photo is a «Kom i gang» step since PR-06, not one of these.
      avatar: null,
      bio: "  ",
      languages: "",
    });
    expect(open.map((s) => s.label)).toEqual([
      "Skriv litt om deg selv",
      "Skriv hvilke språk du snakker",
    ]);
  });

  it("shows on Profil while a step is open and opens Rediger profil", () => {
    finishStarter();
    render(<ProfileScreen />, { wrapper });
    expect(screen.queryByText("Fullfør profilen")).toBeNull();
    act(() => updateMyProfile({ bio: "" }));
    expect(screen.getByText("Fullfør profilen")).toBeTruthy();
    expect(screen.getByText("2 av 3 er på plass")).toBeTruthy();
    fireEvent.press(screen.getByText("Skriv litt om deg selv"));
    expect(mockPush).toHaveBeenCalledWith("/profile/edit");
    // "Vis meg som deltaker" is a privacy choice, never a step.
    expect(screen.queryByText(/Vis meg som deltaker/)).toBeNull();
  });
});

describe("Rediger profil", () => {
  // Since P9 the interests can be dragged into a new order, which is saved,
  // so a new order is a change (an equal copy is not).
  it("compares interests by content and order", () => {
    const me = getMyProfile();
    expect(
      profileDraftChanged(me, { ...me, interests: [...me.interests] }),
    ).toBe(false);
    const draft = { ...me, interests: [...me.interests].reverse() };
    expect(me.interests.length).toBeGreaterThan(1);
    expect(profileDraftChanged(me, draft)).toBe(true);
    expect(profileDraftChanged(me, { ...me, bio: "Ny bio" })).toBe(true);
  });

  it("Forhåndsvis shows the unsaved draft as others see it", () => {
    render(<EditProfileScreen />, { wrapper });
    fireEvent.changeText(screen.getByDisplayValue("Ola Nordmann"), "Ola N.");
    fireEvent.press(screen.getByLabelText("Forhåndsvis"));
    expect(screen.getByText("Slik ser andre profilen din.")).toBeTruthy();
    expect(screen.getByText("Ola N.")).toBeTruthy();
    expect(screen.getByText("Arrangerer")).toBeTruthy();
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
