// Place page (/place/[id]), Phase 12 H4c: the map's place detail as a page,
// so Lagret, links from an experience and deep links have a real back.
// H5d replaces the body with the video-style PlacePage.
import { useLocalSearchParams } from "expo-router";

import { PlaceContent } from "@/components/map/content/PlaceContent";
import { placeById } from "@/fixtures";
import { EntityPage } from "@/features/entity/EntityPage";

export default function PlaceScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const place = placeById(id);
  return (
    <EntityPage
      title={place?.name ?? "Sted"}
      missing={place ? undefined : "Fant ikke stedet"}
    >
      {(push) => <PlaceContent id={id} push={push} />}
    </EntityPage>
  );
}
