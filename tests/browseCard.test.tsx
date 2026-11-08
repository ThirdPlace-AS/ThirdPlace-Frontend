// The map browse sheet's cards (founder 2026-11-08): what the item is (its
// type) with a place's opening or an experience's time, a price only on
// experiences, no pin category, area or distance, and saving with the save
// icon (a bookmark, as in Sveip) instead of a heart.
import { Ionicons } from "@expo/vector-icons";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { BrowseCard } from "@/components/map/MapBrowseSheet";
import { browseCardLine } from "@/components/map/services/itemType";
import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import {
  MARKER_LABEL,
  markerCategoryFor,
} from "@/components/map/services/markerCategory";
import type { DiscoveryItem } from "@/components/map/types/mapPresentation";
import { places } from "@/fixtures";

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
const place = items.find((i) => i.kind === "place" && i.id === "p1")!;
// A city space: free, and still no price on its card.
const freeSpace = items.find((i) => i.kind === "place" && i.type === "byrom")!;

const card = (item: DiscoveryItem, saved = false) =>
  render(
    <BrowseCard
      item={item}
      selected={false}
      saved={saved}
      onSelect={jest.fn()}
      onToggleSave={jest.fn()}
      onActions={jest.fn()}
    />,
  );

const iconNames = () =>
  screen.UNSAFE_getAllByType(Ionicons).map((i) => i.props.name as string);

describe("browse card", () => {
  it.each([
    ["an experience", experience],
    ["a place", place],
    ["a city space", freeSpace],
  ])("%s says what it is, without category, area or distance", (_, item) => {
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
    // A screen reader still hears what and where.
    expect(
      screen.getByRole("button", { name: `${item.title}, ${item.subtitle}` }),
    ).toBeTruthy();
  });

  it("an experience shows its type and time, and its price", () => {
    expect(browseCardLine(experience)).toBe(
      `${experience.typeLabel} · ${experience.when}`,
    );
    card(paid);
    expect(paid.price).toMatch(/^\d+ kr$/);
    expect(screen.getByText(paid.price!)).toBeTruthy();
  });

  it("a place shows its type and opening, and no price", () => {
    expect(browseCardLine(place)).toBe(
      `${place.typeLabel} · ${place.openNow ? "Åpent" : "Stengt"}`,
    );
    card(place);
    expect(screen.queryByText(/(^|\s)kr(\s|$)/)).toBeNull();
    card(freeSpace);
    expect(screen.queryByText("Gratis")).toBeNull();
  });

  it("saves with the bookmark, not a heart", () => {
    card(place);
    expect(iconNames()).toContain("bookmark-outline");
    expect(iconNames().some((n) => n.startsWith("heart"))).toBe(false);
    expect(screen.getByRole("button", { name: "Lagre" })).toBeTruthy();
  });

  it("a saved card shows the filled bookmark", () => {
    card(place, true);
    expect(iconNames()).toContain("bookmark");
    expect(
      screen.getByRole("button", { name: "Fjern fra lagret" }),
    ).toBeTruthy();
  });
});
