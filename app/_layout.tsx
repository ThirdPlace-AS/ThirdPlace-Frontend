import "../global.css";

import { Ionicons } from "@expo/vector-icons";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ReducedMotionConfig, ReduceMotion } from "react-native-reanimated";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { ToastHost } from "@/components/Toast";
import { PIN_GLYPH_FONT } from "@/components/ui/PinGlyph";
import { RootPortalHost } from "@/components/ui/RootPortal";
import { queryClient } from "@/services/api/queryClient";
import { useThemeColors } from "@/theme";
import { fontAssets } from "@/theme/fonts";
import { ThemeRoot } from "@/theme/ThemeRoot";
import { useA11yPrefs } from "@/lib/a11yPrefs";
import {
  hydrateDeviceSettings,
  useDeviceSettingsReady,
} from "@/lib/deviceSettings";

// A crash anywhere below shows the p26 "Noe gikk galt" screen with "Prøv
// igjen" instead of a blank or red screen (Phase 15).
export { CrashScreen as ErrorBoundary } from "@/features/system/CrashScreen";

export default function RootLayout() {
  // Preload the Ionicons glyph font before first paint. Without this the icon
  // font loads lazily on web and every icon renders blank (tofu) for a frame —
  // most visible on the full-screen swipe card. Gate the app on it so no screen
  // flashes empty glyphs; the holder uses the theme background to avoid a flash.
  // If the font fails, still render — a blank-forever screen is worse than
  // briefly missing glyphs.
  // Device settings (map type and style, Tilgjengelighet) load from the phone
  // behind the same gate, so the first screen already uses them (Phase 15).
  const settingsReady = useDeviceSettingsReady();
  useEffect(() => {
    void hydrateDeviceSettings();
  }, []);
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    // Map pin glyphs (Material Community Icons, Phase 19): loaded before the
    // map mounts, so a pin image is never copied with a blank glyph.
    ...PIN_GLYPH_FONT,
    // Brand typeface (src/theme/fonts.ts) — same gate, so text never
    // flashes in the fallback font.
    ...fontAssets,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Seed the insets from the native window so the first frame of a
          deep-linked stack screen never lays its header out with a 0 top
          inset (fresh-eyes review H1). */}
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <ThemeRoot>
            {(fontsLoaded || fontError) && settingsReady ? (
              <RootStack />
            ) : (
              <View className="flex-1 bg-background" />
            )}
            <RootPortalHost />
            <ToastHost />
            <MotionPreference />
          </ThemeRoot>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// "Reduser bevegelse" (Tilgjengelighet, Phase 15) turns Reanimated's own
// animations off app-wide, as the phone's setting does; useReducedMotion
// covers the rest. Reanimated logs the override in development.
LogBox.ignoreLogs(["Reduced motion setting is overwritten"]);
function MotionPreference() {
  const { reduceMotion } = useA11yPrefs();
  return reduceMotion ? (
    <ReducedMotionConfig mode={ReduceMotion.Always} />
  ) : null;
}

function RootStack() {
  // Screen containers follow the active scheme (react-navigation defaults to white).
  const c = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      {/* Account switcher (PDF p27) floats over the current screen. */}
      <Stack.Screen
        name="account-switch"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
