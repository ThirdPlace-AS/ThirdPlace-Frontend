// Phase 12 H4: the experience page follows the founder's reference video and
// shows every fact once (founder 2026-11-06): rating line under the
// description, icon rows for host / where / duration + language / what's
// included / latest review / participants, a Vurderinger section, and no
// duplicated "when"/"påmeldt"/Lagre-Del-Rapporter row.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
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
import { ExperienceJoinBar } from "@/components/map/content/ExperienceJoinBar";
import { experienceById, ratingOf, reviewsForExperience } from "@/fixtures";
import { formatRating } from "@/lib/format";

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
      onOpenExperience={jest.fn()}
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
    expect(hostPerson(e1)?.hostsExperienceId).toBe("e1");
    expect(hostPerson({ id: "nope" })).toBeUndefined();
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
