import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// Smoke test that react-native-reanimated (UI-thread animation) and
// react-native-gesture-handler (pan gesture) are correctly wired through
// babel + metro. Drag the box; it springs back on release.
export default function GestureSandbox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((e) => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onFinalize(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const boxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.hint}>Drag the box — it springs back.</Text>
      <View style={styles.stage}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.box, boxStyle]} />
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
}

// Provisional tokens (see src/theme/tokens.js): background #F8F8F8, muted #808080,
// Ember #D80000.
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F8F8" },
  hint: { color: "#808080", textAlign: "center", padding: 16 },
  stage: { flex: 1, alignItems: "center", justifyContent: "center" },
  box: { width: 96, height: 96, borderRadius: 20, backgroundColor: "#D80000" },
});
