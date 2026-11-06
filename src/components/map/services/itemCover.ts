// Bundled demo photo for a discovery item (browse cards). Fixture art only —
// no media contract. Returns undefined when the item has no photo, so the
// card can fall back to its placeholder.
import type { ImageSourcePropType } from "react-native";

import { businessById, experienceById, groupById, placeById } from "@/fixtures";
import { coverForPlace, libImage } from "@/fixtures/images";

import type { DiscoveryItem } from "../types/mapPresentation";

export function coverForItem(
  item: Pick<DiscoveryItem, "kind" | "id">,
): ImageSourcePropType | undefined {
  switch (item.kind) {
    case "place": {
      const p = placeById(item.id);
      return p ? libImage(coverForPlace(p)) : undefined;
    }
    case "business": {
      const b = businessById(item.id);
      const p = b ? placeById(b.placeId) : undefined;
      return p ? libImage(coverForPlace(p)) : undefined;
    }
    case "experience":
      return experienceById(item.id)?.photos[0];
    case "group": {
      const g = groupById(item.id);
      return g ? libImage(g.cover) : undefined;
    }
    default:
      return undefined;
  }
}
