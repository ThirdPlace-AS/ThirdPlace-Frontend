import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

// Top overlay filter bar. A sliders button opens the Filtre sheet, a horizontal
// row of mode text-tabs (selected = dark pill, the rest plain text), and a
// notifications bell on the right.
//
// The tabs follow the design (PDF p7): For deg · Opplevelser · Steder. "For deg"
// is a NON-PERSONALIZED demo shell (DEMO_MODES rule — no invented ranking);
// "Opplevelser" is the plain experience deck; "Steder" is the place deck (not
// built yet — honest empty state). Group swipe is its own flow ("Start
// gruppe-sveip", PDF p8), not a tab. Local filtering lives in the Filtre sheet.
export type SwipeMode = "forYou" | "experiences" | "places";

export const SWIPE_MODES: { key: SwipeMode; label: string }[] = [
  { key: "forYou", label: "For deg" },
  { key: "experiences", label: "Opplevelser" },
  { key: "places", label: "Steder" },
];

export function SwipeFilterBar({
  mode,
  onSelectMode,
  onOpenFilters,
  filterActive,
  onOpenNotifications,
  unreadCount,
  onLight = false,
}: {
  mode: SwipeMode;
  onSelectMode: (m: SwipeMode) => void;
  onOpenFilters: () => void;
  filterActive: boolean;
  onOpenNotifications: () => void;
  unreadCount: number;
  // True when the bar sits over a light screen (empty / Steder states) rather
  // than a photo — glyphs and text switch to ink.
  onLight?: boolean;
}) {
  const glyph = onLight ? "#202020" : "#FFFFFF";
  return (
    <View className="flex-row items-center gap-2 px-gutter">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filtre"
        onPress={onOpenFilters}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name="options-outline" size={24} color={glyph} />
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
                active
                  ? {
                      backgroundColor: onLight ? "#202020" : "rgba(0,0,0,0.65)",
                    }
                  : undefined
              }
              className={active ? "rounded-full px-4 py-2" : "px-3 py-2"}
            >
              <Text
                className={`text-sm ${
                  active
                    ? "font-bold text-white"
                    : onLight
                      ? "font-medium text-muted"
                      : "font-medium text-white/70"
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
        style={{
          backgroundColor: onLight ? "transparent" : "rgba(0,0,0,0.35)",
        }}
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <Ionicons name="notifications-outline" size={20} color={glyph} />
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
