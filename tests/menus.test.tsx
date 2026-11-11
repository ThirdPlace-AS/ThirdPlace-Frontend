// Menus for cafés, bars and restaurants (user 2026-11-10: "We need to have a
// meny section in the map details sheet for restaurants, cafes and bars").
// One generic model (MASTER_SPEC's venue menus contract): offerings →
// sections → items, prices in minor units and never guessed, labels from a
// controlled list. The place page shows a Meny section, the menu page all of
// it.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  MenuSection,
  menuHref,
  menuItemLabel,
  offeringIndex,
} from "@/components/place/MenuSection";
import { PlacePage } from "@/components/place/PlacePage";
import MenuScreen, { MENU_FOOTNOTE } from "@/features/place/MenuScreen";
import { placeById, places } from "@/fixtures";
import {
  MENU_LABELS,
  isMenuVenue,
  item,
  menuForPlace,
  menus,
  servesFoodOrDrink,
  sized,
} from "@/fixtures/menus";
import { formatMoney } from "@/lib/format";

const mockPush = jest.fn();
let mockParams: { id?: string; offering?: string } = {};
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => mockParams,
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
  mockPush.mockClear();
  mockParams = {};
});

describe("menu prices", () => {
  it("read as kroner, with øre only when there are any", () => {
    expect(formatMoney({ amountMinor: 4200, currency: "NOK" })).toBe("42 kr");
    expect(formatMoney({ amountMinor: 14950, currency: "NOK" })).toBe(
      "149,50 kr",
    );
    expect(formatMoney({ amountMinor: 109500, currency: "NOK" })).toBe(
      `1${String.fromCharCode(0xa0)}095 kr`,
    );
  });

  it("are never guessed: an item without a price has none", () => {
    expect(item("Dagens kake").price).toBeUndefined();
    expect(item("Kaffe", 42).price).toEqual({
      amountMinor: 4200,
      currency: "NOK",
    });
    expect(
      sized("Husets rødvin", [
        ["Glass", 129],
        ["Flaske", 590],
      ]).variants?.map((v) => v.price.amountMinor),
    ).toEqual([12900, 59000]);
  });
});

describe("the menu fixtures", () => {
  it("belong to cafés, bars and restaurants that exist", () => {
    for (const m of menus) {
      const p = placeById(m.placeId);
      expect(p).toBeDefined();
      // By what the place says it is, not because it has a menu.
      expect(servesFoodOrDrink(p!)).toBe(true);
    }
    expect(new Set(menus.map((m) => m.placeId)).size).toBe(menus.length);
  });

  it("are whole: offerings, sections and items, each named once", () => {
    for (const m of menus) {
      expect(m.offerings.length).toBeGreaterThan(0);
      const offerings = m.offerings.map((o) => o.name);
      expect(new Set(offerings).size).toBe(offerings.length);
      for (const o of m.offerings) {
        expect(o.sections.length).toBeGreaterThan(0);
        for (const s of o.sections) {
          expect(s.title.trim()).not.toBe("");
          expect(s.items.length).toBeGreaterThan(0);
          const names = s.items.map((i) => i.name);
          expect(new Set(names).size).toBe(names.length);
        }
      }
    }
  });

  it("price in whole øre, carry only known labels, and read like a person", () => {
    for (const m of menus)
      for (const o of m.offerings)
        for (const s of o.sections)
          for (const i of s.items) {
            const prices = [
              ...(i.price ? [i.price] : []),
              ...(i.variants ?? []).map((v) => v.price),
            ];
            for (const p of prices) {
              expect(Number.isInteger(p.amountMinor)).toBe(true);
              expect(p.amountMinor).toBeGreaterThan(0);
              expect(p.currency).toBe("NOK");
            }
            for (const l of i.labels ?? [])
              expect(MENU_LABELS as readonly string[]).toContain(l);
            for (const text of [i.name, i.description ?? "", i.note ?? ""])
              expect(text).not.toMatch(/ — /);
          }
  });

  it("every café, bar, pub, bakery, tea room and restaurant has a menu", () => {
    const venues = places.filter((p) => servesFoodOrDrink(p));
    expect(venues.filter((p) => !menuForPlace(p.id)).map((p) => p.id)).toEqual(
      [],
    );
    // The three legacy ones, the catalogue's 22 (0372–0373) and the eight
    // restaurants (0374).
    expect(venues.length).toBe(33);
    expect(venues.filter((p) => p.id.startsWith("p-rest-"))).toHaveLength(8);
    expect(menus.length).toBe(venues.length);
    // Of the legacy places, only the two cafés and the wine bar serve food or
    // drink (0371 gave the others categories that say what they are).
    expect(venues.filter((p) => /^p\d+$/.test(p.id)).map((p) => p.id)).toEqual([
      "p1",
      "p2",
      "p3",
    ]);
  });

  it("put a price on every item, or say why there is none", () => {
    // Never a guessed price: an item without one says why (the dog café's
    // free water bowl, the courses of a tasting menu with one price).
    const unpriced: string[] = [];
    for (const m of menus)
      for (const o of m.offerings)
        for (const s of o.sections)
          for (const i of s.items)
            if (!i.price && !i.variants) {
              expect(i.note).toBeTruthy();
              unpriced.push(i.name);
            }
    expect(unpriced).toContain("Vannskål");
    expect(unpriced.length).toBe(6);
  });
});

describe("which places are menu venues", () => {
  const venue = (
    kind: "bedrift" | "organisasjon" | "byrom",
    category: string,
  ) => isMenuVenue({ id: "x", kind, category });

  it("cafés, bars, pubs, bakeries and restaurants", () => {
    for (const c of [
      "Kafé",
      "Bokcafé",
      "Hundekafé",
      "Vinbar",
      "Pingpongbar",
      "Pub",
      "Bakeri",
      "Bryggeri",
      "Tesalong",
      "Restaurant",
    ])
      expect(venue("bedrift", c)).toBe(true);
  });

  it("not clubs, parks or a promenade", () => {
    expect(venue("organisasjon", "Kaffeklubb")).toBe(false);
    expect(venue("organisasjon", "Bakelag")).toBe(false);
    expect(venue("byrom", "Bryggepromenade")).toBe(false);
    expect(venue("byrom", "Park")).toBe(false);
    expect(venue("bedrift", "Verksted")).toBe(false);
  });
});

describe("the Meny section", () => {
  it("shows the first offering's items and opens the whole menu", () => {
    const nav = jest.fn();
    render(<MenuSection place={placeById("p1")!} onNavigate={nav} />, {
      wrapper,
    });
    expect(screen.getByRole("header", { name: "Meny" })).toBeTruthy();
    expect(screen.getByText("Espresso")).toBeTruthy();
    expect(screen.getByText("42 kr")).toBeTruthy();
    // Four items, then the button.
    expect(screen.queryByText("Iskaffe")).toBeNull();
    fireEvent.press(screen.getByText("Vis hele menyen"));
    expect(nav).toHaveBeenCalledWith("/place/p1/menu");
  });

  it("switches between offerings, and the page opens on the one chosen", () => {
    const nav = jest.fn();
    render(<MenuSection place={placeById("p1")!} onNavigate={nav} />, {
      wrapper,
    });
    fireEvent.press(screen.getByRole("radio", { name: "Frokost" }));
    expect(screen.getByText("Eggerøre på toast")).toBeTruthy();
    expect(screen.getByText("Hverdager 07–11 · Helg 09–12")).toBeTruthy();
    expect(screen.queryByText("Espresso")).toBeNull();
    fireEvent.press(screen.getByText("Vis hele menyen"));
    expect(nav).toHaveBeenCalledWith("/place/p1/menu?offering=1");
    screen.unmount();
    mockParams = { id: "p1", offering: "1" };
    render(<MenuScreen />, { wrapper });
    expect(
      screen.getByRole("radio", { name: "Frokost" }).props.accessibilityState,
    ).toMatchObject({ checked: true });
    expect(screen.getByText("Eggerøre på toast")).toBeTruthy();
  });

  it("a page link naming no offering, or one that isn't there, opens the first", () => {
    expect(offeringIndex(undefined, 3)).toBe(0);
    expect(offeringIndex("2", 3)).toBe(2);
    expect(offeringIndex("3", 3)).toBe(0);
    expect(offeringIndex("x", 3)).toBe(0);
    expect(menuHref("p1")).toBe("/place/p1/menu");
    expect(menuHref("p1", 2)).toBe("/place/p1/menu?offering=2");
  });

  it("says why an item has no price, even in the short preview", () => {
    render(
      <MenuSection
        place={placeById("p-rest-kokkebenken")!}
        onNavigate={jest.fn()}
      />,
      { wrapper },
    );
    // The tasting menu has one price; its first course says it is part of it.
    expect(
      screen.getByText(`Ti små retter 1${String.fromCharCode(0xa0)}095 kr`),
    ).toBeTruthy();
    expect(screen.getByText("Rå kamskjell med eple og pepperrot")).toBeTruthy();
    expect(screen.getByText("Del av smaksmenyen")).toBeTruthy();
  });

  it("says so for a café without a menu, and is absent elsewhere", () => {
    render(
      <MenuSection
        place={{ id: "new-cafe", kind: "bedrift", category: "Kafé" }}
        onNavigate={jest.fn()}
      />,
      { wrapper },
    );
    expect(screen.getByText("Menyen er ikke lagt ut ennå.")).toBeTruthy();
    expect(screen.queryByText("Vis hele menyen")).toBeNull();
    screen.unmount();
    render(<MenuSection place={placeById("p4")!} onNavigate={jest.fn()} />, {
      wrapper,
    });
    expect(screen.queryByText("Meny")).toBeNull();
  });

  it("sits on a café's page and not on a workshop's", () => {
    render(<PlacePage place={placeById("p1")!} onNavigate={jest.fn()} />, {
      wrapper,
    });
    expect(screen.getByRole("header", { name: "Meny" })).toBeTruthy();
    screen.unmount();
    render(<PlacePage place={placeById("p4")!} onNavigate={jest.fn()} />, {
      wrapper,
    });
    expect(screen.queryByRole("header", { name: "Meny" })).toBeNull();
  });
});

describe("the menu page", () => {
  it("lists every section of an offering, sizes, labels and the note", () => {
    mockParams = { id: "p3" };
    render(<MenuScreen />, { wrapper });
    expect(screen.getByText(placeById("p3")!.name)).toBeTruthy();
    expect(screen.getByRole("header", { name: "Musserende" })).toBeTruthy();
    expect(screen.getByRole("header", { name: "Rødt" })).toBeTruthy();
    expect(screen.getAllByText("Glass 145 kr · Flaske 690 kr").length).toBe(2);
    expect(screen.getAllByText("Alkoholfri").length).toBeGreaterThan(0);
    expect(screen.getByText(MENU_FOOTNOTE)).toBeTruthy();
    fireEvent.press(screen.getByRole("radio", { name: "Småretter" }));
    expect(screen.getByText("Burrata")).toBeTruthy();
    expect(screen.getByText("Til deling")).toBeTruthy();
  });

  it("reads each item whole to a screen reader", () => {
    const burrata = menuForPlace("p3")!.offerings[1]!.sections[0]!.items.find(
      (i) => i.name === "Burrata",
    )!;
    expect(menuItemLabel(burrata)).toBe(
      "Burrata. 169 kr. Med grillet fersken og basilikum. Vegetar, Glutenfri",
    );
  });

  it("handles a place without a menu and an unknown place", () => {
    mockParams = { id: "p4" };
    render(<MenuScreen />, { wrapper });
    expect(screen.getByText("Menyen er ikke lagt ut ennå.")).toBeTruthy();
    screen.unmount();
    mockParams = { id: "nope" };
    render(<MenuScreen />, { wrapper });
    expect(screen.getByText("Fant ikke stedet.")).toBeTruthy();
  });
});
