import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Button } from "@/components/Button";
import { Icon, type IconName, Text } from "@/components/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { elevation, motion } from "@/theme";

// A one-time tip for a gesture the screen does not show (Phase 18, from the
// screen benchmark: one coach mark for one hidden gesture, YouTube / Apple
// TipKit). The caller decides when it shows (src/lib/hints.ts: once per
// phone, one per session) and marks it seen on "Skjønner" or when the
// gesture is used. Layout on plain Views, fade on the Animated one.
export function HintBanner({
  icon,
  text,
  onDone,
}: {
  icon: IconName;
  text: string;
  onDone: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      entering={reduced ? undefined : FadeIn.duration(motion.duration.base)}
      exiting={reduced ? undefined : FadeOut.duration(motion.duration.fast)}
    >
      <View
        accessibilityLiveRegion="polite"
        className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-3"
        style={elevation.e1}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted">
          <Icon name={icon} size="md" tone="ink" />
        </View>
        <Text variant="label" weight="regular" className="flex-1">
          {text}
        </Text>
        <Button
          label="Skjønner"
          size="sm"
          variant="outline"
          rounded="full"
          fullWidth={false}
          onPress={onDone}
        />
      </View>
    </Animated.View>
  );
}
