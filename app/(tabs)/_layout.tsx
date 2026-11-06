import { router } from "expo-router";

import { Tabs } from "expo-router/js-tabs";
import { View, type ColorValue } from "react-native";

import { Icon, type IconName } from "@/components/ui";
import { haptics } from "@/lib/haptics";
import { useThemeColors } from "@/theme";
import { fontFamilyFor } from "@/theme/fonts";

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
    // The navigator supplies the colour (ember active / muted idle); size is
    // the lg token (24), which is what the navigator asks for.
  }) => <Icon name={focused ? active : idle} color={String(color)} size="lg" />;
  Comp.displayName = `TabIcon(${idle})`;
  return Comp;
}

// Center "Legg til" per the design (PDF p5–p8): a dark round "+" with the
// "Legg til" label underneath, like the other tabs.
function AddIcon() {
  return (
    <View className="h-9 w-9 items-center justify-center rounded-full bg-ink">
      <Icon name="add" size="lg" tone="onInk" />
    </View>
  );
}

// The tab bar is always visible. It used to collapse as the map browse sheet
// reached full extent; that is gone — the sheet tops out within the screen
// scene (above the bar), so the bar simply stays put on every screen.
export default function TabsLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // The bar would ride on top of the keyboard (Add steps, chat search).
        tabBarHideOnKeyboard: true,
        // Active tab icon + label in Airbnb pink #FF385C (founder 2026-11-06);
        // the filled glyph marks the active tab too, so colour isn't alone.
        tabBarActiveTintColor: colors.ember,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fontFamilyFor("medium") },
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
          tabBarIcon: icon("tp-swipe", "tp-swipe-filled"),
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
        listeners={{
          tabLongPress: () => {
            haptics.selection();
            router.push("/account-switch");
          },
        }}
        options={{
          title: "Profil",
          tabBarIcon: icon("person-outline", "person"),
        }}
      />
    </Tabs>
  );
}
