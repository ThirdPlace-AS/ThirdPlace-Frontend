// Søk (/search), Phase 12 H4c: the map's search as a page (results you
// browse). A submit returns to the map with the query as its search filter;
// picking a place or experience returns to the map with it open; a group
// opens its page.
// 0469: back from a place or experience picked here returns to this page
// with the same query (`sq` tells the map where it came from); `resume`
// reopens it showing the results, without the keyboard.
import { router, useLocalSearchParams, type Href } from "expo-router";
import { View } from "react-native";

import { MapSearch } from "@/components/map/MapSearch";
import { StatusBarStyle } from "@/components/ui";
import { goBackOr } from "@/lib/navigation";

export default function SearchScreen() {
  const { q = "", resume } = useLocalSearchParams<{
    q?: string;
    resume?: string;
  }>();
  return (
    <View className="flex-1 bg-background">
      <StatusBarStyle style="auto" />
      <MapSearch
        initialQuery={q}
        autoFocus={resume !== "1"}
        onBack={() => goBackOr("/map")}
        onSubmit={(query) =>
          router.navigate({
            pathname: "/map",
            params: { q: query, at: String(Date.now()) },
          })
        }
        onSelect={(r, query) => {
          if (r.kind === "group") {
            // Pushed (0454): back returns to the search and its query.
            router.push(`/group/${r.id}` as Href);
            return;
          }
          router.navigate({
            pathname: "/map",
            params: {
              focus: `${r.kind}:${r.id}`,
              at: String(Date.now()),
              sq: query,
            },
          });
        }}
      />
    </View>
  );
}
