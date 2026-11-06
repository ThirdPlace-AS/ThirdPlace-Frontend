// Phase 11 G5: the experience page follows the reference video's layout, but
// the founder required that every ThirdPlace-specific item stays (2026-11-06):
// status pill, when, påmeldt, host, about, tags, Lagre / Del / Rapporter,
// Se deltakere, Gruppe, Sjekk inn, Administrer (vert) and the join card.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ExperiencePage } from "@/components/experience/ExperiencePage";
import {
  areaFor,
  experienceCaption,
  hostPerson,
  moreExperiences,
} from "@/components/experience/experienceMeta";
import { ExperienceJoinBar } from "@/components/map/content/ExperienceJoinBar";
import { experienceById, placeById } from "@/fixtures";

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

describe("ExperiencePage", () => {
  it("keeps every ThirdPlace-specific item", () => {
    render(
      <ExperiencePage
        exp={e1}
        onOpen={jest.fn()}
        onOpenExperience={jest.fn()}
        onNavigate={jest.fn()}
      />,
      { wrapper },
    );
    for (const text of [
      e1.title,
      e1.about,
      "Åpen",
      e1.when,
      "Lagre",
      "Del",
      "Rapporter",
      "Se deltakere",
      "Morgenkaffe-gjengen",
      "Sjekk inn (GPS)",
      "Administrer (vert)",
      "Flere opplevelser i området",
      "Om verten",
      ...e1.tags,
    ]) {
      expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText(/påmeldt/).length).toBeGreaterThan(0);
    expect(screen.getByText(/^Vert: /)).toBeTruthy();
  });

  it("opens sub-views through onOpen", () => {
    const onOpen = jest.fn();
    render(
      <ExperiencePage
        exp={e1}
        onOpen={onOpen}
        onOpenExperience={jest.fn()}
        onNavigate={jest.fn()}
      />,
      { wrapper },
    );
    fireEvent.press(screen.getByRole("button", { name: /Se deltakere/ }));
    expect(onOpen).toHaveBeenCalledWith({ kind: "attendees", id: "e1" });
    fireEvent.press(screen.getByText("Administrer (vert)"));
    expect(onOpen).toHaveBeenCalledWith({ kind: "host", id: "e1" });
  });

  it("the join card shows price and the join action", () => {
    render(<ExperienceJoinBar id="e1" />, { wrapper });
    expect(screen.getByText("Gratis")).toBeTruthy();
    expect(screen.getByText("Bli med")).toBeTruthy();
  });
});

describe("experienceMeta", () => {
  it("finds the host by id link, not by name", () => {
    expect(hostPerson(e1)?.hostsExperienceId).toBe("e1");
    expect(hostPerson({ id: "nope" })).toBeUndefined();
  });

  it("captions with the first tag and the nearest area", () => {
    const place = placeById(e1.placeId)!;
    expect(experienceCaption(e1)).toBe(
      `${e1.tags[0]} · ${areaFor(place.coord)}`,
    );
    expect(areaFor([10.758, 59.9227])).toBe("Grünerløkka");
  });

  it("suggests other, non-cancelled experiences", () => {
    const more = moreExperiences(e1);
    expect(more.some((e) => e.id === e1.id)).toBe(false);
    expect(more.every((e) => e.status !== "cancelled")).toBe(true);
  });
});
