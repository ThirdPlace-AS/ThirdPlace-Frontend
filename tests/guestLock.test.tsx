// Founder 2026-11-19 Q1/Q2 (0504): guests browse only. Every account-only
// route shows the lock, a personal action on a readable page asks to sign
// in, and the sign-in sheet keeps the spot it was asked from.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentType } from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { setGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestGate } from "@/components/useGuestGate";
import {
  forgetSignInReturn,
  setCurrentRoute,
  takeSignInReturn,
} from "@/lib/signInReturn";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  usePathname: () => "/",
  useFocusEffect: () => {},
  Link: ({ children }: { children: unknown }) => children,
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
  forgetSignInReturn();
});

// Route module → its lock note.
const LOCKED: [string, () => { default: ComponentType }, string][] = [
  [
    "Legg til",
    () => require("../app/(tabs)/add"),
    "Logg inn for å legge til en opplevelse, en gruppe eller et sted.",
  ],
  [
    "review",
    () => require("../app/review/[kind]/[id]"),
    "Logg inn for å skrive en anmeldelse.",
  ],
  [
    "profile/edit",
    () => require("../app/profile/edit"),
    "Logg inn for å redigere profilen.",
  ],
  [
    "my-listings",
    () => require("../app/my-listings/index"),
    "Logg inn for å se listingene dine.",
  ],
  [
    "my-listings/new",
    () => require("../app/my-listings/new"),
    "Logg inn for å lage en listing.",
  ],
  [
    "my-listings/edit",
    () => require("../app/my-listings/[id]/edit"),
    "Logg inn for å redigere listingen.",
  ],
  [
    "my-listings/waitlist",
    () => require("../app/my-listings/[id]/waitlist"),
    "Logg inn for å se ventelisten.",
  ],
  [
    "chat/new",
    () => require("../app/chat/new"),
    "Logg inn for å starte en chat.",
  ],
  [
    "chat/invite",
    () => require("../app/chat/[id]/invite"),
    "Logg inn for å invitere folk.",
  ],
  [
    "chat/archived",
    () => require("../app/chat/archived"),
    "Logg inn for å se chattene dine.",
  ],
  [
    "payouts",
    () => require("../app/payouts"),
    "Logg inn for å se utbetalingene.",
  ],
  [
    "submissions",
    () => require("../app/submissions"),
    "Logg inn for å se innleveringene.",
  ],
  [
    "collab/payment-status",
    () => require("../app/collab/payment-status"),
    "Logg inn for å se betalingsstatusen.",
  ],
  [
    "collab/history",
    () => require("../app/collab/history"),
    "Logg inn for å se samarbeidene dine.",
  ],
  ["invite", () => require("../app/invite"), "Logg inn for å invitere venner."],
  [
    "invite-contacts",
    () => require("../app/invite-contacts"),
    "Logg inn for å invitere kontakter.",
  ],
  [
    "import",
    () => require("../app/import"),
    "Logg inn for å importere innhold.",
  ],
  [
    "group-swipe",
    () => require("../app/group-swipe"),
    "Logg inn for å sveipe sammen med venner.",
  ],
  [
    "become-creator",
    () => require("../app/become-creator"),
    "Logg inn for å bli Skaper.",
  ],
  [
    "creator-welcome",
    () => require("../app/creator-welcome"),
    "Logg inn for å fortsette som Skaper.",
  ],
  [
    "marketplace/analytics",
    () => require("../app/marketplace/analytics"),
    "Logg inn for å se analysen.",
  ],
  [
    "settings/account",
    () => require("../app/settings/account"),
    "Logg inn for å se kontoen din.",
  ],
  [
    "settings/blocked",
    () => require("../app/settings/blocked"),
    "Logg inn for å se hvem du har blokkert.",
  ],
  [
    "settings/delete",
    () => require("../app/settings/delete"),
    "Logg inn for å slette kontoen.",
  ],
  [
    "settings/linked",
    () => require("../app/settings/linked"),
    "Logg inn for å se koblede kontoer.",
  ],
  [
    "settings/notifications",
    () => require("../app/settings/notifications"),
    "Logg inn for å endre varslene.",
  ],
  [
    "settings/password",
    () => require("../app/settings/password"),
    "Logg inn for å endre passordet.",
  ],
  [
    "settings/preferences",
    () => require("../app/settings/preferences"),
    "Logg inn for å endre preferansene.",
  ],
  [
    "settings/privacy-check",
    () => require("../app/settings/privacy-check"),
    "Logg inn for å gå gjennom personvernet.",
  ],
  [
    "age-verification",
    () => require("../app/age-verification"),
    "Logg inn for å bekrefte alderen.",
  ],
  [
    "two-factor",
    () => require("../app/two-factor"),
    "Logg inn for å slå på totrinnsbekreftelse.",
  ],
  [
    "account-switch",
    () => require("../app/account-switch"),
    "Logg inn for å bytte konto.",
  ],
];

describe("account-only routes (0504)", () => {
  it.each(LOCKED)("%s shows a guest the lock", (_name, load, note) => {
    setGuestMode(true);
    const Route = load().default;
    render(<Route />, { wrapper });
    expect(screen.getByText(note)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Logg inn" })).toBeTruthy();
  });
});

function Gated({ onAct }: { onAct: () => void }) {
  const { gate, prompt } = useGuestGate();
  return (
    <>
      <Pressable accessibilityRole="button" onPress={gate("rapportere", onAct)}>
        <Text>Rapporter</Text>
      </Pressable>
      {prompt}
    </>
  );
}

describe("useGuestGate", () => {
  it("a guest gets the sign-in sheet, not the action", () => {
    setGuestMode(true);
    const onAct = jest.fn();
    render(<Gated onAct={onAct} />, { wrapper });
    fireEvent.press(screen.getByText("Rapporter"));
    expect(onAct).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "Du må ha en konto for å rapportere. Utforsking er åpent for alle.",
      ),
    ).toBeTruthy();
  });

  it("a signed-in user acts at once", () => {
    const onAct = jest.fn();
    render(<Gated onAct={onAct} />, { wrapper });
    fireEvent.press(screen.getByText("Rapporter"));
    expect(onAct).toHaveBeenCalledTimes(1);
  });
});

describe("SignInPrompt keeps the spot", () => {
  it("Logg inn remembers the screen in front", () => {
    setGuestMode(true);
    setCurrentRoute("/place/p1", { id: "p1" });
    render(<SignInPrompt visible onClose={() => {}} action="lagre" />, {
      wrapper,
    });
    fireEvent.press(screen.getByRole("button", { name: "Logg inn" }));
    expect(takeSignInReturn()).toBe("/place/p1");
  });
});
