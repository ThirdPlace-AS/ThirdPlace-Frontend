import { router } from "expo-router";

import { PlacePage } from "@/components/place/PlacePage";
import { Text } from "@/components/ui";
import { placeById } from "@/fixtures";

import type { PushFn } from "../sheetTypes";

// Map place detail (every kind: Bedrift, Organisasjon, Byrom): the shared
// PlacePage inside the map's page sheet, as experiences have ExperiencePage
// (user 2026-11-09: "make businesses and places the same map details sheet
// as experience"). Del and Lagre sit in the sheet header and the page top
// bar. The body keeps its Samtalen section, like an experience's (user
// 2026-11-10); at full screen the sheet's floating card (PlaceChatBar) stays
// too. "Drives av" pushes the business sub-view onto the in-sheet stack; the
// reviews, what happens here, groups and nearby places open as pages (the
// portal sheet hides while the map is out of focus and returns on back).
export function PlaceContent({ id, push }: { id: string; push: PushFn }) {
  const place = placeById(id);
  if (!place) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke stedet.
      </Text>
    );
  }
  return (
    <PlacePage
      place={place}
      onNavigate={(href) => router.push(href)}
      onOpen={push}
    />
  );
}
