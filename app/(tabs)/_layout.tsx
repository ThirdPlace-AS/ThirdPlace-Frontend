import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/js-tabs";
import type { ColorValue } from "react-native";

import { colors } from "@/theme";

type IconName = keyof typeof Ionicons.glyphMap;

function icon(name: IconName) {
  const Comp = ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
  Comp.displayName = `TabIcon(${name})`;
  return Comp;
}

// The tab bar is always visible. It used to collapse as the map browse sheet
// reached full extent; that is gone — the sheet tops out within the screen
// scene (above the bar), so the bar simply stays put on every screen.
export default function TabsLayout() {
  return (
    <Tabs
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
