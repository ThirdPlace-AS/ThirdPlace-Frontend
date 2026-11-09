// Place page (/place/[id]), Phase 12: the video-style PlacePage (H5d) under
// the same top bar as the experience page. Lagret, Sveip's "i", an
// experience's venue row, "Flere steder i nærheten" and deep links open it;
// map pins open the same PlacePage in the map's page sheet (2026-11-09).
import { router, useLocalSearchParams, type Href } from "expo-router";
import { ScrollView, View } from "react-native";

import { placeCaption } from "@/components/experience/experienceMeta";
import { markerId } from "@/components/map/types/mapPresentation";
import { PlacePage } from "@/components/place/PlacePage";
import { EmptyState, Header, Screen, StatusBarStyle } from "@/components/ui";
import { placeById } from "@/fixtures";
import { PageTopBar } from "@/features/entity/PageTopBar";
import { goBackOr } from "@/lib/navigation";

export default function PlaceScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const place = placeById(id);
  if (!place) {
    return (
      <Screen edges={["top", "bottom"]}>
        <Header title="Sted" />
        <EmptyState
          icon="location-outline"
          title="Fant ikke stedet"
          actionLabel="Til kartet"
          onAction={() => goBackOr("/map")}
        />
      </Screen>
    );
  }
  return (
    <View className="flex-1 bg-background">
      <StatusBarStyle style="auto" />
      <PageTopBar
        // "Byrom · Kolsås" (Phase 19): what it is and where.
        caption={placeCaption(place)}
        shareMessage={`${place.name} på ThirdPlace: thirdplace.app/place/${place.id}`}
        savedKey={markerId("place", place.id)}
      />
      <ScrollView
        contentContainerClassName="px-gutter pb-16 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <PlacePage
          place={place}
          onNavigate={(href: Href) => router.push(href)}
        />
      </ScrollView>
    </View>
  );
}
