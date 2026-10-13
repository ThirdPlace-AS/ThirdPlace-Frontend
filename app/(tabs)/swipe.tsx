import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { swipeCards } from "@/fixtures";

const THRESHOLD = 120;

// Swipe-card stack — exercises Reanimated 4 (UI-thread animation) + Gesture
// Handler (pan). Fixtures only; no matching/algorithm (BLOCKED_CONTRACT_GAP).
export default function SwipeScreen() {
  const [index, setIndex] = useState(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const advance = () => {
    setIndex((i) => (i + 1) % swipeCards.length);
    x.value = 0;
    y.value = 0;
  };

  const pan = Gesture.Pan()
    .onChange((e) => {
      x.value += e.changeX;
      y.value += e.changeY;
    })
    .onFinalize(() => {
      if (Math.abs(x.value) > THRESHOLD) {
        x.value = withTiming(
          Math.sign(x.value) * 600,
          { duration: 180 },
          () => {
            runOnJS(advance)();
          },
        );
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotateZ: `${x.value / 20}deg` },
    ],
  }));

  const card = swipeCards[index]!;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="gap-1 p-gutter">
        <Text className="text-2xl font-bold text-ink">Sveip</Text>
        <Text className="text-base text-muted">
          Dra kortet for å utforske opplevelser.
        </Text>
      </View>
      <View className="flex-1 items-center justify-center p-gutter">
        <GestureDetector gesture={pan}>
          <Animated.View
            style={cardStyle}
            className="h-96 w-full rounded-lg border border-line bg-surface p-5"
          >
            <View className="self-start rounded-full bg-ink px-3 py-1">
              <Text className="text-xs font-medium text-onInk">{card.tag}</Text>
            </View>
            <View className="flex-1 justify-end gap-1">
              <Text className="text-xl font-bold text-ink">{card.title}</Text>
              <Text className="text-sm text-muted">Vert: {card.host}</Text>
              <Text className="text-sm text-ember">{card.when}</Text>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
}
