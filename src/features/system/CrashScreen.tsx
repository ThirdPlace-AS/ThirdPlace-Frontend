import { router, type ErrorBoundaryProps } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { palette } from "@/theme";
import { fontFamilyFor } from "@/theme/fonts";

// Crash screen (Phase 15): the root error boundary, in the design of the PDF
// p26 error state ("Noe gikk galt"; its "Feilkode" line is left out, since no
// error codes exist). It replaces the root layout, so it cannot use the
// providers that layout sets up (theme variables, safe-area insets, portals):
// plain views, the static light palette and the brand font by name.
export function CrashScreen({ retry }: ErrorBoundaryProps) {
  const c = palette.light;
  const toMap = () => {
    router.replace("/map");
    setTimeout(() => void retry(), 0);
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 24,
        backgroundColor: c.background,
      }}
    >
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: fontFamilyFor("bold"),
          fontSize: 24,
          lineHeight: 30,
          textAlign: "center",
          color: c.ink,
        }}
      >
        Noe gikk galt
      </Text>
      <Text
        style={{
          fontFamily: fontFamilyFor("regular"),
          fontSize: 16,
          lineHeight: 22,
          textAlign: "center",
          color: c.muted,
          marginBottom: 12,
        }}
      >
        Vi klarte ikke å laste dette akkurat nå. Prøv igjen eller gå tilbake til
        kartet.
      </Text>
      <CrashButton label="Prøv igjen" primary onPress={() => void retry()} />
      <CrashButton label="Til kartet" onPress={toMap} />
    </View>
  );
}

function CrashButton({
  label,
  primary = false,
  onPress,
}: {
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  const c = palette.light;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: primary ? c.ink : c.line,
        backgroundColor: primary ? c.ink : c.surface,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: fontFamilyFor("semibold"),
          fontSize: 16,
          color: primary ? c.onInk : c.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
