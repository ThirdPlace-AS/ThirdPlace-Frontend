import { router } from "expo-router";

import { Tabs } from "expo-router/js-tabs";
import { type ColorValue } from "react-native";

import { Icon, type IconName } from "@/components/ui";
import { useUnreadChatCount } from "@/lib/chatReads";
import { haptics } from "@/lib/haptics";
import { markHintSeen } from "@/lib/hints";
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

// The tab bar is always visible. It used to collapse as the map browse sheet
// reached full extent; that is gone — the sheet tops out within the screen
// scene (above the bar), so the bar simply stays put on every screen.
export default function TabsLayout() {
  const colors = useThemeColors();
  // Chats with unread messages (Phase 16, the WhatsApp / Instagram tab badge).
  const unreadChats = useUnreadChatCount();
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
          // Same convention as the other tabs (founder 2026-11-07): a plus in
          // a rounded square, outline and grey while idle, filled ember while
          // open. It replaced the TikTok-style button of 2026-11-06.
          tabBarIcon: icon("tp-add", "tp-add-filled"),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: icon("chatbubbles-outline", "chatbubbles"),
          tabBarBadge: unreadChats > 0 ? unreadChats : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.emberStrong,
            color: colors.onEmber,
            fontFamily: fontFamilyFor("bold"),
            fontSize: 11,
          },
          tabBarAccessibilityLabel:
            unreadChats > 0
              ? `Chat, ${unreadChats} ${unreadChats === 1 ? "ulest samtale" : "uleste samtaler"}`
              : "Chat",
        }}
      />
      <Tabs.Screen
        name="profile"
        // PDF p27: a long press on Profil opens the account switcher.
        listeners={{
          tabLongPress: () => {
            haptics.selection();
            // Found the gesture: its one-time tip is no longer needed.
            markHintSeen("profileSwitch");
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
