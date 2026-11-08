// The map browse sheet's cards (founder 2026-11-08): no category, type, area
// or distance on the card, an experience keeps its time, and saving uses the
// save icon (a bookmark, as in Sveip) instead of a heart.
import { Ionicons } from "@expo/vector-icons";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { BrowseCard } from "@/components/map/MapBrowseSheet";
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
const place = items.find((i) => i.kind === "place" && i.id === "p1")!;

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
  ])("%s shows no category, type, area or distance", (_, item) => {
    card(item);
    expect(screen.getByText(item.title)).toBeTruthy();
    expect(screen.queryByText(item.subtitle)).toBeNull();
    expect(screen.queryByText(item.typeLabel!)).toBeNull();
    expect(screen.queryByText(item.area!)).toBeNull();
    const category = MARKER_LABEL[markerCategoryFor(item)];
    if (!item.tags?.includes(category))
      expect(screen.queryByText(category)).toBeNull();
    // A screen reader still hears what and where.
    expect(
      screen.getByRole("button", { name: `${item.title}, ${item.subtitle}` }),
    ).toBeTruthy();
  });

  it("an experience keeps its time", () => {
    card(experience);
    expect(experience.when).toBeTruthy();
    expect(screen.getByText(experience.when!)).toBeTruthy();
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
