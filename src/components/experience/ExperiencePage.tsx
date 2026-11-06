// Experience page body (Phase 11 G5), shared by the map's experience detail
// and the Sveip expanded detail. Layout, order and feel follow the founder's
// reference video (benchmark only): inset photo gallery that opens a
// full-screen viewer, centred title and description, a status line, small
// chips, icon rows, "Flere opplevelser i området", "Om verten" and footer
// links. ThirdPlace content the video does not have stays and is restyled to
// fit (founder, 2026-11-06): status pill · when · påmeldt, Lagre / Del /
// Rapporter, Se deltakere, Gruppe, Sjekk inn (GPS), Administrer (vert).
// Built only from fixture fields: no rating, reviews, itinerary or
// availability (BLOCKED_CONTRACT_GAP). The join action lives in the host's
// floating ExperienceJoinBar card.
import { Image } from "expo-image";
import type { Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { BlockSheet } from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import {
  Avatar,
  Chip,
  Icon,
  PhotoViewer,
  Text,
  Pressable as UIPressable,
  type IconName,
} from "@/components/ui";
import { chats, groupById, placeById, type MockExperience } from "@/fixtures";
import { libImage } from "@/fixtures/images";

import { DetailActions } from "../map/content/DetailActions";
import { useExperienceJoin } from "../map/hooks/useExperienceJoin";
import { PhotoPager } from "../map/PhotoPager";
import type { SheetTarget } from "../map/sheetTypes";
import { markerId } from "../map/types/mapPresentation";
import { STATUS_META, hostPerson, moreExperiences } from "./experienceMeta";

export type ExperiencePageProps = {
  exp: MockExperience;
  /** Opens a sub-view (attendees, group, check-in, host tools, place). */
  onOpen: (target: SheetTarget) => void;
  /** Opens another experience ("Flere opplevelser i området"). */
  onOpenExperience: (id: string) => void;
  /** Leaves to another route (host profile, chat). */
  onNavigate: (href: Href) => void;
};

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
  const [blockOpen, setBlockOpen] = useState(false);
  const place = placeById(exp.placeId);
  const group = groupById(exp.groupId);
  const host = hostPerson(exp);
  const status = STATUS_META[exp.status];
  const going = exp.going + (user === "joined" ? 1 : 0);
  const more = moreExperiences(exp);
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
        <View className="mt-1 flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <View className={`rounded-full px-2.5 py-0.5 ${status.className}`}>
            <Text variant="caption" weight="semibold" tone="onInk">
              {status.label}
            </Text>
          </View>
          <Text variant="label" weight="medium">
            {exp.when}
          </Text>
          <Text variant="label" tone="muted">
            · {going}/{exp.capacity} påmeldt
          </Text>
        </View>
        {exp.tags.length > 0 ? (
          <View className="mt-1 flex-row flex-wrap justify-center gap-2">
            {exp.tags.map((t) => (
              <Chip key={t} label={t} size="sm" />
            ))}
          </View>
        ) : null}
      </View>

      <DetailActions
        markerId={markerId("experience", exp.id)}
        title={exp.title}
      />

      <View className="h-px bg-line" />

      {/* Icon rows (the reference's host / place / time / included rows). */}
      <View className="gap-1">
        <InfoRow
          leading={
            <Avatar
              name={exp.host}
              source={host ? libImage(host.avatar) : undefined}
              size="sm"
              decorative
            />
          }
          title={`Vert: ${host?.name ?? exp.host}`}
          subtitle="Arrangerer opplevelsen"
          onPress={
            host ? () => onNavigate(`/creator/${host.id}` as Href) : undefined
          }
        />
        {place ? (
          <InfoRow
            icon="location-outline"
            title={place.name}
            subtitle={place.address}
            onPress={() => onOpen({ kind: "place", id: place.id })}
          />
        ) : null}
        <InfoRow icon="time-outline" title={exp.when} subtitle={exp.day} />
        <InfoRow
          icon="people-outline"
          title={`${going} av ${exp.capacity} påmeldt`}
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
        <InfoRow
          icon="tp-arrival"
          title="Sjekk inn (GPS)"
          subtitle="Når du er på stedet"
          onPress={() => onOpen({ kind: "checkin", id: exp.id })}
        />
      </View>

      {more.length > 0 ? (
        <View className="gap-3">
          <Text variant="h2" accessibilityRole="header">
            Flere opplevelser i området
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            // Plain style: the gap and fixed card width must hold on a
            // cold start (className on the scroll content was dropped).
            contentContainerStyle={{ gap: 12 }}
          >
            {more.map((e) => (
              <UIPressable
                key={e.id}
                accessibilityRole="button"
                accessibilityLabel={`${e.title}, ${e.when}`}
                onPress={() => onOpenExperience(e.id)}
                style={{ width: 176 }}
                contentClassName="gap-1.5"
                pressedScale={0.98}
              >
                <Image
                  source={e.photos[0]}
                  contentFit="cover"
                  transition={150}
                  style={{ width: 176, height: 132, borderRadius: 16 }}
                  className="bg-surfaceMuted"
                />
                <Text variant="label" weight="semibold" numberOfLines={1}>
                  {e.title}
                </Text>
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {e.when}
                </Text>
              </UIPressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Om verten. */}
      <View className="gap-3">
        <Text variant="h2" accessibilityRole="header">
          Om verten
        </Text>
        <View className="gap-3 rounded-lg border border-line bg-surface p-4">
          <View className="flex-row items-center gap-3">
            <Avatar
              name={host?.name ?? exp.host}
              source={host ? libImage(host.avatar) : undefined}
              size="lg"
              decorative
            />
            <View className="flex-1">
              <Text variant="title">{host?.name ?? exp.host}</Text>
              <Text variant="caption" tone="muted">
                {host ? `Vert · ${host.area}` : "Vert"}
              </Text>
            </View>
          </View>
          {host?.bio ? (
            <Text variant="label" weight="regular">
              {host.bio}
            </Text>
          ) : null}
          <Button
            label="Send melding"
            variant="secondary"
            onPress={() =>
              onNavigate((dm ? `/chat/${dm.id}` : "/chat") as Href)
            }
          />
        </View>
      </View>

      <View className="h-px bg-line" />

      {/* Footer links. */}
      <View className="gap-1">
        <FooterLink
          icon="settings-outline"
          label="Administrer (vert)"
          onPress={() => onOpen({ kind: "host", id: exp.id })}
        />
        <FooterLink
          icon="ban-outline"
          label={`Blokker ${host?.name.split(" ")[0] ?? exp.host}`}
          onPress={() => setBlockOpen(true)}
        />
      </View>

      {blockOpen ? (
        <BlockSheet
          name={host?.name ?? exp.host}
          onClose={() => setBlockOpen(false)}
        />
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
  onPress,
}: {
  icon?: IconName;
  leading?: React.ReactNode;
  title: string;
  subtitle?: string;
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
          <Text variant="caption" tone="muted" numberOfLines={1}>
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
