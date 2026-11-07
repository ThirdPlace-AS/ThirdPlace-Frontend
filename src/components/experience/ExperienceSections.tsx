// Experience page sections from the founder's reference video (Phase 12 H4b):
// "Hva dere skal gjøre" (steps → step carousel), "Ledige tider" (time
// cards → "Velg tidspunkt" sheet that drives the join card), "Hvor vi møtes"
// (map card + "Har du spørsmål?" → ask-host sheet), "Samtalen" (the
// experience's chat) and "Ting å vite" (rows → detail sheets). Every value
// comes from what the creator entered (MOCK fixtures); no policy is invented.
import { Image } from "expo-image";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import { showToastAfterSheet } from "@/components/Toast";
import {
  Avatar,
  Icon,
  IconButton,
  Input,
  LoadingImage,
  Overlay,
  Pressable,
  Sheet,
  StatusBarStyle,
  Text,
  type IconName,
} from "@/components/ui";
import { confirmToast } from "@/copy";
import {
  ACCESSIBILITY_ICONS,
  CHAT_ACCESS_LABEL,
  messagesForChat,
  placeById,
  sessionsFor,
  type MockChat,
  type MockExperience,
  type MockItineraryStep,
  type MockSession,
} from "@/fixtures";
import { dayLabel, shortSessionLabel, timeRange } from "@/lib/dates";
import { env } from "@/lib/env";
import { haptics } from "@/lib/haptics";
import { isMember, joinChat, useJoinedChats } from "@/lib/joinedChats";
import { useScheme } from "@/theme";

import { useExperienceSession } from "./useExperienceSession";

// ── Hva dere skal gjøre ──────────────────────────────────────────────────

export function ItinerarySection({ exp }: { exp: MockExperience }) {
  const [open, setOpen] = useState<number | null>(null);
  const steps = exp.itinerary;
  if (steps.length === 0) return null;
  return (
    <View className="gap-4">
      <Text variant="h2" accessibilityRole="header">
        Hva dere skal gjøre
      </Text>
      <View>
        {steps.map((s, i) => (
          <Pressable
            key={s.title}
            accessibilityRole="button"
            accessibilityLabel={`Steg ${i + 1} av ${steps.length}: ${s.title}`}
            onPress={() => setOpen(i)}
            pressedScale={0.99}
            contentClassName="flex-row gap-4"
          >
            <View className="items-center">
              <LoadingImage
                thumb
                source={s.photo}
                contentFit="cover"
                style={{ width: 64, height: 64, borderRadius: 12 }}
              />
              {/* The thin line joining the steps, as in the reference. */}
              {i < steps.length - 1 ? (
                <View
                  className="w-px flex-1 bg-line"
                  style={{ minHeight: 20 }}
                />
              ) : null}
            </View>
            <View className="flex-1 gap-1 pb-5">
              <Text variant="label" weight="semibold">
                {s.title}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={3}>
                {s.text}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
      <StepCarousel steps={steps} index={open} onClose={() => setOpen(null)} />
    </View>
  );
}

/** The steps as swipeable cards ("2 av 4"), opened at the tapped step. */
function StepCarousel({
  steps,
  index,
  onClose,
}: {
  steps: readonly MockItineraryStep[];
  index: number | null;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(index ?? 0);
  if (index !== null && index !== shown) setShown(index);
  return (
    <Overlay
      visible={index !== null}
      onClose={onClose}
      enter="fade"
      statusBarTranslucent
      accessibilityLabel="Hva dere skal gjøre"
    >
      <StepCards steps={steps} start={shown} onClose={onClose} />
    </Overlay>
  );
}

function StepCards({
  steps,
  start,
  onClose,
}: {
  steps: readonly MockItineraryStep[];
  start: number;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const card = width - 48;
  const step = card + 12;
  const [current, setCurrent] = useState(start);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setCurrent(Math.round(e.nativeEvent.contentOffset.x / step));
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBarStyle style="auto" />
      <View className="flex-row items-center justify-between px-gutter py-2">
        <View className="w-10" />
        <Text variant="label" weight="semibold">
          {`${current + 1} av ${steps.length}`}
        </Text>
        <IconButton icon="close" label="Lukk" onPress={onClose} />
      </View>
      <FlatList
        data={steps as MockItineraryStep[]}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        initialScrollIndex={Math.min(start, steps.length - 1)}
        getItemLayout={(_, i) => ({ length: step, offset: step * i, index: i })}
        onMomentumScrollEnd={onEnd}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
        keyExtractor={(s) => s.title}
        renderItem={({ item, index: i }) => (
          <View
            // Hug the content (a horizontal list stretches items to its height).
            style={{ width: card, alignSelf: "flex-start" }}
            className="mt-2 overflow-hidden rounded-xl border border-line bg-surface"
            accessible
            accessibilityLabel={`Steg ${i + 1} av ${steps.length}: ${item.title}. ${item.text}`}
          >
            <LoadingImage
              source={item.photo}
              contentFit="cover"
              style={{ width: card, height: card }}
            />
            <View className="gap-2 p-5">
              <Text variant="h2">{item.title}</Text>
              <Text variant="body" tone="muted">
                {item.text}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// ── Ledige tider (availability) ───────────────────────────────────────────

/** Sessions shown on the page and in the time sheet (stable per mount). */
export function useSessions(exp: MockExperience, count = 8) {
  const now = useMemo(() => new Date(), []);
  const sessions = useMemo(
    () => sessionsFor(exp, now, count),
    [exp, now, count],
  );
  return { now, sessions };
}

const placesLeft = (s: MockSession) =>
  s.spotsLeft > 0
    ? `${s.spotsLeft} ${s.spotsLeft === 1 ? "plass" : "plasser"} igjen`
    : "Fullt";

export function AvailabilitySection({ exp }: { exp: MockExperience }) {
  const { now, sessions } = useSessions(exp);
  const [chosenId, choose] = useExperienceSession(exp.id);
  const [sheetAt, setSheetAt] = useState<string | null>(null);
  if (sessions.length === 0) return null;
  return (
    <View className="gap-3">
      <View className="gap-0.5">
        <Text variant="h2" accessibilityRole="header">
          Ledige tider
        </Text>
        <Text variant="caption" tone="muted">
          {`${exp.repeat} · ${exp.duration}`}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={212}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 12 }}
      >
        {sessions.slice(0, 4).map((s) => {
          const on = s.id === chosenId;
          return (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${dayLabel(s.start, now)}, ${timeRange(s.start, s.end)}, ${placesLeft(s)}`}
              onPress={() => setSheetAt(s.id)}
              style={{ width: 200 }}
              contentClassName={`gap-1 rounded-lg p-4 ${
                on ? "border-2 border-ink" : "border border-line"
              }`}
            >
              <Text variant="label" weight="semibold" numberOfLines={1}>
                {dayLabel(s.start, now)}
              </Text>
              <Text variant="caption" tone="muted">
                {timeRange(s.start, s.end)}
              </Text>
              <Text
                variant="caption"
                tone={s.spotsLeft > 0 ? "muted" : "ink"}
                weight={s.spotsLeft > 0 ? "regular" : "semibold"}
              >
                {placesLeft(s)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        onPress={() => setSheetAt(chosenId ?? sessions[0]?.id ?? null)}
        hitSlop={8}
        className="self-start"
      >
        <Text variant="label" weight="semibold" className="underline">
          Se alle tider
        </Text>
      </Pressable>
      <SessionSheet
        exp={exp}
        sessions={sessions}
        now={now}
        visible={sheetAt !== null}
        initial={sheetAt}
        onClose={() => setSheetAt(null)}
        onPick={(id) => {
          haptics.selection();
          choose(id);
          setSheetAt(null);
        }}
      />
    </View>
  );
}

/** "Velg tidspunkt": every upcoming time grouped by day, full ones disabled. */
export function SessionSheet({
  exp,
  sessions,
  now,
  visible,
  initial,
  onClose,
  onPick,
}: {
  exp: MockExperience;
  sessions: readonly MockSession[];
  now: Date;
  visible: boolean;
  initial: string | null;
  onClose: () => void;
  onPick: (sessionId: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(initial);
  const [shown, setShown] = useState(visible);
  if (visible !== shown) {
    setShown(visible);
    if (visible) setDraft(initial);
  }
  const days = useMemo(() => {
    const map = new Map<string, MockSession[]>();
    for (const s of sessions) {
      const k = dayLabel(s.start, now);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()];
  }, [sessions, now]);
  const picked = sessions.find((s) => s.id === draft) ?? null;
  const price = exp.priceNok ? `${exp.priceNok} kr per person` : "Gratis";
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Velg tidspunkt"
      fullHeight
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 pb-4"
        showsVerticalScrollIndicator={false}
      >
        {days.map(([day, list]) => (
          <View key={day} className="gap-3">
            <Text variant="label" weight="semibold">
              {day}
            </Text>
            {list.map((s) => {
              const full = s.spotsLeft <= 0;
              const on = s.id === draft;
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on, disabled: full }}
                  accessibilityLabel={`${day}, ${timeRange(s.start, s.end)}, ${placesLeft(s)}`}
                  disabled={full}
                  dimWhenDisabled={false}
                  haptic="selection"
                  onPress={() => setDraft(s.id)}
                  contentClassName={`flex-row items-center justify-between rounded-lg p-4 ${
                    on ? "border-2 border-ink" : "border border-line"
                  }`}
                >
                  <View className="gap-0.5">
                    <Text
                      variant="body"
                      weight="semibold"
                      tone={full ? "muted" : "ink"}
                      className={full ? "line-through" : ""}
                    >
                      {timeRange(s.start, s.end)}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {price}
                    </Text>
                  </View>
                  <Text
                    variant="caption"
                    tone={full ? "ink" : "muted"}
                    weight={full ? "semibold" : "regular"}
                  >
                    {placesLeft(s)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
      {/* Sticky footer, as in the reference: the picked time and "Velg". */}
      <View className="flex-row items-center gap-3 border-t border-line pt-3">
        <Text variant="label" weight="semibold" className="flex-1">
          {picked ? shortSessionLabel(picked.start, now) : "Velg en tid"}
        </Text>
        <View style={{ minWidth: 120 }}>
          <Button
            label="Velg"
            variant="ink"
            rounded="full"
            disabled={!picked}
            onPress={() => picked && onPick(picked.id)}
          />
        </View>
      </View>
    </Sheet>
  );
}

// ── Hvor vi møtes ────────────────────────────────────────────────────────

export function MeetingSection({
  exp,
  hostName,
  onShowOnMap,
}: {
  exp: MockExperience;
  hostName: string;
  onShowOnMap: () => void;
}) {
  const [ask, setAsk] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const { isGuest } = useGuestMode();
  const mp = exp.meetingPoint;
  return (
    <View className="gap-3">
      <Text variant="h2" accessibilityRole="header">
        Hvor vi møtes
      </Text>
      <View className="gap-0.5">
        <Text variant="label" weight="semibold">
          {mp.name}
        </Text>
        <Text variant="caption" tone="muted">
          {mp.address}
        </Text>
      </View>
      <MeetingMap coord={mp.coord} onShowOnMap={onShowOnMap} />
      <Pressable
        accessibilityRole="button"
        // Guests read but do not send (CLAUDE.md "Guest mode").
        onPress={() => (isGuest ? setPrompt(true) : setAsk(true))}
        contentClassName="flex-row items-center gap-3 rounded-full border border-line px-4 py-3"
      >
        <Icon name="chatbubble-outline" size="md" tone="ink" />
        <Text variant="label" className="flex-1">
          Har du spørsmål?
        </Text>
        <Text variant="label" weight="semibold" className="underline">
          Send melding
        </Text>
      </Pressable>
      <AskHostSheet
        visible={ask}
        hostName={hostName}
        onClose={() => setAsk(false)}
      />
      <SignInPrompt
        visible={prompt}
        onClose={() => setPrompt(false)}
        action="sende melding til verten"
      />
    </View>
  );
}

/** Static map card (Mapbox Static Images with the public token; a calm
 *  placeholder without one) with our own pin, like the reference's map card.
 *  No second live map: the page sits in a sheet/Modal over the real map. */
export function MeetingMap({
  coord,
  label = "Møtested",
  onShowOnMap,
}: {
  coord: [number, number];
  /** Pin label (experiences: "Møtested"; a place: its name). */
  label?: string;
  onShowOnMap: () => void;
}) {
  const { width } = useWindowDimensions();
  const scheme = useScheme();
  const w = Math.min(640, Math.round(width - 32));
  const h = 200;
  const token = env.mapboxToken;
  const style = scheme === "dark" ? "dark-v11" : "light-v11";
  const uri = token
    ? `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${coord[0]},${coord[1]},14.5,0/${w}x${h}@2x?access_token=${token}`
    : null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. Vis på kartet`}
      onPress={onShowOnMap}
      pressedScale={0.99}
      contentClassName="overflow-hidden rounded-xl border border-line bg-surfaceMuted"
      contentStyle={{ height: h }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={StyleSheet.absoluteFill}
          accessible={false}
        />
      ) : (
        <View style={StyleSheet.absoluteFill} className="bg-surfaceMuted" />
      )}
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        className="items-center justify-center"
      >
        <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-ink">
          <View className="h-2.5 w-2.5 rounded-full bg-surface" />
        </View>
        <View className="mt-1 rounded-full bg-surface px-2 py-0.5">
          <Text variant="caption" weight="semibold" numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
      <View className="absolute right-3 top-3" pointerEvents="none">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-surface">
          <Icon name="map-outline" size="md" tone="ink" />
        </View>
      </View>
    </Pressable>
  );
}

const MIN_MESSAGE = 20;

/** "Har du spørsmål?": a short message to the host (sent in product voice). */
export function AskHostSheet({
  visible,
  hostName,
  onClose,
}: {
  visible: boolean;
  hostName: string;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const n = text.trim().length;
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={`Spør ${hostName.split(" ")[0]}`}
    >
      <View className="gap-3">
        <Text variant="label" tone="muted" weight="regular">
          Send en melding for å høre mer om opplevelsen.
        </Text>
        <Input
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Si kort hvem du er og hva du lurer på."
          maxLength={500}
          autoFocus
        />
        <Text variant="caption" tone="muted">
          {`${Math.min(n, MIN_MESSAGE)}/${MIN_MESSAGE} tegn`}
        </Text>
        <Button
          label="Send melding"
          variant="ink"
          disabled={n < MIN_MESSAGE}
          onPress={() => {
            setText("");
            onClose();
            showToastAfterSheet(confirmToast.messageSent);
          }}
        />
      </View>
    </Sheet>
  );
}

// ── Samtalen ─────────────────────────────────────────────────────────────

export function ChatSection({
  chat,
  onNavigate,
}: {
  /** The experience's or the place's chat (none: no section). */
  chat: MockChat | undefined;
  onNavigate: (href: Href) => void;
}) {
  const joined = useJoinedChats();
  const { isGuest } = useGuestMode();
  const [prompt, setPrompt] = useState(false);
  if (!chat) return null;
  const member = isMember(chat, joined);
  const last = messagesForChat(chat.id).at(-1);
  const open = () => {
    if (!member) {
      if (isGuest) {
        setPrompt(true);
        return;
      }
      haptics.light();
      joinChat(chat.id);
    }
    onNavigate(`/chat/${chat.id}` as Href);
  };
  return (
    <View className="gap-3">
      <Text variant="h2" accessibilityRole="header">
        Samtalen
      </Text>
      <View className="gap-3 rounded-lg border border-line p-4">
        <View className="flex-row items-center gap-3">
          <Avatar name={chat.name} icon="chatbubbles-outline" size="md" />
          <View className="flex-1">
            <Text variant="label" weight="semibold" numberOfLines={1}>
              {chat.name}
            </Text>
            <Text variant="caption" tone="muted">
              {`${chat.members ?? 0} medlemmer · ${CHAT_ACCESS_LABEL[chat.access]}`}
            </Text>
          </View>
        </View>
        {last ? (
          <Text variant="label" weight="regular" numberOfLines={2}>
            <Text variant="label" weight="semibold">
              {`${last.author}: `}
            </Text>
            {last.text}
          </Text>
        ) : null}
        <Button
          label={member ? "Åpne samtalen" : "Bli med i samtalen"}
          variant={member ? "secondary" : "ink"}
          rounded="full"
          onPress={open}
        />
      </View>
      <SignInPrompt
        visible={prompt}
        onClose={() => setPrompt(false)}
        action="bli med i samtalen"
      />
    </View>
  );
}

// ── Ting å vite ──────────────────────────────────────────────────────────

export type Know = {
  key: string;
  icon: IconName;
  title: string;
  summary: string;
  detail: { icon: IconName; text: string }[];
};

const ACCESS_TEXT: Record<MockExperience["access"], string> = {
  Alle: "Alle kan melde seg på.",
  "Godkjennes av deg": "Verten godkjenner påmeldingene.",
  "Kun invitasjon": "Bare de som er invitert, kan bli med.",
};

/** The creator's choices behind "Ting å vite" (no rules beyond them). */
export function thingsToKnow(exp: MockExperience): Know[] {
  const place = placeById(exp.placeId);
  const a11y = place?.accessibility ?? [];
  return [
    {
      key: "krav",
      icon: "people-outline",
      title: "Krav til deltakere",
      summary: `Fra 18 år. ${ACCESS_TEXT[exp.access]}`,
      detail: [
        {
          icon: "id-card-outline",
          text: "ThirdPlace er for deg som er 18 år eller eldre.",
        },
        { icon: "people-outline", text: ACCESS_TEXT[exp.access] },
      ],
    },
    {
      key: "aktivitet",
      icon: "pulse-outline",
      title: "Aktivitetsnivå",
      summary: `${exp.energy} aktivitetsnivå`,
      detail: [
        {
          icon: "pulse-outline",
          text: `Verten har satt aktivitetsnivået til ${exp.energy.toLowerCase()}.`,
        },
      ],
    },
    {
      key: "avbestilling",
      icon: "calendar-clear-outline",
      title: "Avbestilling",
      summary: exp.cancellation,
      detail: [
        {
          icon: "calendar-clear-outline",
          text: `Verten har valgt: ${exp.cancellation.toLowerCase()}.`,
        },
      ],
    },
    {
      key: "tilgjengelighet",
      icon: "accessibility-outline",
      title: "Tilgjengelighet",
      summary: a11y.length > 0 ? a11y.join(", ") : "Utendørs møtested",
      detail:
        a11y.length > 0
          ? a11y.map((t) => ({
              icon: (ACCESSIBILITY_ICONS[t] ?? "checkmark-outline") as IconName,
              text: t,
            }))
          : [
              {
                icon: "leaf-outline",
                text: "Møtestedet er utendørs. Spør verten om tilrettelegging.",
              },
            ],
    },
  ];
}

export function ThingsToKnowSection({ exp }: { exp: MockExperience }) {
  return <KnowSection items={thingsToKnow(exp)} />;
}

/** "Ting å vite": rows that open a short sheet (experiences and places). */
export function KnowSection({ items }: { items: Know[] }) {
  const [open, setOpen] = useState<Know | null>(null);
  return (
    <View className="gap-2">
      <Text variant="h2" accessibilityRole="header">
        Ting å vite
      </Text>
      {items.map((k) => (
        <Pressable
          key={k.key}
          accessibilityRole="button"
          accessibilityLabel={`${k.title}, ${k.summary}`}
          onPress={() => setOpen(k)}
          pressedScale={0.99}
          contentClassName="flex-row items-center gap-3 py-3"
        >
          <Icon name={k.icon} size="lg" tone="ink" />
          <View className="flex-1">
            <Text variant="label" weight="semibold">
              {k.title}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={2}>
              {k.summary}
            </Text>
          </View>
          <Icon name="chevron-forward" size="md" tone="muted" />
        </Pressable>
      ))}
      <Sheet
        visible={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title}
      >
        <View className="gap-4">
          {open?.detail.map((d) => (
            <View key={d.text} className="flex-row items-center gap-3">
              <Icon name={d.icon} size="lg" tone="ink" />
              <Text variant="body" className="flex-1">
                {d.text}
              </Text>
            </View>
          ))}
        </View>
      </Sheet>
    </View>
  );
}
