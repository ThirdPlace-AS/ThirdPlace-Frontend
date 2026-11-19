// Phase 16 (founder 2026-11-07, opt-in per person): who's going shows a
// face only for people who chose "Vis meg som deltaker" (the viewer too, once
// joined and opted in); "N skal" counts everyone.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AttendeesContent } from "@/components/map/content/AttendeesContent";
import { ExperienceJoinBar } from "@/components/map/content/ExperienceJoinBar";
import { resetExperienceJoins } from "@/components/map/hooks/useExperienceJoin";
import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import { experienceToDeckItem } from "@/components/swipe/deckItems";
import PrivacyScreen from "@/features/settings/PrivacyScreen";
import {
  attendeesForExperience,
  experienceById,
  experiences,
  places,
} from "@/fixtures";
import { GoingLine } from "@/components/GoingLine";
import {
  goingFor,
  goingLabel,
  goingLine,
  MAX_FACES,
  setShowMeAsAttendee,
} from "@/lib/going";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: () => true },
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
  act(() => {
    setShowMeAsAttendee(false);
    resetExperienceJoins();
  });
});

describe("goingFor", () => {
  it("faces only for people who opted in; the count is everyone", () => {
    for (const e of experiences) {
      const all = attendeesForExperience(e.id);
      const g = goingFor(e.id);
      expect(g.count).toBe(e.going);
      expect(g.count).toBe(all.length);
      const shownNames = all.filter((a) => a.shown).map((a) => a.name);
      expect(g.faces.length).toBe(Math.min(MAX_FACES, shownNames.length));
      for (const f of g.faces) expect(shownNames).toContain(f.name);
    }
  });

  it("the viewer counts once joined, and shows only after opting in", () => {
    const e1 = experienceById("e1")!;
    const joined = goingFor("e1", { joined: true, showMe: false });
    expect(joined.count).toBe(e1.going + 1);
    expect(joined.faces.some((f) => f.key === "me")).toBe(false);
    const shown = goingFor("e1", { joined: true, showMe: true });
    expect(shown.faces[0]?.key).toBe("me");
    expect(goingFor("e1", { joined: false, showMe: true }).faces).toEqual(
      goingFor("e1").faces,
    );
  });

  it("cards read 'N skal' (Sveip, browse)", () => {
    const e1 = experienceById("e1")!;
    const line = experienceToDeckItem(e1).lines[2]!;
    expect(line.text.startsWith(goingLabel(e1.going))).toBe(true);
    expect(line.goingId).toBe("e1");
    const item = resultForMode({
      mode: "explore",
      places,
      query: "",
      savedIds: [],
    }).items.find((i) => i.kind === "experience" && i.id === "e1")!;
    expect(item.meta?.startsWith(goingLabel(e1.going))).toBe(true);
  });

  it("the card line follows your join, like the page", () => {
    const e1 = experienceById("e1")!;
    render(
      <>
        <GoingLine id="e1" />
        <ExperienceJoinBar id="e1" />
      </>,
      { wrapper },
    );
    expect(
      screen.getByText(goingLine({ capacity: e1.capacity, going: e1.going })),
    ).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Bli med"));
    expect(
      screen.getByText(
        goingLine({ capacity: e1.capacity, going: e1.going + 1 }),
      ),
    ).toBeTruthy();
  });
});

describe("Se deltakere", () => {
  it("names the host and the people who opted in, then counts the rest", () => {
    const all = attendeesForExperience("e1");
    const named = all.filter((a) => a.isHost || a.shown);
    render(<AttendeesContent id="e1" />, { wrapper });
    for (const a of named) expect(screen.getByText(a.name)).toBeTruthy();
    for (const a of all.filter((x) => !x.isHost && !x.shown))
      expect(screen.queryByText(a.name)).toBeNull();
    const others = all.length - named.length;
    if (others > 0)
      expect(
        screen.getByText(`og ${others} ${others === 1 ? "annen" : "andre"}`),
      ).toBeTruthy();
  });

  it("once you join you count; you are named only if you opted in", () => {
    const all = attendeesForExperience("e1");
    const named = all.filter((a) => a.isHost || a.shown).length;
    render(
      <>
        <ExperienceJoinBar id="e1" />
        <AttendeesContent id="e1" />
      </>,
      { wrapper },
    );
    fireEvent.press(screen.getByLabelText("Bli med"));
    const total = all.length + 1;
    expect(screen.getAllByText(new RegExp(goingLabel(total))).length).toBe(2);
    expect(screen.queryByText("Du")).toBeNull();
    expect(screen.getByText(`og ${total - named} andre`)).toBeTruthy();
    act(() => setShowMeAsAttendee(true));
    expect(screen.getByText("Du")).toBeTruthy();
    expect(screen.getByText(`og ${total - named - 1} andre`)).toBeTruthy();
  });

  it("the host's own list names everyone", () => {
    render(<AttendeesContent id="e1" everyone />, { wrapper });
    for (const a of attendeesForExperience("e1"))
      expect(screen.getByText(a.name)).toBeTruthy();
  });
});

describe("join card and Personvern", () => {
  it("the join card counts the viewer once joined", () => {
    const e1 = experienceById("e1")!;
    render(<ExperienceJoinBar id="e1" />, { wrapper });
    expect(screen.getByText(goingLabel(e1.going))).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Bli med"));
    expect(screen.getByText(goingLabel(e1.going + 1))).toBeTruthy();
  });

  it("Vis meg som deltaker is off until chosen", () => {
    render(<PrivacyScreen />, { wrapper });
    const toggle = screen.getByLabelText("Vis meg som deltaker");
    expect(toggle.props.accessibilityState?.checked ?? toggle.props.value).toBe(
      false,
    );
    fireEvent(toggle, "valueChange", true);
    expect(goingFor("e1", { joined: true, showMe: true }).faces[0]?.key).toBe(
      "me",
    );
  });
});
