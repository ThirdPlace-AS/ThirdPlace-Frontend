// R3a (0366) and 0381: in the map's detail sheet a page opens with what the
// peek shows (the gallery), the title block and first rows mount once the
// sheet has come to rest, and the rest a moment later; the /place and
// /experience routes render everything at once. User 2026-11-11: "the
// details modal sheet is should slide in before the screen is done
// redericting to the newly clicked marker".
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ExperiencePage } from "@/components/experience/ExperiencePage";
import {
  SheetStageContext,
  sheetStage,
  type SheetStage,
} from "@/components/map/sheetStage";
import { PlacePage } from "@/components/place/PlacePage";
import { experienceById, placeById } from "@/fixtures";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

function inSheet(stage: SheetStage | undefined) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const body =
      stage === undefined ? (
        children
      ) : (
        <SheetStageContext.Provider value={stage}>
          {children}
        </SheetStageContext.Provider>
      );
    return <SafeAreaProvider initialMetrics={METRICS}>{body}</SafeAreaProvider>;
  };
}

describe("sheetStage", () => {
  const at = (
    rootKey: string | null,
    settledKey: string | null,
    restKey: string | null,
    nested = false,
  ) => sheetStage({ nested, rootKey, settledKey, restKey });

  it("opens with the peek's part until the sheet rests for this item", () => {
    expect(at("place:p1", null, null)).toBe(0);
    // Resting for another item (a swap) does not count.
    expect(at("place:p2", "place:p1", "place:p1")).toBe(0);
    expect(at(null, null, null)).toBe(0);
  });

  it("then the first screen, then everything", () => {
    expect(at("place:p1", "place:p1", null)).toBe(1);
    expect(at("place:p1", "place:p1", "place:p0")).toBe(1);
    expect(at("place:p1", "place:p1", "place:p1")).toBe(2);
  });

  it("is keyed on the item, so a second tap on the open pin keeps it", () => {
    // The same item tapped again: the keys still match.
    expect(at("place:p1", "place:p1", "place:p1")).toBe(2);
  });

  it("a pushed view renders everything (the sheet is already open)", () => {
    expect(at("place:p1", null, null, true)).toBe(2);
  });
});

describe("an experience page in the opening sheet", () => {
  const exp = experienceById("e1")!;
  const page = (stage: SheetStage | undefined) =>
    render(
      <ExperiencePage exp={exp} onOpen={jest.fn()} onNavigate={jest.fn()} />,
      { wrapper: inSheet(stage) },
    );
  const title = () => screen.queryByRole("header", { name: exp.title });

  it("opens with the gallery only: the peek shows nothing else", () => {
    page(0);
    expect(title()).toBeNull();
    expect(screen.queryByText("Hva dere skal gjøre")).toBeNull();
  });

  it("shows the first screen once the sheet rests", () => {
    page(1);
    expect(title()).toBeTruthy();
    expect(screen.queryByText("Hva dere skal gjøre")).toBeNull();
    expect(screen.queryByText("Samtalen")).toBeNull();
    expect(screen.queryByText("Ting å vite")).toBeNull();
  });

  it("shows everything a moment later", () => {
    page(2);
    expect(title()).toBeTruthy();
    expect(screen.getByText("Hva dere skal gjøre")).toBeTruthy();
    expect(screen.getByText("Samtalen")).toBeTruthy();
    expect(screen.getByText("Ting å vite")).toBeTruthy();
  });

  it("the /experience page (no sheet) shows everything at once", () => {
    page(undefined);
    expect(title()).toBeTruthy();
    expect(screen.getByText("Hva dere skal gjøre")).toBeTruthy();
    expect(screen.getByText("Samtalen")).toBeTruthy();
  });
});

describe("a place page in the opening sheet", () => {
  const place = placeById("p1")!;
  const page = (stage: SheetStage | undefined) =>
    render(<PlacePage place={place} onNavigate={jest.fn()} />, {
      wrapper: inSheet(stage),
    });
  const title = () => screen.queryByRole("header", { name: place.name });

  it("opens with the gallery only", () => {
    page(0);
    expect(title()).toBeNull();
    expect(screen.queryByText("Åpent nå")).toBeNull();
    expect(screen.queryByText("Stengt nå")).toBeNull();
  });

  it("shows the first screen once the sheet rests", () => {
    page(1);
    expect(title()).toBeTruthy();
    expect(screen.getByText(place.address)).toBeTruthy();
    expect(screen.queryByText("Hvor du finner oss")).toBeNull();
    expect(screen.queryByText("Samtalen")).toBeNull();
  });

  it("shows everything a moment later, and on /place", () => {
    page(2);
    expect(screen.getByText("Hvor du finner oss")).toBeTruthy();
    expect(screen.getByText("Samtalen")).toBeTruthy();
    page(undefined);
    expect(screen.getAllByText("Hvor du finner oss").length).toBeGreaterThan(0);
  });
});
