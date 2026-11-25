import { SystemState } from "@/components/states/SystemState";
import { resetTo } from "@/lib/navigation";

// "Fant ikke siden" (Phase 15): what a link to a page that does not exist
// opens — a mistyped or old link, or a shared join link whose chat or
// experience is gone. expo-router showed its own English screen here. Since
// review PR-05 it is the shared system page: a back arrow (to the map with no
// history) and "Til kartet".
export default function NotFoundScreen() {
  return (
    <SystemState
      icon="map-outline"
      title="Fant ikke siden"
      body="Den kan være flyttet eller slettet."
      action={{ label: "Til kartet", onPress: () => resetTo("/map") }}
    />
  );
}
