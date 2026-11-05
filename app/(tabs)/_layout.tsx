import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

// Center "Legg til" per the design (PDF p5–p8): a dark round "+" with the
// "Legg til" label underneath, like the other tabs.
function AddIcon() {
  return (
    <View className="h-9 w-9 items-center justify-center rounded-full bg-ink">
      <Ionicons name="add" size={24} color={colors.onEmber} />
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
        // PDF: the active tab's icon + label are Ember; the rest muted.
        tabBarActiveTintColor: colors.ember,
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
        // PDF p27: a long press on Profil opens the account switcher.
        listeners={{ tabLongPress: () => router.push("/account-switch") }}
        options={{
          title: "Profil",
          tabBarIcon: icon("person-outline", "person"),
        }}
      />
    </Tabs>
  );
}
