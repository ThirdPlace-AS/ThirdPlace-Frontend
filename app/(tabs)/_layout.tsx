import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
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

      {/* Detail routes — rendered inside the tabs so the bottom nav stays
          visible, but hidden from the tab bar itself (href: null). */}
      <Tabs.Screen name="place/[id]" options={{ href: null }} />
      <Tabs.Screen name="business/[id]" options={{ href: null }} />
      <Tabs.Screen name="host/[id]" options={{ href: null }} />
      <Tabs.Screen name="attendees/[id]" options={{ href: null }} />
      <Tabs.Screen name="reviews/[id]" options={{ href: null }} />
      <Tabs.Screen name="group/[id]" options={{ href: null }} />
      <Tabs.Screen name="checkin/[id]" options={{ href: null }} />
      <Tabs.Screen name="verification" options={{ href: null }} />
    </Tabs>
  );
}
