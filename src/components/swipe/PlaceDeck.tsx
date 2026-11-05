import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { markerId } from "@/components/map/types/mapPresentation";
import { SignInPrompt } from "@/components/SignInPrompt";
import { showToast } from "@/components/Toast";
import { EmptyState } from "@/components/states/StateView";
import { places } from "@/fixtures";
import { coverForPlace, libImage } from "@/fixtures/images";
import { useThemeColors, media } from "@/theme";

// "Steder" deck in Sveip (PDF p7 tab). Place cards with Hopp over / Lagre /
// Vis på kartet. Button-driven (no drag) — the experience deck keeps the full
// gesture engine. Saving writes the shared demo Saved store, so the place
// shows up in Lagret and the map's Lagret mode. No ranking or interest
// signal is recorded (BLOCKED_CONTRACT_GAP).
export function PlaceDeck({
  onExhausted,
}: {
  onExhausted?: (done: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const { isSaved, toggle } = useMapSaved();
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);
  const place = places[index];
  const done = !place;
  useEffect(() => {
    onExhausted?.(done);
  }, [done, onExhausted]);

  if (!place) {
    return (
      <View
        className="flex-1 justify-center bg-background"
        style={{ paddingTop: insets.top }}
      >
        <StatusBar style="dark" />
        <EmptyState
          icon="storefront-outline"
          title="Du har sett alle stedene"
          message="Utforsk kartet for flere, eller se gjennom dem på nytt."
          actionLabel="Se stedene igjen"
          onAction={() => setIndex(0)}
          secondaryLabel="Utforsk kartet"
          onSecondary={() => router.navigate("/map")}
        />
      </View>
    );
  }

  const key = markerId("place", place.id);
  const saved = isSaved(key);
  const next = () => setIndex((i) => i + 1);

  return (
    <View className="flex-1 bg-ink">
      <StatusBar style="light" />
      <Image
        source={libImage(coverForPlace(place))}
        contentFit="cover"
        transition={150}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        accessibilityLabel={place.name}
      />
      <View
        className="absolute inset-x-0 bottom-0 gap-3 px-gutter pb-6 pt-24"
        style={{ backgroundColor: media.scrim }}
      >
        <Text className="text-3xl font-bold text-white" numberOfLines={2}>
          {place.name}
        </Text>
        <Text className="text-base text-white/85 font-normal">
          {place.category} · {place.distance} · ★ {place.rating.toFixed(1)}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {place.vibes.slice(0, 3).map((v) => (
            <View key={v} className="rounded-full bg-black/50 px-3 py-1">
              <Text className="text-sm font-medium text-white">{v}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row items-center justify-center gap-5 pt-2">
          <Round icon="close" label="Hopp over" onPress={next} />
          <Round
            icon={saved ? "bookmark" : "bookmark-outline"}
            label={saved ? "Fjern fra lagret" : "Lagre"}
            big
            onPress={() => {
              if (isGuest) return setSignIn(true);
              toggle(key);
              showToast({
                title: saved ? "Fjernet fra Lagret" : "Lagret",
                body: `${place.name} · demo — tømmes ved omstart`,
                icon: saved ? "bookmark-outline" : "bookmark",
              });
            }}
          />
          <Round
            icon="map-outline"
            label="Vis på kartet"
            onPress={() => router.navigate("/map")}
          />
          <Round icon="arrow-forward" label="Neste" onPress={next} />
        </View>
      </View>
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="lagre steder"
      />
    </View>
  );
}

function Round({
  icon,
  label,
  big,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  big?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const size = big ? 64 : 52;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ height: size, width: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-black/55 active:opacity-80"
    >
      <Ionicons
        name={icon}
        size={big ? 28 : 22}
        color={big ? colors.ember : media.onMedia}
      />
    </Pressable>
  );
}
