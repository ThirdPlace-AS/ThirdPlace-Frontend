// Experience page body (Phase 11 G5, rebuilt in Phase 12 H4), shared by the
// map's experience sheet/page and the Sveip page. Order, look and behaviour
// follow the founder's reference video (benchmark only): inset gallery →
// centred title, description, rating line and chips → icon rows (host, where,
// duration + language, what's included, latest review, participants, group)
// → Vurderinger → … → footer links. Founder rule (2026-11-06): no fact
// appears twice; everything a creator enters in Legg til shows once. The join
// action lives in the host's floating ExperienceJoinBar card.
import type { Href } from "expo-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  useSheetStageFirst,
  useSheetStageReady,
} from "@/components/map/sheetStage";
import {
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView as RailScrollView,
} from "react-native-gesture-handler";

import {
  BlockSheet,
  ItemActionsSheet,
  ReportSheet,
} from "@/components/actions/ActionSheets";
import { useGuestGate } from "@/components/useGuestGate";
import { usePageScroll } from "@/components/pageScroll";
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
  type Rect,
  Button,
  useOriginRect,
  LINK_SLOP,
} from "@/components/ui";
import {
  PLACE_KIND_LABEL,
  areaLabel,
  chatForExperience,
  chats,
  groupById,
  placeById,
  ratingOf,
  reviewsForExperience,
  type MockExperience,
} from "@/fixtures";
import { isHostedByMe, useCreatedVersion } from "@/fixtures/created";
import { libImage } from "@/fixtures/images";
import { formatRating, membersLabel } from "@/lib/format";

import { useExperienceJoin } from "../map/hooks/useExperienceJoin";
import { useGuestMode } from "../map/hooks/useGuestMode";
import { ITEM_TYPE_ICON, experienceTypeLabel } from "../map/services/itemType";
import { PhotoPager } from "../map/PhotoPager";
import type { SheetTarget } from "../map/sheetTypes";
import {
  AvailabilitySection,
  ChatSection,
  ItinerarySection,
  MeetingSection,
  ThingsToKnowSection,
} from "./ExperienceSections";
import { JoinedCard } from "./JoinedCard";
import { hostPerson, moreExperiences } from "./experienceMeta";

/** Height of the page top bar below the status bar (the route page and the
 *  map sheet's top snap share it so both pages line up). */
export const PAGE_BAR_ROW = 52;

export type ExperiencePageProps = {
  exp: MockExperience;
  /** Opens a short sub-view in a sheet (attendees, check-in, host tools). */
  onOpen: (target: SheetTarget) => void;
  /** Leaves to another page: place, group, another experience, host
   *  profile, chat, all reviews (Phase 12 H4c: full entities are pages). */
  onNavigate: (href: Href) => void;
  /** Leaves out the photo gallery (Sveip's details show the card's photo
   *  above the page). */
  hideGallery?: boolean;
  /** Legg til's last step (review PR-07, 0525): the page as others will see
   *  it, built from the draft. Nothing that acts is shown (join, chat,
   *  reviews, report, other experiences); each part has «Endre», which goes
   *  back to the wizard step that holds it. */
  preview?: { onEdit: (part: ExperiencePart) => void };
};

/** The parts of an experience the Add wizard edits, one step each. */
export type ExperiencePart =
  | "photos"
  | "about"
  | "mood"
  | "when"
  | "where"
  | "frame"
  | "plan";

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

/**
 * ["En kopp kaffe", "Litt bakst"] → "En kopp kaffe og litt bakst". An item
 * that holds its own "og" keeps the list readable with commas:
 * ["Inngang", "Kaffe og kake"] → "Inngang, kaffe og kake", and
 * ["Tråd og knapper", "Kaffe"] → "Tråd og knapper, og kaffe".
 */
export function includedLabel(exp: Pick<MockExperience, "included">): string {
  const items = exp.included.map((x, i) =>
    i === 0 ? x : x.charAt(0).toLowerCase() + x.slice(1),
  );
  const hasOg = (x: string) => /(^|\s)og(\s|$)/.test(x);
  const last = items[items.length - 1] ?? "";
  if (items.length > 1 && hasOg(last)) return items.join(", ");
  if (items.length > 2 && items.slice(1, -1).some(hasOg))
    return `${items.slice(0, -1).join(", ")}, og ${last}`;
  return joinList(items);
}

/** Vibes first, then tags that are not already a vibe (no chip twice). */
export function experienceChips(
  exp: Pick<MockExperience, "vibes" | "tags" | "format" | "days">,
): string[] {
  // The top bar already says what an Arrangement is ("Festival · Kolsås"),
  // so a tag naming it is not repeated as a chip (Phase 19).
  const seen = new Set<string>(
    exp.format === "event" ? [experienceTypeLabel(exp).toLowerCase()] : [],
  );
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
  onNavigate,
  hideGallery = false,
  preview,
}: ExperiencePageProps) {
  // In the map sheet: the open shows the gallery (what the peek shows), the
  // first rows come once the sheet rests, the rest a moment later (0381).
  const first = useSheetStageFirst();
  const ready = useSheetStageReady();
  const [user] = useExperienceJoin(
    exp.id,
    exp.status === "joined" ? "joined" : "none",
  );
  const [sheet, setSheet] = useState<"help" | "report" | "block" | null>(null);
  // Messaging, reporting and blocking are personal (founder 2026-11-19 Q1).
  const { gate, prompt: signInPrompt } = useGuestGate();
  const { isGuest } = useGuestMode();
  const place = placeById(exp.placeId);
  const group = groupById(exp.groupId);
  const host = hostPerson(exp);
  const hostName = host?.name ?? exp.host;
  // The viewer hosts it (0464): Administrer, and no message, report or block
  // aimed at themselves.
  const mine = isHostedByMe(exp.id);
  const going = exp.going + (user === "joined" ? 1 : 0);
  const reviews = reviewsForExperience(exp.id);
  const { score, count } = ratingOf(reviews);
  const latest = sortReviews(reviews, "newest")[0];
  // Lists over every experience and chat: worked out once per page (speed
  // pass 0348), with each suggestion's rating.
  // Something made in Legg til joins the list (review of the speed pass).
  const created = useCreatedVersion();
  // Worked out only once the lower part shows.
  const more = useMemo(
    () =>
      ready && !preview
        ? moreExperiences(exp).map((e) => ({
            e,
            r: ratingOf(reviewsForExperience(e.id)),
          }))
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created: an experience made in Legg til
    [exp, created, ready, preview],
  );
  // The rating link brings the page's own reviews into view (Airbnb
  // tap-through 2026-11-26); without a scrolling host, or before they have
  // mounted, it opens all reviews as before.
  const reviewsAnchor = useRef<View>(null);
  const pageScroll = usePageScroll();
  const toReviews = () => {
    if (!pageScroll?.scrollToAnchor(reviewsAnchor.current))
      onNavigate(reviewsHref);
  };
  const reviewsHref = `/experience/${exp.id}/reviews` as Href;
  // The direct chat with the host, matched by person (Phase 19: with many
  // hosts a first name is no longer enough).
  const dm =
    ready && host
      ? chats.find((c) => c.type === "dm" && c.personId === host.id)
      : undefined;
  // An Arrangement names who puts it on (a club or a business).
  const organizer =
    exp.format === "event" ? placeById(exp.organizerPlaceId) : undefined;
  // In the preview a row's tap edits its part, and the row says «Endre».
  const edit = (part: ExperiencePart) =>
    preview ? () => preview.onEdit(part) : undefined;
  const action = preview ? "Endre" : undefined;

  return (
    // 32 between sections (Airbnb tap-through 2026-11-26: more air around
    // the dividers than our 24).
    <View className="gap-8">
      {hideGallery ? null : (
        <HeroGallery title={exp.title} photos={exp.photos} />
      )}
      {preview ? (
        <EditLinks
          links={[
            { label: "bildene", onPress: () => preview.onEdit("photos") },
          ]}
        />
      ) : null}

      {first ? (
        <>
          {/* Title block, centred as in the reference. */}
          <View className="items-center gap-2 px-2">
            <Text
              variant="display"
              weight="semibold"
              className="text-center"
              accessibilityRole="header"
            >
              {exp.title}
            </Text>
            <Text variant="body" tone="muted" className="text-center">
              {exp.about}
            </Text>
            {count > 0 ? (
              <UIPressable
                accessibilityRole="link"
                accessibilityLabel={`${formatRating(score)} av 5, ${count} vurderinger. Gå til vurderingene`}
                onPress={toReviews}
                hitSlop={LINK_SLOP}
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
          {preview ? (
            <EditLinks
              links={[
                { label: "teksten", onPress: () => preview.onEdit("about") },
                { label: "stemningen", onPress: () => preview.onEdit("mood") },
              ]}
            />
          ) : null}

          {/* PR-03: once joined, the page says so and keeps the next steps.
              Not for a guest or the host. */}
          {user === "joined" && !mine && !isGuest ? (
            <JoinedCard experience={exp} />
          ) : null}

          <View className="h-px bg-line" />

          {/* Icon rows (the reference's host / where / time / included / review). */}
          <View className="gap-1">
            <InfoRow
              leading={
                <Avatar
                  name={hostName}
                  source={host ? libImage(host.avatar) : undefined}
                  size="md"
                  decorative
                />
              }
              title={`Vert: ${hostName}`}
              subtitle={
                host?.area ? `Bor på ${host.area}` : "Arrangerer opplevelsen"
              }
              onPress={
                host && !preview
                  ? () => onNavigate(`/people/${host.id}` as Href)
                  : undefined
              }
            />
            {organizer ? (
              <InfoRow
                icon={ITEM_TYPE_ICON[organizer.kind]}
                title={`Arrangør: ${organizer.name}`}
                subtitle={`${PLACE_KIND_LABEL[organizer.kind]} · ${areaLabel(organizer.coord)}`}
                onPress={() => onNavigate(`/place/${organizer.id}` as Href)}
              />
            ) : null}
            <InfoRow
              icon="location-outline"
              title={place?.name ?? exp.meetingPoint.name}
              subtitle={areaLabel(exp.meetingPoint.coord)}
              onPress={
                edit("where") ??
                (place
                  ? () => onNavigate(`/place/${place.id}` as Href)
                  : undefined)
              }
              action={action}
            />
            <InfoRow
              icon="time-outline"
              title={durationLabel(exp)}
              subtitle={languageLabel(exp)}
              onPress={edit("when")}
              action={action}
            />
            <InfoRow
              icon="clipboard-outline"
              title="Hva er inkludert"
              subtitle={includedLabel(exp)}
              lines={2}
              onPress={edit("plan")}
              action={action}
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
              title={
                preview
                  ? `${exp.capacity} plasser`
                  : `${going} av ${exp.capacity} plasser tatt`
              }
              subtitle={preview ? undefined : "Se deltakere"}
              onPress={
                edit("frame") ??
                (() => onOpen({ kind: "attendees", id: exp.id }))
              }
              action={action}
            />
            {group ? (
              <InfoRow
                icon="people-outline"
                title={group.name}
                subtitle={`Gruppe · ${membersLabel(group.memberCount)}`}
                onPress={() => onNavigate(`/group/${group.id}` as Href)}
              />
            ) : null}
          </View>
        </>
      ) : null}

      {/* Below the first screen: in the map sheet, a moment after it has
          come to rest (R3a, 0381, src/components/map/sheetStage.ts). */}
      {ready ? (
        <>
          <View className="h-px bg-line" />

          <PreviewPart
            preview={preview}
            label="programmet"
            onEdit={edit("plan")}
          >
            <ItinerarySection exp={exp} />
          </PreviewPart>

          <View className="h-px bg-line" />

          {/* A new experience has no reviews: the preview leaves them out. */}
          {preview ? null : (
            <>
              <View ref={reviewsAnchor} collapsable={false}>
                <ReviewsSection
                  reviews={reviews}
                  onShowAll={() => onNavigate(reviewsHref)}
                />
              </View>

              <View className="h-px bg-line" />
            </>
          )}

          <PreviewPart preview={preview} label="tiden" onEdit={edit("when")}>
            <AvailabilitySection exp={exp} />
          </PreviewPart>

          <View className="h-px bg-line" />

          <PreviewPart
            preview={preview}
            label="møtestedet"
            onEdit={edit("where")}
          >
            <MeetingSection
              exp={exp}
              hostName={hostName}
              onShowOnMap={() =>
                onNavigate(
                  `/map?focus=experience:${exp.id}&at=${Date.now()}` as Href,
                )
              }
            />
          </PreviewPart>

          {preview ? null : (
            <ChatSection
              chat={chatForExperience(exp.id)}
              onNavigate={onNavigate}
            />
          )}

          {more.length > 0 ? (
            <View className="gap-3">
              <Text variant="h1" accessibilityRole="header">
                Flere opplevelser i området
              </Text>
              <RailScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={188}
                decelerationRate="fast"
                // Plain style: the gap and fixed card width must hold on a
                // cold start (className on the scroll content was dropped).
                contentContainerStyle={{ gap: 12 }}
              >
                {more.map(({ e, r }) => {
                  return (
                    <UIPressable
                      key={e.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${e.title}, ${e.category}`}
                      onPress={() => onNavigate(`/experience/${e.id}` as Href)}
                      style={{ width: 176 }}
                      contentClassName="gap-2"
                      pressedScale={0.98}
                    >
                      <LoadingImage
                        thumb
                        source={e.photos[0]}
                        contentFit="cover"
                        transition={150}
                        style={{ width: 176, height: 176, borderRadius: 14 }}
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
              </RailScrollView>
            </View>
          ) : null}

          {/* Om verten: a centred card, then the bio and the message button, as
          in the reference. */}
          <View className="gap-4">
            <Text variant="h1" accessibilityRole="header">
              Om verten
            </Text>
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel={
                preview ? `${hostName}, vert` : `${hostName}, vert. Se profilen`
              }
              onPress={
                host && !preview
                  ? () => onNavigate(`/people/${host.id}` as Href)
                  : undefined
              }
              pressedScale={0.99}
              contentClassName="items-center gap-2 rounded-lg border border-line bg-surface px-4 py-6"
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
            {mine || preview ? null : (
              <Button
                label={`Send melding til ${hostName.split(" ")[0]}`}
                variant="secondary"
                onPress={gate("sende melding", () =>
                  onNavigate((dm ? `/chat/${dm.id}` : "/chat") as Href),
                )}
              />
            )}
          </View>

          <View className="h-px bg-line" />

          <PreviewPart preview={preview} label="rammene" onEdit={edit("frame")}>
            <ThingsToKnowSection exp={exp} />
          </PreviewPart>

          {preview ? null : <View className="h-px bg-line" />}

          {/* Footer links. No "Sjekk inn når du er der": with no GPS
              arrival check it always said "Du er fremme!" (review
              2026-11-18 C2, #5). CheckinContent stays for when the check
              exists (C-Q1). */}
          {preview ? null : (
            <View className="gap-1">
              {/* Only for the host (0464: anyone could open the host view). */}
              {mine ? (
                <FooterLink
                  icon="settings-outline"
                  label="Administrer"
                  onPress={() => onOpen({ kind: "host", id: exp.id })}
                />
              ) : null}
              {/* Help, report and block behind one quiet link (Airbnb
                  tap-through 2026-11-26: three underlined rows read louder
                  than the page). Phase 18's help from this experience
                  stays the first choice; the host sees help only. */}
              <FooterLink
                quiet
                icon={mine ? "help-buoy-outline" : "flag-outline"}
                label={
                  mine ? "Få hjelp med opplevelsen" : "Få hjelp eller rapporter"
                }
                onPress={() =>
                  mine
                    ? onNavigate(`/settings/support?about=${exp.id}` as Href)
                    : setSheet("help")
                }
              />
            </View>
          )}

          {sheet === "help" ? (
            <ItemActionsSheet
              title="Få hjelp eller rapporter"
              onClose={() => setSheet(null)}
              actions={[
                {
                  label: "Få hjelp med opplevelsen",
                  icon: "help-buoy-outline",
                  afterClose: true,
                  onPress: () =>
                    onNavigate(`/settings/support?about=${exp.id}` as Href),
                },
                {
                  label: "Rapporter opplevelsen",
                  icon: "flag-outline",
                  afterClose: true,
                  onPress: gate("rapportere", () => setSheet("report")),
                },
                {
                  label: `Blokker ${hostName.split(" ")[0]}`,
                  icon: "ban-outline",
                  afterClose: true,
                  onPress: gate("blokkere", () => setSheet("block")),
                },
              ]}
            />
          ) : null}
          {sheet === "report" ? (
            <ReportSheet onClose={() => setSheet(null)} />
          ) : null}
          {sheet === "block" ? (
            <BlockSheet
              name={hostName}
              personId={host?.id}
              onClose={() => setSheet(null)}
            />
          ) : null}
          {signInPrompt}
        </>
      ) : null}
    </View>
  );
}

// Inset gallery (radius 20) that pages with dots; a tap opens the full-screen
// viewer at the shown photo, grown out of the gallery (0457).
export function HeroGallery({
  title,
  photos,
}: {
  title: string;
  photos: ImageSourcePropType[];
}) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [from, setFrom] = useState<Rect | null>(null);
  const [galleryRef, measureGallery] = useOriginRect();
  const open = () =>
    measureGallery((rect) => {
      setFrom(rect);
      setViewer(page);
    });
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((_e, ok) => {
      if (ok) open();
    });
  return (
    <>
      <GestureDetector gesture={tap}>
        <View
          ref={galleryRef}
          accessible
          accessibilityRole="imagebutton"
          accessibilityLabel={`${title}, ${photos.length} ${photos.length === 1 ? "bilde" : "bilder"}. Åpne bildene`}
          accessibilityActions={[{ name: "activate" }]}
          onAccessibilityAction={open}
          className="overflow-hidden rounded-lg bg-surfaceMuted"
          // Inside the page's 24 dp sides, a little taller than before
          // (Airbnb's listing photo).
          style={{ height: Math.round((width - 48) * 0.9) }}
        >
          <PhotoPager photos={photos} onIndexChange={setPage} />
        </View>
      </GestureDetector>
      <PhotoViewer
        photos={photos}
        index={viewer}
        onClose={() => setViewer(null)}
        label={title}
        from={from}
      />
    </>
  );
}

export function InfoRow({
  icon,
  leading,
  title,
  subtitle,
  lines = 1,
  onPress,
  action,
}: {
  icon?: IconName;
  leading?: React.ReactNode;
  title: string;
  subtitle?: string;
  lines?: number;
  onPress?: () => void;
  /** A word in place of the chevron (the Add preview's «Endre»). */
  action?: string;
}) {
  const body = (
    <>
      {/* Airbnb's fact rows: a bigger icon, the title in medium weight and
          the subtitle at the same size, muted (tap-through 2026-11-26). */}
      <View className="h-12 w-12 items-center justify-center">
        {leading ?? (icon ? <Icon name={icon} size="xl" tone="ink" /> : null)}
      </View>
      <View className="flex-1">
        <Text variant="body" weight="medium" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body" tone="muted" numberOfLines={lines}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress && action ? (
        <Text variant="label" weight="semibold" className="underline">
          {action}
        </Text>
      ) : onPress ? (
        <Icon name="chevron-forward" size="md" tone="muted" />
      ) : null}
    </>
  );
  const spoken = subtitle ? `${title}, ${subtitle}` : title;
  return onPress ? (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={action ? `${action}: ${spoken}` : spoken}
      onPress={onPress}
      contentClassName="flex-row items-center gap-4 rounded-sm py-3"
      pressedScale={0.99}
    >
      {body}
    </UIPressable>
  ) : (
    <View
      accessible
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      className="flex-row items-center gap-4 py-3"
    >
      {body}
    </View>
  );
}

export function FooterLink({
  icon,
  label,
  onPress,
  quiet = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** Help and safety: smaller and muted, so it does not compete with the
   *  page (Airbnb's «Rapporter denne annonsen»). */
  quiet?: boolean;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      onPress={onPress}
      contentClassName="flex-row items-center gap-3 py-3"
      pressedScale={0.99}
    >
      <Icon
        name={icon}
        size={quiet ? "sm" : "md"}
        tone={quiet ? "muted" : "ink"}
      />
      <Text
        variant="label"
        weight={quiet ? "regular" : "semibold"}
        tone={quiet ? "muted" : undefined}
        className="flex-1 underline"
      >
        {label}
      </Text>
    </UIPressable>
  );
}

// The Add preview's «Endre» links (review PR-07, 0525): underlined words at
// the end of a part, each going back to the step that holds it.
export function EditLinks({
  links,
}: {
  links: { label: string; onPress: () => void }[];
}) {
  return (
    <View className="flex-row justify-end gap-4">
      {links.map((l) => (
        <UIPressable
          key={l.label}
          accessibilityRole="button"
          accessibilityLabel={`Endre ${l.label}`}
          hitSlop={LINK_SLOP}
          onPress={l.onPress}
        >
          <Text variant="label" weight="semibold" className="underline">
            {`Endre ${l.label}`}
          </Text>
        </UIPressable>
      ))}
    </View>
  );
}

// A section in the Add preview: shown as it will be, but nothing in it acts
// (a session, directions, the map); «Endre» under it edits its part.
function PreviewPart({
  preview,
  label,
  onEdit,
  children,
}: {
  preview: ExperiencePageProps["preview"];
  label: string;
  onEdit: (() => void) | undefined;
  children: ReactNode;
}) {
  if (!preview || !onEdit) return <>{children}</>;
  return (
    <View className="gap-3">
      <View pointerEvents="none">{children}</View>
      <EditLinks links={[{ label, onPress: onEdit }]} />
    </View>
  );
}
