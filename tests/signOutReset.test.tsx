// What Logg ut resets, and what it leaves (P6 zustand: "reset-on-logout
// behaves as before"). Written before the stores moved to zustand, so the
// move is checked against today's behaviour.
import { afterAll, beforeEach, expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import {
  isHostedByMe,
  resetCreated,
  submitPlace,
  submittedPlaces,
} from "@/fixtures/created";
import { experiences } from "@/fixtures";
import { blockPerson, resetBlocked, useBlocked } from "@/lib/blocked";
import { getChatReads, markChatRead, resetChatReads } from "@/lib/chatReads";
import {
  answerOffer,
  getCollabDeal,
  resetCollabDeal,
  signContract,
} from "@/lib/collabDeal";
import { getMyProfile, resetMyProfile, updateMyProfile } from "@/lib/myProfile";
import { resetMyRatings, saveMyRating, useMyRatings } from "@/lib/myRatings";
import { getOrigin, resetOrigin, setOriginArea } from "@/lib/origin";
import {
  resetPinnedChats,
  togglePinnedChat,
  usePinnedChats,
} from "@/lib/pinnedChats";
import {
  getPreferences,
  resetPreferences,
  setPreferences,
} from "@/lib/preferences";
import {
  DEFAULT_PRIVACY_PREFS,
  getPrivacyPrefs,
  resetPrivacyPrefs,
  setPrivacyPref,
} from "@/lib/privacyPrefs";
import { signOut } from "@/lib/signOut";
import {
  getSignupProgress,
  markAccountCreated,
  markOnboarded,
  resetSignupProgress,
} from "@/lib/signupProgress";

const mockResetTo = jest.fn();
jest.mock("@/lib/navigation", () => ({
  resetTo: (href: string) => mockResetTo(href),
}));

function resetAll() {
  resetSignupProgress();
  resetMyProfile();
  resetPreferences();
  resetBlocked();
  resetPrivacyPrefs();
  resetPinnedChats();
  resetMyRatings();
  resetCollabDeal();
  resetChatReads();
  resetOrigin();
}

beforeEach(() => {
  mockResetTo.mockClear();
  resetAll();
});
afterAll(resetAll);

test("Logg ut resets the account stores and goes to /welcome", () => {
  const blocked = renderHook(() => useBlocked());
  const pinned = renderHook(() => usePinnedChats());
  const ratings = renderHook(() => useMyRatings());
  const seedBlocked = blocked.result.current;
  const profile = getMyProfile();
  const prefs = getPreferences();

  act(() => {
    markOnboarded();
    markAccountCreated();
    updateMyProfile({ name: "Endret Navn" });
    setPreferences({ ...prefs, Tempo: "Rolig" });
    blockPerson("ny-person", "Ny Person");
    setPrivacyPref("mapVisible", !DEFAULT_PRIVACY_PREFS.mapVisible);
    togglePinnedChat("c1");
    saveMyRating("e1", { stars: 4, liked: [] });
  });

  expect(getSignupProgress()).toEqual({
    onboarded: true,
    accountCreated: true,
  });
  expect(getMyProfile().name).toBe("Endret Navn");
  expect(blocked.result.current).not.toEqual(seedBlocked);
  expect(pinned.result.current).toEqual(["c1"]);
  expect(Object.keys(ratings.result.current)).toEqual(["e1"]);

  act(() => signOut());

  expect(getSignupProgress()).toEqual({
    onboarded: false,
    accountCreated: false,
  });
  expect(getMyProfile()).toEqual(profile);
  expect(getPreferences()).toEqual(prefs);
  expect(blocked.result.current).toEqual(seedBlocked);
  expect(getPrivacyPrefs()).toEqual(DEFAULT_PRIVACY_PREFS);
  expect(pinned.result.current).toEqual([]);
  expect(ratings.result.current).toEqual({});
  expect(mockResetTo).toHaveBeenCalledWith("/welcome");
});

test("Logg ut clears the collab deal (review 2026-11-18 #9)", () => {
  act(() => {
    answerOffer("Godtatt");
    signContract("Ola Nordmann");
  });
  expect(getCollabDeal().signedBy).toBe("Ola Nordmann");
  act(() => signOut());
  expect(getCollabDeal()).toEqual({
    answer: null,
    counterSplit: null,
    signedBy: null,
  });
});

test("Logg ut forgets what the account sent in (0464)", () => {
  // The next account must not own the last one's places or experiences.
  act(() => submitPlace("Bakgården", "Kampen"));
  expect(submittedPlaces()).toHaveLength(1);
  act(() => signOut());
  expect(submittedPlaces()).toEqual([]);
  expect(experiences.some((e) => isHostedByMe(e.id))).toBe(false);
  resetCreated();
});

test("Logg ut leaves the stores it never reset: saved, chat reads, origin", () => {
  const saved = renderHook(() => useMapSaved());
  act(() => {
    if (!saved.result.current.isSaved("m-signout")) {
      saved.result.current.toggle("m-signout");
    }
    markChatRead("c1");
    setOriginArea([10.7, 59.9]);
  });

  act(() => signOut());

  expect(saved.result.current.isSaved("m-signout")).toBe(true);
  expect(getChatReads().has("c1")).toBe(true);
  expect(getOrigin()).toEqual({ coord: [10.7, 59.9], source: "area" });

  act(() => saved.result.current.toggle("m-signout"));
});
