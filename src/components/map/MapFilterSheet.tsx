import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  InteractionManager,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

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
  ACCESSIBILITY_OPTIONS,
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
import { colors } from "@/theme";

import {
  applyFilters,
  DEFAULT_FILTERS,
  DURATION_NO_CAP,
  type MapFilters,
  PRICE_CEIL,
  PRICE_FLOOR,
  PRICE_STEP,
  type RatingSort,
} from "./services/mapFilters";
import { TypeChip } from "./TypeChip";

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

// A titled block, rendered as a white card so the whole Filtre sheet reads as a
// stack of cards on the muted sheet backdrop (matches the reference design).
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
    <View className="gap-3 rounded-lg border border-line bg-surface px-5 py-5">
      <View className="gap-0.5">
        <Text className="text-base font-semibold text-ink">{title}</Text>
        {subtitle ? (
          <Text className="text-xs text-muted">{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

// Unified icon-chip group: wraps chips and hides the overflow behind a "Vis
// flere" expander — the single paradigm for every taxonomy group (Opplevelsestype
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
          <Text className="text-base font-semibold text-ink underline">
            {expanded ? "Vis færre" : "Vis flere"}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.ink}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

// Soft card shadow for the Where/When/Who cards (className can't express an
// arbitrary cross-platform shadow, so it lives in a style object).
const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
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
          <Text className="text-xl font-bold text-ink">{title}</Text>
          <Ionicons name="chevron-up" size={20} color={colors.ink} />
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
      <Text className="shrink-0 text-base text-muted">{label}</Text>
      <View className="flex-1 flex-row items-center justify-end gap-1.5">
        <Text
          numberOfLines={1}
          className="shrink text-right text-base font-semibold text-ink"
        >
          {value}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </View>
    </Pressable>
  );
}

export function MapFilterSheet({
  visible,
  filters,
  query = "",
  onClose,
  onApply,
}: {
  visible: boolean;
  filters: MapFilters;
  query?: string;
  onClose: () => void;
  onApply: (f: MapFilters) => void;
}) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Filtre"
      fullHeight
      surfaceTone="muted"
    >
      {/* Mount the body only while open so its draft seeds fresh from `filters`
          on each open (no setState-in-effect). */}
      {visible ? (
        <FilterBody
          filters={filters}
          query={query}
          onClose={onClose}
          onApply={onApply}
        />
      ) : null}
    </Sheet>
  );
}

type OpenSection = "where" | "when" | "who" | null;

function FilterBody({
  filters,
  query,
  onClose,
  onApply,
}: {
  filters: MapFilters;
  query: string;
  onClose: () => void;
  onApply: (f: MapFilters) => void;
}) {
  const [draft, setDraft] = useState<MapFilters>(filters);
  const [openSection, setOpenSection] = useState<OpenSection>(null);
  const [langExpanded, setLangExpanded] = useState(false);

  // Defer the below-the-fold sections until after the sheet's open animation so
  // the slide renders only the three top cards (smooth open); the rest of the
  // sheet mounts a frame later. Reduces the synchronous mount cost on open.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() =>
      setReady(true),
    );
    return () => handle.cancel();
  }, []);

  const toggleIn = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  // Live "show N results" count — instant, no artificial delay. Memoized so it
  // is not recomputed over all places on every unrelated render (e.g. slider drag).
  const resultCount = useMemo(
    () => applyFilters(places, query, draft).length,
    [query, draft],
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
      >
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
              <View className="flex-row flex-wrap gap-2">
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
                          // Advance to "Hvem?" once a date shortcut is picked.
                          setOpenSection("who");
                          return {
                            ...d,
                            time: c.time,
                            dateStart: r?.start ?? null,
                            dateEnd: r?.end ?? null,
                          };
                        })
                      }
                      className={`w-[48%] grow gap-0.5 rounded-lg border px-3 py-3.5 ${
                        selected ? "border-2 border-ink" : "border border-line"
                      }`}
                    >
                      <Text className="text-sm font-semibold text-ink">
                        {c.label}
                      </Text>
                      <Text className="text-xs text-muted">
                        {whenChipSubtitle(c.label)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Calendar
                start={draft.dateStart}
                end={draft.dateEnd}
                onChange={(s, e) =>
                  setDraft((d) => ({ ...d, dateStart: s, dateEnd: e }))
                }
              />
              <Text className="text-xs text-muted">
                Datoer er kun demo — påvirker ikke resultatene.
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
              <DemoBadge label="DEMO — teller ikke med i resultatene" />
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

        {/* Below-the-fold sections mount after the open animation (smooth slide). */}
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
            <Section
              title="Pris per gjest"
              subtitle="Priser før gebyrer og skatt"
            >
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
                  <Text className="text-[10px] text-muted">Minst</Text>
                  <Text className="text-sm text-ink">kr {draft.priceMin}</Text>
                </View>
                <View className="rounded-md border border-line px-4 py-3">
                  <Text className="text-[10px] text-muted">Maksimalt</Text>
                  <Text className="text-sm text-ink">
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
                      accessibilityLabel={`${r} stjerner og over`}
                      onPress={() => setDraft((d) => ({ ...d, minRating: r }))}
                      className={`flex-row items-center gap-1.5 rounded-full border bg-surface px-3 py-2 ${
                        selected ? "border-2 border-ink" : "border border-line"
                      }`}
                    >
                      <RatingStars value={r} size={13} />
                      <Text className="text-sm text-ink">
                        {r === 5 ? "5" : `${r.toString().replace(".", ",")}+`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="text-sm font-semibold text-ink">
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
                  <Text className="text-base font-semibold text-ink underline">
                    {langExpanded ? "Vis mindre" : "Vis mer"}
                  </Text>
                  <Ionicons
                    name={langExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.ink}
                  />
                </Pressable>
              </View>
            </Section>
            {/* Tilgjengelighetsfunksjoner — icon rows */}
            <Section
              title="Tilgjengelighetsfunksjoner"
              subtitle="Oppgitt av stedet — DEMO, ikke verifisert"
            >
              <View>
                {ACCESSIBILITY_OPTIONS.map((a, i) => (
                  <CheckboxRow
                    key={a}
                    label={a}
                    icon={ACCESSIBILITY_ICONS[a] ?? DEFAULT_CHIP_ICON}
                    divider={i < ACCESSIBILITY_OPTIONS.length - 1}
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
            </Section>
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
        ) : (
          <View style={{ height: 480 }} />
        )}
      </ScrollView>

      {/* Sticky footer — compact reset link + wide primary button */}
      <View className="flex-row items-center gap-2 border-t border-line pt-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setDraft(DEFAULT_FILTERS);
            setLangExpanded(false);
            setOpenSection(null);
          }}
          className="px-2 py-3"
        >
          <Text className="text-base font-semibold text-ink underline">
            Fjern alt
          </Text>
        </Pressable>
        <View className="flex-1">
          <Button
            label={footerLabel}
            variant="ember"
            rounded="full"
            icon="search"
            disabled={resultCount === 0}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          />
        </View>
      </View>
    </View>
  );
}
