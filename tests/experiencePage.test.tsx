// Phase 12 H4: the experience page follows the founder's reference video and
// shows every fact once (founder 2026-11-06): rating line under the
// description, icon rows for host / where / duration + language / what's
// included / latest review / participants, a Vurderinger section, and no
// duplicated "when"/"påmeldt"/Lagre-Del-Rapporter row.
import { describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  durationLabel,
  ExperiencePage,
  experienceChips,
  includedLabel,
  languageLabel,
} from "@/components/experience/ExperiencePage";
import {
  areaFor,
  experienceCaption,
  hostPerson,
  moreExperiences,
} from "@/components/experience/experienceMeta";
import {
  ChatSection,
  MeetingSection,
  thingsToKnow,
} from "@/components/experience/ExperienceSections";
import {
  resetExperienceSessions,
  useExperienceSession,
} from "@/components/experience/useExperienceSession";
import { ExperienceJoinBar } from "@/components/map/content/ExperienceJoinBar";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import {
  chatForExperience,
  experienceById,
  experiencesHostedBy,
  placeById,
  ratingOf,
  reviewsForExperience,
  sessionsFor,
} from "@/fixtures";
import { shortSessionLabel } from "@/lib/dates";
import { formatRating } from "@/lib/format";
import { resetJoinedChats } from "@/lib/joinedChats";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

const e1 = experienceById("e1")!;

function renderPage(
  over: Partial<React.ComponentProps<typeof ExperiencePage>> = {},
) {
  return render(
    <ExperiencePage
      exp={e1}
      onOpen={jest.fn()}
      onNavigate={jest.fn()}
      {...over}
    />,
    { wrapper },
  );
}

describe("ExperiencePage", () => {
  it("shows what the creator entered, each once", () => {
    renderPage();
    const reviews = reviewsForExperience("e1");
    const { score, count } = ratingOf(reviews);
    for (const text of [
      e1.title,
      e1.about,
      formatRating(score),
      `${count} vurderinger`,
      durationLabel(e1),
      languageLabel(e1),
      "Hva er inkludert",
      includedLabel(e1),
      "Siste anmeldelse",
      `${e1.going} av ${e1.capacity} plasser tatt`,
      "Se deltakere",
      "Morgenkaffe-gjengen",
      "Vis alle vurderinger",
      "Slik fungerer vurderinger",
      "Flere opplevelser i området",
      "Om verten",
      "Sjekk inn når du er der",
      "Administrer (vert)",
      "Rapporter opplevelsen",
      ...experienceChips(e1),
    ]) {
      expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(/^Vert: /)).toBeTruthy();
    // Section title "★ 4,7 · 3 vurderinger".
    expect(
      screen.getByText(`★ ${formatRating(score)} · ${count} vurderinger`),
    ).toBeTruthy();
  });

  it("does not repeat facts the old page showed twice", () => {
    renderPage();
    // When lives in Tilgjengelighet / the join card, not in a status line.
    expect(screen.queryByText(e1.when)).toBeNull();
    expect(screen.queryByText(/påmeldt/)).toBeNull();
    expect(screen.queryByText("Åpen")).toBeNull();
    // Lagre / Del moved to the sheet header and top bar.
    expect(screen.queryByText("Lagre")).toBeNull();
    expect(screen.queryByText("Del")).toBeNull();
    // Each chip once, even when a tag is also a vibe.
    const chips = experienceChips(e1);
    expect(new Set(chips.map((c) => c.toLowerCase())).size).toBe(chips.length);
  });

  it("opens sub-views and pages", () => {
    const onOpen = jest.fn();
    const onNavigate = jest.fn();
    renderPage({ onOpen, onNavigate });
    fireEvent.press(screen.getByRole("button", { name: /Se deltakere/ }));
    expect(onOpen).toHaveBeenCalledWith({ kind: "attendees", id: "e1" });
    fireEvent.press(screen.getByText("Administrer (vert)"));
    expect(onOpen).toHaveBeenCalledWith({ kind: "host", id: "e1" });
    fireEvent.press(screen.getByText("Vis alle vurderinger"));
    expect(onNavigate).toHaveBeenCalledWith("/experience/e1/reviews");
  });

  it("whole places, groups and other experiences open as pages", () => {
    const onOpen = jest.fn();
    const onNavigate = jest.fn();
    renderPage({ onOpen, onNavigate });
    const place = placeById(e1.placeId)!;
    fireEvent.press(screen.getByText(place.name));
    expect(onNavigate).toHaveBeenCalledWith(`/place/${place.id}`);
    const other = moreExperiences(e1)[0]!;
    fireEvent.press(
      screen.getByRole("button", { name: `${other.title}, ${other.category}` }),
    );
    expect(onNavigate).toHaveBeenCalledWith(`/experience/${other.id}`);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("the join card shows price and the join action", () => {
    render(<ExperienceJoinBar id="e1" />, { wrapper });
    expect(screen.getByText("Gratis")).toBeTruthy();
    expect(screen.getByText("Bli med")).toBeTruthy();
  });
});

describe("labels", () => {
  it("duration and language read as in the reference", () => {
    expect(durationLabel({ duration: "1 time" })).toBe("Ca. 1 time");
    expect(durationLabel({ duration: "Hele dagen" })).toBe("Hele dagen");
    expect(languageLabel({ languages: ["Norsk"] })).toBe("Holdes på norsk");
    expect(languageLabel({ languages: ["Norsk", "Engelsk"] })).toBe(
      "Holdes på norsk og engelsk",
    );
  });
});

describe("experienceMeta", () => {
  it("finds the host by id link, not by name", () => {
    // Phase 19: the experience names its host (`hostId`); a person can
    // host several.
    expect(hostPerson(e1)?.id).toBe("u1");
    expect(experiencesHostedBy("u1").map((e) => e.id)).toContain("e1");
    expect(hostPerson({ hostId: "nope" })).toBeUndefined();
    expect(hostPerson({})).toBeUndefined();
  });

  it("captions with the category and the meeting point's area", () => {
    expect(experienceCaption(e1)).toBe(
      `${e1.category} · ${areaFor(e1.meetingPoint.coord)}`,
    );
    expect(areaFor([10.758, 59.9227])).toBe("Grünerløkka");
  });

  it("suggests other, non-cancelled experiences", () => {
    const more = moreExperiences(e1);
    expect(more.some((e) => e.id === e1.id)).toBe(false);
    expect(more.every((e) => e.status !== "cancelled")).toBe(true);
  });
});

describe("ExperiencePage sections (H4b)", () => {
  it("has every section of the reference, each once", () => {
    renderPage();
    for (const text of [
      "Hva dere skal gjøre",
      ...e1.itinerary.map((s) => s.title),
      "Ledige tider",
      "Se alle tider",
      "Tilgjengelighet",
      "Hvor vi møtes",
      e1.meetingPoint.name,
      e1.meetingPoint.address,
      "Har du spørsmål?",
      "Samtalen",
      "Ting å vite",
      "Krav til deltakere",
      "Aktivitetsnivå",
      "Avbestilling",
    ]) {
      expect(screen.getAllByText(text)).toHaveLength(1);
    }
  });

  it("things to know come from the creator's choices and the 18+ rule", () => {
    const items = thingsToKnow(e1);
    const krav = items.find((k) => k.key === "krav")!;
    expect(krav.summary).toContain("Fra 18 år");
    const cancel = items.find((k) => k.key === "avbestilling")!;
    expect(cancel.summary).toBe(e1.cancellation);
    expect(cancel.detail[0]?.text).toContain("Verten har valgt");
    const e4 = experienceById("e4")!;
    const a11y = thingsToKnow(e4).find((k) => k.key === "tilgjengelighet")!;
    expect(a11y.summary).toBe("Utendørs møtested");
  });

  it("the join card follows the picked time", () => {
    const now = new Date();
    const later = sessionsFor(e1, now, 8)[2]!;
    const { result } = renderHook(() => useExperienceSession("e1"));
    act(() => result.current[1](later.id));
    render(<ExperienceJoinBar id="e1" />, { wrapper });
    expect(
      screen.getByText(new RegExp(shortSessionLabel(later.start, now))),
    ).toBeTruthy();
    act(() => resetExperienceSessions());
  });

  it("Samtalen joins the experience's chat and opens it", () => {
    const chat = chatForExperience("e2")!;
    expect(chat.member).toBe(false);
    const onNavigate = jest.fn();
    render(
      <ChatSection chat={chatForExperience("e2")} onNavigate={onNavigate} />,
      { wrapper },
    );
    fireEvent.press(screen.getByText("Bli med i samtalen"));
    expect(onNavigate).toHaveBeenCalledWith(`/chat/${chat.id}`);
    expect(screen.getByText("Åpne samtalen")).toBeTruthy();
    act(() => resetJoinedChats());
  });

  it("guests are asked to sign in before joining or messaging the host", () => {
    const guest = renderHook(() => useGuestMode());
    act(() => guest.result.current.setGuest(true));
    try {
      const onNavigate = jest.fn();
      render(
        <ChatSection chat={chatForExperience("e2")} onNavigate={onNavigate} />,
        { wrapper },
      );
      fireEvent.press(screen.getByText("Bli med i samtalen"));
      expect(onNavigate).not.toHaveBeenCalled();
      expect(screen.getByText(/for å bli med i samtalen/)).toBeTruthy();

      render(
        <MeetingSection
          exp={e1}
          hostName="Maria Movik"
          onShowOnMap={jest.fn()}
        />,
        { wrapper },
      );
      fireEvent.press(screen.getByText("Har du spørsmål?"));
      expect(screen.getByText(/for å sende melding til verten/)).toBeTruthy();
      expect(screen.queryByText("Spør Maria")).toBeNull();
    } finally {
      act(() => guest.result.current.setGuest(false));
    }
  });

  it("the ask-host message needs 20 characters before Send", () => {
    render(
      <MeetingSection
        exp={e1}
        hostName="Maria Movik"
        onShowOnMap={jest.fn()}
      />,
      { wrapper },
    );
    fireEvent.press(screen.getByText("Har du spørsmål?"));
    expect(screen.getByText("Spør Maria")).toBeTruthy();
    expect(screen.getByText("0/20 tegn")).toBeTruthy();
    // The pill also reads "Send melding"; the sheet's button comes last.
    const send = () => screen.getAllByText("Send melding").at(-1)!;
    const field = screen.getByPlaceholderText(
      "Si kort hvem du er og hva du lurer på.",
    );
    fireEvent.changeText(field, "Hei");
    // Too short: Send does nothing (a send would clear the text).
    fireEvent.press(send());
    expect(screen.getByText("3/20 tegn")).toBeTruthy();
    fireEvent.changeText(field, "Kan jeg ta med hunden?");
    expect(screen.getByText("20/20 tegn")).toBeTruthy();
    fireEvent.press(send());
    expect(screen.queryByText("20/20 tegn")).toBeNull();
  });
});
