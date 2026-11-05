import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Switch } from "@/components/ui/Switch";
import { IconButton } from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoBadge } from "@/components/DemoBadge";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { PlacePicker } from "@/components/pickers/Pickers";
import { experiences, OSLO_AREAS, places } from "@/fixtures";
import { colors } from "@/theme";

import {
  type AddDraft,
  type AddKind,
  canAdvance,
  EMPTY_DRAFT,
  type StepKey,
  stepsFor,
} from "./types";

// Bundled sample art reused as the demo photo pool (MOCK — no media contract).
const PHOTO_POOL = experiences.flatMap((e) => e.photos).slice(0, 9);

const PLACE_CATEGORIES = [
  "Kafé",
  "Bar",
  "Restaurant",
  "Utendørs",
  "Kultur",
  "Verksted",
];
const EXPERIENCE_CATEGORIES = [
  "Kurs & smaking",
  "Musikk",
  "Tur & friluft",
  "Kunst & kultur",
  "Sport & trening",
  "Sosialt",
];
const PLACE_FEATURES = [
  "Har åpningstider",
  "Rullestolvennlig",
  "Nær kollektivtransport",
  "Parkering tilgjengelig",
];
const START_TIMES = ["10:00", "14:00", "18:00", "20:00"];
const DURATIONS = ["1 time", "2 timer", "3 timer", "Hele dagen"];
const REPEATS = ["Gjentas ikke", "Ukentlig", "Månedlig"];
const ACCESS = ["Alle", "Godkjennes av deg", "Kun invitasjon"];
const CANCELLATION = [
  "Gratis frem til 24 t før",
  "Gratis frem til 48 t før",
  "Ingen refusjon",
];
const VIBES = [
  "Rolig",
  "Lærerikt",
  "Sosialt",
  "Hands-on",
  "Koselig",
  "Kreativt",
];
const ENERGY = ["Lavt", "Middels", "Høyt"];
const LANGUAGES = ["Norsk", "Engelsk"];
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
// ends in "Publiser opplevelsen". DEMO: nothing is sent or published — the end
// state says so plainly (BLOCKED_CONTRACT_GAP).
export function AddWizard() {
  const [draft, setDraft] = useState<AddDraft>(EMPTY_DRAFT);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const steps = stepsFor(draft.kind);
  const step = steps[Math.min(stepIndex, steps.length - 1)] ?? "kind";
  const patch = (p: Partial<AddDraft>) => setDraft((d) => ({ ...d, ...p }));

  const reset = () => {
    setDraft(EMPTY_DRAFT);
    setStepIndex(0);
    setSubmitted(false);
  };

  if (submitted && draft.kind) {
    return <SubmittedState draft={draft} onReset={reset} />;
  }

  if (step === "kind") {
    return (
      <KindMenu
        onPick={(kind) => {
          setDraft({ ...EMPTY_DRAFT, kind });
          setStepIndex(0);
        }}
      />
    );
  }

  const isLast = step === "review";
  const back = () =>
    stepIndex === 0 ? setDraft(EMPTY_DRAFT) : setStepIndex((i) => i - 1);
  const next = () => (isLast ? setSubmitted(true) : setStepIndex((i) => i + 1));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="gap-3 px-gutter pb-2 pt-1">
        <View className="flex-row items-center justify-between">
          <IconButton
            icon="chevron-back"
            label="Tilbake"
            variant="outline"
            onPress={back}
          />
          <Text className="text-xs font-medium text-muted">
            Steg {stepIndex + 1} av {steps.length}
          </Text>
        </View>
        <View className="flex-row gap-1.5">
          {steps.map((s, i) => (
            <View
              key={s}
              className={`h-1 flex-1 rounded-full ${
                i <= stepIndex ? "bg-ink" : "bg-line"
              }`}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerClassName="gap-5 p-gutter pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <StepBody step={step} draft={draft} patch={patch} />
      </ScrollView>

      <View className="px-gutter pb-3 pt-2">
        <Button
          label={
            !isLast
              ? "Neste"
              : draft.kind === "place"
                ? "Send inn til vurdering"
                : "Publiser opplevelsen"
          }
          variant={isLast && draft.kind === "experience" ? "ember" : "ink"}
          disabled={!canAdvance(step, draft)}
          onPress={next}
        />
      </View>
    </SafeAreaView>
  );
}

function KindMenu({ onPick }: { onPick: (k: AddKind) => void }) {
  const rows: {
    kind: AddKind;
    label: string;
    hint: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      kind: "place",
      label: "Sted",
      hint: "Del en perle — kafé, park, utsiktspunkt",
      icon: "location-outline",
    },
    {
      kind: "experience",
      label: "Opplevelse",
      hint: "Arranger noe — stort eller lite",
      icon: "sparkles-outline",
    },
  ];
  return (
    <SafeAreaView className="flex-1 justify-end bg-background" edges={["top"]}>
      <View className="gap-3 p-gutter pb-6">
        <Text className="pb-1 text-2xl font-bold text-ink">
          Hva vil du legge til?
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/import")}
          className="flex-row items-center gap-2 self-start py-1"
        >
          <Ionicons name="link-outline" size={16} color={colors.ember} />
          <Text className="text-sm font-semibold text-ember">
            Importer fra lenke →
          </Text>
        </Pressable>
        {rows.map((r) => (
          <Pressable
            key={r.kind}
            accessibilityRole="button"
            onPress={() => onPick(r.kind)}
            className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4 active:opacity-80"
          >
            <View className="h-11 w-11 items-center justify-center rounded-md bg-surfaceMuted">
              <Ionicons name={r.icon} size={20} color={colors.ink} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink">
                {r.label}
              </Text>
              <Text className="text-xs text-muted">{r.hint}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
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
  const [picker, setPicker] = useState(false);
  switch (step) {
    case "about":
      return (
        <Shell
          title={isPlace ? "Fortell om stedet" : "Hva skjer?"}
          subtitle={
            isPlace
              ? "Hva heter det, og hva slags sted er det?"
              : "Grunnleggende om opplevelsen din."
          }
        >
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
          <Label>Kategori</Label>
          <ChipRow
            options={isPlace ? PLACE_CATEGORIES : EXPERIENCE_CATEGORIES}
            selected={draft.category ? [draft.category] : []}
            onPress={(c) => patch({ category: c })}
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
      return isPlace ? (
        <Shell title="Hvor er det?" subtitle="Velg området stedet ligger i.">
          <ChipRow
            options={OSLO_AREAS.map((a) => a.name)}
            selected={draft.area ? [draft.area] : []}
            onPress={(a) => patch({ area: a })}
          />
          {draft.area ? (
            <View className="flex-row items-center gap-2">
              <Ionicons name="location" size={16} color={colors.ink} />
              <Text className="text-sm font-medium text-ink">
                {draft.area}, Oslo
              </Text>
            </View>
          ) : null}
          <DemoNote>Kartpinne og adressesøk er ikke aktive i demoen.</DemoNote>
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
          <Pressable
            accessibilityRole="button"
            onPress={() => setPicker(true)}
            className="flex-row items-center gap-2 rounded-md border border-line bg-surface p-3.5 active:opacity-80"
          >
            <Ionicons name="search" size={16} color={colors.muted} />
            <Text className="flex-1 text-sm text-muted">
              {draft.area &&
              !HOST_PLACES.some((p) => p.name === draft.area) &&
              !OSLO_AREAS.some((a) => a.name === draft.area)
                ? `Valgt: ${draft.area}`
                : "Søk etter et annet sted …"}
            </Text>
          </Pressable>
          {picker ? (
            <PlacePicker
              onPick={(pl) => patch({ area: pl.name })}
              onClose={() => setPicker(false)}
            />
          ) : null}
          <Label>Annet sted</Label>
          <ChipRow
            options={OSLO_AREAS.map((a) => a.name)}
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
          subtitle="Legg til minst ett bilde. Første bilde blir hovedbildet."
        >
          <View className="flex-row flex-wrap gap-2">
            {PHOTO_POOL.map((src, i) => {
              const pos = draft.photos.indexOf(i);
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`Eksempelbilde ${i + 1}`}
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
                    source={src}
                    contentFit="cover"
                    style={{ aspectRatio: 1, width: "100%", borderRadius: 10 }}
                  />
                  {pos >= 0 ? (
                    <View className="absolute right-1.5 top-1.5 h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5">
                      <Text className="text-xs font-bold text-onInk">
                        {pos + 1}
                      </Text>
                    </View>
                  ) : null}
                  {pos === 0 ? (
                    <View className="absolute bottom-1.5 left-1.5 rounded-full bg-ink px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-onInk">
                        Hovedbilde
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <Text className="text-xs text-muted">
            Minst 1 bilde påkrevd · JPG, PNG · maks 10 MB
          </Text>
          <DemoNote>
            Eksempelbilder — opplasting er ikke aktiv i demoen.
          </DemoNote>
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
                <Text className="text-base text-ink">{f}</Text>
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
            <Text className="text-sm font-medium text-ink">
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
            label="Pris per person (kr) — tomt = gratis"
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
          <Text className="text-xs text-muted">
            Alle = hvem som helst kan bli med · Godkjenning = du bestemmer ·
            Invitasjon = kun inviterte
          </Text>
          <Label>Avbestilling</Label>
          <ChipRow
            options={CANCELLATION}
            selected={[draft.cancellation]}
            onPress={(c) => patch({ cancellation: c })}
          />
          <DemoNote>
            Pris og avbestilling er bare visning — ingen betaling eller refusjon
            er aktiv.
          </DemoNote>
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

    case "review":
      return <ReviewStep draft={draft} />;

    default:
      return null;
  }
}

function ReviewStep({ draft }: { draft: AddDraft }) {
  const isPlace = draft.kind === "place";
  const cover =
    draft.photos[0] !== undefined ? PHOTO_POOL[draft.photos[0]] : null;
  const price =
    draft.price && draft.price !== "0" ? `${draft.price} kr` : "Gratis";
  return (
    <Shell title={isPlace ? "Se over og send inn" : "Klar til å publisere?"}>
      {cover ? (
        <Image
          source={cover}
          contentFit="cover"
          style={{ height: 176, width: "100%", borderRadius: 14 }}
        />
      ) : null}
      <View className="gap-1">
        <Text className="text-lg font-semibold text-ink">{draft.title}</Text>
        <Text className="text-sm text-muted">
          {isPlace
            ? `${draft.category} · ${draft.area}, Oslo`
            : `${draft.date ? formatDate(draft.date) : ""} · ${draft.startTime} · ${draft.area}`}
        </Text>
        {draft.summary ? (
          <Text className="pt-1 text-sm text-ink">{draft.summary}</Text>
        ) : null}
      </View>
      {isPlace ? (
        <View className="flex-row items-start gap-2 rounded-md bg-surfaceMuted p-3">
          <Ionicons name="hourglass-outline" size={16} color={colors.ink} />
          <Text className="flex-1 text-sm text-ink">
            Steder gjennomgås manuelt av ThirdPlace før de blir synlige.
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row gap-2">
            <Fact icon="pricetag-outline" value={price} />
            <Fact icon="people-outline" value={`${draft.capacity} plasser`} />
            <Fact icon="globe-outline" value={draft.access} />
          </View>
          <View className="flex-row flex-wrap gap-2">
            {draft.vibes.map((v) => (
              <View key={v} className="rounded-full bg-surfaceMuted px-3 py-1">
                <Text className="text-xs font-medium text-ink">{v}</Text>
              </View>
            ))}
          </View>
          <DemoNote>
            Publisering er ikke aktiv. Ingenting blir synlig, og ingen chat
            opprettes.
          </DemoNote>
        </>
      )}
    </Shell>
  );
}

function Fact({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View className="flex-1 gap-1 rounded-md border border-line bg-surface p-3">
      <Ionicons name={icon} size={16} color={colors.ink} />
      <Text className="text-xs font-medium text-ink" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SubmittedState({
  draft,
  onReset,
}: {
  draft: AddDraft;
  onReset: () => void;
}) {
  const isPlace = draft.kind === "place";
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 items-center justify-center gap-5 p-gutter">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surfaceMuted">
          <Ionicons
            name={isPlace ? "hourglass-outline" : "eye-off-outline"}
            size={28}
            color={colors.ink}
          />
        </View>
        <View className="items-center gap-2">
          <Text className="text-center text-xl font-bold text-ink">
            {draft.title}
          </Text>
          <View className="flex-row">
            <DemoBadge label={isPlace ? "IKKE SENDT" : "IKKE PUBLISERT"} />
          </View>
          <Text className="px-6 text-center text-base text-muted">
            {isPlace
              ? "Demo — stedet ble ikke sendt til vurdering. Innsending krever innlogging og en server, som ikke er aktiv ennå."
              : "Demo — opplevelsen ble ikke publisert, og ingen chat ble opprettet. Publisering krever innlogging og en server, som ikke er aktiv ennå."}
          </Text>
        </View>
        <View className="w-full gap-3 pt-2">
          <Button label="Legg til noe nytt" variant="ink" onPress={onReset} />
          {isPlace ? (
            <Button
              label="Se innleveringer"
              variant="secondary"
              onPress={() => router.push("/submissions")}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-3xl font-bold text-ink">{title}</Text>
        {subtitle ? (
          <Text className="text-sm text-muted">{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Label({ children }: { children: string }) {
  return <Text className="text-sm font-semibold text-ink">{children}</Text>;
}

function ChipRow({
  options,
  selected,
  onPress,
}: {
  options: string[];
  selected: string[];
  onPress: (v: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o}
          label={o}
          selected={selected.includes(o)}
          onPress={() => onPress(o)}
        />
      ))}
    </View>
  );
}

function SelectRow({
  icon,
  title,
  hint,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
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
      <Ionicons name={icon} size={18} color={colors.ink} />
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{title}</Text>
        <Text className="text-xs text-muted">{hint}</Text>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Forrige måned"
          disabled={atStart}
          onPress={() => shift(-1)}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={atStart ? colors.line : colors.ink}
          />
        </Pressable>
        <Text className="text-sm font-semibold capitalize text-ink">
          {label}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Neste måned"
          onPress={() => shift(1)}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
        >
          <Ionicons name="chevron-forward" size={18} color={colors.ink} />
        </Pressable>
      </View>
      <View className="flex-row">
        {["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"].map((d) => (
          <Text key={d} className="flex-1 text-center text-xs text-muted">
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
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`${d}. ${label}`}
              accessibilityState={{ selected, disabled: past }}
              disabled={past}
              onPress={() => onChange(iso)}
              className="h-10 w-[14.28%] items-center justify-center"
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  selected ? "bg-ink" : ""
                }`}
              >
                <Text
                  className={`text-sm ${
                    selected
                      ? "font-semibold text-onInk"
                      : past
                        ? "text-line"
                        : "text-ink"
                  }`}
                >
                  {d}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function isoOf(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
