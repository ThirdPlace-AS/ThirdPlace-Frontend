import { EmptyState } from "@/components/states/StateView";
import { Screen } from "@/components/ui";
import { resetTo } from "@/lib/navigation";

// "Fant ikke siden" (Phase 15): what a link to a page that does not exist
// opens — a mistyped or old link, or a shared join link whose chat or
// experience is gone. expo-router showed its own English screen here. Same
// voice as the entity pages' "Fant ikke …" states.
export default function NotFoundScreen() {
  return (
    <Screen edges={["top", "bottom"]}>
      <EmptyState
        icon="map-outline"
        title="Fant ikke siden"
        message="Lenken kan være feil, eller siden er fjernet."
        actionLabel="Til kartet"
        onAction={() => resetTo("/map")}
      />
    </Screen>
  );
}
