import { router, useSegments } from "expo-router";

import { Tabs } from "expo-router/js-tabs";
import { type ColorValue } from "react-native";

import { AddTabIcon } from "@/components/AddTabIcon";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { Icon, type IconName } from "@/components/ui";
import { useUnreadChatCount } from "@/lib/chatReads";
import { openAccountSheet } from "@/components/AccountSwitcher";
import { markHintSeen } from "@/lib/hints";
import { media, palette, useThemeColors } from "@/theme";
import { SchemeScope } from "@/theme/ThemeRoot";
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
  const themeColors = useThemeColors();
  // On Sveip the bar is black, part of the dark deck (user 2026-11-25): the
  // deck's base colour with the dark theme's tints, whatever the app theme.
  const onSwipe = (useSegments() as string[]).includes("swipe");
  const colors = onSwipe ? palette.dark : themeColors;
  // Chats with unread messages (Phase 16, the WhatsApp / Instagram tab badge).
  const demoUnread = useUnreadChatCount();
  // A guest has no chats of their own (IJ2): no count on the tab.
  const { isGuest } = useGuestMode();
  const unreadChats = isGuest ? 0 : demoUnread;
  return (
    <Tabs
      // System back returns to the tab you came from (0454), not to Kart
      // each time; on Kart with no history left it closes the app.
      backBehavior="history"
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
          backgroundColor: onSwipe ? media.base : colors.surface,
          borderTopColor: onSwipe ? media.base : colors.line,
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
          // TikTok's stacked button in our colours (founder 2026-11-08); the
          // same look open or not, the label turns ember while open.
          // On Sveip's black bar it takes the dark theme's look (white face).
          tabBarIcon: () =>
            onSwipe ? (
              <SchemeScope scheme="dark">
                <AddTabIcon />
              </SchemeScope>
            ) : (
              <AddTabIcon />
            ),
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
        // PDF p27: a long press on Profil opens the account switcher,
        // the same sheet as Profil's chip (review PR-08, 0526). A guest
        // gets the switcher's lock and Logg inn.
        listeners={{
          tabLongPress: () => {
            markHintSeen("profileSwitch");
            if (isGuest) {
              router.push("/account-switch");
              return;
            }
            router.navigate("/profile");
            openAccountSheet();
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
