// Phase 19 S3b (founder 2026-11-08): what every map item is (Bedrift,
// Organisasjon, Byrom, Opplevelse, Arrangement), shown on cards and search
// rows and picked in Filtre's "Type"; search finds interests; Saved opens
// every kind's page; the workspace keeps to the demo owner's own things.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MapFilterSheet } from "@/components/map/MapFilterSheet";
import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import {
  activeExtraFilterCount,
  appliedFilterChips,
  applyExperienceFilters,
  applyFilters,
  DEFAULT_FILTERS,
} from "@/components/map/services/mapFilters";
import { searchFixtures } from "@/components/map/services/mapSearch";
import {
  ITEM_TYPES,
  ITEM_TYPE_LABEL,
  experienceKindLabel,
  experienceType,
  experienceTypeLabel,
} from "@/components/map/services/itemType";
import { interestById } from "@/fixtures/catalog/interests";
import {
  WorkspaceCalendar,
  WorkspaceLocations,
} from "@/features/workspace/WorkspaceScreens";
import SavedScreen from "@/features/saved/SavedScreen";
import { experiences, places } from "@/fixtures";
import { resetOrigin } from "@/lib/origin";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    navigate: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({}),
}));

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

afterEach(() => {
  resetOrigin();
  mockPush.mockClear();
});

describe("item types", () => {
  it("tell an opplevelse, a one-day event and a festival apart", () => {
    expect(experienceTypeLabel({ format: undefined, days: undefined })).toBe(
      "Opplevelse",
    );
    expect(experienceTypeLabel({ format: "event", days: 1 })).toBe(
      "Arrangement",
    );
    expect(experienceTypeLabel({ format: "event", days: 2 })).toBe("Festival");
    expect(experienceType({ format: "event" })).toBe("arrangement");
  });

  it("label every map item with its kind and area", () => {
    const r = resultForMode({
      mode: "explore",
      places,
      query: "",
      savedIds: [],
    });
    for (const i of r.items) {
      expect(ITEM_TYPES).toContain(i.type);
      expect(i.subtitle.startsWith(`${i.typeLabel} · ${i.area} · `)).toBe(true);
    }
    const fest = r.items.find((i) => i.id === "e-klatring-arr")!;
    expect(fest.subtitle).toBe("Klatring · Festival · Kolsås · Lør 10:00");
  });

  it("names an experience by its activity (2026-11-09)", () => {
    const r = resultForMode({
      mode: "explore",
      places,
      query: "",
      savedIds: [],
    });
    for (const i of r.items.filter((x) => x.kind === "experience")) {
      const e = experiences.find((x) => x.id === i.id)!;
      const activity = interestById(e.interestId)?.label;
      if (!activity) continue;
      expect(i.typeLabel).toBe(
        e.format === "event" && (e.days ?? 1) > 1
          ? `${activity} · Festival`
          : activity,
      );
      // Filtre's Type axis is unchanged.
      expect(i.type).toBe(experienceType(e));
    }
    expect(experienceKindLabel({ interestId: undefined })).toBe("Opplevelse");
    expect(
      experienceKindLabel({ format: "event", days: 1, interestId: "jazz" }),
    ).toBe("Jazz");
  });

  it("names a city space by its own kind, not just Byrom (2026-11-09)", () => {
    const r = resultForMode({
      mode: "explore",
      places,
      query: "",
      savedIds: [],
    });
    const spaces = r.items.filter((i) => i.type === "byrom");
    expect(spaces.length).toBeGreaterThan(0);
    for (const i of spaces) {
      const p = places.find((x) => x.id === i.id)!;
      expect(i.typeLabel).toBe(p.category);
      expect(i.typeLabel).not.toBe("Byrom");
    }
    const crag = spaces.find((i) => i.id === "p-klatring-r")!;
    expect(crag.subtitle.startsWith("Klatrefelt · Kolsås · ")).toBe(true);
    // Bedrift and Organisasjon keep the kind; Filtre's Type still says Byrom.
    expect(r.items.find((i) => i.type === "bedrift")!.typeLabel).toBe(
      "Bedrift",
    );
    expect(ITEM_TYPE_LABEL.byrom).toBe("Byrom");
  });
});

describe("the Type filter", () => {
  it("narrows places and experiences alike", () => {
    const byrom = { ...DEFAULT_FILTERS, kinds: ["byrom" as const] };
    const ps = applyFilters(places, "", byrom);
    expect(ps.length).toBeGreaterThan(0);
    expect(ps.every((p) => p.kind === "byrom")).toBe(true);
    expect(applyExperienceFilters(experiences, "", byrom)).toEqual([]);
    const events = { ...DEFAULT_FILTERS, kinds: ["arrangement" as const] };
    expect(applyFilters(places, "", events)).toEqual([]);
    const es = applyExperienceFilters(experiences, "", events);
    expect(es.length).toBeGreaterThan(0);
    expect(es.every((e) => e.format === "event")).toBe(true);
  });

  it("counts once in the badge and gives each kind a removable chip", () => {
    const f = {
      ...DEFAULT_FILTERS,
      kinds: ["byrom" as const, "bedrift" as const],
    };
    expect(activeExtraFilterCount(f)).toBe(1);
    const chips = appliedFilterChips(f);
    expect(chips.map((c) => c.label)).toEqual(["Byrom", "Bedrift"]);
    expect(chips[0]!.remove(f).kinds).toEqual(["bedrift"]);
  });

  it("is a group in Filtre, drawn like Kategori", () => {
    render(
      <MapFilterSheet
        visible
        filters={DEFAULT_FILTERS}
        mode="forYou"
        savedIds={[]}
        onClose={jest.fn()}
        onApply={jest.fn()}
      />,
      { wrapper },
    );
    expect(screen.getByText("Type")).toBeTruthy();
    for (const t of ITEM_TYPES)
      expect(
        screen.getByRole("button", { name: ITEM_TYPE_LABEL[t] }),
      ).toBeTruthy();
    const before = screen.getByText(/^Vis \d+ resultater$/).props.children;
    fireEvent.press(screen.getByRole("button", { name: "Byrom" }));
    expect(
      screen.getByRole("button", { name: "Byrom" }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(screen.getByText(/^Vis \d+ resultat(er)?$/).props.children).not.toBe(
      before,
    );
    // Every interest has exactly one byrom, so Byrom plus one activity
    // (Kolsås klatrefelt for Klatring) is one result, in the singular.
    fireEvent.press(screen.getAllByRole("button", { name: /^Trening/ })[0]!);
    fireEvent.press(screen.getByRole("checkbox", { name: "Klatring" }));
    expect(screen.getByText("Vis 1 resultat")).toBeTruthy();
  });
});

describe("search", () => {
  it("finds an interest's places, experiences and group", () => {
    const g = searchFixtures("klatring");
    const ids = g.places.map((r) => r.id);
    for (const id of ["p-klatring-b", "p-klatring-o", "p-klatring-r"])
      expect(ids).toContain(id);
    expect(g.experiences.map((r) => r.id)).toEqual(
      expect.arrayContaining(["e-klatring", "e-klatring-arr"]),
    );
    expect(g.groups.map((r) => r.id)).toContain("g-klatring");
    const gym = g.places.find((r) => r.id === "p-klatring-b")!;
    expect(gym.subtitle).toMatch(/^Bedrift · Lillestrøm · ★ \d,\d$/);
    expect(g.groups.find((r) => r.id === "g-klatring")!.subtitle).toBe(
      "Gruppe · 46 medlemmer",
    );
  });

  it("reads older labels as the interest", () => {
    // "Bøker" is a synonym of Litteratur: the bookcafé and the reading circle.
    const g = searchFixtures("bøker");
    expect(g.places.map((r) => r.id)).toContain("p2");
  });
});

describe("Saved", () => {
  it("files a business under Bedrifter and opens its place page", () => {
    const saved = renderHook(() => useMapSaved());
    const toggle = (k: string) => act(() => saved.result.current.toggle(k));
    toggle("business:b1");
    toggle("place:p-klatring-r");
    render(<SavedScreen />, { wrapper });
    fireEvent.press(screen.getByText("Bedrifter"));
    expect(screen.getByText("Oslo Kaffebar AS")).toBeTruthy();
    expect(screen.queryByText("Kolsås klatrefelt")).toBeNull();
    fireEvent.press(screen.getByText("Oslo Kaffebar AS"));
    expect(mockPush).toHaveBeenCalledWith("/place/p1");
    fireEvent.press(screen.getByText("Steder"));
    expect(screen.getByText("Kolsås klatrefelt")).toBeTruthy();
    toggle("business:b1");
    toggle("place:p-klatring-r");
  });
});

describe("the workspace keeps to its own things", () => {
  it("lists the demo owner's four locations", () => {
    render(<WorkspaceLocations />, { wrapper });
    expect(screen.getByText("4 lokasjoner")).toBeTruthy();
    expect(screen.queryByText("Bratt Buldring AS")).toBeNull();
  });

  it("leaves the catalogue's experiences out of Kalender", () => {
    render(<WorkspaceCalendar />, { wrapper });
    expect(screen.queryByText("Buldring for nye")).toBeNull();
  });
});
