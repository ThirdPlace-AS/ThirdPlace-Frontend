import "../global.css";

import { Ionicons } from "@expo/vector-icons";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastHost } from "@/components/Toast";
import { queryClient } from "@/services/api/queryClient";
import { useThemeColors } from "@/theme";
import { ThemeRoot } from "@/theme/ThemeRoot";

export default function RootLayout() {
  // Preload the Ionicons glyph font before first paint. Without this the icon
  // font loads lazily on web and every icon renders blank (tofu) for a frame —
  // most visible on the full-screen swipe card. Gate the app on it so no screen
  // flashes empty glyphs; the holder uses the theme background to avoid a flash.
  // If the font fails, still render — a blank-forever screen is worse than
  // briefly missing glyphs.
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeRoot>
            {fontsLoaded || fontError ? (
              <RootStack />
            ) : (
              <View className="flex-1 bg-background" />
            )}
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
