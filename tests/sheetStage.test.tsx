// R3a (0366): in the map's detail sheet a page opens with its first screen
// (gallery, title, the first rows) and the rest mounts once the sheet has
// come to rest; the /place and /experience routes render everything at once.
// Measured on the emulator (production JS): the first screen committed
// 210–266 ms after the open instead of 313–509 ms, and the sheet settled at
// mid 0.6–0.8 s after the open instead of 0.9–1.3 s.
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ExperiencePage } from "@/components/experience/ExperiencePage";
import { SheetStageContext, stageReady } from "@/components/map/sheetStage";
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

function inSheet(ready: boolean | undefined) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const body =
      ready === undefined ? (
        children
      ) : (
        <SheetStageContext.Provider value={ready}>
          {children}
        </SheetStageContext.Provider>
      );
    return <SafeAreaProvider initialMetrics={METRICS}>{body}</SafeAreaProvider>;
  };
}

describe("stageReady", () => {
  it("waits for this open's settle; pushed views are ready at once", () => {
    expect(stageReady({ nested: false, openNonce: 3, settledNonce: 2 })).toBe(
      false,
    );
    expect(
      stageReady({ nested: false, openNonce: 3, settledNonce: null }),
    ).toBe(false);
    expect(stageReady({ nested: false, openNonce: 3, settledNonce: 3 })).toBe(
      true,
    );
    expect(stageReady({ nested: true, openNonce: 3, settledNonce: 2 })).toBe(
      true,
    );
  });
});

describe("an experience page in the opening sheet", () => {
  const exp = experienceById("e1")!;
  const page = (ready: boolean | undefined) =>
    render(
      <ExperiencePage exp={exp} onOpen={jest.fn()} onNavigate={jest.fn()} />,
      { wrapper: inSheet(ready) },
    );

  it("shows the first screen before the sheet settles", () => {
    page(false);
    expect(screen.getByText(exp.title)).toBeTruthy();
    expect(screen.queryByText("Hva dere skal gjøre")).toBeNull();
    expect(screen.queryByText("Samtalen")).toBeNull();
    expect(screen.queryByText("Ting å vite")).toBeNull();
  });

  it("shows everything once it has settled", () => {
    page(true);
    expect(screen.getByText("Hva dere skal gjøre")).toBeTruthy();
    expect(screen.getByText("Samtalen")).toBeTruthy();
    expect(screen.getByText("Ting å vite")).toBeTruthy();
  });

  it("the /experience page (no sheet) shows everything at once", () => {
    page(undefined);
    expect(screen.getByText("Hva dere skal gjøre")).toBeTruthy();
    expect(screen.getByText("Samtalen")).toBeTruthy();
  });
});

describe("a place page in the opening sheet", () => {
  const place = placeById("p1")!;
  const page = (ready: boolean | undefined) =>
    render(<PlacePage place={place} onNavigate={jest.fn()} />, {
      wrapper: inSheet(ready),
    });

  it("shows the first screen before the sheet settles", () => {
    page(false);
    expect(screen.getAllByText(place.name).length).toBeGreaterThan(0);
    expect(screen.queryByText("Hvor du finner oss")).toBeNull();
    expect(screen.queryByText("Samtalen")).toBeNull();
  });

  it("shows everything once it has settled, and on /place", () => {
    page(true);
    expect(screen.getByText("Hvor du finner oss")).toBeTruthy();
    expect(screen.getByText("Samtalen")).toBeTruthy();
    page(undefined);
    expect(screen.getAllByText("Hvor du finner oss").length).toBeGreaterThan(0);
  });
});
