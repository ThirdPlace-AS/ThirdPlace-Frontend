// Place page (Phase 12 H5d), in the reference video's layout like the
// experience page: inset gallery with the photo viewer, centred name and
// description, a rating line built from the place's reviews, chips; icon rows
// (Adresse, Åpningstider, Prisnivå, Siste anmeldelse); Vurderinger; "Hvor du
// finner oss" with the map card; Samtalen; Flere steder i nærheten; Ting å
// vite (tilgjengelighet, spesielle åpningstider, kilde); footer links. Every
// fact once. MOCK fixture data; no booking or ranking (BLOCKED_CONTRACT_GAP).
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { ReportSheet } from "@/components/actions/ActionSheets";
import { DirectionsButton } from "@/components/DirectionsButton";
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
import type { SheetTarget } from "@/components/map/sheetTypes";
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
  areaLabel,
  businessForPlace,
  chatForPlace,
  experiences,
  groups,
  organizationForPlace,
  personById,
  places,
  priceBandFor,
  ratingOf,
  reviewsForPlace,
  type MockPlace,
} from "@/fixtures";
import { useCreatedVersion } from "@/fixtures/created";
import {
  coverForPlace,
  libImage,
  libThumb,
  photosForPlace,
} from "@/fixtures/images";
import { formatRating, membersLabel } from "@/lib/format";
import { isPlaceOpen } from "@/lib/openingHours";
import {
  ITEM_TYPE_ICON,
  experienceTypeLabel,
} from "@/components/map/services/itemType";
import { NEARBY_M, distanceMeters } from "@/lib/distance";
import { distanceLabelFor, useOrigin } from "@/lib/origin";

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
  // Nearest first, and only what is near (Phase 19: across Akershus the
  // nearest place can be a town away).
  return places
    .filter((q) => q.id !== p.id && q.placeStatus !== "unavailable")
    .map((q) => ({ q, d: distanceMeters(q.coord, p.coord) }))
    .filter((x) => x.d <= NEARBY_M)
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((x) => x.q);
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
  // A byrom: what is there, who it is for, the season (Phase 19).
  if (p.space)
    items.push({
      key: "fasiliteter",
      icon: "leaf-outline",
      title: "Fasiliteter",
      summary: p.space.facilities.join(", "),
      detail: [
        ...p.space.facilities.map((f) => ({
          icon: "checkmark-circle-outline" as const,
          text: f,
        })),
        { icon: "people-outline", text: p.space.access },
        ...(p.space.season
          ? [
              {
                icon: "sunny-outline" as const,
                text: `Sesong: ${p.space.season}`,
              },
            ]
          : []),
      ],
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
  onOpen,
  chatInBar = false,
}: {
  place: MockPlace;
  onNavigate: (href: Href) => void;
  /** In the map's page sheet: opens a sub-view on the sheet's stack (the
   *  business behind "Drives av", and from there its Verifiseringsstatus). */
  onOpen?: (target: SheetTarget) => void;
  /** The map's page sheet pins the chat as its floating card (PlaceChatBar),
   *  so the body leaves out its own Samtalen section (every fact once). */
  chatInBar?: boolean;
}) {
  const [report, setReport] = useState(false);
  const reviews = reviewsForPlace(place.id);
  const origin = useOrigin();
  const { score, count } = ratingOf(reviews);
  const latest = sortReviews(reviews, "newest")[0];
  const reviewsHref = `/place/${place.id}/reviews` as Href;
  // Lists over every place, experience and group: worked out once per page
  // (speed pass 0348), and the same photo list for the gallery each render.
  // Something made in Legg til joins the lists below (review of the speed
  // pass: the memoised lists kept the arrays they first saw).
  const created = useCreatedVersion();
  const photos = useMemo(() => photosForPlace(place).map(libImage), [place]);
  const band = priceBandFor(place.priceNok);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- created: a place made in Legg til
  const nearby = useMemo(() => nearbyPlaces(place), [place, created]);
  // Phase 19: who runs it, what happens here, which groups meet here.
  const business =
    place.kind === "bedrift" ? businessForPlace(place.id) : undefined;
  const org =
    place.kind === "organisasjon" ? organizationForPlace(place.id) : undefined;
  const contact = org ? personById(org.contactPersonId) : undefined;
  const happening = useMemo(
    () =>
      experiences.filter(
        (e) =>
          e.status !== "cancelled" &&
          (e.placeId === place.id || e.organizerPlaceId === place.id),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created: an experience made in Legg til
    [place.id, created],
  );
  const meetingHere = useMemo(
    () => groups.filter((g) => g.homePlaceId === place.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created: a group made in Legg til
    [place.id, created],
  );

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
          // How far away it is, from the person (the map's place sheet showed
          // it before it became this page, 2026-11-09).
          subtitle={`${place.category} · ${areaLabel(place.coord)} · ${distanceLabelFor(place.coord, origin)}`}
        />
        <InfoRow
          icon="time-outline"
          title={isPlaceOpen(place) ? "Åpent nå" : "Stengt nå"}
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
        {business ? (
          <InfoRow
            icon="storefront-outline"
            title={`Drives av ${business.name}`}
            subtitle={business.verified ? "Verifisert bedrift" : "Bedrift"}
            onPress={
              onOpen
                ? () => onOpen({ kind: "business", id: business.id })
                : undefined
            }
          />
        ) : null}
        {org ? (
          <>
            <InfoRow
              icon={ITEM_TYPE_ICON.organisasjon}
              // A club named like its place would say its name twice.
              title={org.name === place.name ? "Om organisasjonen" : org.name}
              subtitle={
                contact ? `${org.form} · Kontakt: ${contact.name}` : org.form
              }
              onPress={
                contact
                  ? () => onNavigate(`/people/${contact.id}` as Href)
                  : undefined
              }
            />
            <InfoRow
              icon="list-outline"
              title="Hva vi gjør"
              subtitle={org.activities.join(" · ")}
              lines={2}
            />
          </>
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
        <View className="flex-row items-start gap-3">
          <View className="flex-1 gap-0.5">
            <Text variant="label" weight="semibold">
              {place.name}
            </Text>
            <Text variant="caption" tone="muted">
              {place.address}
            </Text>
          </View>
          <DirectionsButton coord={place.coord} name={place.name} />
        </View>
        <MeetingMap
          coord={place.coord}
          label={place.name}
          onShowOnMap={() =>
            onNavigate(`/map?focus=place:${place.id}&at=${Date.now()}` as Href)
          }
        />
      </View>

      {happening.length > 0 ? (
        <View className="gap-1">
          <Text variant="h2" accessibilityRole="header" className="mb-2">
            Hva skjer her
          </Text>
          {happening.map((e) => (
            <InfoRow
              key={e.id}
              icon={e.format === "event" ? "calendar-outline" : "tp-experience"}
              title={e.title}
              subtitle={`${experienceTypeLabel(e)} · ${e.when}`}
              onPress={() => onNavigate(`/experience/${e.id}` as Href)}
            />
          ))}
        </View>
      ) : null}

      {meetingHere.length > 0 ? (
        <View className="gap-1">
          <Text variant="h2" accessibilityRole="header" className="mb-2">
            Grupper som møtes her
          </Text>
          {meetingHere.map((g) => (
            <InfoRow
              key={g.id}
              icon="people-outline"
              title={g.name}
              subtitle={`Gruppe · ${membersLabel(g.memberCount)}`}
              onPress={() => onNavigate(`/group/${g.id}` as Href)}
            />
          ))}
        </View>
      ) : null}

      {chatInBar ? null : (
        <ChatSection chat={chatForPlace(place.id)} onNavigate={onNavigate} />
      )}

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
                    {`${p.category} · ${distanceLabelFor(p.coord, origin)}${
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
