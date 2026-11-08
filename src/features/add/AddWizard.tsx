import { Image } from "expo-image";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Switch } from "@/components/ui/Switch";
import {
  ChipGroup,
  Icon,
  Screen,
  StepContent,
  StepHeader,
  StickyFooter,
  type IconName,
  Pressable as UIPressable,
  Text,
  IconButton,
  FadeSwap,
  Sheet,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { haptics } from "@/lib/haptics";
import {
  CategoryArt,
  hasCategoryArt,
} from "@/components/illustrations/CategoryArt";
import { areaFor } from "@/components/experience/experienceMeta";
import { Input } from "@/components/Input";
import { CategoryPicker, PlacePicker } from "@/components/pickers/Pickers";
import {
  CANCELLATION_OPTIONS,
  CHAT_ACCESS_LABEL,
  DURATION_OPTIONS,
  ENERGY_LEVELS,
  EXPERIENCE_ACCESS,
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_LANGUAGES,
  EXPERIENCE_VIBES,
  experienceById,
  experiences,
  AREAS,
  people,
  places,
  REPEAT_OPTIONS,
  type MockChatAccess,
  type MockExperience,
} from "@/fixtures";
import {
  createExperience,
  createGroup,
  hostedExperiences,
} from "@/fixtures/created";
import { libThumb, smallImage, type LibraryKey } from "@/fixtures/images";

import {
  type AddDraft,
  type AddKind,
  advanceHint,
  canAdvance,
  draftCopyOf,
  draftFromExperience,
  EMPTY_DRAFT,
  minPhotos,
  type StepKey,
  stepsFor,
} from "./types";

// Bundled sample art reused as the demo photo pool (MOCK — no media contract).
const PHOTO_POOL = experiences.flatMap((e) => e.photos).slice(0, 9);
// A group's gallery uses library photos (groups store library keys).
const GROUP_POOL: LibraryKey[] = [
  "group-coffee",
  "group-books",
  "group-wine",
  "group-run",
  "group-climb",
  "venue-cafe",
  "venue-books",
  "venue-outdoor",
  "venue-gallery",
];
// Interests people already use in their profiles (no new taxonomy).
const GROUP_INTERESTS = Array.from(
  new Set(people.flatMap((p) => p.interests)),
).slice(0, 14);
// Who can join a group: the chat access modes with the chat's own labels
// (the group chat header shows the same word).
const GROUP_ACCESS: { value: MockChatAccess; title: string; hint: string }[] = [
  { value: "open", title: CHAT_ACCESS_LABEL.open, hint: "Alle kan bli med." },
  {
    value: "closed",
    title: CHAT_ACCESS_LABEL.closed,
    hint: "Du godkjenner nye medlemmer.",
  },
  {
    value: "invite_only",
    title: CHAT_ACCESS_LABEL.invite_only,
    hint: "Bare de du inviterer, kan bli med.",
  },
];
const MAX_STEPS = 5;

const PLACE_CATEGORIES = [
  "Kafé",
  "Bar",
  "Restaurant",
  "Utendørs",
  "Kultur",
  "Verksted",
];
const PLACE_FEATURES = [
  "Har åpningstider",
  "Rullestolvennlig",
  "Nær kollektivtransport",
  "Parkering tilgjengelig",
];
const START_TIMES = ["10:00", "14:00", "18:00", "20:00"];
// What a creator can enter for an experience: the same option lists the
// fixtures use, so every experience page section has a source.
const DURATIONS = DURATION_OPTIONS;
const REPEATS = REPEAT_OPTIONS;
const ACCESS = EXPERIENCE_ACCESS;
const CANCELLATION = CANCELLATION_OPTIONS;
const VIBES = EXPERIENCE_VIBES;
const ENERGY = ENERGY_LEVELS;
const LANGUAGES = EXPERIENCE_LANGUAGES;
// Places a host could pick for an experience (MOCK — no ownership model).
const HOST_PLACES = places.slice(0, 2);

const toggle = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

const MONTHS = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];
const WEEKDAYS = [
  "Søndag",
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
];
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}. ${MONTHS[date.getMonth()]}`;
}

// The Add flows, per the design (PDF p10–p12). "Hva vil du legge til?" offers
// Sted or Opplevelse. A place takes 5 steps and ends in "Send inn til
// vurdering" (places are reviewed manually); an experience takes 7 steps and
// ends in "Publiser opplevelsen". The end state confirms in product voice
// (founder decision 2026-11-06); BLOCKED_CONTRACT_GAP: nothing is persisted.
export function AddWizard() {
  const [draft, setDraft] = useState<AddDraft>(EMPTY_DRAFT);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  // Ids of what the submit created (group + its chat, or the experience).
  const [created, setCreated] = useState<{
    groupId?: string;
    chatId?: string;
    experienceId?: string;
  }>({});
  // Kalender "Rediger" → /add?edit=<id>&at=<stamp>: seed the draft once per
  // request (the tab stays mounted, so a stamp tells repeat taps apart).
  const { edit, at } = useLocalSearchParams<{ edit?: string; at?: string }>();
  const editKey = edit ? `${edit}:${at ?? ""}` : undefined;
  const [seeded, setSeeded] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  if (editKey && editKey !== seeded) {
    setSeeded(editKey);
    const source = experienceById(edit ?? "");
    if (source) {
      setDraft(draftFromExperience(source));
      setStepIndex(0);
      setSubmitted(false);
      setEditing(true);
    }
  }

  const steps = stepsFor(draft.kind);
  const step = steps[Math.min(stepIndex, steps.length - 1)] ?? "kind";
  const patch = (p: Partial<AddDraft>) => setDraft((d) => ({ ...d, ...p }));

  const reset = () => {
    setDraft(EMPTY_DRAFT);
    setStepIndex(0);
    setSubmitted(false);
    setEditing(false);
    setCreated({});
  };

  if (submitted && draft.kind) {
    return (
      <SubmittedState
        draft={draft}
        editing={editing}
        created={created}
        onReset={reset}
      />
    );
  }

  if (step === "kind") {
    return (
      <KindMenu
        onPick={(kind) => {
          setDraft({ ...EMPTY_DRAFT, kind });
          setStepIndex(0);
          setEditing(false);
        }}
      />
    );
  }

  const isLast = step === "review";
  const back = () => {
    if (stepIndex > 0) return setStepIndex((i) => i - 1);
    setDraft(EMPTY_DRAFT);
    setEditing(false);
  };
  const next = () => {
    if (!isLast) return setStepIndex((i) => i + 1);
    haptics.light();
    if (draft.kind === "group") {
      setCreated(
        createGroup({
          name: draft.title,
          about: draft.summary,
          interests: draft.interests,
          area: draft.area ?? "Oslo",
          photos: draft.photos.map((i) => GROUP_POOL[i]!),
          access: draft.groupAccess,
          rules: draft.groupRules,
        }),
      );
    } else if (draft.kind === "experience" && !editing) {
      setCreated({
        experienceId: createExperience({
          title: draft.title,
          about: draft.summary,
          category: draft.category ?? "Sosialt",
          area: draft.area ?? "Grünerløkka",
          meetingPoint: draft.meetingPoint,
          photos: draft.photos.map((i) => PHOTO_POOL[i]!),
          date: draft.date ?? "",
          startTime: draft.startTime ?? "18:00",
          duration: draft.duration,
          repeat: draft.repeat,
          capacity: Number(draft.capacity) || 1,
          priceNok: Number(draft.price) || 0,
          access: draft.access,
          cancellation: draft.cancellation,
          vibes: draft.vibes,
          energy: draft.energy,
          languages: draft.languages,
          included: draft.included,
          steps: draft.steps,
        }),
      });
    }
    setSubmitted(true);
  };

  return (
    <Screen edges={["top"]}>
      <StepHeader
        current={stepIndex}
        total={steps.length}
        onBack={back}
        label={`Steg ${stepIndex + 1} av ${steps.length}`}
      />

      {/* Edge-to-edge Android does not resize for the keyboard, so the step
          and its footer move up themselves (padding on both platforms). */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        {/* New step: fresh scroll at its top, faded in. */}
        <FadeSwap swapKey={step} style={{ flex: 1 }}>
          <ScrollView
            contentContainerClassName="gap-5 p-gutter pb-8"
            keyboardShouldPersistTaps="handled"
          >
            <StepBody step={step} draft={draft} patch={patch} />
          </ScrollView>
        </FadeSwap>

        <StickyFooter>
          <Button
            label={
              !isLast
                ? "Neste"
                : editing
                  ? "Lagre endringer"
                  : draft.kind === "place"
                    ? "Send inn til vurdering"
                    : draft.kind === "group"
                      ? "Opprett gruppen"
                      : "Publiser opplevelsen"
            }
            variant={isLast && draft.kind === "experience" ? "ember" : "ink"}
            disabled={!canAdvance(step, draft)}
            onPress={next}
          />
          {advanceHint(step, draft) ? (
            <Text variant="caption" tone="muted" className="text-center">
              {advanceHint(step, draft)}
            </Text>
          ) : null}
        </StickyFooter>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function KindMenu({ onPick }: { onPick: (k: AddKind) => void }) {
  const insets = useSafeAreaInsets();
  const rows: {
    kind: AddKind;
    label: string;
    hint: string;
    icon: IconName;
  }[] = [
    {
      kind: "place",
      label: "Sted",
      hint: "Del en kafé, en park eller et utsiktspunkt",
      icon: "location-outline",
    },
    {
      kind: "experience",
      label: "Opplevelse",
      hint: "Arranger noe, stort eller lite",
      icon: "tp-experience",
    },
    {
      kind: "group",
      label: "Gruppe",
      hint: "Samle folk rundt noe dere liker",
      icon: "people-outline",
    },
  ];
  return (
    <View
      className="flex-1 justify-end bg-background"
      style={{ paddingTop: insets.top }}
    >
      <View className="gap-3 p-gutter pb-6">
        <Text variant="h1" className="pb-1">
          Hva vil du legge til?
        </Text>
        <UIPressable
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          accessibilityRole="button"
          onPress={() => router.push("/import")}
          className="self-start"
          contentClassName="flex-row items-center gap-2 py-1"
        >
          <Icon name="link-outline" size="sm" tone="ember" />
          <Text variant="label" weight="semibold" tone="ember">
            Importer fra lenke
          </Text>
        </UIPressable>
        {rows.map((r) => (
          <UIPressable
            key={r.kind}
            accessibilityRole="button"
            onPress={() => onPick(r.kind)}
            contentClassName="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4"
            pressedScale={0.99}
          >
            <View className="h-12 w-12 items-center justify-center">
              {hasCategoryArt(r.label) ? (
                <CategoryArt name={r.label} size={48} />
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-full bg-surfaceMuted">
                  <Icon name={r.icon} size="lg" tone="ink" />
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text variant="body" weight="semibold">
                {r.label}
              </Text>
              <Text variant="caption" tone="muted">
                {r.hint}
              </Text>
            </View>
            <Icon name="chevron-forward" size="md" tone="muted" />
          </UIPressable>
        ))}
      </View>
    </View>
  );
}

function StepBody({
  step,
  draft,
  patch,
}: {
  step: StepKey;
  draft: AddDraft;
  patch: (p: Partial<AddDraft>) => void;
}) {
  const isPlace = draft.kind === "place";
  const isGroup = draft.kind === "group";
  const [picker, setPicker] = useState(false);
  const [startFrom, setStartFrom] = useState(false);
  const [newItem, setNewItem] = useState("");
  switch (step) {
    case "about":
      if (isGroup)
        return (
          <Shell
            title="Om gruppen"
            subtitle="Hva heter gruppen, og hva samles dere om?"
          >
            <Input
              label="Navn"
              placeholder="F.eks. «Løpegjengen på Løkka»"
              value={draft.title}
              onChangeText={(t) => patch({ title: t })}
              maxLength={50}
            />
            <Input
              label="Beskrivelse"
              placeholder="Hva gjør dere sammen?"
              value={draft.summary}
              onChangeText={(t) => patch({ summary: t })}
              multiline
              maxLength={280}
            />
            <Label>Interesser</Label>
            <ChipRow
              options={GROUP_INTERESTS}
              selected={draft.interests}
              onPress={(i) => patch({ interests: toggle(draft.interests, i) })}
            />
          </Shell>
        );
      return (
        <Shell
          title={isPlace ? "Fortell om stedet" : "Hva skjer?"}
          subtitle={
            isPlace
              ? "Hva heter det, og hva slags sted er det?"
              : "Grunnleggende om opplevelsen din."
          }
        >
          {/* Phase 16: hosts start from one of their experiences instead of
              typing it again; offered while the step is still empty. */}
          {!isPlace &&
          !draft.title &&
          !draft.summary &&
          hostedExperiences().length > 0 ? (
            <UIPressable
              accessibilityRole="button"
              accessibilityHint="Fyller inn fra en du har holdt før"
              onPress={() => setStartFrom(true)}
              contentClassName="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-3.5"
              pressedScale={0.99}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
                <Icon name="copy-outline" size="md" tone="ink" />
              </View>
              <View className="flex-1">
                <Text variant="label" weight="semibold">
                  Start fra en tidligere opplevelse
                </Text>
                <Text variant="caption" tone="muted">
                  Det du skrev sist blir fylt inn. Du velger ny tid.
                </Text>
              </View>
              <Icon name="chevron-forward" size="md" tone="muted" />
            </UIPressable>
          ) : null}
          <StartFromSheet
            visible={startFrom}
            onClose={() => setStartFrom(false)}
            onPick={(e) => {
              patch(copyOf(e));
              haptics.light();
            }}
          />
          <Input
            label="Navn"
            placeholder={
              isPlace
                ? "F.eks. «Hemmelig takterrasse»"
                : "F.eks. «Kaffekurs: Latte art for nybegynnere»"
            }
            value={draft.title}
            onChangeText={(t) => patch({ title: t })}
            maxLength={60}
          />
          <CategoryField
            options={isPlace ? PLACE_CATEGORIES : EXPERIENCE_CATEGORIES}
            value={draft.category || null}
            onChange={(c) => patch({ category: c })}
          />
          <Input
            label="Beskrivelse"
            placeholder={
              isPlace
                ? "Hva gjør dette stedet spesielt?"
                : "Hva skal dere gjøre, og hva er inkludert?"
            }
            value={draft.summary}
            onChangeText={(t) => patch({ summary: t })}
            multiline
            maxLength={280}
          />
        </Shell>
      );

    case "where":
      return isPlace || isGroup ? (
        <Shell
          title={isGroup ? "Hvor holder dere til?" : "Hvor er det?"}
          subtitle={
            isGroup
              ? "Velg området gruppen møtes i."
              : "Velg området stedet ligger i."
          }
        >
          <ChipRow
            options={AREAS.map((a) => a.name)}
            selected={draft.area ? [draft.area] : []}
            onPress={(a) => patch({ area: a })}
          />
          {draft.area ? (
            <View className="flex-row items-center gap-2">
              <Icon name="location" size="sm" tone="ink" />
              <Text variant="label">{draft.area}, Oslo</Text>
            </View>
          ) : null}
        </Shell>
      ) : (
        <Shell
          title="Hvor skjer det?"
          subtitle="Velg et sted, eller et område."
        >
          {HOST_PLACES.map((p) => (
            <SelectRow
              key={p.id}
              icon="cafe-outline"
              title={p.name}
              hint={p.address}
              selected={draft.area === p.name}
              onPress={() => patch({ area: p.name })}
            />
          ))}
          <UIPressable
            accessibilityRole="button"
            onPress={() => setPicker(true)}
            contentClassName="flex-row items-center gap-2 rounded-md border border-line bg-surface p-3.5"
            pressedScale={0.99}
          >
            <Icon name="search" size="sm" tone="muted" />
            <Text variant="caption" tone="muted" className="flex-1">
              {draft.area &&
              !HOST_PLACES.some((p) => p.name === draft.area) &&
              !AREAS.some((a) => a.name === draft.area)
                ? `Valgt: ${draft.area}`
                : "Søk etter et annet sted …"}
            </Text>
          </UIPressable>
          {picker ? (
            <PlacePicker
              onPick={(pl) => patch({ area: pl.name })}
              onClose={() => setPicker(false)}
            />
          ) : null}
          <Label>Annet sted</Label>
          <ChipRow
            options={AREAS.map((a) => a.name)}
            selected={draft.area ? [draft.area] : []}
            onPress={(a) => patch({ area: a })}
          />
          <Input
            label="Valgfritt: eget oppmøtested"
            placeholder="F.eks. «Møt ved inngangen»"
            value={draft.meetingPoint}
            onChangeText={(t) => patch({ meetingPoint: t })}
            maxLength={80}
          />
        </Shell>
      );

    case "photos":
      return (
        <Shell
          title={isPlace ? "Vis det frem" : "Bilder"}
          subtitle={
            minPhotos(draft.kind) > 1
              ? "Legg til minst to bilder. Første bilde blir hovedbildet."
              : "Legg til minst ett bilde. Første bilde blir hovedbildet."
          }
        >
          <View className="flex-row flex-wrap gap-2">
            {(isGroup ? GROUP_POOL.map((k) => libThumb(k)) : PHOTO_POOL).map(
              (src, i) => {
                const pos = draft.photos.indexOf(i);
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityLabel={`Bilde ${i + 1}`}
                    accessibilityState={{ selected: pos >= 0 }}
                    onPress={() =>
                      patch({
                        photos:
                          pos >= 0
                            ? draft.photos.filter((x) => x !== i)
                            : [...draft.photos, i],
                      })
                    }
                    className="w-[31.5%]"
                  >
                    <Image
                      source={smallImage(src)}
                      contentFit="cover"
                      style={{
                        aspectRatio: 1,
                        width: "100%",
                        borderRadius: 10,
                      }}
                    />
                    {pos >= 0 ? (
                      <View className="absolute right-1.5 top-1.5 h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5">
                        <Text variant="caption" weight="bold" tone="onInk">
                          {pos + 1}
                        </Text>
                      </View>
                    ) : null}
                    {pos === 0 ? (
                      <View className="absolute bottom-1.5 left-1.5 rounded-full bg-ink px-2 py-0.5">
                        <Text variant="caption" weight="semibold" tone="onInk">
                          Hovedbilde
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              },
            )}
          </View>
          <Text variant="caption" tone="muted">
            {minPhotos(draft.kind) > 1
              ? "Minst 2 bilder påkrevd · JPG, PNG · maks 10 MB"
              : "Minst 1 bilde påkrevd · JPG, PNG · maks 10 MB"}
          </Text>
        </Shell>
      );

    case "details":
      return (
        <Shell
          title="Detaljer"
          subtitle="Hjelp folk å vite hva de kan forvente."
        >
          <View className="gap-1">
            {PLACE_FEATURES.map((f) => (
              <View
                key={f}
                className="flex-row items-center justify-between py-2"
              >
                <Text variant="body">{f}</Text>
                <Switch
                  value={draft.features.includes(f)}
                  onValueChange={() =>
                    patch({ features: toggle(draft.features, f) })
                  }
                  label={f}
                />
              </View>
            ))}
          </View>
          <Label>Sesong</Label>
          <ChipRow
            options={["Hele året", "Sommer", "Vinter"]}
            selected={[draft.season]}
            onPress={(s) => patch({ season: s })}
          />
        </Shell>
      );

    case "when":
      return (
        <Shell title="Når skjer det?">
          <MonthPicker
            value={draft.date}
            onChange={(d) => patch({ date: d })}
          />
          <Label>Starter</Label>
          <ChipRow
            options={START_TIMES}
            selected={draft.startTime ? [draft.startTime] : []}
            onPress={(t) => patch({ startTime: t })}
          />
          {draft.date && draft.startTime ? (
            <Text variant="label">
              {formatDate(draft.date)} · {draft.startTime}
            </Text>
          ) : null}
          <Label>Varighet</Label>
          <ChipRow
            options={DURATIONS}
            selected={[draft.duration]}
            onPress={(d) => patch({ duration: d })}
          />
          <Label>Gjentas</Label>
          <ChipRow
            options={REPEATS}
            selected={[draft.repeat]}
            onPress={(r) => patch({ repeat: r })}
          />
        </Shell>
      );

    case "frame":
      return (
        <Shell title="Rammene" subtitle="Kapasitet, pris og avbestilling.">
          <Input
            label="Kapasitet (plasser)"
            placeholder="F.eks. 12"
            keyboardType="numeric"
            value={draft.capacity}
            onChangeText={(t) => patch({ capacity: t.replace(/\D/g, "") })}
            maxLength={4}
          />
          <Input
            label="Pris per person (kr)"
            helper="La feltet stå tomt hvis det er gratis."
            placeholder="F.eks. 350"
            keyboardType="numeric"
            value={draft.price}
            onChangeText={(t) => patch({ price: t.replace(/\D/g, "") })}
            maxLength={5}
          />
          <Label>Hvem kan bli med?</Label>
          <ChipRow
            options={ACCESS}
            selected={[draft.access]}
            onPress={(a) => patch({ access: a })}
          />
          <Text variant="caption" tone="muted">
            Alle = hvem som helst kan bli med · Godkjenning = du bestemmer ·
            Invitasjon = kun inviterte
          </Text>
          <Label>Avbestilling</Label>
          <ChipRow
            options={CANCELLATION}
            selected={[draft.cancellation]}
            onPress={(c) => patch({ cancellation: c })}
          />
        </Shell>
      );

    case "mood":
      return (
        <Shell
          title="Sett stemningen"
          subtitle="Vibes hjelper folk å finne opplevelser som passer dem."
        >
          <Label>Vibes</Label>
          <ChipRow
            options={VIBES}
            selected={draft.vibes}
            onPress={(v) => patch({ vibes: toggle(draft.vibes, v) })}
          />
          <Label>Energinivå</Label>
          <ChipRow
            options={ENERGY}
            selected={draft.energy ? [draft.energy] : []}
            onPress={(e) => patch({ energy: e })}
          />
          <Label>Språk</Label>
          <ChipRow
            options={LANGUAGES}
            selected={draft.languages}
            onPress={(l) => patch({ languages: toggle(draft.languages, l) })}
          />
        </Shell>
      );

    case "plan":
      return (
        <Shell
          title="Hva skjer underveis?"
          subtitle="Valgfritt. Vises på siden til opplevelsen."
        >
          <Label>Hva er inkludert</Label>
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <Input
                label="Legg til noe som er inkludert"
                placeholder="F.eks. «En kopp kaffe»"
                value={newItem}
                onChangeText={setNewItem}
                maxLength={50}
              />
            </View>
            <View className="pb-0.5">
              <Button
                label="Legg til"
                variant="secondary"
                disabled={newItem.trim().length < 2}
                onPress={() => {
                  patch({ included: [...draft.included, newItem.trim()] });
                  setNewItem("");
                }}
              />
            </View>
          </View>
          {draft.included.length ? (
            <View className="flex-row flex-wrap gap-2">
              {draft.included.map((it) => (
                <UIPressable
                  key={it}
                  accessibilityRole="button"
                  accessibilityLabel={`Fjern ${it}`}
                  onPress={() =>
                    patch({
                      included: draft.included.filter((x) => x !== it),
                    })
                  }
                  contentClassName="flex-row items-center gap-1.5 rounded-full bg-surfaceMuted px-3 py-1.5"
                >
                  <Text variant="caption" weight="medium">
                    {it}
                  </Text>
                  <Icon name="close" size="sm" tone="muted" />
                </UIPressable>
              ))}
            </View>
          ) : null}
          <Label>Hva dere skal gjøre</Label>
          {draft.steps.map((st, i) => (
            <Input
              key={i}
              label={`Steg ${i + 1}`}
              placeholder="F.eks. «Vi møtes og hilser på hverandre»"
              value={st}
              onChangeText={(t) =>
                patch({
                  steps: draft.steps.map((x, j) => (j === i ? t : x)),
                })
              }
              maxLength={60}
            />
          ))}
          {draft.steps.length < MAX_STEPS ? (
            <UIPressable
              accessibilityRole="button"
              onPress={() => patch({ steps: [...draft.steps, ""] })}
              className="self-start"
              contentClassName="flex-row items-center gap-2 rounded-full border border-line bg-surface px-3 py-2"
              pressedScale={0.99}
            >
              <Icon name="add" size="sm" tone="ink" />
              <Text variant="label">Legg til et steg</Text>
            </UIPressable>
          ) : null}
        </Shell>
      );

    case "access":
      return (
        <Shell
          title="Hvem kan bli med?"
          subtitle="Velg hvem som kan bli med i gruppen."
        >
          {GROUP_ACCESS.map((a) => (
            <SelectRow
              key={a.value}
              icon={
                a.value === "open"
                  ? "earth-outline"
                  : a.value === "closed"
                    ? "checkmark-circle-outline"
                    : "mail-outline"
              }
              title={a.title}
              hint={a.hint}
              selected={draft.groupAccess === a.value}
              onPress={() => patch({ groupAccess: a.value })}
            />
          ))}
          {/* Phase 18 (screen benchmark): the group's rules, in the
              creator's words; shown on the group page. */}
          <Input
            label="Regler for gruppen"
            placeholder="Valgfritt: det som gjelder hos dere"
            value={draft.groupRules}
            onChangeText={(t) => patch({ groupRules: t })}
            multiline
            maxLength={500}
          />
        </Shell>
      );

    case "review":
      return <ReviewStep draft={draft} />;

    default:
      return null;
  }
}

function ReviewStep({ draft }: { draft: AddDraft }) {
  const isPlace = draft.kind === "place";
  const isGroup = draft.kind === "group";
  const first = draft.photos[0];
  const cover =
    first === undefined
      ? null
      : isGroup
        ? libThumb(GROUP_POOL[first]!)
        : PHOTO_POOL[first];
  const price =
    draft.price && draft.price !== "0" ? `${draft.price} kr` : "Gratis";
  const steps = draft.steps.map((x) => x.trim()).filter(Boolean);
  return (
    <Shell
      title={
        isPlace
          ? "Se over og send inn"
          : isGroup
            ? "Se over gruppen"
            : "Klar til å publisere?"
      }
    >
      {cover ? (
        <Image
          source={cover}
          contentFit="cover"
          style={{ height: 176, width: "100%", borderRadius: 14 }}
        />
      ) : null}
      <View className="gap-1">
        <Text variant="title">{draft.title}</Text>
        <Text variant="caption" tone="muted">
          {isPlace
            ? `${draft.category} · ${draft.area}, Oslo`
            : isGroup
              ? `Gruppe · ${draft.area}, Oslo`
              : `${draft.date ? formatDate(draft.date) : ""} · ${draft.startTime} · ${draft.area}`}
        </Text>
        {draft.summary ? (
          <Text variant="label" weight="regular" className="pt-1">
            {draft.summary}
          </Text>
        ) : null}
      </View>
      {isGroup ? (
        <>
          <Fact
            icon="people-outline"
            value={
              GROUP_ACCESS.find((a) => a.value === draft.groupAccess)?.title ??
              ""
            }
          />
          {draft.groupRules.trim() ? (
            <View className="gap-1">
              <Text variant="label" weight="semibold">
                Regler
              </Text>
              <Text variant="caption" tone="muted">
                {draft.groupRules.trim()}
              </Text>
            </View>
          ) : null}
          <View className="flex-row flex-wrap gap-2">
            {draft.interests.map((v) => (
              <View key={v} className="rounded-full bg-surfaceMuted px-3 py-1">
                <Text variant="caption" weight="medium">
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : isPlace ? null : (
        <>
          <View className="flex-row gap-2">
            <Fact icon="pricetag-outline" value={price} />
            <Fact icon="people-outline" value={`${draft.capacity} plasser`} />
            <Fact icon="globe-outline" value={draft.access} />
          </View>
          <View className="flex-row flex-wrap gap-2">
            {draft.vibes.map((v) => (
              <View key={v} className="rounded-full bg-surfaceMuted px-3 py-1">
                <Text variant="caption" weight="medium">
                  {v}
                </Text>
              </View>
            ))}
          </View>
          {draft.included.length ? (
            <View className="gap-1">
              <Text variant="label" weight="semibold">
                Hva er inkludert
              </Text>
              <Text variant="label" weight="regular">
                {draft.included.join(", ")}
              </Text>
            </View>
          ) : null}
          {steps.length ? (
            <View className="gap-1">
              <Text variant="label" weight="semibold">
                Hva dere skal gjøre
              </Text>
              {steps.map((st, i) => (
                <Text key={i} variant="label" weight="regular">
                  {`${i + 1}. ${st}`}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      )}
    </Shell>
  );
}

function Fact({ icon, value }: { icon: IconName; value: string }) {
  return (
    <View className="flex-1 gap-1 rounded-md border border-line bg-surface p-3">
      <Icon name={icon} size="sm" tone="ink" />
      <Text variant="caption" weight="medium" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SubmittedState({
  draft,
  editing,
  created,
  onReset,
}: {
  draft: AddDraft;
  editing: boolean;
  created: { groupId?: string; chatId?: string; experienceId?: string };
  onReset: () => void;
}) {
  const isPlace = draft.kind === "place";
  const isGroup = draft.kind === "group";
  return (
    <Screen edges={["top"]}>
      <View className="flex-1 items-center justify-center gap-5 p-gutter">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <Icon name="checkmark" size="xl" tone="success" />
        </View>
        <View className="items-center gap-2">
          <Text variant="label" weight="semibold" tone="success">
            {editing
              ? "Endringene er lagret"
              : isPlace
                ? "Stedet er sendt inn"
                : isGroup
                  ? "Gruppen er opprettet"
                  : "Opplevelsen er publisert"}
          </Text>
          <Text
            variant="h2"
            weight="bold"
            className="text-center"
            accessibilityRole="text"
          >
            {draft.title}
          </Text>
          {editing ? null : (
            <Text variant="body" tone="muted" className="px-6 text-center">
              {isPlace
                ? "Du kan følge stedet under Innleveringer."
                : isGroup
                  ? "Gruppechatten ligger under Chat."
                  : "Del den med folk du vil ha med."}
            </Text>
          )}
        </View>
        <View className="w-full gap-3 pt-2">
          {isGroup && created.groupId ? (
            <>
              <Button
                label="Se gruppen"
                variant="ink"
                onPress={() => router.push(`/group/${created.groupId}` as Href)}
              />
              <Button
                label="Til gruppechatten"
                variant="secondary"
                onPress={() => router.push(`/chat/${created.chatId}` as Href)}
              />
            </>
          ) : null}
          {!isGroup && !isPlace && created.experienceId ? (
            <Button
              label="Se opplevelsen"
              variant="ink"
              onPress={() =>
                router.push(`/experience/${created.experienceId}` as Href)
              }
            />
          ) : null}
          {isPlace ? (
            <Button
              label="Se innleveringer"
              variant="secondary"
              onPress={() => router.push("/submissions")}
            />
          ) : null}
          <Button
            label="Legg til noe nytt"
            variant={
              (isGroup && created.groupId) || created.experienceId
                ? "secondary"
                : "ink"
            }
            onPress={onReset}
          />
        </View>
      </View>
    </Screen>
  );
}

// "Start fra en tidligere opplevelse": the copy, with the photos that are
// in the pool and the place (or area) it happened in.
function copyOf(e: MockExperience): AddDraft {
  const place = e.placeId ? places.find((p) => p.id === e.placeId) : undefined;
  return draftCopyOf(e, {
    area: place?.name ?? areaFor(e.meetingPoint.coord),
    photos: e.photos.map((p) => PHOTO_POOL.indexOf(p)).filter((i) => i >= 0),
  });
}

// A short choice, so a sheet: the experiences you host, newest first.
function StartFromSheet({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (e: MockExperience) => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Start fra en tidligere">
      <View className="gap-2">
        {hostedExperiences().map((e) => (
          <UIPressable
            key={e.id}
            accessibilityRole="button"
            accessibilityLabel={`${e.title}, ${e.category}, ${e.when}`}
            onPress={() => {
              onClose();
              onPick(e);
            }}
            contentClassName="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-3"
            pressedScale={0.99}
          >
            <Image
              source={smallImage(e.photos[0])}
              contentFit="cover"
              style={{ width: 48, height: 48, borderRadius: 10 }}
              accessible={false}
            />
            <View className="flex-1">
              <Text variant="label" weight="semibold" numberOfLines={1}>
                {e.title}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {e.category} · {e.when}
              </Text>
            </View>
          </UIPressable>
        ))}
      </View>
    </Sheet>
  );
}

// Wizard step body (design-system StepContent).
const Shell = StepContent;

// Kategori as a select field (PDF p10–p11): category art + value + chevron,
// opening "Velg kategori".
function CategoryField({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string | null;
  onChange: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View className="gap-1.5">
      <Text variant="label">Kategori</Text>
      <UIPressable
        accessibilityRole="button"
        accessibilityLabel={`Kategori, ${value ?? "ikke valgt"}`}
        accessibilityHint="Åpner Velg kategori"
        onPress={() => setOpen(true)}
        pressedScale={0.99}
        contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface px-4 py-3"
      >
        {value && hasCategoryArt(value) ? (
          <CategoryArt name={value} size={28} />
        ) : (
          <Icon name="pricetags-outline" size="md" tone="muted" />
        )}
        <Text variant="body" tone={value ? "ink" : "muted"} className="flex-1">
          {value ?? "Velg kategori"}
        </Text>
        <Icon name="chevron-down" size="md" tone="muted" />
      </UIPressable>
      {open ? (
        <CategoryPicker
          options={options}
          value={value}
          onPick={onChange}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </View>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text variant="label" weight="semibold">
      {children}
    </Text>
  );
}

function ChipRow({
  options,
  selected,
  onPress,
}: {
  options: readonly string[];
  selected: string[];
  onPress: (v: string) => void;
}) {
  return (
    <ChipGroup multiple options={options} value={selected} onChange={onPress} />
  );
}

function SelectRow({
  icon,
  title,
  hint,
  selected,
  onPress,
}: {
  icon: IconName;
  title: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-md border bg-surface p-3.5 ${
        selected ? "border-ink" : "border-line"
      }`}
    >
      <Icon name={icon} size="md" tone="ink" />
      <View className="flex-1">
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      </View>
      <View
        className={`h-5 w-5 rounded-full border-2 ${
          selected ? "border-ink bg-ink" : "border-line"
        }`}
      />
    </Pressable>
  );
}

// Single-month date picker (PDF p11: "‹ Juli 2026 ›" grid, selected day = ink
// circle). Past days are disabled. Local demo state only.
function MonthPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (iso: string) => void;
}) {
  const now = new Date();
  const todayIso = isoOf(now.getFullYear(), now.getMonth(), now.getDate());
  const [cursor, setCursor] = useState({
    y: now.getFullYear(),
    m: now.getMonth(),
  });
  const first = new Date(cursor.y, cursor.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const atStart = cursor.y === now.getFullYear() && cursor.m === now.getMonth();
  const shift = (d: number) =>
    setCursor(({ y, m }) => {
      const n = new Date(y, m + d, 1);
      return { y: n.getFullYear(), m: n.getMonth() };
    });
  const label = `${MONTHS[cursor.m]} ${cursor.y}`;
  return (
    <View className="gap-2 rounded-lg border border-line bg-surface p-3">
      <View className="flex-row items-center justify-between">
        <IconButton
          icon="chevron-back"
          label="Forrige måned"
          size="sm"
          disabled={atStart}
          onPress={() => shift(-1)}
        />
        <Text variant="label" weight="semibold" className="capitalize">
          {label}
        </Text>
        <IconButton
          icon="chevron-forward"
          label="Neste måned"
          size="sm"
          onPress={() => shift(1)}
        />
      </View>
      <View className="flex-row">
        {["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"].map((d) => (
          <Text
            key={d}
            variant="caption"
            tone="muted"
            className="flex-1 text-center"
          >
            {d}
          </Text>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {cells.map((d, i) => {
          if (d === null) return <View key={i} className="h-10 w-[14.28%]" />;
          const iso = isoOf(cursor.y, cursor.m, d);
          const past = iso < todayIso;
          const selected = iso === value;
          return (
            <UIPressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`${d}. ${label}`}
              accessibilityState={{ selected, disabled: past }}
              disabled={past}
              onPress={() => onChange(iso)}
              className="w-[14.28%]"
              contentClassName="h-10 items-center justify-center"
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  selected ? "bg-ink" : ""
                }`}
              >
                <Text
                  variant="label"
                  weight={selected ? "semibold" : "regular"}
                  tone={selected ? "onInk" : past ? "muted" : "ink"}
                  className={past && !selected ? "opacity-50" : undefined}
                >
                  {d}
                </Text>
              </View>
            </UIPressable>
          );
        })}
      </View>
    </View>
  );
}

function isoOf(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
