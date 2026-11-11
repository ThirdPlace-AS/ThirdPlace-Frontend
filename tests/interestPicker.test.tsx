// Phase 19 S5 (founder 2026-11-08): one interest picker for onboarding's
// "Hva liker du?", Rediger profil and the Gruppe wizard, over the whole
// catalogue: the design's 22 first, then the other 62 under the eight
// category headings, with a search that knows older names. A new group keeps
// its interests; people's interests use the catalogue's names.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  InterestPicker,
  interestSections,
} from "@/components/pickers/InterestPicker";
import { groupById, people, profile } from "@/fixtures";
import { INTERESTS, interestForLabel } from "@/fixtures/catalog/interests";
import { createGroup, resetCreated } from "@/fixtures/created";
import { INTEREST_OPTIONS } from "@/lib/preferences";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

afterEach(() => act(() => resetCreated()));

describe("the sections", () => {
  const sections = interestSections("");

  it("start with the design's 22, in the design's order", () => {
    expect(sections[0]!.title).toBe("Forslag");
    expect(sections[0]!.items.map((i) => i.label)).toEqual([
      ...INTEREST_OPTIONS,
    ]);
  });

  it("then hold the other interests under the eight categories, once each", () => {
    expect(sections.slice(1).map((s) => s.title)).toEqual([
      "Kafé",
      "Mat og drikke",
      "Sosialt og spill",
      "Natur og tur",
      "Trening",
      "Bøker og kultur",
      "Kreativt og verksted",
      "Velvære",
    ]);
    const ids = sections.flatMap((s) => s.items.map((i) => i.id));
    expect(ids).toHaveLength(INTERESTS.length);
    expect(new Set(ids).size).toBe(INTERESTS.length);
  });

  it("search names and older names, and says when nothing fits", () => {
    expect(interestSections("bøker")).toEqual([
      { title: "Treff", items: [interestForLabel("Litteratur")] },
    ]);
    expect(interestSections("klatr")[0]!.items.map((i) => i.label)).toEqual([
      "Klatring",
    ]);
    expect(interestSections("xyz")).toEqual([]);
  });
});

describe("the picker", () => {
  it("shows the headings, filters on search and reports a pick", () => {
    const onToggle = jest.fn();
    render(<InterestPicker value={["Kaffe"]} onToggle={onToggle} />, {
      wrapper,
    });
    expect(screen.getByText("Forslag")).toBeTruthy();
    expect(screen.getByText("Trening")).toBeTruthy();
    expect(
      screen.getByRole("checkbox", { name: "Kaffe" }).props.accessibilityState,
    ).toMatchObject({ checked: true });
    fireEvent.changeText(
      screen.getByPlaceholderText("Søk etter en interesse"),
      "jazz",
    );
    expect(screen.getByText("Treff")).toBeTruthy();
    expect(screen.queryByText("Forslag")).toBeNull();
    fireEvent.press(screen.getByRole("checkbox", { name: "Jazz" }));
    expect(onToggle).toHaveBeenCalledWith("Jazz");
    fireEvent.changeText(
      screen.getByPlaceholderText("Søk etter en interesse"),
      "xyz",
    );
    expect(screen.getByText("Ingen interesser passer «xyz».")).toBeTruthy();
  });
});

describe("a new group", () => {
  it("keeps its interests as catalogue ids, the first as its interest", () => {
    const { groupId } = createGroup({
      name: "Buldring etter jobb",
      about: "",
      interests: ["Klatring", "Bøker", "Klatring", "Noe annet"],
      area: "Lillestrøm",
      photos: ["group-coffee", "venue-cafe"],
      access: "open",
    });
    const g = groupById(groupId)!;
    expect(g.interests).toEqual(["klatring", "litteratur"]);
    expect(g.interestId).toBe("klatring");
  });

  it("has no interest when none was picked", () => {
    const { groupId } = createGroup({
      name: "Tom gruppe",
      about: "",
      interests: [],
      area: "Grünerløkka",
      photos: ["group-coffee", "venue-cafe"],
      access: "open",
    });
    expect(groupById(groupId)).toMatchObject({ interests: [] });
    expect(groupById(groupId)!.interestId).toBeUndefined();
  });
});

describe("people's interests", () => {
  it("use the catalogue's own names", () => {
    for (const list of [profile.interests, ...people.map((p) => p.interests)])
      for (const l of list) expect(interestForLabel(l)?.label).toBe(l);
  });
});
