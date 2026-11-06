import { ScrollView, View } from "react-native";

import { IconButton, Pressable, Text } from "@/components/ui";
import { media } from "@/theme";

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
  onOpenGroup,
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
  // Opens "Start gruppe-sveip" (PDF p8).
  onOpenGroup?: () => void;
}) {
  const iconVariant = onLight ? "ghost" : "media";
  const iconTone = onLight ? "ink" : "onMedia";
  return (
    <View className="flex-row items-center gap-xs px-gutter">
      <IconButton
        icon="options-outline"
        label="Filtre"
        variant="ghost"
        size="sm"
        tone={iconTone}
        badge={filterActive}
        onPress={onOpenFilters}
      />

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
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
              haptic="selection"
              pressedScale={0.95}
              onPress={() => onSelectMode(m.key)}
              // Over a photo the selected pill is a light surface with ink text
              // (a dark scrim pill barely showed against a dark photo); on a
              // light screen it is the theme ink (so it also works in dark mode).
              contentClassName={
                active
                  ? `rounded-full px-3.5 py-2 ${onLight ? "bg-ink" : ""}`
                  : "px-2.5 py-2"
              }
              contentStyle={
                active && !onLight
                  ? { backgroundColor: media.surface }
                  : undefined
              }
            >
              <Text
                variant="caption"
                weight={active ? "bold" : "medium"}
                tone={
                  active
                    ? onLight
                      ? "onInk"
                      : "onMedia"
                    : onLight
                      ? "muted"
                      : "onMedia"
                }
                className={!active && !onLight ? "opacity-70" : undefined}
                style={
                  active && !onLight ? { color: media.inkOnLight } : undefined
                }
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {onOpenGroup ? (
        <IconButton
          icon="people-outline"
          label="Start gruppe-sveip"
          variant={iconVariant}
          size="sm"
          tone={iconTone}
          onPress={onOpenGroup}
        />
      ) : null}

      {/* Notifications bell (opens the demo notifications sheet), with an unread
          count badge — same affordance as the map's top bar. */}
      <IconButton
        icon="notifications-outline"
        label="Varsler"
        variant={iconVariant}
        size="sm"
        tone={iconTone}
        badge={unreadCount}
        onPress={onOpenNotifications}
      />
    </View>
  );
}
