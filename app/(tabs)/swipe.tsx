import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { DemoBadge } from "@/components/DemoBadge";
import { EmptyState } from "@/components/states/StateView";
import { swipeCards } from "@/fixtures";
import { colors } from "@/theme";

const THRESHOLD = 110;

// Swipe-card stack (PDF 7-8) — exercises Reanimated 4 + Gesture Handler. Fixtures
// only; no scoring, interest registration, group matching or GPS join exists
// (BLOCKED_CONTRACT_GAP). Left = "pass", right = "join" (DEMO).
export default function SwipeScreen() {
  const [index, setIndex] = useState(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const reduced = useReducedMotion();

  const done = index >= swipeCards.length;

  const advance = () => {
    setIndex((i) => i + 1);
    x.value = 0;
    y.value = 0;
  };

  const fling = (dir: 1 | -1) => {
    x.value = withTiming(dir * 600, { duration: 180 }, () =>
      runOnJS(advance)(),
    );
  };

  const pan = Gesture.Pan()
    .enabled(!done)
    .onChange((e) => {
      x.value += e.changeX;
      y.value += e.changeY;
    })
    .onFinalize(() => {
      if (Math.abs(x.value) > THRESHOLD) {
        x.value = withTiming(Math.sign(x.value) * 600, { duration: 180 }, () =>
          runOnJS(advance)(),
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
      { rotateZ: reduced ? "0deg" : `${x.value / 20}deg` },
    ],
  }));
  const likeStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, x.value / THRESHOLD),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, -x.value / THRESHOLD),
  }));

  const card = done ? null : swipeCards[index]!;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="gap-1 p-gutter">
        <Text className="text-2xl font-bold text-ink">Sveip</Text>
        <Text className="text-base text-muted">
          Dra kortet, eller bruk knappene. Demo — ingen reell påmelding.
        </Text>
      </View>

      {done ? (
        <EmptyState
          icon="albums-outline"
          title="Tomt for nå"
          message="Du har sett alle forslagene. Kom tilbake senere for flere."
          actionLabel="Start på nytt"
          onAction={() => setIndex(0)}
        />
      ) : (
        <>
          <View className="flex-1 items-center justify-center p-gutter">
            <GestureDetector gesture={pan}>
              <Animated.View
                style={cardStyle}
                className="h-96 w-full overflow-hidden rounded-lg border border-line bg-surface"
              >
                {/* media placeholder */}
                <View className="h-48 items-center justify-center bg-surfaceMuted">
                  <Ionicons
                    name="image-outline"
                    size={40}
                    color={colors.muted}
                  />
                </View>
                <Animated.View
                  style={likeStyle}
                  className="absolute left-4 top-4 rounded-md border-2 border-success px-3 py-1"
                >
                  <Text className="text-lg font-extrabold text-success">
                    BLI MED
                  </Text>
                </Animated.View>
                <Animated.View
                  style={nopeStyle}
                  className="absolute right-4 top-4 rounded-md border-2 border-danger px-3 py-1"
                >
                  <Text className="text-lg font-extrabold text-danger">
                    HOPP OVER
                  </Text>
                </Animated.View>
                <View className="flex-1 gap-1 p-5">
                  <View className="flex-row items-center justify-between">
                    <View className="self-start rounded-full bg-ink px-3 py-1">
                      <Text className="text-xs font-medium text-onInk">
                        {card!.tag}
                      </Text>
                    </View>
                    <DemoBadge />
                  </View>
                  <View className="flex-1 justify-end gap-1">
                    <Text className="text-xl font-bold text-ink">
                      {card!.title}
                    </Text>
                    <Text className="text-sm text-muted">
                      Vert: {card!.host}
                    </Text>
                    <Text className="text-sm text-ember">{card!.when}</Text>
                    <Text className="text-sm text-muted">{card!.spots}</Text>
                  </View>
                </View>
              </Animated.View>
            </GestureDetector>
          </View>

          {/* action buttons — accessible alternative to swiping */}
          <View className="flex-row justify-center gap-8 p-gutter">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hopp over"
              onPress={() => fling(-1)}
              className="h-16 w-16 items-center justify-center rounded-full border border-line bg-surface"
            >
              <Ionicons name="close" size={28} color={colors.danger} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bli med"
              onPress={() => fling(1)}
              className="h-16 w-16 items-center justify-center rounded-full bg-ember"
            >
              <Ionicons name="heart" size={26} color={colors.onEmber} />
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
