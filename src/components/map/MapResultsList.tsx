import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { DemoBadge } from "@/components/DemoBadge";
import { colors } from "@/theme";

import type { DiscoveryItem } from "./types/mapPresentation";

// List presentation of the active discovery results. Accessible, non-gesture
// alternative to the map markers (journey K + a11y). Row tap opens the detail
// sheet; the row matching the map selection is highlighted so the two views stay
// in sync. The row tap target and the Save control are SIBLINGS (no nested
// buttons). Save writes the in-memory demo store.
export const MapResultsList = memo(function MapResultsList({
  items,
  selectedMarkerId,
  onSelect,
  isSaved,
  onToggleSave,
  demo = false,
  note,
  emptyMessage,
}: {
  items: DiscoveryItem[];
  selectedMarkerId: string | null;
  onSelect: (item: DiscoveryItem) => void;
  isSaved: (markerId: string) => boolean;
  onToggleSave: (item: DiscoveryItem) => void;
  demo?: boolean;
  note?: string;
  emptyMessage: string;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.markerId}
      contentContainerClassName="gap-3 p-gutter pb-28"
      ListHeaderComponent={
        demo ? (
          <View className="mb-1 flex-row items-center gap-2">
            <DemoBadge />
            {note ? <Text className="text-xs text-muted">{note}</Text> : null}
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View className="items-center gap-2 p-gutter">
          <Ionicons name="compass-outline" size={32} color={colors.muted} />
          <Text className="text-center text-sm text-muted">{emptyMessage}</Text>
        </View>
      }
      renderItem={({ item }) => {
        const selected = item.markerId === selectedMarkerId;
        const saved = isSaved(item.markerId);
        return (
          <View
            className={`flex-row gap-3 rounded-lg border bg-surface p-3 ${
              selected ? "border-ink" : "border-line"
            }`}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${item.title}, ${item.category}, ${item.subtitle}`}
              onPress={() => onSelect(item)}
              className="flex-1 flex-row gap-3"
            >
              <View className="h-14 w-14 items-center justify-center rounded-md bg-surfaceMuted">
                <Ionicons name="image-outline" size={22} color={colors.muted} />
              </View>
              <View className="flex-1 justify-center gap-0.5">
                <Text
                  className="text-base font-semibold text-ink"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-sm text-muted" numberOfLines={1}>
                  {item.category} · {item.subtitle}
                </Text>
                {item.meta ? (
                  <Text className="text-sm text-ink" numberOfLines={1}>
                    {item.meta}
                  </Text>
                ) : null}
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={saved ? "Fjern fra lagret" : "Lagre"}
              accessibilityState={{ selected: saved }}
              onPress={() => onToggleSave(item)}
              hitSlop={8}
              className="justify-center"
            >
              <Ionicons
                name={saved ? "heart" : "heart-outline"}
                size={22}
                color={saved ? colors.ember : colors.muted}
              />
            </Pressable>
          </View>
        );
      }}
    />
  );
});
