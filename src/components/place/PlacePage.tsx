// Place page (Phase 12 H5d), in the reference video's layout like the
// experience page: inset gallery with the photo viewer, centred name and
// description, a rating line built from the place's reviews, chips; icon rows
// (Adresse, Åpningstider, Prisnivå, Siste anmeldelse); Vurderinger; "Hvor du
// finner oss" with the map card; Samtalen; Flere steder i nærheten; Ting å
// vite (tilgjengelighet, spesielle åpningstider, kilde); footer links. Every
// fact once. MOCK fixture data; no booking or ranking (BLOCKED_CONTRACT_GAP).
import type { Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { ReportSheet } from "@/components/actions/ActionSheets";
import {
  ChatSection,
  KnowSection,
  MeetingMap,
  type Know,
} from "@/components/experience/ExperienceSections";
import {
  FooterLink,
  HeroGallery,
  InfoRow,
} from "@/components/experience/ExperiencePage";
import { areaFor } from "@/components/experience/experienceMeta";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { sortReviews } from "@/components/reviews/reviewSort";
import {
  Chip,
  Icon,
  LoadingImage,
  Text,
  Pressable as UIPressable,
} from "@/components/ui";
import {
  chatForPlace,
  places,
  priceBandFor,
  ratingOf,
  reviewsForPlace,
  type MockPlace,
} from "@/fixtures";
import {
  coverForPlace,
  libImage,
  libThumb,
  photosForPlace,
} from "@/fixtures/images";
import { formatRating } from "@/lib/format";

/** Chips: vibes, then tags not already a vibe (each once). */
export function placeChips(p: Pick<MockPlace, "vibes" | "tags">): string[] {
  const seen = new Set<string>();
  return [...p.vibes, ...p.tags].filter((c) => {
    const k = c.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Other places, nearest first (straight-line distance between the pins). */
export function nearbyPlaces(p: MockPlace, count = 6): MockPlace[] {
  const d = (q: MockPlace) =>
    Math.hypot(q.coord[0] - p.coord[0], (q.coord[1] - p.coord[1]) * 2);
  return places
    .filter((q) => q.id !== p.id && q.placeStatus !== "unavailable")
    .sort((a, b) => d(a) - d(b))
    .slice(0, count);
}

/** "Ting å vite" for a place: facts the listing has, nothing invented. */
export function placeThingsToKnow(p: MockPlace): Know[] {
  const items: Know[] = [
    {
      key: "tilgjengelighet",
      icon: "accessibility-outline",
      title: "Tilgjengelighet",
      summary: p.accessibility.length
        ? p.accessibility.join(", ")
        : "Ikke oppgitt",
      detail: p.accessibility.length
        ? p.accessibility.map((a) => ({
            icon: "checkmark-circle-outline" as const,
            text: a,
          }))
        : [{ icon: "information-circle-outline", text: "Ikke oppgitt." }],
    },
  ];
  if (p.specialHours)
    items.push({
      key: "spesielle",
      icon: "calendar-outline",
      title: "Spesielle åpningstider",
      summary: p.specialHours,
      detail: [{ icon: "time-outline", text: p.specialHours }],
    });
  items.push({
    key: "kilde",
    icon: "shield-checkmark-outline",
    title: "Kilde",
    summary: p.source,
    detail: [{ icon: "information-circle-outline", text: p.source }],
  });
  return items;
}

export function PlacePage({
  place,
  onNavigate,
}: {
  place: MockPlace;
  onNavigate: (href: Href) => void;
}) {
  const [report, setReport] = useState(false);
  const reviews = reviewsForPlace(place.id);
  const { score, count } = ratingOf(reviews);
  const latest = sortReviews(reviews, "newest")[0];
  const reviewsHref = `/place/${place.id}/reviews` as Href;
  const photos = photosForPlace(place).map(libImage);
  const band = priceBandFor(place.priceNok);
  const nearby = nearbyPlaces(place);

  return (
    <View className="gap-6">
      <HeroGallery title={place.name} photos={photos} />

      <View className="items-center gap-2 px-2">
        <Text variant="h1" className="text-center" accessibilityRole="header">
          {place.name}
        </Text>
        <Text variant="body" tone="muted" className="text-center">
          {place.about}
        </Text>
        {count > 0 ? (
          <UIPressable
            accessibilityRole="link"
            accessibilityLabel={`${formatRating(score)} av 5, ${count} vurderinger. Vis alle`}
            onPress={() => onNavigate(reviewsHref)}
            hitSlop={8}
            contentClassName="mt-1 flex-row items-center gap-1"
          >
            <Icon name="star" size="sm" tone="ink" />
            <Text variant="label" weight="semibold">
              {formatRating(score)}
            </Text>
            <Text variant="label" tone="muted">
              ·
            </Text>
            <Text variant="label" weight="semibold" className="underline">
              {`${count} ${count === 1 ? "vurdering" : "vurderinger"}`}
            </Text>
          </UIPressable>
        ) : null}
        <View className="mt-1 flex-row flex-wrap justify-center gap-2">
          {placeChips(place).map((c) => (
            <Chip key={c} label={c} size="sm" />
          ))}
        </View>
      </View>

      <View className="h-px bg-line" />

      <View className="gap-1">
        <InfoRow
          icon="location-outline"
          title={place.address}
          subtitle={`${place.category} · ${areaFor(place.coord)}, Oslo`}
        />
        <InfoRow
          icon="time-outline"
          title={place.openNow ? "Åpent nå" : "Stengt nå"}
          subtitle={place.hours}
        />
        <InfoRow
          icon="pricetag-outline"
          title="Prisnivå"
          subtitle={band === "Gratis" ? "Gratis" : `${band} kr`}
        />
        {latest ? (
          <InfoRow
            icon="chatbox-ellipses-outline"
            title="Siste anmeldelse"
            subtitle={`«${latest.text}» · ${latest.when}`}
            lines={2}
          />
        ) : null}
      </View>

      <View className="h-px bg-line" />

      <ReviewsSection
        reviews={reviews}
        onShowAll={() => onNavigate(reviewsHref)}
      />

      <View className="h-px bg-line" />

      <View className="gap-3">
        <Text variant="h2" accessibilityRole="header">
          Hvor du finner oss
        </Text>
        <View className="gap-0.5">
          <Text variant="label" weight="semibold">
            {place.name}
          </Text>
          <Text variant="caption" tone="muted">
            {place.address}
          </Text>
        </View>
        <MeetingMap
          coord={place.coord}
          label={place.name}
          onShowOnMap={() =>
            onNavigate(`/map?focus=place:${place.id}&at=${Date.now()}` as Href)
          }
        />
      </View>

      <ChatSection chat={chatForPlace(place.id)} onNavigate={onNavigate} />

      {nearby.length > 0 ? (
        <View className="gap-3">
          <Text variant="h2" accessibilityRole="header">
            Flere steder i nærheten
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={188}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 12 }}
          >
            {nearby.map((p) => {
              const r = ratingOf(reviewsForPlace(p.id));
              return (
                <UIPressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.name}, ${p.category}`}
                  onPress={() => onNavigate(`/place/${p.id}` as Href)}
                  style={{ width: 176 }}
                  contentClassName="gap-1.5"
                  pressedScale={0.98}
                >
                  <LoadingImage
                    thumb
                    source={libThumb(coverForPlace(p))}
                    contentFit="cover"
                    transition={150}
                    style={{ width: 176, height: 176, borderRadius: 16 }}
                  />
                  <Text variant="label" weight="semibold" numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text variant="caption" tone="muted" numberOfLines={1}>
                    {`${p.category} · ${p.distance}${
                      r.count ? ` · ★ ${formatRating(r.score)}` : ""
                    }`}
                  </Text>
                </UIPressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View className="h-px bg-line" />

      <KnowSection items={placeThingsToKnow(place)} />

      <View className="h-px bg-line" />

      <View className="gap-1">
        <FooterLink
          icon="create-outline"
          label="Skriv en anmeldelse"
          onPress={() => onNavigate(`/review/place/${place.id}` as Href)}
        />
        <FooterLink
          icon="flag-outline"
          label="Rapporter stedet"
          onPress={() => setReport(true)}
        />
      </View>

      {report ? <ReportSheet onClose={() => setReport(false)} /> : null}
    </View>
  );
}
