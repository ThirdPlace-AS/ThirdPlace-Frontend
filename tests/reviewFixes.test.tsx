// Review 2026-11-18 Top 25 fixes: the new shared pieces (whenLabel, Input
// types, Varsler prefs, GuestPage, closed group chat, published listings,
// 48 dp targets).
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { GuestPage } from "@/components/GuestPage";
import { GroupContent } from "@/components/map/content/GroupContent";
import { setGuestMode } from "@/components/map/hooks/useGuestMode";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Button, IconButton, Input, LINK_SLOP } from "@/components/ui";
import {
  OWNED_BUSINESS_IDS,
  businesses,
  chatById,
  experiences,
  groupById,
  isCatalogueId,
  listingById,
  listings,
  myListingStates,
  sessionsFor,
} from "@/fixtures";
import { createListing, resetCreated, updateListing } from "@/fixtures/created";
import { resetJoinedChats } from "@/lib/joinedChats";
import {
  DEFAULT_NOTIFICATION_PREFS,
  pushSummary,
  resetNotificationPrefs,
  setNotificationPref,
  useNotificationPrefs,
} from "@/lib/notificationPrefs";
import { whenLabel } from "@/lib/whenLabel";
import {
  getActiveBusinessId,
  resetActiveAccount,
  switchToBusiness,
  switchToPersonal,
} from "@/lib/activeAccount";
import { ownExperiences } from "@/features/workspace/ownExperiences";
import {
  AccountScreen,
  LinkedAccountsScreen,
} from "@/features/settings/SettingsPages";
import { resetSignupProgress, setSignupEmail } from "@/lib/signupProgress";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
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

afterEach(() => {
  setGuestMode(false);
  resetNotificationPrefs();
  resetJoinedChats();
  resetCreated();
  resetActiveAccount();
  resetSignupProgress();
});

describe("whenLabel (JR1)", () => {
  const now = new Date(2026, 10, 18, 8, 0);
  it("says I dag / I morgen like the page, a weekday this week", () => {
    let today = 0;
    let week = 0;
    for (const e of experiences) {
      const start = sessionsFor(e, now, 1)[0]?.start;
      if (!start) continue;
      const label = whenLabel(e, now);
      const days = Math.floor(
        (new Date(start).setHours(0, 0, 0, 0) -
          new Date(now).setHours(0, 0, 0, 0)) /
          86_400_000,
      );
      if (days === 0) {
        today += 1;
        expect(label).toMatch(/^I dag \d\d[:.]\d\d$/);
      } else if (days === 1) {
        expect(label).toMatch(/^I morgen \d\d[:.]\d\d$/);
      } else if (days >= 2 && days <= 5) {
        week += 1;
        expect(label).toMatch(/^(Søn|Man|Tir|Ons|Tor|Fre|Lør) \d\d[:.]\d\d$/);
      }
    }
    expect(today).toBeGreaterThan(0);
    expect(week).toBeGreaterThan(0);
  });
});

describe("Input type (CMP-11, O9)", () => {
  it("an e-mail field has the e-mail keyboard and no capital or autocorrect", () => {
    render(<Input label="E-post" placeholder="e" type="email" />);
    const field = screen.getByPlaceholderText("e");
    expect(field.props.keyboardType).toBe("email-address");
    expect(field.props.autoCapitalize).toBe("none");
    expect(field.props.autoCorrect).toBe(false);
    expect(field.props.autoComplete).toBe("email");
  });

  it("a url field has the url keyboard; an explicit prop wins", () => {
    render(
      <Input label="Lenke" placeholder="u" type="url" keyboardType="default" />,
    );
    const field = screen.getByPlaceholderText("u");
    expect(field.props.keyboardType).toBe("default");
    expect(field.props.autoCapitalize).toBe("none");
  });

  it("a plain field keeps the defaults", () => {
    render(<Input label="Navn" placeholder="n" />);
    const field = screen.getByPlaceholderText("n");
    expect(field.props.keyboardType).toBeUndefined();
    expect(field.props.autoCorrect).toBeUndefined();
  });
});

describe("Varsler prefs (IJ4)", () => {
  function Probe() {
    const prefs = useNotificationPrefs();
    return <Text>{`Chat ${prefs.Chat} · ${pushSummary(prefs)}`}</Text>;
  }

  it("keeps a switch until logout brings back the defaults", () => {
    render(<Probe />);
    expect(screen.getByText("Chat true · På")).toBeTruthy();
    act(() => {
      for (const k of ["Opplevelser", "Venteliste", "Venner", "Chat"])
        setNotificationPref(k, false);
    });
    expect(screen.getByText("Chat false · Av")).toBeTruthy();
    act(() => resetNotificationPrefs());
    expect(screen.getByText("Chat true · På")).toBeTruthy();
    expect(DEFAULT_NOTIFICATION_PREFS.Anbefalinger).toBe(false);
  });
});

describe("GuestPage (IJ2, IJ22)", () => {
  it("a guest sees the lock and Logg inn, never the page", () => {
    setGuestMode(true);
    render(
      <GuestPage
        title="Planer"
        message="Logg inn for å se planene dine."
        action="se planene dine"
      >
        <Text>Mine planer</Text>
      </GuestPage>,
      { wrapper },
    );
    expect(screen.queryByText("Mine planer")).toBeNull();
    expect(screen.getByText("Logg inn for å se planene dine.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Logg inn" })).toBeTruthy();
  });

  it("a signed-in user sees the page", () => {
    render(
      <GuestPage title="Planer" message="Lås" action="se planene dine">
        <Text>Mine planer</Text>
      </GuestPage>,
      { wrapper },
    );
    expect(screen.getByText("Mine planer")).toBeTruthy();
  });
});

describe("closed group chat (C4)", () => {
  it("a Lukket group's chat shows only to its members", () => {
    const g = groupById("g3")!;
    expect(chatById(g.chatId!)!.access).not.toBe("open");
    render(<GroupContent id="g3" />, { wrapper });
    expect(screen.queryByText("Samtalen")).toBeNull();
    fireEvent.press(screen.getByText("Bli medlem"));
    expect(screen.getByText("Samtalen")).toBeTruthy();
  });

  it("a guest sees no group chat, even an open one", () => {
    const open = ["g1", "g2"].find(
      (id) => chatById(groupById(id)!.chatId!)?.access === "open",
    );
    if (!open) return;
    setGuestMode(true);
    render(<GroupContent id={open} />, { wrapper });
    expect(screen.queryByText("Samtalen")).toBeNull();
  });
});

describe("published listings (H-04)", () => {
  it("Publiser adds an owned, active listing; logout takes it away", () => {
    const before = listings.length;
    const id = createListing({
      title: "  Sykkel til utlån ",
      type: listings[0]!.type,
      about: "Grønn bysykkel.",
    });
    expect(listings.length).toBe(before + 1);
    expect(listingById(id)!.title).toBe("Sykkel til utlån");
    expect(myListingStates[id]).toBeDefined();
    updateListing(id, {
      title: "Sykkel",
      type: listings[0]!.type,
      about: "Rød.",
    });
    expect(listingById(id)!.title).toBe("Sykkel");
    resetCreated();
    expect(listings.length).toBe(before);
    expect(listingById(id)).toBeUndefined();
  });
});

describe("48 dp targets (CMP-04)", () => {
  it("a small IconButton reaches 48 through its slop", () => {
    render(<IconButton icon="close" label="Lukk" size="sm" />);
    const slop = screen.getByLabelText("Lukk").props.hitSlop;
    const v = typeof slop === "number" ? slop : slop?.top;
    expect(36 + 2 * v).toBeGreaterThanOrEqual(48);
  });

  it("a small Button reaches 48 through its slop", () => {
    render(<Button label="Velg" size="sm" />);
    const slop = screen.getByRole("button", { name: "Velg" }).props.hitSlop;
    const v = typeof slop === "number" ? slop : slop?.top;
    expect(40 + 2 * v).toBeGreaterThanOrEqual(48);
  });

  it("a caption text link reaches 48 through LINK_SLOP", () => {
    // A caption line is about 16 px; the slop carries it to 48.
    expect(16 + LINK_SLOP.top + LINK_SLOP.bottom).toBeGreaterThanOrEqual(48);
    render(<ReviewsSection reviews={[]} onShowAll={() => {}} />);
    const link = screen.getByRole("link");
    expect(link.props.hitSlop).toEqual(LINK_SLOP);
  });
});

describe("active account (G-Q8)", () => {
  it("starts personal, switches to a business and back", () => {
    expect(getActiveBusinessId()).toBeNull();
    switchToBusiness("b1");
    expect(getActiveBusinessId()).toBe("b1");
    switchToPersonal();
    expect(getActiveBusinessId()).toBeNull();
  });

  it("Koblede kontoer marks the active account", () => {
    const { rerender } = render(<LinkedAccountsScreen />, { wrapper });
    expect(screen.getByText("Utforsker · aktiv nå")).toBeTruthy();
    act(() => switchToBusiness(businesses[0]!.id));
    rerender(<LinkedAccountsScreen />);
    expect(screen.getByText("Bedrift · aktiv nå")).toBeTruthy();
    expect(screen.queryByText("Utforsker · aktiv nå")).toBeNull();
  });
});

describe("own experiences at own places (#18)", () => {
  it("lists only experiences at, or organised by, an owned place", () => {
    const places = new Set(
      businesses
        .filter((b) => OWNED_BUSINESS_IDS.includes(b.id))
        .map((b) => b.placeId),
    );
    const own = ownExperiences();
    expect(own.length).toBeGreaterThan(0);
    for (const e of own) {
      expect(
        places.has(e.placeId ?? "") || places.has(e.organizerPlaceId ?? ""),
      ).toBe(true);
    }
    // Other hosts' legacy experiences elsewhere are no longer counted.
    const legacy = experiences.filter((e) => !isCatalogueId(e.id));
    expect(own.length).toBeLessThan(legacy.length);
  });
});

describe("Kontoinformasjon e-mail (O6)", () => {
  it("shows the address typed at sign-up", () => {
    setSignupEmail("ny@epost.no");
    render(<AccountScreen />, { wrapper });
    expect(screen.getByDisplayValue("ny@epost.no")).toBeTruthy();
  });
});
