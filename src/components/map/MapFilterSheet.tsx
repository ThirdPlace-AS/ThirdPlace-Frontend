import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Accordion, Icon, Text } from "@/components/ui";
import { elevation, presentation } from "@/theme";
import { Button } from "@/components/Button";
import { Calendar } from "@/components/Calendar";
import { CheckboxRow } from "@/components/CheckboxRow";
import { Chip } from "@/components/Chip";
import { DemoBadge } from "@/components/DemoBadge";
import { PriceHistogram } from "./PriceHistogram";
import { RangeSlider } from "@/components/RangeSlider";
import { RatingStars } from "@/components/RatingStars";
import { Sheet } from "@/components/Sheet";
import { SteppedSlider } from "@/components/SteppedSlider";
import { Stepper } from "@/components/Stepper";
import { WhereField } from "./WhereField";
import {
  ACCESSIBILITY_ICONS,
  type AccessibilityOption,
  AUDIENCES,
  DEFAULT_CHIP_ICON,
  DURATION_STEPS,
  EXPERIENCE_TYPES,
  LANGUAGES,
  LANGUAGES_VISIBLE,
  places,
  PLACE_TAGS,
  RATING_THRESHOLDS,
  TAG_ICONS,
  TIME_OF_DAY,
  VIBE_ICONS,
  VIBES,
} from "@/fixtures";
import { formatThreshold } from "@/lib/format";

import { countResults } from "./services/mapFixtureAdapter";
import {
  DEFAULT_FILTERS,
  DURATION_NO_CAP,
  type MapFilters,
  PRICE_CEIL,
  PRICE_FLOOR,
  PRICE_STEP,
  type RatingSort,
} from "./services/mapFilters";
import { TypeChip } from "./TypeChip";
import type { DiscoveryMode } from "./types/mapPresentation";

// Re-export the pure filter model/logic so existing importers (useMapFilters,
// tests) keep working through this module too.
export {
  activeExtraFilterCount,
  applyFilters,
  DEFAULT_FILTERS,
  type MapFilters,
} from "./services/mapFilters";

// Distance "smart slider" steps (last = no cap / "Alle").
const DISTANCE_STEPS: { m: number | null; label: string }[] = [
  { m: 500, label: "500 m" },
  { m: 1000, label: "1 km" },
  { m: 2000, label: "2 km" },
  { m: 5000, label: "5 km" },
  { m: null, label: "Alle" },
];

// Static slider labels + histogram inputs — hoisted so they are not rebuilt on
// every render (they never change; the fixtures are constant).
const DURATION_LABELS = DURATION_STEPS.map((s) => s.label);
const DISTANCE_LABELS = DISTANCE_STEPS.map((s) => s.label);
const PRICE_VALUES = places.map((p) => p.priceNok);

// Icon-chip items for the taxonomy groups (label + Ionicons glyph), hoisted so
// they are built once. Vibe/Fasiliteter derive their glyph from the icon maps.
const VIBE_ITEMS = VIBES.map((v) => ({
  label: v as string,
  icon: VIBE_ICONS[v] ?? DEFAULT_CHIP_ICON,
}));
const TAG_ITEMS = PLACE_TAGS.map((t) => ({
  label: t as string,
  icon: TAG_ICONS[t] ?? DEFAULT_CHIP_ICON,
}));

// When-quick chips → the TimeWindow axis (I dag/I morgen/Helg) used by discovery.
const WHEN_CHIPS: { label: string; time: MapFilters["time"] }[] = [
  { label: "I dag", time: "I dag" },
  { label: "I morgen", time: "I morgen" },
  { label: "Denne uka", time: "Denne uka" },
  { label: "Helg", time: "Helg" },
];

const SHORT_MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "mai",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "des",
];
function fmtDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}. ${SHORT_MONTHS[Number(m) - 1]}`;
}

function isoD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// Concrete demo dates behind each quick chip (MOCK — do not filter results).
// Computed once at load relative to "today"; "Denne uka" = Mon–Sun of this week,
// "Helg" = this week's Sat–Sun.
type WhenRange = { start: string; end: string | null };
const WHEN_RANGES: Record<string, WhenRange> = (() => {
  const now = new Date();
  const today = isoD(now);
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  const monday = addDays(now, -dow);
  // Upcoming weekend: this week's Sat/Sun, rolled to next week if already past.
  let sat = addDays(monday, 5);
  let sun = addDays(monday, 6);
  if (isoD(sun) < today) {
    sat = addDays(sat, 7);
    sun = addDays(sun, 7);
  }
  return {
    "I dag": { start: today, end: null },
    "I morgen": { start: isoD(addDays(now, 1)), end: null },
    "Denne uka": { start: isoD(monday), end: isoD(addDays(monday, 6)) },
    Helg: { start: isoD(sat), end: isoD(sun) },
  };
})();
function whenChipSubtitle(label: string): string {
  const r = WHEN_RANGES[label];
  if (!r) return "";
  return r.end ? `${fmtDate(r.start)} – ${fmtDate(r.end)}` : fmtDate(r.start);
}

// A titled block on the flat sheet, split from the one above by a hairline
// (benchmark F1: PDF p5 and the reference draw flat sections, not cards).
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3 border-t border-line py-6">
      <View className="gap-0.5">
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

// Unified icon-chip group: wraps chips and hides the overflow behind a "Vis
// mer" expander — the single paradigm for every taxonomy group (Opplevelsestype
// / Passer for / Vibe / Fasiliteter) so they behave consistently and never hide
// chips off-screen.
type ChipItem = { label: string; icon: string };
function ChipGroup({
  items,
  selected,
  onToggle,
  visible = 8,
}: {
  items: ChipItem[];
  selected: (label: string) => boolean;
  onToggle: (label: string) => void;
  visible?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, visible);
  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2">
        {shown.map((t) => (
          <TypeChip
            key={t.label}
            label={t.label}
            icon={t.icon}
            selected={selected(t.label)}
            onPress={() => onToggle(t.label)}
          />
        ))}
      </View>
      {items.length > visible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((e) => !e)}
          className="flex-row items-center gap-1 py-1"
        >
          <Text variant="body" weight="semibold" className="underline">
            {expanded ? "Vis mindre" : "Vis mer"}
          </Text>
          <Icon
            name={expanded ? "chevron-up" : "chevron-down"}
            size="sm"
            tone="ink"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

// Tilgjengelighetsfunksjoner in three groups (benchmark F7: chunked, so eight
// rows read as three short lists). Every option appears exactly once.
const ACCESSIBILITY_GROUPS: { title: string; items: AccessibilityOption[] }[] =
  [
    {
      title: "Mobilitet",
      items: ["Trinnfri inngang", "Rullestol-WC", "Heis"],
    },
    {
      title: "Syn og hørsel",
      items: [
        "Syns- og hørselshjelpemidler",
        "Alternativer for tegnspråk",
        "Ledsager for synshemmede",
      ],
    },
    {
      title: "Sansepåvirkning",
      items: ["Sensoriske stimuli", "Ingen ekstreme sensoriske stimuli"],
    },
  ];

// Soft card shadow for the Where/When/Who cards (className can't express an
// arbitrary cross-platform shadow, so it lives in a style object).
const cardShadow = {
  ...elevation.e1,
} as const;

// One card of the top Where/When/Who accordion (single-open). Collapsed shows a
// muted label (left) + bold value (right); expanded shows a large title and the
// children beneath — matching the reference Where/When/Who flow.
function SearchRow({
  label,
  title,
  value,
  open,
  onToggle,
  children,
}: {
  label: string;
  title: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  if (open) {
    return (
      <View
        style={cardShadow}
        className="gap-4 rounded-lg border border-line bg-surface px-6 py-5"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: true }}
          onPress={onToggle}
          className="flex-row items-center justify-between"
        >
          <Text variant="h2" weight="bold" accessibilityRole="text">
            {title}
          </Text>
          <Icon name="chevron-up" size="md" tone="ink" />
        </Pressable>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: false }}
      accessibilityLabel={`${label}, ${value}`}
      onPress={onToggle}
      style={cardShadow}
      className="flex-row items-center justify-between gap-2 rounded-lg border border-line bg-surface px-6 py-5"
    >
      <Text variant="body" tone="muted" className="shrink-0">
        {label}
      </Text>
      <View className="flex-1 flex-row items-center justify-end gap-1.5">
        <Text
          numberOfLines={1}
          variant="body"
          weight="semibold"
          className="shrink text-right"
        >
          {value}
        </Text>
        <Icon name="chevron-down" size="md" tone="muted" />
      </View>
    </Pressable>
  );
}

export function MapFilterSheet({
  visible,
  filters,
  query = "",
  mode,
  savedIds,
  onClose,
  onApply,
}: {
  visible: boolean;
  filters: MapFilters;
  query?: string;
  /** Active discovery mode + saved ids: the count runs the list's pipeline. */
  mode: DiscoveryMode;
  savedIds: readonly string[];
  onClose: () => void;
  onApply: (f: MapFilters) => void;
}) {
  // Large "Filtre" at the top of the content; the header takes the title
  // once it has scrolled away (benchmark F2).
  const [headerTitle, setHeaderTitle] = useState(false);
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={headerTitle ? "Filtre" : undefined}
      fullHeight
    >
      {/* Mount the body only while open so its draft seeds fresh from `filters`
          on each open (no setState-in-effect). */}
      {visible ? (
        <FilterBody
          filters={filters}
          query={query}
          mode={mode}
          savedIds={savedIds}
          onClose={onClose}
          onApply={onApply}
          onTitleScrolledAway={setHeaderTitle}
        />
      ) : null}
    </Sheet>
  );
}

type OpenSection = "where" | "when" | "who" | null;

function FilterBody({
  filters,
  query,
  mode,
  savedIds,
  onClose,
  onApply,
  onTitleScrolledAway,
}: {
  filters: MapFilters;
  query: string;
  mode: DiscoveryMode;
  savedIds: readonly string[];
  onClose: () => void;
  onApply: (f: MapFilters) => void;
  onTitleScrolledAway: (away: boolean) => void;
}) {
  const titleAway = useRef(false);
  // The lower sections mount just after the sheet has slid in, so the open
  // stays quick (all sections at once took ~2.5 s to mount on the dev build).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), presentation.enter + 80);
    return () => clearTimeout(t);
  }, []);
  const [draft, setDraft] = useState<MapFilters>(filters);
  const [openSection, setOpenSection] = useState<OpenSection>(null);
  const [langExpanded, setLangExpanded] = useState(false);

  const toggleIn = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  // Live "show N results" count — instant, no artificial delay, and the same
  // pipeline as the list (countResults), so N is what the list will show.
  const resultCount = useMemo(
    () =>
      countResults({
        mode,
        allPlaces: places,
        query,
        filters: draft,
        savedIds,
      }),
    [mode, query, draft, savedIds],
  );

  const durationIndex = Math.max(
    0,
    DURATION_STEPS.findIndex((s) => s.min === draft.durationMaxMin),
  );
  const distanceIndex = Math.max(
    0,
    DISTANCE_STEPS.findIndex((s) => s.m === draft.maxDistanceM),
  );
  const atCeil = draft.priceMax >= PRICE_CEIL;

  const toggleSection = (s: Exclude<OpenSection, null>) =>
    setOpenSection((cur) => (cur === s ? null : s));

  const setRatingSort = (s: RatingSort) =>
    setDraft((d) => ({ ...d, ratingSort: d.ratingSort === s ? null : s }));

  const guestTotal =
    draft.guests.adults +
    draft.guests.children +
    draft.guests.infants +
    draft.guests.students +
    draft.guests.pensioners;
  const whenValue =
    draft.dateStart && draft.dateEnd
      ? `${fmtDate(draft.dateStart)} – ${fmtDate(draft.dateEnd)}`
      : draft.dateStart
        ? fmtDate(draft.dateStart)
        : (draft.time ?? "Legg til datoer");

  const hasDate =
    draft.time !== null || draft.dateStart !== null || draft.dateEnd !== null;

  // Something to clear? (benchmark F9: "Fjern alt" is inactive otherwise)
  const canClear = JSON.stringify(draft) !== JSON.stringify(DEFAULT_FILTERS);

  const footerLabel =
    resultCount === 0
      ? "Ingen tilgjengelige resultater"
      : `Vis ${resultCount} resultater`;

  const visibleLangs = langExpanded
    ? LANGUAGES
    : LANGUAGES.slice(0, LANGUAGES_VISIBLE);

  return (
    <View className="flex-1 gap-4">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32}
        onScroll={(e) => {
          const away = e.nativeEvent.contentOffset.y > 36;
          if (away !== titleAway.current) {
            titleAway.current = away;
            onTitleScrolledAway(away);
          }
        }}
      >
        <Text variant="h1" accessibilityRole="header">
          Filtre
        </Text>
        {/* Where / When / Who (single-open accordion) */}
        <View className="gap-4">
          <SearchRow
            label="Hvor"
            title="Hvor?"
            value={draft.whereArea ?? "Legg til sted"}
            open={openSection === "where"}
            onToggle={() => toggleSection("where")}
          >
            <WhereField
              value={draft.whereArea}
              onSelect={(area) => {
                setDraft((d) => ({ ...d, whereArea: area }));
                // Auto-advance to "Når?" once a place is chosen (not on clear).
                if (area) setOpenSection("when");
              }}
            />
          </SearchRow>

          <SearchRow
            label="Når"
            title="Når?"
            value={whenValue}
            open={openSection === "when"}
            onToggle={() => toggleSection("when")}
          >
            <View className="gap-4">
              {/* One row of quick dates (benchmark W2), scrolling if the four
                  PDF labels don't fit. */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2"
              >
                {WHEN_CHIPS.map((c) => {
                  const selected = draft.time === c.time;
                  return (
                    <Pressable
                      key={c.label}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() =>
                        setDraft((d) => {
                          if (d.time === c.time) {
                            return {
                              ...d,
                              time: null,
                              dateStart: null,
                              dateEnd: null,
                            };
                          }
                          const r = WHEN_RANGES[c.label];
                          return {
                            ...d,
                            time: c.time,
                            dateStart: r?.start ?? null,
                            dateEnd: r?.end ?? null,
                          };
                        })
                      }
                      style={{ minWidth: 104 }}
                      className={`gap-0.5 rounded-lg border px-3 py-3 ${
                        selected ? "border-2 border-ink" : "border border-line"
                      }`}
                    >
                      <Text variant="label" weight="semibold">
                        {c.label}
                      </Text>
                      <Text variant="caption" tone="muted">
                        {whenChipSubtitle(c.label)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Calendar
                start={draft.dateStart}
                end={draft.dateEnd}
                onChange={(s, e) =>
                  // A custom range replaces the quick choice (its tile no longer applies).
                  setDraft((d) => ({
                    ...d,
                    dateStart: s,
                    dateEnd: e,
                    time: null,
                  }))
                }
              />
              <Text variant="caption" tone="muted">
                Datoene påvirker ikke resultatene i demoen.
              </Text>
            </View>
          </SearchRow>

          <SearchRow
            label="Hvem"
            title="Hvem?"
            value={
              guestTotal > 0 ? `${guestTotal} gjester` : "Legg til gjester"
            }
            open={openSection === "who"}
            onToggle={() => toggleSection("who")}
          >
            <View>
              <DemoBadge label="Demo · telles ikke med" />
              <Stepper
                label="Voksne"
                divider
                value={draft.guests.adults}
                onChange={(n) =>
                  setDraft((d) => ({
                    ...d,
                    guests: { ...d.guests, adults: n },
                  }))
                }
              />
              <Stepper
                label="Barn"
                divider
                value={draft.guests.children}
                onChange={(n) =>
                  setDraft((d) => ({
                    ...d,
                    guests: { ...d.guests, children: n },
                  }))
                }
              />
              <Stepper
                label="Spedbarn"
                divider
                value={draft.guests.infants}
                onChange={(n) =>
                  setDraft((d) => ({
                    ...d,
                    guests: { ...d.guests, infants: n },
                  }))
                }
              />
              <Stepper
                label="Studenter"
                divider
                value={draft.guests.students}
                onChange={(n) =>
                  setDraft((d) => ({
                    ...d,
                    guests: { ...d.guests, students: n },
                  }))
                }
              />
              <Stepper
                label="Pensjonister"
                value={draft.guests.pensioners}
                onChange={(n) =>
                  setDraft((d) => ({
                    ...d,
                    guests: { ...d.guests, pensioners: n },
                  }))
                }
              />
            </View>
          </SearchRow>
        </View>

        {/* Below-the-fold sections mount once the sheet has settled. */}
        {ready ? (
          <>
            {/* Tid på dagen (moved out of the "Når?" card) */}
            <Section title="Tid på dagen">
              <View>
                {TIME_OF_DAY.map((t, i) => (
                  <CheckboxRow
                    key={t.key}
                    label={t.label}
                    hint={t.hint}
                    divider={i < TIME_OF_DAY.length - 1}
                    checked={draft.timeOfDay.includes(t.key)}
                    onToggle={() =>
                      setDraft((d) => ({
                        ...d,
                        timeOfDay: toggleIn(d.timeOfDay, t.key),
                      }))
                    }
                  />
                ))}
              </View>
            </Section>
            {/* Opplevelsestype */}
            <Section title="Opplevelsestype">
              <ChipGroup
                items={EXPERIENCE_TYPES}
                selected={(l) => draft.types.includes(l)}
                onToggle={(l) =>
                  setDraft((d) => ({ ...d, types: toggleIn(d.types, l) }))
                }
              />
            </Section>
            {/* Passer for */}
            <Section title="Passer for">
              <ChipGroup
                items={AUDIENCES}
                selected={(l) => draft.audiences.includes(l)}
                onToggle={(l) =>
                  setDraft((d) => ({
                    ...d,
                    audiences: toggleIn(d.audiences, l),
                  }))
                }
              />
            </Section>
            {/* Pris per gjest */}
            <Section title="Pris per gjest">
              <PriceHistogram
                values={PRICE_VALUES}
                min={PRICE_FLOOR}
                max={PRICE_CEIL}
                low={draft.priceMin}
                high={draft.priceMax}
              />
              <RangeSlider
                min={PRICE_FLOOR}
                max={PRICE_CEIL}
                step={PRICE_STEP}
                minGap={PRICE_STEP}
                low={draft.priceMin}
                high={draft.priceMax}
                onChange={(lo, hi) =>
                  setDraft((d) => ({ ...d, priceMin: lo, priceMax: hi }))
                }
              />
              <View className="flex-row items-center justify-between">
                <View className="rounded-md border border-line px-4 py-3">
                  <Text variant="caption" tone="muted">
                    Minst
                  </Text>
                  <Text variant="label" weight="regular">
                    kr {draft.priceMin}
                  </Text>
                </View>
                <View className="rounded-md border border-line px-4 py-3">
                  <Text variant="caption" tone="muted">
                    Maksimalt
                  </Text>
                  <Text variant="label" weight="regular">
                    kr {draft.priceMax}
                    {atCeil ? " +" : ""}
                  </Text>
                </View>
              </View>
            </Section>
            {/* Varighet */}
            <Section title="Varighet">
              <SteppedSlider
                labels={DURATION_LABELS}
                index={durationIndex}
                onChange={(i) =>
                  setDraft((d) => ({
                    ...d,
                    durationMaxMin: DURATION_STEPS[i]?.min ?? DURATION_NO_CAP,
                  }))
                }
              />
            </Section>
            {/* Avstand — smart slider (canonical: distance/travel feasibility) */}
            <Section
              title="Avstand"
              subtitle={`Innen ${DISTANCE_STEPS[distanceIndex]?.label ?? "Alle"}`}
            >
              <SteppedSlider
                labels={DISTANCE_LABELS}
                index={distanceIndex}
                onChange={(i) =>
                  setDraft((d) => ({
                    ...d,
                    maxDistanceM: DISTANCE_STEPS[i]?.m ?? null,
                  }))
                }
              />
            </Section>
            {/* Interesser: Vibe + Fasiliteter (icon chips) */}
            <Section title="Vibe">
              <ChipGroup
                items={VIBE_ITEMS}
                selected={(l) =>
                  draft.vibes.includes(l as (typeof VIBES)[number])
                }
                onToggle={(l) =>
                  setDraft((d) => ({
                    ...d,
                    vibes: d.vibes.includes(l as (typeof VIBES)[number])
                      ? d.vibes.filter((x) => x !== l)
                      : [...d.vibes, l as (typeof VIBES)[number]],
                  }))
                }
              />
            </Section>

            <Section title="Fasiliteter">
              <ChipGroup
                items={TAG_ITEMS}
                selected={(l) => draft.tags.includes(l)}
                onToggle={(l) =>
                  setDraft((d) => ({ ...d, tags: toggleIn(d.tags, l) }))
                }
              />
            </Section>

            {/* Vurdering — star thresholds + sort */}
            <Section title="Vurdering">
              <View className="flex-row flex-wrap gap-2">
                <Chip
                  label="Alle"
                  selected={draft.minRating === null}
                  onPress={() => setDraft((d) => ({ ...d, minRating: null }))}
                />
                {RATING_THRESHOLDS.map((r) => {
                  const selected = draft.minRating === r;
                  return (
                    <Pressable
                      key={r}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${formatThreshold(r)} stjerner og over`}
                      onPress={() => setDraft((d) => ({ ...d, minRating: r }))}
                      className={`flex-row items-center gap-1.5 rounded-full border bg-surface px-3 py-2 ${
                        selected ? "border-2 border-ink" : "border border-line"
                      }`}
                    >
                      <RatingStars value={r} size={13} />
                      <Text variant="label" weight="regular">
                        {r === 5 ? "5" : `${formatThreshold(r)}+`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text variant="label" weight="semibold">
                Sorter etter
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <Chip
                  label="Høyest vurdert"
                  selected={draft.ratingSort === "best"}
                  onPress={() => setRatingSort("best")}
                />
                <Chip
                  label="Flest anmeldelser"
                  selected={draft.ratingSort === "most"}
                  onPress={() => setRatingSort("most")}
                />
              </View>
            </Section>
            {/* Språk som tilbys — "Vis mer/mindre" anchored at the BOTTOM */}
            <Section title="Språk som tilbys">
              <View>
                {visibleLangs.map((l, i) => (
                  <CheckboxRow
                    key={l}
                    label={l}
                    divider={i < visibleLangs.length - 1}
                    checked={draft.languages.includes(l)}
                    onToggle={() =>
                      setDraft((d) => ({
                        ...d,
                        languages: toggleIn(d.languages, l),
                      }))
                    }
                  />
                ))}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: langExpanded }}
                  onPress={() => setLangExpanded((e) => !e)}
                  className="flex-row items-center gap-1 py-3"
                >
                  <Text variant="body" weight="semibold" className="underline">
                    {langExpanded ? "Vis mindre" : "Vis mer"}
                  </Text>
                  <Icon
                    name={langExpanded ? "chevron-up" : "chevron-down"}
                    size="sm"
                    tone="ink"
                  />
                </Pressable>
              </View>
            </Section>
            {/* Tilgjengelighetsfunksjoner — collapsed, grouped (benchmark F7) */}
            <View className="border-t border-line py-2">
              <Accordion
                title="Tilgjengelighetsfunksjoner"
                subtitle="Oppgitt av stedet, ikke sjekket (demo)"
              >
                <View className="gap-4">
                  {ACCESSIBILITY_GROUPS.map((g) => (
                    <View key={g.title}>
                      <Text variant="label" weight="semibold">
                        {g.title}
                      </Text>
                      {g.items.map((a, i) => (
                        <CheckboxRow
                          key={a}
                          label={a}
                          icon={ACCESSIBILITY_ICONS[a] ?? DEFAULT_CHIP_ICON}
                          divider={i < g.items.length - 1}
                          checked={draft.accessibility.includes(a)}
                          onToggle={() =>
                            setDraft((d) => ({
                              ...d,
                              accessibility: toggleIn(d.accessibility, a),
                            }))
                          }
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </Accordion>
            </View>
            {/* Tilgjengelighet (availability) */}
            <Section title="Tilgjengelighet">
              <View>
                <CheckboxRow
                  label="Åpent nå"
                  divider
                  checked={draft.openNowOnly}
                  onToggle={() =>
                    setDraft((d) => ({ ...d, openNowOnly: !d.openNowOnly }))
                  }
                />
                <CheckboxRow
                  label="Ledige plasser"
                  hint="Gjelder opplevelser"
                  checked={draft.hasSpots}
                  onToggle={() =>
                    setDraft((d) => ({ ...d, hasSpots: !d.hasSpots }))
                  }
                />
              </View>
            </Section>
          </>
        ) : null}
      </ScrollView>

      {/* Sticky footer. While "Når" is open it steps the flow (benchmark W5):
          Hopp over / Neste, with Nullstill once a date is picked. Otherwise the
          reset link + "Vis N resultater". */}
      {openSection === "when" ? (
        <View className="flex-row items-center justify-between gap-2 border-t border-line pt-3">
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              hasDate
                ? setDraft((d) => ({
                    ...d,
                    time: null,
                    dateStart: null,
                    dateEnd: null,
                  }))
                : setOpenSection("who")
            }
            className="px-2 py-3"
          >
            <Text variant="body" weight="semibold" className="underline">
              {hasDate ? "Nullstill" : "Hopp over"}
            </Text>
          </Pressable>
          {/* Fixed width: a bare Button stretched past the sheet edge. */}
          <View style={{ width: 160 }}>
            <Button
              label="Neste"
              variant="ink"
              rounded="full"
              onPress={() => setOpenSection("who")}
            />
          </View>
        </View>
      ) : (
        <View className="flex-row items-center gap-2 border-t border-line pt-3">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canClear }}
            disabled={!canClear}
            onPress={() => {
              setDraft(DEFAULT_FILTERS);
              setLangExpanded(false);
              setOpenSection(null);
            }}
            className="px-2 py-3"
          >
            <Text
              variant="body"
              weight="semibold"
              tone={canClear ? "ink" : "muted"}
              className={canClear ? "underline" : undefined}
            >
              Fjern alt
            </Text>
          </Pressable>
          <View className="flex-1">
            <Button
              label={footerLabel}
              variant="ink"
              rounded="full"
              disabled={resultCount === 0}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
