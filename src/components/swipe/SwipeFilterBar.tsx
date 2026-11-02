import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

// Top overlay filter bar. A sliders button opens the Filtre sheet, a horizontal
// row of mode text-tabs (selected = dark pill, the rest plain text), and a
// notifications bell on the right.
//
// The modes are audience shells (Master §7 solo vs group swipe). "For deg" is the
// solo deck; "Gruppeaktivitet" and "Reiserute" are NON-PERSONALIZED demo shells
// (DEMO_MODES rule) — same deck + a demo note, no invented ranking or group
// matching (BLOCKED_CONTRACT_GAP). The real local filtering (interests / Når /
// availability) lives in the Filtre sheet, not here.
export type SwipeMode = "forYou" | "group" | "itinerary";

export const SWIPE_MODES: { key: SwipeMode; label: string }[] = [
  { key: "forYou", label: "For deg" },
  { key: "group", label: "Gruppeaktivitet" },
  { key: "itinerary", label: "Reiserute" },
];

export function SwipeFilterBar({
  mode,
  onSelectMode,
  onOpenFilters,
  filterActive,
  onOpenNotifications,
  unreadCount,
}: {
  mode: SwipeMode;
  onSelectMode: (m: SwipeMode) => void;
  onOpenFilters: () => void;
  filterActive: boolean;
  onOpenNotifications: () => void;
  unreadCount: number;
}) {
  return (
    <View className="flex-row items-center gap-2 px-gutter">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filtre"
        onPress={onOpenFilters}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name="options-outline" size={24} color="#FFFFFF" />
        {filterActive ? (
          <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ember" />
        ) : null}
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, alignItems: "center" }}
        className="flex-1"
      >
        {SWIPE_MODES.map((m) => {
          const active = m.key === mode;
          return (
            <Pressable
              key={m.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelectMode(m.key)}
              style={
                active ? { backgroundColor: "rgba(0,0,0,0.65)" } : undefined
              }
              className={active ? "rounded-full px-4 py-2" : "px-3 py-2"}
            >
              <Text
                className={`text-sm ${
                  active ? "font-bold text-white" : "font-medium text-white/70"
                }`}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Notifications bell (opens the demo notifications sheet), with an unread
          count badge — same affordance as the map's top bar. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Varsler"
        onPress={onOpenNotifications}
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
        {unreadCount > 0 ? (
          <View className="absolute -right-0.5 -top-0.5 h-4 w-4 items-center justify-center rounded-full bg-ember">
            <Text className="text-[9px] font-bold text-onEmber">
              {unreadCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
