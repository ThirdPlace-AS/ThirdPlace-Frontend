import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/ui";
import { Sheet } from "@/components/Sheet";

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
            className={`font-normal text-base ${auto ? "font-semibold text-emberText" : "text-ink"}`}
          >
            Auto (følg tid på døgnet)
          </Text>
          {auto ? <Icon name="checkmark" size="md" tone="ember" /> : null}
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
                className={`font-normal text-base ${selected ? "font-semibold text-emberText" : "text-ink"}`}
              >
                {s.label}
              </Text>
              {selected ? (
                <Icon name="checkmark" size="md" tone="ember" />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
