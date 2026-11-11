// Speed pass (0345): the map screen re-renders for many reasons that do not
// concern the map (sheets, the peek height, saved toggles). The map, the
// browse sheet and the detail sheet are memoised, so they must get the same
// props when nothing they show changed: these tests hold the hooks and the
// memo boundaries to that.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, render, renderHook } from "@testing-library/react-native";
import { readFileSync } from "fs";
import { join } from "path";
import { useState } from "react";
import { Text as RNText } from "react-native";

import { DetailContent } from "@/components/map/DetailContentRouter";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { useMapSelection } from "@/components/map/hooks/useMapSelection";
import { MapCanvas } from "@/components/map/MapCanvas";
import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import { useSheetChrome } from "@/components/ui";
import { places } from "@/fixtures";
import { useMockResource } from "@/hooks/useMockResource";

// Count how often the map's pins and a page body render.
const counts = { pins: 0, page: 0 };
jest.mock("@/components/ui/PinGlyph", () => ({
  PinGlyph: () => {
    counts.pins += 1;
    return null;
  },
}));
jest.mock("@/components/map/content/ExperienceContent", () => ({
  ExperienceContent: () => {
    counts.page += 1;
    return null;
  },
}));

afterEach(() => {
  counts.pins = 0;
  counts.page = 0;
  jest.useRealTimers();
});

// The nearest and the farthest item: far apart, so the fallback map draws
// each as its own pin (not one cluster badge).
const all = resultForMode({
  mode: "explore",
  places,
  query: "",
  savedIds: [],
}).items;
const items = [all[0]!, all[all.length - 1]!];
const noop = () => {};
// The map's select handler says whether it took the selection (0380).
const selectNone = () => false;

describe("hooks hand the map stable values", () => {
  it("useSheetChrome returns the same styles on every render", () => {
    const h = renderHook(() => useSheetChrome());
    const first = h.result.current;
    h.rerender({});
    expect(h.result.current).toBe(first);
  });

  it("useMapSaved returns the same object until the saved list changes", () => {
    const h = renderHook(() => useMapSaved());
    const first = h.result.current;
    h.rerender({});
    expect(h.result.current).toBe(first);
    const id = items[0]!.markerId;
    act(() => h.result.current.toggle(id));
    expect(h.result.current).not.toBe(first);
    expect(h.result.current.isSaved(id)).toBe(true);
    act(() => h.result.current.toggle(id));
  });

  it("useMockResource does not render again when the result is the same", () => {
    jest.useFakeTimers();
    let renders = 0;
    function Probe() {
      renders += 1;
      const { status } = useMockResource(places, {
        delayMs: 500,
        immediate: true,
      });
      return <RNText>{status}</RNText>;
    }
    render(<Probe />);
    const before = renders;
    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(renders).toBe(before);
  });
});

describe("memo boundaries", () => {
  it("the map does not render again when its parent does", () => {
    let bump: () => void = noop;
    function Parent() {
      const [n, setN] = useState(0);
      bump = () => setN(n + 1);
      return (
        <>
          <RNText>{n}</RNText>
          <MapCanvas
            fill
            markers={items}
            selectedMarkerId={null}
            onSelectMarker={selectNone}
            onMapPress={noop}
          />
        </>
      );
    }
    render(<Parent />);
    const before = counts.pins;
    expect(before).toBeGreaterThan(0);
    act(() => bump());
    expect(counts.pins).toBe(before);
  });

  it("a page body does not render again for the same target", () => {
    let bump: () => void = noop;
    const target = { kind: "experience" as const, id: "e1" };
    function Parent() {
      const [n, setN] = useState(0);
      bump = () => setN(n + 1);
      return (
        <>
          <RNText>{n}</RNText>
          <DetailContent target={target} push={noop} />
        </>
      );
    }
    render(<Parent />);
    expect(counts.page).toBe(1);
    act(() => bump());
    expect(counts.page).toBe(1);
  });
});

// Review of the speed pass: the map screen's empty-map tap handler listed the
// whole selection object, which was new on every render, so the memoised map
// rendered again with every map-screen render and the test above (a synthetic
// parent) could not see it.
describe("the map screen hands the map stable handlers", () => {
  it("useMapSelection returns the same object until the selection changes", () => {
    const h = renderHook(() => useMapSelection());
    const first = h.result.current;
    h.rerender({});
    expect(h.result.current).toBe(first);
    act(() =>
      h.result.current.openTarget({ kind: "place", id: places[0]!.id }),
    );
    const opened = h.result.current;
    expect(opened).not.toBe(first);
    h.rerender({});
    expect(h.result.current).toBe(opened);
  });

  it("no hook on the map screen lists a whole hook result as a dependency", () => {
    // These objects are rebuilt with their hook's state; a callback or memo
    // that lists one changes whenever they do. List the member used instead.
    const whole = ["filters", "discovery", "selection", "camera", "location"];
    const src = readFileSync(
      join(__dirname, "..", "app", "(tabs)", "map.tsx"),
      "utf8",
    );
    const found: string[] = [];
    for (const m of src.matchAll(/\[([^[\]]*)\]\s*,?\s*\)/g)) {
      for (const name of m[1]!.split(",").map((x) => x.trim())) {
        if (whole.includes(name)) found.push(name);
      }
    }
    expect(found).toEqual([]);
  });
});
