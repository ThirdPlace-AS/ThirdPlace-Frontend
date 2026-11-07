import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusBarStyle } from "@/components/ui/StatusBarStyle";
import { FadeSwap, HeartToggle, IconButton, Text } from "@/components/ui";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { markerId } from "@/components/map/types/mapPresentation";
import { SignInPrompt } from "@/components/SignInPrompt";
import { showToast } from "@/components/Toast";
import { EmptyState } from "@/components/states/StateView";
import { places, type MockPlace } from "@/fixtures";
import { libImage, photosForPlace } from "@/fixtures/images";
import { PhotoCarousel } from "./PhotoCarousel";
import { media } from "@/theme";
import { Illustration } from "@/components/illustrations/Illustration";
import { formatRating } from "@/lib/format";

// "Steder" deck in Sveip (PDF p7 tab). Place cards with Hopp over / Lagre /
// Vis på kartet. Button-driven (no drag) — the experience deck keeps the full
// gesture engine. Saving writes the shared demo Saved store, so the place
// shows up in Lagret and the map's Lagret mode. No ranking or interest
// signal is recorded (BLOCKED_CONTRACT_GAP).
export function PlaceDeck({
  items = places,
  onExhausted,
}: {
  /** Places after Sveip's filters (default: every place). */
  items?: MockPlace[];
  onExhausted?: (done: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const { isSaved, toggle } = useMapSaved();
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);
  const place = items[index];
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
        <StatusBarStyle style="auto" />
        <EmptyState
          icon="tp-business"
          illustration={<Illustration name="emptyDeck" />}
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
      <StatusBarStyle style="light" />
      {/* Tap left/right to step through the place's photos (≥2 each). */}
      <PhotoCarousel
        key={place.id}
        photos={photosForPlace(place).map(libImage)}
        variant="card"
        indicatorTop={insets.top + 52}
      />
      <View
        className="absolute inset-x-0 bottom-0 gap-3 px-gutter pb-6 pt-24"
        style={{ backgroundColor: media.scrim }}
      >
        {/* The next place fades in with its photo (the text swapped in one
            frame while the photo cross-faded). */}
        <FadeSwap swapKey={place.id} style={{ gap: 12 }}>
          <Text
            variant="display"
            tone="onMedia"
            accessibilityRole="text"
            numberOfLines={2}
          >
            {place.name}
          </Text>
          <Text variant="body" tone="onMedia" className="opacity-85">
            {place.category} · {place.distance} · ★ {formatRating(place.rating)}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {place.vibes.slice(0, 3).map((v) => (
              <View
                key={v}
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: media.fillSubtle }}
              >
                <Text variant="label" tone="onMedia">
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </FadeSwap>
        <View className="flex-row items-center justify-center gap-5 pt-2">
          <IconButton
            icon="close"
            label="Hopp over"
            variant="media"
            size="lg"
            onPress={next}
          />
          <HeartToggle
            kind="bookmark"
            selected={saved}
            variant="media"
            size="xl"
            haptic={!isGuest}
            onToggle={() => {
              if (isGuest) return setSignIn(true);
              toggle(key);
              showToast({
                title: saved ? "Fjernet fra Lagret" : "Lagret",
                body: `${place.name} · tømmes når appen starter på nytt`,
                icon: saved ? "bookmark-outline" : "bookmark",
              });
            }}
          />
          <IconButton
            icon="map-outline"
            label="Vis på kartet"
            variant="media"
            size="lg"
            // Opens this place on the map (its detail), not just the map.
            onPress={() =>
              router.navigate({
                pathname: "/map",
                params: { focus: key, at: String(Date.now()) },
              })
            }
          />
          <IconButton
            icon="arrow-forward"
            label="Neste"
            variant="media"
            size="lg"
            onPress={next}
          />
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
