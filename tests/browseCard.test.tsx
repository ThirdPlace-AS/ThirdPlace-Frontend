// The map browse sheet's cards (founder 2026-11-08): what the item is (its
// type), a price only on experiences, no pin category or area, and saving with
// the save icon (a bookmark, as in Sveip) instead of a heart. A Bedrift or
// Byrom card adds how far away it is to that line and wears its opening on
// the photo, green "Åpent" or red "Stengt"; an Organisasjon card keeps its
// opening in the line (user 2026-11-09). No long-press menu on a card
// (user 2026-11-09).
import { Ionicons } from "@expo/vector-icons";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { BrowseCard } from "@/components/map/MapBrowseSheet";
import {
  browseCardLine,
  browseCardOpenBadge,
} from "@/components/map/services/itemType";
import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import {
  MARKER_LABEL,
  markerCategoryFor,
} from "@/components/map/services/markerCategory";
import type { DiscoveryItem } from "@/components/map/types/mapPresentation";
import { Badge } from "@/components/ui";
import { places } from "@/fixtures";
import { formatDistance } from "@/lib/distance";

const items = resultForMode({
  mode: "explore",
  places,
  query: "",
  savedIds: [],
}).items;
const experience = items.find((i) => i.kind === "experience" && i.id === "e1")!;
const paid = items.find(
  (i) => i.kind === "experience" && i.price !== "Gratis",
)!;
const bedrift = items.find((i) => i.kind === "place" && i.type === "bedrift")!;
const organisasjon = items.find(
  (i) => i.kind === "place" && i.type === "organisasjon",
)!;
// A city space: free, and still no price on its card.
const byrom = items.find((i) => i.kind === "place" && i.type === "byrom")!;
// Whether a place is open depends on the clock, so the tests set it.
const at = (item: DiscoveryItem, openNow: boolean) => ({ ...item, openNow });

const card = (item: DiscoveryItem, saved = false) =>
  render(
    <BrowseCard
      item={item}
      selected={false}
      saved={saved}
      onSelect={jest.fn()}
      onToggleSave={jest.fn()}
    />,
  );

const iconNames = () =>
  screen.UNSAFE_getAllByType(Ionicons).map((i) => i.props.name as string);

describe("browse card", () => {
  it.each([
    ["an experience", experience],
    ["a Bedrift", bedrift],
    ["an Organisasjon", organisasjon],
    ["a city space", byrom],
  ])("%s says what it is, without category or area", (_, item) => {
    card(item);
    expect(screen.getByText(item.title)).toBeTruthy();
    const line = browseCardLine(item);
    expect(line.startsWith(item.typeLabel!)).toBe(true);
    expect(screen.getByText(line)).toBeTruthy();
    expect(screen.queryByText(item.subtitle)).toBeNull();
    expect(screen.queryByText(item.area!)).toBeNull();
    const category = MARKER_LABEL[markerCategoryFor(item)];
    if (!item.tags?.includes(category))
      expect(screen.queryByText(category)).toBeNull();
  });

  it.each([
    ["a Bedrift", bedrift],
    ["a city space", byrom],
  ])(
    "%s shows how far away it is, and its opening on the photo",
    (_, place) => {
      for (const openNow of [true, false]) {
        const item = at(place, openNow);
        // The distance the list is sorted by, measured from the person.
        expect(browseCardLine(item)).toBe(
          `${item.typeLabel} · ${formatDistance(item.distanceM!)}`,
        );
        card(item);
        expect(screen.getByText(browseCardLine(item))).toBeTruthy();
        // Green "Åpent" or red "Stengt", solid on the photo.
        expect(screen.UNSAFE_getByType(Badge).props).toMatchObject(
          openNow
            ? { label: "Åpent", tone: "success", solid: true }
            : { label: "Stengt", tone: "danger", solid: true },
        );
        expect(browseCardOpenBadge(item)?.label).toBe(
          openNow ? "Åpent" : "Stengt",
        );
        screen.unmount();
      }
    },
  );

  it("an Organisasjon keeps its opening in the line, no badge", () => {
    for (const openNow of [true, false]) {
      const place = at(organisasjon, openNow);
      expect(browseCardLine(place)).toBe(
        `Organisasjon · ${openNow ? "Åpent" : "Stengt"}`,
      );
      expect(browseCardOpenBadge(place)).toBeNull();
      card(place);
      expect(screen.UNSAFE_queryAllByType(Badge)).toHaveLength(0);
      screen.unmount();
    }
  });

  it("an experience shows its type and time, its price, and no badge", () => {
    expect(browseCardLine(experience)).toBe(
      `${experience.typeLabel} · ${experience.when}`,
    );
    expect(browseCardOpenBadge(experience)).toBeNull();
    card(paid);
    expect(paid.price).toMatch(/^\d+ kr$/);
    expect(screen.getByText(paid.price!)).toBeTruthy();
    expect(screen.UNSAFE_queryAllByType(Badge)).toHaveLength(0);
  });

  it("a screen reader hears the type, area and distance, and a place's opening", () => {
    card(experience);
    expect(
      screen.getByRole("button", {
        name: `${experience.title}, ${experience.subtitle}`,
      }),
    ).toBeTruthy();
    screen.unmount();
    card(at(bedrift, true));
    expect(
      screen.getByRole("button", {
        name: `${bedrift.title}, ${bedrift.subtitle}, åpent nå`,
      }),
    ).toBeTruthy();
    screen.unmount();
    card(at(byrom, false));
    expect(
      screen.getByRole("button", {
        name: `${byrom.title}, ${byrom.subtitle}, stengt nå`,
      }),
    ).toBeTruthy();
  });

  it("has no long-press menu", () => {
    card(bedrift);
    const button = screen.getByRole("button", {
      name: new RegExp(`^${bedrift.title}, `),
    });
    expect(button.props.onLongPress).toBeUndefined();
    expect(button.props.accessibilityActions ?? []).toHaveLength(0);
  });

  it("places show no price", () => {
    card(bedrift);
    expect(screen.queryByText(/(^|\s)kr(\s|$)/)).toBeNull();
    screen.unmount();
    card(byrom);
    expect(screen.queryByText("Gratis")).toBeNull();
  });

  it("saves with the bookmark, not a heart", () => {
    card(bedrift);
    expect(iconNames()).toContain("bookmark-outline");
    expect(iconNames().some((n) => n.startsWith("heart"))).toBe(false);
    expect(screen.getByRole("button", { name: "Lagre" })).toBeTruthy();
  });

  it("a saved card shows the filled bookmark", () => {
    card(bedrift, true);
    expect(iconNames()).toContain("bookmark");
    expect(
      screen.getByRole("button", { name: "Fjern fra lagret" }),
    ).toBeTruthy();
  });
});
