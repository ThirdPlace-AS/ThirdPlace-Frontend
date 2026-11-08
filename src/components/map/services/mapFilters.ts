// Pure map-filter model + logic (MOCK — client-side only over fixtures, no
// contract). Kept free of React/Reanimated imports so it is unit-testable in
// jest and reusable by the sheet UI and the useMapFilters hook.

import {
  DURATION_STEPS,
  experiences,
  placeById,
  places,
  ratingOf,
  reviewsForExperience,
  sessionsFor,
  TIME_OF_DAY,
  type MockExperience,
  type MockPlace,
  type TimeWindow,
  type Vibe,
  placeRating,
} from "@/fixtures";

import { distanceMeters } from "@/lib/distance";
import { formatRating } from "@/lib/format";
import { shortDayMonth } from "@/lib/dates";
import { getOrigin, type Origin } from "@/lib/origin";

import { interestById } from "@/fixtures/catalog/interests";

import { ITEM_TYPE_LABEL, experienceType, type ItemType } from "./itemType";
import { experienceMatchesQuery, placeMatchesQuery } from "./mapSearch";
import {
  MARKER_LABEL,
  markerCategoryFor,
  type MarkerCategory,
} from "./markerCategory";

// Price range bounds derived from the MOCK fixtures (not a pricing contract):
// the dearest place or experience. The top of the range is open ("kr 1650+"),
// so a dearer item, such as one made in Legg til, still shows by default.
export const PRICE_FLOOR = 0;
export const PRICE_CEIL = Math.max(
  ...places.map((p) => p.priceNok),
  ...experiences.map((e) => e.priceNok ?? 0),
);
export const PRICE_STEP = 10;

/** The price range, with no upper limit while the slider is at its top. */
export function withinPrice(price: number, f: MapFilters): boolean {
  if (price < f.priceMin) return false;
  return f.priceMax >= PRICE_CEIL || price <= f.priceMax;
}
// Duration is picked as a "max" step; the last step (999) means "no upper cap".
export const DURATION_NO_CAP =
  DURATION_STEPS[DURATION_STEPS.length - 1]?.min ?? 999;

// Rating sort for the "Vurdering" section (demo ordering, not a ranking contract).
export type RatingSort = "best" | "most"; // høyest vurdert | flest anmeldelser

// Demo-only guest counts ("Who?"). No fixture backing → never filters results.
export type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
  students: number;
  pensioners: number;
};
export const DEFAULT_GUESTS: GuestCounts = {
  adults: 0,
  children: 0,
  infants: 0,
  students: 0,
  pensioners: 0,
};

export type MapFilters = {
  // "Kategori": the map pins' eight categories (OR match). Phase 18, from
  // the screen benchmark: quick chips on the map, the same colours as the pins.
  categories: MarkerCategory[];
  // Activities inside the chosen categories (Phase 19, founder 2026-11-08:
  // nested so people can filter to one activity): interest ids. A category
  // with picks keeps only those; one without keeps everything in it.
  interests: string[];
  // "Type" (Phase 19, founder 2026-11-08): Bedrift, Organisasjon, Byrom,
  // Opplevelse, Arrangement (OR). Applies to places and experiences alike, so
  // choosing only Byrom also empties the experience list.
  kinds: ItemType[];
  types: string[]; // "Opplevelsestype" (OR match)
  whereArea: string | null; // "Where?" selected Oslo area — recenters, does NOT filter
  // "When?" picked dates (ISO). Phase 18: without a quick tile (`time`), they
  // keep the experiences with a session in the range (± dateFlex days);
  // places are not dated.
  dateStart: string | null;
  dateEnd: string | null;
  dateFlex: 0 | 1; // "± 1 dag" for a picked day (Airbnb's flexible dates)
  guests: GuestCounts; // "Who?" demo guest counts — does NOT filter
  maxDistanceM: number | null; // null = any distance
  priceMin: number; // NOK, inclusive
  priceMax: number; // NOK, inclusive
  durationMaxMin: number; // minutes; DURATION_NO_CAP = any
  vibes: Vibe[]; // empty = any (OR match)
  minRating: number | null; // null = any
  ratingSort: RatingSort | null; // null = default order
  tags: string[]; // "Fasiliteter" (AND match)
  audiences: string[]; // "Passer for" (OR match)
  timeOfDay: string[]; // "Tid på dagen" keys (OR match)
  languages: string[]; // "Språk som tilbys" (OR match)
  accessibility: string[]; // "Tilgjengelighetsfunksjoner" (AND match)
  time: TimeWindow | null; // null = any (applies to experiences)
  openNowOnly: boolean;
  hasSpots: boolean; // ledige plasser — applies to experiences
};

export const DEFAULT_FILTERS: MapFilters = {
  categories: [],
  interests: [],
  kinds: [],
  types: [],
  whereArea: null,
  dateStart: null,
  dateEnd: null,
  dateFlex: 0,
  guests: DEFAULT_GUESTS,
  maxDistanceM: null,
  priceMin: PRICE_FLOOR,
  priceMax: PRICE_CEIL,
  durationMaxMin: DURATION_NO_CAP,
  vibes: [],
  minRating: null,
  ratingSort: null,
  tags: [],
  audiences: [],
  timeOfDay: [],
  languages: [],
  accessibility: [],
  time: null,
  openNowOnly: false,
  hasSpots: false,
};

// The list's order (Sorter, nearest first, Trending) is set once, after places
// and experiences are mixed: orderItems() in mapFixtureAdapter.ts (Phase 19).

/** Kategori with its activities (Phase 19, founder 2026-11-08). Nothing
 *  chosen keeps everything; a picked activity always matches; a chosen
 *  category keeps all of itself until one of its activities is picked, then
 *  only the picked ones. Items without an interest (made in Legg til) match
 *  by category alone. */
export function categoryMatch(
  f: Pick<MapFilters, "categories" | "interests">,
  category: MarkerCategory,
  interestId?: string,
): boolean {
  if (f.categories.length === 0 && f.interests.length === 0) return true;
  if (interestId !== undefined && f.interests.includes(interestId)) return true;
  if (!f.categories.includes(category)) return false;
  return !f.interests.some((i) => interestById(i)?.category === category);
}

// Applies search text + place-level filters to the place list. Time and
// hasSpots are experience concepts and are applied by the discovery adapter.
export function applyFilters(
  all: MockPlace[],
  query: string,
  f: MapFilters,
  // Avstand is measured from the person (Phase 19): the phone, a picked area
  // or Grünerløkka (src/lib/origin.ts).
  origin: Origin = getOrigin(),
): MockPlace[] {
  const q = query.trim().toLowerCase();
  return all.filter((p) => {
    if (
      !categoryMatch(
        f,
        markerCategoryFor({ kind: "place", id: p.id }),
        p.interestId,
      )
    )
      return false;
    if (f.kinds.length > 0 && !f.kinds.includes(p.kind)) return false;
    if (f.types.length > 0 && !f.types.some((t) => p.types.includes(t)))
      return false;
    if (
      f.maxDistanceM !== null &&
      distanceMeters(origin.coord, p.coord) > f.maxDistanceM
    )
      return false;
    if (!withinPrice(p.priceNok, f)) return false;
    if (f.durationMaxMin < DURATION_NO_CAP && p.durationMin > f.durationMaxMin)
      return false;
    if (f.vibes.length > 0 && !f.vibes.some((v) => p.vibes.includes(v)))
      return false;
    if (f.minRating !== null && placeRating(p.id).score < f.minRating)
      return false;
    if (f.tags.length > 0 && !f.tags.every((t) => p.tags.includes(t)))
      return false;
    if (
      f.audiences.length > 0 &&
      !f.audiences.some((a) => p.audiences.includes(a))
    )
      return false;
    if (
      f.timeOfDay.length > 0 &&
      !f.timeOfDay.some((t) => p.timeOfDay.includes(t))
    )
      return false;
    if (
      f.languages.length > 0 &&
      !f.languages.some((l) => p.languages.includes(l))
    )
      return false;
    if (
      f.accessibility.length > 0 &&
      !f.accessibility.every((a) => p.accessibility.includes(a))
    )
      return false;
    if (f.openNowOnly && !p.openNow) return false;
    // Same matcher as the overlay search (name/category/tags) so submitting a
    // query from the overlay narrows the map exactly as the overlay showed it.
    if (q !== "" && !placeMatchesQuery(p, q)) return false;
    return true;
  });
}

// Count of active filters, Opplevelsestype included (drives the filter badge;
// nothing else on the map shows the chosen types).
// Demo-only axes (whereArea / date range / guests) are NOT counted — they don't
// narrow results, so they must not inflate the badge.
export function activeExtraFilterCount(f: MapFilters): number {
  return (
    (f.categories.length > 0 || f.interests.length > 0 ? 1 : 0) +
    (f.kinds.length > 0 ? 1 : 0) +
    (f.types.length > 0 ? 1 : 0) +
    (f.maxDistanceM !== null ? 1 : 0) +
    (f.priceMin > PRICE_FLOOR || f.priceMax < PRICE_CEIL ? 1 : 0) +
    (f.durationMaxMin < DURATION_NO_CAP ? 1 : 0) +
    (f.vibes.length > 0 ? 1 : 0) +
    (f.minRating !== null ? 1 : 0) +
    (f.ratingSort !== null ? 1 : 0) +
    (f.tags.length > 0 ? 1 : 0) +
    (f.audiences.length > 0 ? 1 : 0) +
    (f.timeOfDay.length > 0 ? 1 : 0) +
    (f.languages.length > 0 ? 1 : 0) +
    (f.accessibility.length > 0 ? 1 : 0) +
    (f.time !== null ? 1 : 0) +
    (f.time === null && f.dateStart !== null ? 1 : 0) +
    (f.openNowOnly ? 1 : 0) +
    (f.hasSpots ? 1 : 0)
  );
}

// ── Experiences (Phase 12 H5c: one filter pipeline for the map and Sveip) ──
// Every facet reads a field the experience has (H2) or, for venue facts
// (facilities, accessibility), the place it is held at; distance is measured
// from the person to the meeting point (Phase 19). An experience without a
// venue has no facilities or accessibility to match (it fails those). "Åpent nå"
// is opening hours, a place concept: experiences pass it.

const startHour = (when: string): number | null => {
  const m = /(\d{1,2}):\d{2}$/.exec(when);
  return m ? Number(m[1]) : null;
};

/** "morgen" before 12, "ettermiddag" 12–17, "kveld" after 17. */
export function timeOfDayFor(when: string): string | null {
  const h = startHour(when);
  if (h === null) return null;
  return h < 12 ? "morgen" : h < 17 ? "ettermiddag" : "kveld";
}

const lower = (list: readonly string[]) => list.map((x) => x.toLowerCase());

/** The picked days as a time window: from the first day's start to the
 *  last day's end, widened by `dateFlex` days on each side. */
export function dateWindow(f: MapFilters): [Date, Date] | null {
  if (!f.dateStart) return null;
  const day = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  };
  const from = day(f.dateStart);
  from.setDate(from.getDate() - f.dateFlex);
  const to = day(f.dateEnd ?? f.dateStart);
  to.setDate(to.getDate() + f.dateFlex + 1);
  to.setTime(to.getTime() - 1);
  return [from, to];
}

function hasSessionIn(e: MockExperience, f: MapFilters): boolean {
  const w = dateWindow(f);
  if (!w) return true;
  return sessionsFor(e, new Date(), 8).some(
    (s) => s.start >= w[0] && s.start <= w[1],
  );
}

export function applyExperienceFilters(
  all: MockExperience[],
  query: string,
  f: MapFilters,
  origin: Origin = getOrigin(),
): MockExperience[] {
  const q = query.trim().toLowerCase();
  const out = all.filter((e) => {
    if (e.status === "cancelled") return false;
    if (
      !categoryMatch(
        f,
        markerCategoryFor({ kind: "experience", id: e.id }),
        e.interestId,
      )
    )
      return false;
    if (f.kinds.length > 0 && !f.kinds.includes(experienceType(e)))
      return false;
    const place = placeById(e.placeId);
    if (f.types.length > 0 && !f.types.some((t) => e.types.includes(t)))
      return false;
    // Measured to the meeting point, so an outdoor one is capped too.
    if (
      f.maxDistanceM !== null &&
      distanceMeters(origin.coord, e.meetingPoint.coord) > f.maxDistanceM
    )
      return false;
    if (!withinPrice(e.priceNok ?? 0, f)) return false;
    if (f.durationMaxMin < DURATION_NO_CAP && e.durationMin > f.durationMaxMin)
      return false;
    if (
      f.vibes.length > 0 &&
      !f.vibes.some((v) => (e.vibes as readonly string[]).includes(v))
    )
      return false;
    if (f.minRating !== null) {
      const { score, count } = ratingOf(reviewsForExperience(e.id));
      if (count === 0 || score < f.minRating) return false;
    }
    if (
      f.tags.length > 0 &&
      !(place && f.tags.every((t) => place.tags.includes(t)))
    )
      return false;
    if (
      f.audiences.length > 0 &&
      !f.audiences.some((a) => e.audiences.includes(a))
    )
      return false;
    if (f.timeOfDay.length > 0) {
      const tod = timeOfDayFor(e.when);
      if (tod === null || !f.timeOfDay.includes(tod)) return false;
    }
    if (f.languages.length > 0) {
      const have = lower(e.languages);
      if (!lower(f.languages).some((l) => have.includes(l))) return false;
    }
    if (
      f.accessibility.length > 0 &&
      !(place && f.accessibility.every((a) => place.accessibility.includes(a)))
    )
      return false;
    if (f.time !== null && e.day !== f.time) return false;
    if (f.time === null && f.dateStart !== null && !hasSessionIn(e, f))
      return false;
    if (f.hasSpots && e.capacity - e.going <= 0) return false;
    if (q !== "" && !experienceMatchesQuery(e, q) && !"opplevelse".includes(q))
      return false;
    return true;
  });
  return sortExperiences(out, f.ratingSort);
}

/** "Sorter" for experiences: by review score or count (demo ordering). */
export function sortExperiences(
  list: MockExperience[],
  sort: RatingSort | null,
): MockExperience[] {
  if (sort === null) return list;
  const r = (e: MockExperience) => ratingOf(reviewsForExperience(e.id));
  return [...list].sort((a, b) =>
    sort === "best" ? r(b).score - r(a).score : r(b).count - r(a).count,
  );
}

// ── Applied filters as chips (Phase 18, from the screen benchmark) ──
// Each narrowing filter, one chip per value, in the words the Filtre sheet
// uses, with what removing it leaves. Feeds the chips row on the map and the
// "Fjern «…»" choices when nothing matches. Demo-only axes (Hvor, dates,
// guests) do not narrow results and get no chip.
export type AppliedFilterChip = {
  key: string;
  label: string;
  remove: (f: MapFilters) => MapFilters;
};

const distanceLabel = (m: number) =>
  m < 1000 ? `${m} m` : `${formatRating(m / 1000).replace(/,0$/, "")} km`;
const capitalise = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export function appliedFilterChips(f: MapFilters): AppliedFilterChip[] {
  const out: AppliedFilterChip[] = [];
  const each = <K extends keyof MapFilters>(
    key: K,
    values: readonly string[],
    label: (v: string) => string = (v) => v,
  ) => {
    for (const v of values)
      out.push({
        key: `${String(key)}:${v}`,
        label: label(v),
        remove: (g) => ({
          ...g,
          [key]: (g[key] as unknown as string[]).filter((x) => x !== v),
        }),
      });
  };
  // Kategori (Phase 19 nested): a category with picked activities shows one
  // chip per activity; removing the last one drops the category too, so the
  // filter goes away instead of widening to the whole category.
  for (const c of f.categories) {
    const picks = f.interests.filter((i) => interestById(i)?.category === c);
    if (picks.length === 0)
      out.push({
        key: `categories:${c}`,
        label: MARKER_LABEL[c],
        remove: (g) => ({
          ...g,
          categories: g.categories.filter((x) => x !== c),
        }),
      });
    for (const i of picks)
      out.push({
        key: `interests:${i}`,
        label: interestById(i)?.label ?? i,
        remove: (g) => {
          const interests = g.interests.filter((x) => x !== i);
          const left = interests.some((x) => interestById(x)?.category === c);
          return {
            ...g,
            interests,
            categories: left
              ? g.categories
              : g.categories.filter((x) => x !== c),
          };
        },
      });
  }
  // An activity picked without its category (not made by Filtre, but kept
  // consistent).
  for (const i of f.interests) {
    const cat = interestById(i)?.category;
    if (cat && f.categories.includes(cat)) continue;
    out.push({
      key: `interests:${i}`,
      label: interestById(i)?.label ?? i,
      remove: (g) => ({ ...g, interests: g.interests.filter((x) => x !== i) }),
    });
  }
  each("kinds", f.kinds, (k) => ITEM_TYPE_LABEL[k as ItemType]);
  if (f.time !== null)
    out.push({
      key: "time",
      label: f.time,
      remove: (g) => ({ ...g, time: null }),
    });
  if (f.time === null && f.dateStart !== null)
    out.push({
      key: "dates",
      label: `${shortDayMonth(f.dateStart)}${
        f.dateEnd && f.dateEnd !== f.dateStart
          ? `–${shortDayMonth(f.dateEnd)}`
          : ""
      }${f.dateFlex ? " ± 1 dag" : ""}`,
      remove: (g) => ({ ...g, dateStart: null, dateEnd: null, dateFlex: 0 }),
    });
  each(
    "timeOfDay",
    f.timeOfDay,
    (k) => TIME_OF_DAY.find((t) => t.key === k)?.label ?? k,
  );
  each("types", f.types);
  if (f.hasSpots)
    out.push({
      key: "hasSpots",
      label: "Ledige plasser",
      remove: (g) => ({ ...g, hasSpots: false }),
    });
  if (f.openNowOnly)
    out.push({
      key: "openNowOnly",
      label: "Åpent nå",
      remove: (g) => ({ ...g, openNowOnly: false }),
    });
  if (f.maxDistanceM !== null)
    out.push({
      key: "maxDistanceM",
      label: `Innen ${distanceLabel(f.maxDistanceM)}`,
      remove: (g) => ({ ...g, maxDistanceM: null }),
    });
  if (f.priceMin > PRICE_FLOOR || f.priceMax < PRICE_CEIL)
    out.push({
      key: "price",
      label: `kr ${f.priceMin}–${f.priceMax}`,
      remove: (g) => ({ ...g, priceMin: PRICE_FLOOR, priceMax: PRICE_CEIL }),
    });
  if (f.durationMaxMin < DURATION_NO_CAP)
    out.push({
      key: "duration",
      label: `Inntil ${
        DURATION_STEPS.find((d) => d.min === f.durationMaxMin)?.label ??
        `${f.durationMaxMin} min`
      }`,
      remove: (g) => ({ ...g, durationMaxMin: DURATION_NO_CAP }),
    });
  each("vibes", f.vibes);
  if (f.minRating !== null)
    out.push({
      key: "minRating",
      label: `★ ${formatRating(f.minRating)}+`,
      remove: (g) => ({ ...g, minRating: null }),
    });
  if (f.ratingSort !== null)
    out.push({
      key: "ratingSort",
      label: f.ratingSort === "best" ? "Høyest vurdert" : "Flest anmeldelser",
      remove: (g) => ({ ...g, ratingSort: null }),
    });
  each("tags", f.tags);
  each("audiences", f.audiences);
  each("languages", f.languages, capitalise);
  each("accessibility", f.accessibility);
  return out;
}
