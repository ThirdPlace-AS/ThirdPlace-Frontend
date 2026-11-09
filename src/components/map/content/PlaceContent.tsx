import { router } from "expo-router";

import { PlacePage } from "@/components/place/PlacePage";
import { Text } from "@/components/ui";
import { chatForPlace, placeById } from "@/fixtures";

import type { PushFn } from "../sheetTypes";

// Map place detail (every kind: Bedrift, Organisasjon, Byrom): the shared
// PlacePage inside the map's page sheet, as experiences have ExperiencePage
// (user 2026-11-09: "make businesses and places the same map details sheet
// as experience"). Del and Lagre sit in the sheet header and the page top
// bar; the chat is the sheet's floating card (PlaceChatBar), so the body
// leaves out its Samtalen section. "Drives av" pushes the business sub-view
// onto the in-sheet stack; the reviews, what happens here, groups and nearby
// places open as pages (the portal sheet hides while the map is out of focus
// and returns on back).
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
      chatInBar={!!chatForPlace(place.id)}
    />
  );
}
