import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { DemoBadge } from "@/components/DemoBadge";
import { colors, motion } from "@/theme";

import type { DiscoveryItem } from "./types/mapPresentation";

// Floating contextual preview for the selected marker/list row. Drag up (or tap)
// to expand into the full detail sheet; drag down to dismiss. Reanimated + Gesture
// Handler; honors reduced motion. The Save toggle writes the in-memory demo store
// (persistence is CONTRACT-BLOCKED).
export function MapPreviewCard({
  item,
  saved,
  onToggleSave,
  onExpand,
  onDismiss,
  demo = false,
  note,
}: {
  item: DiscoveryItem;
  saved: boolean;
  onToggleSave: () => void;
  onExpand: () => void;
  onDismiss: () => void;
  demo?: boolean;
  note?: string;
}) {
  const reduced = useReducedMotion();
  const ty = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((e) => {
      ty.value += e.changeY;
    })
    .onEnd((e) => {
      const commitUp =
        ty.value < -motion.gesture.dragCommitPx ||
        e.velocityY < -motion.gesture.flingVelocity;
      const commitDown =
        ty.value > motion.gesture.dragCommitPx ||
        e.velocityY > motion.gesture.flingVelocity;
      if (commitUp) {
        runOnJS(onExpand)();
      } else if (commitDown) {
        runOnJS(onDismiss)();
      } else {
        ty.value = withSpring(0, motion.spring.snappy);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        entering={
          reduced ? undefined : SlideInDown.duration(motion.duration.base)
        }
        exiting={
          reduced ? undefined : SlideOutDown.duration(motion.duration.fast)
        }
        style={style}
        className="rounded-lg border border-line bg-surface p-3 shadow-sm"
        accessibilityLabel={`Forhåndsvisning: ${item.title}`}
      >
        {/* drag handle */}
        <View className="mb-2 h-1 w-10 self-center rounded-full bg-line" />

        <Pressable
          accessibilityRole="button"
          accessibilityHint="Åpne detaljer"
          onPress={onExpand}
          className="flex-row gap-3"
        >
          <View className="h-16 w-16 items-center justify-center rounded-md bg-surfaceMuted">
            <Ionicons name="image-outline" size={24} color={colors.muted} />
          </View>
          <View className="flex-1 justify-center gap-0.5">
            {demo ? (
              <View className="mb-0.5 flex-row items-center gap-2">
                <DemoBadge />
                {note ? (
                  <Text className="text-[10px] text-muted">{note}</Text>
                ) : null}
              </View>
            ) : null}
            <Text className="text-base font-bold text-ink" numberOfLines={1}>
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
          <View className="items-center justify-between py-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={saved ? "Fjern fra lagret" : "Lagre"}
              accessibilityState={{ selected: saved }}
              onPress={onToggleSave}
              hitSlop={8}
            >
              <Ionicons
                name={saved ? "heart" : "heart-outline"}
                size={24}
                color={saved ? colors.ember : colors.muted}
              />
            </Pressable>
            <Ionicons name="chevron-up" size={20} color={colors.muted} />
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
