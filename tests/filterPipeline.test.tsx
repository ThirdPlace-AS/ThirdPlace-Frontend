// Speed pass (0347): the filter pipeline does less work per change and the
// Filtre sliders only report a new step, while the results stay exactly what
// they were: the footer's count is still the list's length in every mode, an
// opening-hours answer still follows the clock with its parse cached, and
// distances still follow the person.
import { describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react-native";

import { RangeSlider } from "@/components/RangeSlider";
import { SteppedSlider } from "@/components/SteppedSlider";
import {
  DEFAULT_FILTERS,
  applyFilters,
  type MapFilters,
} from "@/components/map/services/mapFilters";
import {
  countResults,
  resultForMode,
} from "@/components/map/services/mapFixtureAdapter";
import type { DiscoveryMode } from "@/components/map/types/mapPresentation";
import { markerId } from "@/components/map/types/mapPresentation";
import { AREAS, experiences, places } from "@/fixtures";
import { isPlaceOpen } from "@/lib/openingHours";

const MODES: DiscoveryMode[] = [
  "forYou",
  "trending",
  "live",
  "explore",
  "saved",
  "friends",
];

const DRAFTS: Partial<MapFilters>[] = [
  {},
  { categories: ["kafe"] },
  { openNowOnly: true },
  { maxDistanceM: 5000 },
  { priceMax: 200 },
  { kinds: ["bedrift", "opplevelse"] },
  { hasSpots: true, minRating: 4 },
];

describe("the footer count is the list's length", () => {
  const savedIds = [
    markerId("place", places[0]!.id),
    markerId("place", places[40]!.id),
    markerId("experience", experiences[0]!.id),
  ];
  for (const query of ["", "kaffe"])
    for (const extra of DRAFTS)
      it(`query "${query}", ${JSON.stringify(extra)}`, () => {
        const filters = { ...DEFAULT_FILTERS, ...extra } as MapFilters;
        for (const mode of MODES) {
          const list = resultForMode({
            mode,
            places: applyFilters(places, query, filters),
            query,
            savedIds,
            time: filters.time,
            hasSpots: filters.hasSpots,
            filters,
          }).items;
          expect(
            countResults({ mode, allPlaces: places, query, filters, savedIds }),
          ).toBe(list.length);
        }
      });
});

describe("cached work still follows the clock and the person", () => {
  it("a place opens and closes across its hours with the parse cached", () => {
    const p = {
      hours: "Man–fre 07–18 · Lør–søn 09–17",
      openNow: false,
    };
    const monday = (h: number, m = 0) => new Date(2026, 10, 9, h, m);
    expect(isPlaceOpen(p, monday(17, 59))).toBe(true);
    expect(isPlaceOpen(p, monday(18, 0))).toBe(false);
    expect(isPlaceOpen(p, monday(6, 59))).toBe(false);
    expect(isPlaceOpen(p, monday(7, 0))).toBe(true);
  });

  it("distances follow an origin move", () => {
    const at = (coord: [number, number]) =>
      resultForMode({
        mode: "explore",
        places,
        query: "",
        savedIds: [],
        origin: { coord, source: "area" },
      }).items;
    const oslo = at(AREAS[0]!.coord);
    const far = AREAS.reduce((a, b) =>
      Math.abs(b.coord[1] - AREAS[0]!.coord[1]) >
      Math.abs(a.coord[1] - AREAS[0]!.coord[1])
        ? b
        : a,
    );
    const away = at(far.coord);
    const p = places[0]!.id;
    const d = (items: typeof oslo) => items.find((i) => i.id === p)!.distanceM!;
    expect(d(away)).toBeGreaterThan(d(oslo));
  });
});

// The sliders' touch handlers read the gesture from a touch history.
type Bank = { x: number; t: number; prevX: number };
const history = ({ x, t, prevX }: Bank) => ({
  numberActiveTouches: 1,
  indexOfSingleActiveTouch: 0,
  mostRecentTimeStamp: t,
  touchBank: [
    {
      touchActive: true,
      startPageX: 0,
      startPageY: 0,
      startTimeStamp: 0,
      currentPageX: x,
      currentPageY: 0,
      currentTimeStamp: t,
      previousPageX: prevX,
      previousPageY: 0,
      previousTimeStamp: t - 1,
    },
  ],
});

type Handlers = {
  onLayout?: (e: unknown) => void;
  onResponderGrant: (e: unknown) => void;
  onResponderMove: (e: unknown) => void;
  onResponderRelease: (e: unknown) => void;
};

function drag(h: Handlers, from: number, to: number) {
  h.onResponderGrant({
    nativeEvent: { locationX: from, touches: [], changedTouches: [] },
    touchHistory: history({ x: from, t: 1, prevX: from }),
  });
  let prev = from;
  let t = 2;
  const dir = to > from ? 1 : -1;
  for (let x = from + dir; dir > 0 ? x <= to : x >= to; x += dir) {
    h.onResponderMove({
      nativeEvent: { touches: [], changedTouches: [] },
      touchHistory: history({ x, t, prevX: prev }),
    });
    prev = x;
    t += 1;
  }
  h.onResponderRelease({
    nativeEvent: { touches: [], changedTouches: [] },
    touchHistory: history({ x: prev, t, prevX: prev }),
  });
}

function handlersOf(root: ReturnType<typeof render>["UNSAFE_root"]) {
  return root.findAll(
    (n) => typeof n.props.onResponderMove === "function",
  ) as unknown as { props: Handlers }[];
}

describe("the Filtre sliders only report a new step", () => {
  it("SteppedSlider: one report per step crossed, none within a step", () => {
    const onChange = jest.fn();
    const ui = render(
      <SteppedSlider
        labels={["1 km", "5 km", "10 km", "25 km", "50 km", "Alle"]}
        index={0}
        onChange={onChange}
      />,
    );
    const [track] = handlersOf(ui.UNSAFE_root);
    // A 528 px track: 500 px for the thumb to travel, 100 px per step.
    track!.props.onLayout?.({ nativeEvent: { layout: { width: 528 } } });
    drag(track!.props, 0, 160);
    const moves = onChange.mock.calls.map((c) => c[0]);
    // 160 one-pixel moves cross into step 1 and then step 2 at most.
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.length).toBeLessThanOrEqual(3);
    expect(new Set(moves).size).toBe(moves.length);
  });

  it("RangeSlider: dragging the top thumb reports each step once", () => {
    const onChange = jest.fn();
    const ui = render(
      <RangeSlider
        min={0}
        max={1000}
        step={100}
        low={0}
        high={1000}
        onChange={onChange}
      />,
    );
    const thumbs = handlersOf(ui.UNSAFE_root);
    const root = ui.UNSAFE_root.findAll(
      (n) => typeof n.props.onLayout === "function",
    )[0]!;
    root.props.onLayout({ nativeEvent: { layout: { width: 528 } } });
    drag(thumbs[thumbs.length - 1]!.props, 500, 260);
    const highs = onChange.mock.calls.map((c) => c[1]);
    // 240 one-pixel moves down from 1000 cross about five 100-kr steps.
    expect(highs.length).toBeGreaterThan(0);
    expect(highs.length).toBeLessThanOrEqual(6);
    expect(new Set(highs).size).toBe(highs.length);
  });
});
