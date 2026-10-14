import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

import { motion } from "@/theme";

import {
  DEMO_MODES,
  DISCOVERY_MODE_LABELS,
  DISCOVERY_MODES,
  type DiscoveryMode,
} from "./types/mapPresentation";

// Horizontal discovery-mode selector with a subtle animated active underline.
// `role="tab"` + selected state announced for screen readers. For You / Friends
// get a small "demo" dot (non-personalized shells — see docs/map/MAP_BLOCKERS.md).
export function DiscoveryModeTabs({
  mode,
  onChange,
}: {
  mode: DiscoveryMode;
  onChange: (m: DiscoveryMode) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-5 px-1"
      accessibilityRole="tablist"
    >
      {DISCOVERY_MODES.map((m) => {
        const selected = m === mode;
        const isDemo = DEMO_MODES.includes(m);
        return (
          <Pressable
            key={m}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={
              isDemo
                ? `${DISCOVERY_MODE_LABELS[m]} (demo)`
                : DISCOVERY_MODE_LABELS[m]
            }
            onPress={() => onChange(m)}
            className="items-center gap-1 py-1"
          >
            <View className="flex-row items-center gap-1">
              <Text
                className={`text-sm ${
                  selected ? "font-bold text-ink" : "font-medium text-muted"
                }`}
              >
                {DISCOVERY_MODE_LABELS[m]}
              </Text>
              {isDemo ? (
                <View className="h-1.5 w-1.5 rounded-full bg-ember" />
              ) : null}
            </View>
            {selected ? (
              <Animated.View
                entering={
                  reduced ? undefined : FadeIn.duration(motion.duration.fast)
                }
                className="h-0.5 w-full rounded-full bg-ink"
              />
            ) : (
              <View className="h-0.5 w-full" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
