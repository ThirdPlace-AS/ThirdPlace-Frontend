// Experience page body (Phase 11 G5, rebuilt in Phase 12 H4), shared by the
// map's experience sheet/page and the Sveip page. Order, look and behaviour
// follow the founder's reference video (benchmark only): inset gallery →
// centred title, description, rating line and chips → icon rows (host, where,
// duration + language, what's included, latest review, participants, group)
// → Vurderinger → … → footer links. Founder rule (2026-11-06): no fact
// appears twice; everything a creator enters in Legg til shows once. The join
// action lives in the host's floating ExperienceJoinBar card.
import type { Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { BlockSheet, ReportSheet } from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { sortReviews } from "@/components/reviews/reviewSort";
import {
  Avatar,
  Chip,
  Icon,
  LoadingImage,
  PhotoViewer,
  Text,
  Pressable as UIPressable,
  type IconName,
} from "@/components/ui";
import {
  chats,
  groupById,
  placeById,
  ratingOf,
  reviewsForExperience,
  type MockExperience,
} from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { formatRating } from "@/lib/format";

import { useExperienceJoin } from "../map/hooks/useExperienceJoin";
import { PhotoPager } from "../map/PhotoPager";
import type { SheetTarget } from "../map/sheetTypes";
import {
  AvailabilitySection,
  ChatSection,
  ItinerarySection,
  MeetingSection,
  ThingsToKnowSection,
} from "./ExperienceSections";
import { areaFor, hostPerson, moreExperiences } from "./experienceMeta";

export type ExperiencePageProps = {
  exp: MockExperience;
  /** Opens a sub-view (attendees, group, check-in, host tools, place). */
  onOpen: (target: SheetTarget) => void;
  /** Opens another experience ("Flere opplevelser i området"). */
  onOpenExperience: (id: string) => void;
  /** Leaves to another route (host profile, chat, all reviews). */
  onNavigate: (href: Href) => void;
};

/** "1 time" → "Ca. 1 time"; "Hele dagen" stays. */
export function durationLabel(exp: Pick<MockExperience, "duration">): string {
  return exp.duration === "Hele dagen" ? exp.duration : `Ca. ${exp.duration}`;
}

/** ["a", "b", "c"] → "a, b og c". */
export function joinList(items: readonly string[]): string {
  return items.length > 1
    ? `${items.slice(0, -1).join(", ")} og ${items[items.length - 1]}`
    : (items[0] ?? "");
}

/** ["Norsk", "Engelsk"] → "Holdes på norsk og engelsk". */
export function languageLabel(exp: Pick<MockExperience, "languages">): string {
  const list = joinList(exp.languages.map((x) => x.toLowerCase()));
  return `Holdes på ${list || "norsk"}`;
}

/** ["En kopp kaffe", "Litt bakst"] → "En kopp kaffe og litt bakst". */
export function includedLabel(exp: Pick<MockExperience, "included">): string {
  return joinList(
    exp.included.map((x, i) =>
      i === 0 ? x : x.charAt(0).toLowerCase() + x.slice(1),
    ),
  );
}

/** Vibes first, then tags that are not already a vibe (no chip twice). */
export function experienceChips(
  exp: Pick<MockExperience, "vibes" | "tags">,
): string[] {
  const seen = new Set<string>();
  return [...exp.vibes, ...exp.tags].filter((c) => {
    const k = c.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function ExperiencePage({
  exp,
  onOpen,
  onOpenExperience,
  onNavigate,
}: ExperiencePageProps) {
  const [user] = useExperienceJoin(
    exp.id,
    exp.status === "joined" ? "joined" : "none",
  );
  const [sheet, setSheet] = useState<"report" | "block" | null>(null);
  const place = placeById(exp.placeId);
  const group = groupById(exp.groupId);
  const host = hostPerson(exp);
  const hostName = host?.name ?? exp.host;
  const going = exp.going + (user === "joined" ? 1 : 0);
  const reviews = reviewsForExperience(exp.id);
  const { score, count } = ratingOf(reviews);
  const latest = sortReviews(reviews, "newest")[0];
  const more = moreExperiences(exp);
  const reviewsHref = `/experience/${exp.id}/reviews` as Href;
  const dm = host
    ? chats.find(
        (c) =>
          c.type === "dm" && c.name.startsWith(host.name.split(" ")[0] ?? ""),
      )
    : undefined;

  return (
    <View className="gap-6">
      <HeroGallery exp={exp} />

      {/* Title block, centred as in the reference. */}
      <View className="items-center gap-2 px-2">
        <Text variant="h1" className="text-center" accessibilityRole="header">
          {exp.title}
        </Text>
        <Text variant="body" tone="muted" className="text-center">
          {exp.about}
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
              {count} vurderinger
            </Text>
          </UIPressable>
        ) : null}
        <View className="mt-1 flex-row flex-wrap justify-center gap-2">
          {experienceChips(exp).map((c) => (
            <Chip key={c} label={c} size="sm" />
          ))}
        </View>
      </View>

      <View className="h-px bg-line" />

      {/* Icon rows (the reference's host / where / time / included / review). */}
      <View className="gap-1">
        <InfoRow
          leading={
            <Avatar
              name={hostName}
              source={host ? libImage(host.avatar) : undefined}
              size="sm"
              decorative
            />
          }
          title={`Vert: ${hostName}`}
          subtitle={
            host?.area ? `Bor på ${host.area}` : "Arrangerer opplevelsen"
          }
          onPress={
            host ? () => onNavigate(`/creator/${host.id}` as Href) : undefined
          }
        />
        <InfoRow
          icon="location-outline"
          title={place?.name ?? exp.meetingPoint.name}
          subtitle={`${areaFor(exp.meetingPoint.coord)}, Oslo`}
          onPress={
            place ? () => onOpen({ kind: "place", id: place.id }) : undefined
          }
        />
        <InfoRow
          icon="time-outline"
          title={durationLabel(exp)}
          subtitle={languageLabel(exp)}
        />
        <InfoRow
          icon="clipboard-outline"
          title="Hva er inkludert"
          subtitle={includedLabel(exp)}
          lines={2}
        />
        {latest ? (
          <InfoRow
            icon="chatbox-ellipses-outline"
            title="Siste anmeldelse"
            subtitle={`«${latest.text}» · ${latest.when}`}
            lines={2}
            onPress={() => onNavigate(reviewsHref)}
          />
        ) : null}
        <InfoRow
          icon="people-outline"
          title={`${going} av ${exp.capacity} plasser tatt`}
          subtitle="Se deltakere"
          onPress={() => onOpen({ kind: "attendees", id: exp.id })}
        />
        {group ? (
          <InfoRow
            icon="people-circle-outline"
            title={group.name}
            subtitle={`Gruppe · ${group.memberCount} medlemmer`}
            onPress={() => onOpen({ kind: "group", id: group.id })}
          />
        ) : null}
      </View>

      <View className="h-px bg-line" />

      <ItinerarySection exp={exp} />

      <View className="h-px bg-line" />

      <ReviewsSection
        reviews={reviews}
        onShowAll={() => onNavigate(reviewsHref)}
      />

      <View className="h-px bg-line" />

      <AvailabilitySection exp={exp} />

      <View className="h-px bg-line" />

      <MeetingSection
        exp={exp}
        hostName={hostName}
        onShowOnMap={() =>
          onNavigate(`/map?focus=experience:${exp.id}&at=${Date.now()}` as Href)
        }
      />

      <ChatSection exp={exp} onNavigate={onNavigate} />

      {more.length > 0 ? (
        <View className="gap-3">
          <Text variant="h2" accessibilityRole="header">
            Flere opplevelser i området
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={188}
            decelerationRate="fast"
            // Plain style: the gap and fixed card width must hold on a
            // cold start (className on the scroll content was dropped).
            contentContainerStyle={{ gap: 12 }}
          >
            {more.map((e) => {
              const r = ratingOf(reviewsForExperience(e.id));
              return (
                <UIPressable
                  key={e.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${e.title}, ${e.category}`}
                  onPress={() => onOpenExperience(e.id)}
                  style={{ width: 176 }}
                  contentClassName="gap-1.5"
                  pressedScale={0.98}
                >
                  <LoadingImage
                    thumb
                    source={e.photos[0]}
                    contentFit="cover"
                    transition={150}
                    style={{ width: 176, height: 176, borderRadius: 16 }}
                  />
                  <Text variant="label" weight="semibold" numberOfLines={2}>
                    {e.title}
                  </Text>
                  <Text variant="caption" tone="muted" numberOfLines={1}>
                    {`${e.category} · ${e.duration}`}
                  </Text>
                  <Text variant="caption" tone="muted" numberOfLines={1}>
                    {`${e.priceNok ? `${e.priceNok} kr` : "Gratis"}${
                      r.count ? ` · ★ ${formatRating(r.score)}` : ""
                    }`}
                  </Text>
                </UIPressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Om verten: a centred card, then the bio and the message button, as
          in the reference. */}
      <View className="gap-4">
        <Text variant="h2" accessibilityRole="header">
          Om verten
        </Text>
        <UIPressable
          accessibilityRole="button"
          accessibilityLabel={`${hostName}, vert. Se profilen`}
          onPress={
            host ? () => onNavigate(`/creator/${host.id}` as Href) : undefined
          }
          pressedScale={0.99}
          contentClassName="items-center gap-2 rounded-xl border border-line bg-surface px-4 py-6"
        >
          <Avatar
            name={hostName}
            source={host ? libImage(host.avatar) : undefined}
            size="xl"
            decorative
          />
          <Text variant="title" className="text-center">
            {hostName}
          </Text>
          <Text variant="caption" tone="muted">
            {host ? `Vert · ${host.area}` : "Vert"}
          </Text>
        </UIPressable>
        {host?.bio ? <Text variant="body">{host.bio}</Text> : null}
        <Button
          label={`Send melding til ${hostName.split(" ")[0]}`}
          variant="secondary"
          onPress={() => onNavigate((dm ? `/chat/${dm.id}` : "/chat") as Href)}
        />
      </View>

      <View className="h-px bg-line" />

      <ThingsToKnowSection exp={exp} />

      <View className="h-px bg-line" />

      {/* Footer links. */}
      <View className="gap-1">
        <FooterLink
          icon="tp-arrival"
          label="Sjekk inn når du er der"
          onPress={() => onOpen({ kind: "checkin", id: exp.id })}
        />
        <FooterLink
          icon="settings-outline"
          label="Administrer (vert)"
          onPress={() => onOpen({ kind: "host", id: exp.id })}
        />
        <FooterLink
          icon="flag-outline"
          label="Rapporter opplevelsen"
          onPress={() => setSheet("report")}
        />
        <FooterLink
          icon="ban-outline"
          label={`Blokker ${hostName.split(" ")[0]}`}
          onPress={() => setSheet("block")}
        />
      </View>

      {sheet === "report" ? (
        <ReportSheet onClose={() => setSheet(null)} />
      ) : null}
      {sheet === "block" ? (
        <BlockSheet name={hostName} onClose={() => setSheet(null)} />
      ) : null}
    </View>
  );
}

// Inset gallery (radius 20) that pages with dots; a tap opens the full-screen
// viewer at the shown photo.
function HeroGallery({ exp }: { exp: MockExperience }) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((_e, ok) => {
      if (ok) setViewer(page);
    });
  return (
    <>
      <GestureDetector gesture={tap}>
        <View
          accessible
          accessibilityRole="imagebutton"
          accessibilityLabel={`${exp.title}, ${exp.photos.length} bilder. Åpne bildene`}
          accessibilityActions={[{ name: "activate" }]}
          onAccessibilityAction={() => setViewer(page)}
          className="overflow-hidden rounded-xl bg-surfaceMuted"
          style={{ height: Math.round((width - 32) * 0.78) }}
        >
          <PhotoPager photos={exp.photos} onIndexChange={setPage} />
        </View>
      </GestureDetector>
      <PhotoViewer
        photos={exp.photos}
        index={viewer}
        onClose={() => setViewer(null)}
        label={exp.title}
      />
    </>
  );
}

function InfoRow({
  icon,
  leading,
  title,
  subtitle,
  lines = 1,
  onPress,
}: {
  icon?: IconName;
  leading?: React.ReactNode;
  title: string;
  subtitle?: string;
  lines?: number;
  onPress?: () => void;
}) {
  const body = (
    <>
      <View className="h-10 w-10 items-center justify-center">
        {leading ?? (icon ? <Icon name={icon} size="lg" tone="ink" /> : null)}
      </View>
      <View className="flex-1">
        <Text variant="body" weight="semibold" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={lines}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? <Icon name="chevron-forward" size="md" tone="muted" /> : null}
    </>
  );
  return onPress ? (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={onPress}
      contentClassName="flex-row items-center gap-3 rounded-md py-2.5"
      pressedScale={0.99}
    >
      {body}
    </UIPressable>
  ) : (
    <View className="flex-row items-center gap-3 py-2.5">{body}</View>
  );
}

function FooterLink({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      onPress={onPress}
      contentClassName="flex-row items-center gap-3 py-3"
      pressedScale={0.99}
    >
      <Icon name={icon} size="md" tone="ink" />
      <Text variant="label" weight="semibold" className="flex-1 underline">
        {label}
      </Text>
    </UIPressable>
  );
}
