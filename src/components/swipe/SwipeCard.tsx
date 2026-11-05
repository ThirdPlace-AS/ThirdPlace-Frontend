import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui";
import { DemoBadge } from "@/components/DemoBadge";
import { media } from "@/theme";
import { places, type MockExperience } from "@/fixtures";

import { experienceAvailability } from "./availability";
import { PhotoCarousel } from "./PhotoCarousel";

// Leading icon per tag — still used by the Filtre sheet's interest chips.
const TAG_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Sosialt: "people-outline",
  Kaffe: "cafe-outline",
  Bøker: "book-outline",
  Diskusjon: "chatbubbles-outline",
  Vin: "wine-outline",
  Smaking: "restaurant-outline",
  Trening: "barbell-outline",
  Løping: "walk-outline",
  Spill: "game-controller-outline",
  Foto: "camera-outline",
  Kultur: "color-palette-outline",
};
export const tagIcon = (t: string): keyof typeof Ionicons.glyphMap =>
  TAG_ICONS[t] ?? "pricetag-outline";

// One icon + text meta row (location / date / spots). White, bright, single-line.
function InfoRow({
  icon,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  children: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name={icon} size="sm" tone="onMedia" />
      <Text className="text-[15px] text-white/95 font-normal" numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

// Interest pills — text-only dark discs with white labels (the reference's
// interest row carries no leading icon). Capped so a long tag list never pushes
// the block into the action discs.
function TagPills({ tags }: { tags: string[] }) {
  const shown = tags.slice(0, 4);
  const extra = tags.length - shown.length;
  return (
    <View className="flex-row flex-wrap gap-2">
      {shown.map((t) => (
        <View
          key={t}
          className="rounded-full px-3.5 py-1.5"
          style={{ backgroundColor: media.scrimStrong }}
        >
          <Text className="text-[15px] font-medium text-white">{t}</Text>
        </View>
      ))}
      {extra > 0 ? (
        <View
          className="rounded-full px-3.5 py-1.5"
          style={{ backgroundColor: media.scrimStrong }}
        >
          <Text className="text-[15px] font-medium text-white">{`+${extra}`}</Text>
        </View>
      ) : null}
    </View>
  );
}

// `SWIPE_CONTENT_BOTTOM` places the BOTTOM of the info block a fixed distance
// above the TOP of the action row, so the gap is the same on every card (the
// block is bottom-anchored). The block is now a single consolidated overlay
// (name + meta + interests) shown on every photo — the per-photo info facet was
// dropped so info no longer depends on how many photos a card happens to have.
export const SWIPE_CONTENT_BOTTOM = 120;

// A single full-bleed swipe card (presentational only — no gesture/animation).
// The photo fills the whole card edge-to-edge; a top + bottom gradient keep the
// overlaid filter bar and the white info legible. Drag stamps + expand/action
// overlays live in SwipeDeck (outside the gesture so taps work on web).
// DemoBadge stays on every card — joining/saving is local demo state
// (BLOCKED_CONTRACT_GAP). The "Om" blurb + host live in the expanded detail.
//
// `minimal` renders only the cover photo (no gradients/overlays/badge/info): used
// for the behind-the-top-card peek, which is fully occluded, so the extra layers
// would be pure overdraw. `onInfoTop` reports the measured top Y of the info block
// so the deck can align the expand arrow to the actual title row.
export function SwipeCard({
  exp,
  interactive = true,
  minimal = false,
  onInfoTop,
}: {
  exp: MockExperience;
  interactive?: boolean;
  minimal?: boolean;
  onInfoTop?: (y: number) => void;
}) {
  const insets = useSafeAreaInsets();
  // Track the shown photo ONLY to tint the footer scrim to it; the info block no
  // longer changes per photo. Behind/exiting cards rest on photo 0.
  const [photo, setPhoto] = useState(0);
  const idx = interactive ? photo : 0;
  const place = places.find((p) => p.id === exp.placeId) ?? null;
  // Per-photo scrim tint so the bottom gradient blends with the image it covers.
  const scrim = exp.scrims[idx] ?? media.base;

  // Occluded peek card — cover image only, no overlays (overdraw saving).
  if (minimal) {
    return (
      <View
        style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        className="overflow-hidden bg-ink"
      >
        <PhotoCarousel photos={exp.photos} interactive={false} variant="card" />
      </View>
    );
  }

  return (
    <View
      style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
      className="overflow-hidden bg-ink"
    >
      <PhotoCarousel
        photos={exp.photos}
        interactive={interactive}
        onIndexChange={setPhoto}
        indicatorTop={insets.top + 52}
        variant="card"
      />

      {/* Top gradient — dark→transparent, behind the filter bar / progress dots. */}
      <LinearGradient
        colors={media.gradientTop}
        locations={[0, 0.22]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Bottom legibility FLOOR — a constant faint dark wash over the lower half,
          under the tint, so the white info never rides on a bright photo with no
          scrim at all (guarantees contrast independent of the photo). */}
      <LinearGradient
        colors={media.gradientBottom}
        locations={[0.5, 0.78, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Bottom gradient — transparent→the photo's own scrim tint. Starts higher
          and ramps gently (no hard band on bright photos) but only tops out ~0.9
          so it covers as little of the image as possible while the info stays
          legible (over the floor above). */}
      <LinearGradient
        colors={[`${scrim}00`, `${scrim}99`, `${scrim}E6`]}
        locations={[0.45, 0.78, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Honesty marker — stays on every card, below the top bar. */}
      <View className="absolute right-gutter top-28">
        <DemoBadge />
      </View>

      {/* ─── Bottom info overlay — one consolidated block, bottom-anchored ─────
          name → location · distance → when → spots/status → interest pills.
          Reports its resolved top Y so the deck can pin the expand arrow to the
          title row (the block height varies with title lines / meta / pills). */}
      <View
        style={{ bottom: SWIPE_CONTENT_BOTTOM, gap: 8 }}
        className="absolute inset-x-0 px-gutter pr-16"
        onLayout={(e) => onInfoTop?.(e.nativeEvent.layout.y)}
      >
        <Text
          className="text-4xl font-extrabold tracking-tight text-white"
          numberOfLines={2}
          accessibilityRole="header"
          accessibilityLiveRegion={interactive ? "polite" : "none"}
        >
          {exp.title}
        </Text>

        <View style={{ gap: 6 }}>
          {place ? (
            <InfoRow icon="location-outline">
              {`${place.name} · ${place.distance}`}
            </InfoRow>
          ) : null}
          <InfoRow icon="calendar-outline">{exp.when}</InfoRow>
          <InfoRow icon="people-outline">
            {experienceAvailability(exp).label}
          </InfoRow>
        </View>

        {exp.tags.length > 0 ? <TagPills tags={exp.tags} /> : null}
      </View>
    </View>
  );
}
