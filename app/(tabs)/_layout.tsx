import { Ionicons } from "@expo/vector-icons";
import {
  BottomTabBar,
  type BottomTabBarProps,
  Tabs,
} from "expo-router/js-tabs";
import { useState } from "react";
import type { ColorValue } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import { browseAnimatedIndex } from "@/components/map/browseSheetProgress";
import { colors } from "@/theme";

type IconName = keyof typeof Ionicons.glyphMap;

function icon(name: IconName) {
  const Comp = ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
  Comp.displayName = `TabIcon(${name})`;
  return Comp;
}

// Tab bar whose visibility tracks the map browse sheet: as the sheet is dragged
// from mid (index 1) to full (index 2) — driven continuously by the sheet's
// live `browseAnimatedIndex` — the bar fades, slides down, AND collapses its
// reserved height to zero so the sheet grows to own the whole screen with no
// leftover strip. On every other screen the sheet stays at index 0, so the bar
// keeps its full height and is fully shown.
function AnimatedTabBar(props: BottomTabBarProps) {
  // Natural bar height, measured once, so we can animate the reserved height
  // between it and 0.
  const [barHeight, setBarHeight] = useState(0);

  // One box: as the sheet approaches full extent, collapse this box's height.
  // The box is bottom-pinned and clips (`overflow: hidden`), so `BottomTabBar`
  // — whose own root View carries the background — slides down and clips out
  // the bottom as a SINGLE OPAQUE element: background and icons move together.
  // No opacity fade (a fading bar would reveal the root background through it,
  // reading as an out-of-sync white layer). Collapsing the height also frees
  // the scene space, so the sheet grows to the bottom with no strip.
  const style = useAnimatedStyle(() => {
    const progress = interpolate(
      browseAnimatedIndex.value,
      [1, 2],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { height: barHeight ? barHeight * (1 - progress) : undefined };
  });

  return (
    <Animated.View
      style={[{ overflow: "hidden" }, style]}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && barHeight === 0) setBarHeight(h);
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
        },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{ title: "Kart", tabBarIcon: icon("map-outline") }}
      />
      <Tabs.Screen
        name="swipe"
        options={{ title: "Sveip", tabBarIcon: icon("albums-outline") }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: "Legg til", tabBarIcon: icon("add-circle-outline") }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: "Chat", tabBarIcon: icon("chatbubbles-outline") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profil", tabBarIcon: icon("person-outline") }}
      />
    </Tabs>
  );
}
