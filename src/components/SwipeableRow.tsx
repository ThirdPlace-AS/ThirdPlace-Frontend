import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

export type SwipeAction = {
  icon: keyof typeof Ionicons.glyphMap;
  bg: string; // action tile background (hex)
  tint: string; // icon color (hex)
  accessibilityLabel: string;
  onPress: () => void;
};

const ACTION_W = 76; // px per revealed action tile (Instagram-like)

// Swipe-a-row-left to reveal trailing actions (Instagram-style), built on
// RNGH's ReanimatedSwipeable so the pan is handled natively and works across
// web + native (tap/long-press on the children keep working). The children
// must be opaque (childrenContainerStyle background) to cover the actions when
// the row is closed.
export function SwipeableRow({
  children,
  actions,
  background,
}: {
  children: React.ReactNode;
  actions: SwipeAction[];
  background: string;
}) {
  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      containerStyle={{ borderRadius: 12, overflow: "hidden" }}
      childrenContainerStyle={{ backgroundColor: background }}
      renderRightActions={(_progress, _translation, methods) => (
        <View className="flex-row">
          {actions.map((a) => (
            <Pressable
              key={a.accessibilityLabel}
              accessibilityRole="button"
              accessibilityLabel={a.accessibilityLabel}
              onPress={() => {
                methods.close();
                a.onPress();
              }}
              style={{ width: ACTION_W, backgroundColor: a.bg }}
              className="items-center justify-center"
            >
              <Ionicons name={a.icon} size={24} color={a.tint} />
            </Pressable>
          ))}
        </View>
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
}
