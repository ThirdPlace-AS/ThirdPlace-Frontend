import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Sheet } from "@/components/Sheet";
import { colors } from "@/theme";

import { MAP_STYLES, type MapStyleKey } from "./mapStyles";

// Base-map layer picker. Uses the shared Sheet (tap-outside-to-close backdrop).
// Selecting a style swaps the native map's styleURL; SoftMap (web/Expo Go) has
// no styles, so this only changes the look on the native map.
//
// The "Auto" row follows the time of day: when `auto` is on it owns the
// highlight and the style rows show no check (the resolved style still renders
// on the map). Picking a style turns auto off; the Auto row turns it back on.
export function MapLayerSheet({
  visible,
  active,
  auto,
  onClose,
  onSelect,
  onEnableAuto,
}: {
  visible: boolean;
  active: MapStyleKey;
  auto: boolean;
  onClose: () => void;
  onSelect: (key: MapStyleKey) => void;
  onEnableAuto: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Kartlag">
      <View className="gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: auto }}
          onPress={() => {
            onEnableAuto();
            onClose();
          }}
          className={`flex-row items-center justify-between rounded-md border px-3 py-3 ${
            auto ? "border-ember bg-ember/10" : "border-line bg-surface"
          }`}
        >
          <Text
            className={`text-base ${auto ? "font-semibold text-ember" : "text-ink"}`}
          >
            Auto (følg tid på døgnet)
          </Text>
          {auto ? (
            <Ionicons name="checkmark" size={20} color={colors.ember} />
          ) : null}
        </Pressable>
        {MAP_STYLES.map((s) => {
          const selected = !auto && s.key === active;
          return (
            <Pressable
              key={s.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                onSelect(s.key);
                onClose();
              }}
              className={`flex-row items-center justify-between rounded-md border px-3 py-3 ${
                selected ? "border-ember bg-ember/10" : "border-line bg-surface"
              }`}
            >
              <Text
                className={`text-base ${selected ? "font-semibold text-ember" : "text-ink"}`}
              >
                {s.label}
              </Text>
              {selected ? (
                <Ionicons name="checkmark" size={20} color={colors.ember} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
