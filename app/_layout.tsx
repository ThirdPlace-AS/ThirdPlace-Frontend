import "../global.css";

import { Ionicons } from "@expo/vector-icons";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { ToastHost } from "@/components/Toast";
import { RootPortalHost } from "@/components/ui/RootPortal";
import { queryClient } from "@/services/api/queryClient";
import { useThemeColors } from "@/theme";
import { fontAssets } from "@/theme/fonts";
import { ThemeRoot } from "@/theme/ThemeRoot";

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
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
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
            {fontsLoaded || fontError ? (
              <RootStack />
            ) : (
              <View className="flex-1 bg-background" />
            )}
            <RootPortalHost />
            <ToastHost />
          </ThemeRoot>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
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
