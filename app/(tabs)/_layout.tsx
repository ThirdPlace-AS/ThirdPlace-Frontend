import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/js-tabs";
import { View, type ColorValue } from "react-native";

import { colors } from "@/theme";

type IconName = keyof typeof Ionicons.glyphMap;

// Outline when idle, filled when active — the usual iOS/Android tab convention.
function icon(idle: IconName, active: IconName) {
  const Comp = ({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) => <Ionicons name={focused ? active : idle} color={color} size={size} />;
  Comp.displayName = `TabIcon(${idle})`;
  return Comp;
}

// Center "Legg til": the one primary action, so it gets the brand fill instead
// of a plain glyph. Label hidden visually; the tab title stays the a11y name.
function AddIcon({ focused }: { focused: boolean }) {
  return (
    <View
      className={`h-10 w-14 items-center justify-center rounded-2xl ${
        focused ? "bg-ink" : "bg-ember"
      }`}
    >
      <Ionicons name="add" size={26} color={colors.onEmber} />
    </View>
  );
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
        options={{ title: "Kart", tabBarIcon: icon("map-outline", "map") }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: "Sveip",
          tabBarIcon: icon("albums-outline", "albums"),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Legg til",
          tabBarLabel: () => null,
          tabBarIcon: AddIcon,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: icon("chatbubbles-outline", "chatbubbles"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: icon("person-outline", "person"),
        }}
      />
    </Tabs>
  );
}
