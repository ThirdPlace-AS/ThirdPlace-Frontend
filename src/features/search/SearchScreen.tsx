// Søk (/search), Phase 12 H4c: the map's search as a page (results you
// browse). A submit returns to the map with the query as its search filter;
// picking a place or experience returns to the map with it open; a group
// opens its page.
import { router, useLocalSearchParams, type Href } from "expo-router";
import { View } from "react-native";

import { MapSearch } from "@/components/map/MapSearch";
import { StatusBarStyle } from "@/components/ui";
import { goBackOr } from "@/lib/navigation";

export default function SearchScreen() {
  const { q = "" } = useLocalSearchParams<{ q?: string }>();
  return (
    <View className="flex-1 bg-background">
      <StatusBarStyle style="auto" />
      <MapSearch
        initialQuery={q}
        onBack={() => goBackOr("/map")}
        onSubmit={(query) =>
          router.navigate({
            pathname: "/map",
            params: { q: query, at: String(Date.now()) },
          })
        }
        onSelect={(r) => {
          if (r.kind === "group") {
            router.replace(`/group/${r.id}` as Href);
            return;
          }
          router.navigate({
            pathname: "/map",
            params: { focus: `${r.kind}:${r.id}`, at: String(Date.now()) },
          });
        }}
      />
    </View>
  );
}
