// Deterministic fixture search (MOCK — no network, no search backend, no history
// persistence; that is CONTRACT-BLOCKED CB-8). Groups matches the way the search
// overlay shows them: På kartet (places) / Opplevelser / Grupper.
//
// Search by type (R2b, user 2026-11-10: "the user should be able to search for
// a type of experiance, city space or business and get result"). An item is
// found by its own words (name or title, host, tags, a city space's
// facilities) and by its type words: the type ("Bedrift", "Byrom",
// "Arrangement" …, "Festival" for a multi-day event), the place's category
// ("Park", "Klatresenter"), the business record's category, the
// organisation's form ("Forening", "Klubb"), the experience's category and
// Opplevelsestype labels, and its interest (label and older synonyms, Phase
// 19). Accents fold except æ, ø, å ("kafe" finds "Kafé"); plural and definite
// endings fold ("parker", "parken" find "Park"); each word of a query must
// match ("park bærum"), and an area or municipality word counts only next to
// another word that matches. Words of up to three letters match only at the
// start of a word ("tur" is not "kultur"). The overlay lists the best matches
// first, nearest first among equals.

import {
  areaFor,
  businessForPlace,
  experiences,
  groups,
  organizationForPlace,
  placeRating,
  places,
  type MockExperience,
  type MockGroup,
  type MockPlace,
} from "@/fixtures";
import { interestWords } from "@/fixtures/catalog/interests";
import { distanceMeters } from "@/lib/distance";
import { formatRating } from "@/lib/format";
import { getOrigin } from "@/lib/origin";

import {
  ITEM_TYPE_LABEL,
  experienceKindLabel,
  experienceType,
  placeTypeLabel,
  type ItemType,
} from "./itemType";

import type { SheetKind } from "../sheetTypes";

export type SearchResult = {
  kind: SheetKind;
  id: string;
  title: string;
  subtitle: string;
};

export type SearchGroups = {
  places: SearchResult[];
  experiences: SearchResult[];
  groups: SearchResult[];
  /** Rows shown (at most GROUP_LIMIT per group). */
  total: number;
  /** Every place and experience that matches: what a submit shows on the
   *  map. */
  onMap: number;
};

// Max rows shown per group in the overlay (places / experiences / groups).
const GROUP_LIMIT = 5;

// ── Text ──────────────────────────────────────────────────────────────────

/** Lower case with accents folded, except Norwegian æ, ø, å ("Kafé" →
 *  "kafe", "Grünerløkka" → "grunerløkka"). */
export function foldText(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      // Every combining mark but U+030A (the ring of å).
      .replace(/[̀-̉̋-ͯ]/g, "")
      .normalize("NFC")
  );
}

const WORD_SPLIT = /[^a-z0-9æøå]+/;

function wordsOf(texts: readonly (string | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const t of texts) {
    if (!t) continue;
    for (const w of foldText(t).split(WORD_SPLIT)) if (w) out.push(w);
  }
  return out;
}

/** Words that only glue a query together ("kafé i sentrum"). */
const FILLER = new Set([
  "i",
  "på",
  "pa",
  "og",
  "med",
  "for",
  "ved",
  "nær",
  "naer",
  "til",
]);

/** Plural and definite endings, longest first. */
const ENDINGS = ["ene", "ane", "er", "en", "et", "a", "e", "r", "n"];

/** The word as typed, then without a plural or definite ending ("parken" →
 *  "park", "byrommet" → "byrom"). */
export function wordForms(word: string): string[] {
  const forms = [word];
  if (word.length >= 5) {
    for (const end of ENDINGS) {
      if (!word.endsWith(end)) continue;
      const stem = word.slice(0, -end.length);
      if (stem.length < 3) continue;
      forms.push(stem);
      // A doubled last letter before the ending: "byromm-et" → "byrom".
      if (stem.length > 3 && stem[stem.length - 1] === stem[stem.length - 2])
        forms.push(stem.slice(0, -1));
    }
  }
  return [...new Set(forms)];
}

type Token = { forms: string[] };
type Prepared = { tokens: Token[] };

let lastQuery: string | null = null;
let lastPrepared: Prepared = { tokens: [] };

/** The query's words (filler dropped while other words remain), each with
 *  its folded forms. Cached for the last query: the matchers run per item. */
export function prepareQuery(query: string): Prepared {
  if (query === lastQuery) return lastPrepared;
  const words = wordsOf([query]);
  const content = words.filter((w) => !FILLER.has(w));
  const kept = content.length > 0 ? content : words;
  lastQuery = query;
  lastPrepared = { tokens: kept.map((w) => ({ forms: wordForms(w) })) };
  return lastPrepared;
}

// ── An item's words ───────────────────────────────────────────────────────

type ItemWords = {
  /** Type words: type, category, form, experience types. */
  type: string[];
  /** Its interest: label and older synonyms (an activity, a little below
   *  its own type: "kafe" lists the cafés before a park whose interest is
   *  Språkkafé). */
  interest: string[];
  /** Its own words: name or title, host, tags, facilities. */
  own: string[];
  /** Where it is: area and municipality. */
  area: string[];
};

/** Type words beyond the type's own label. */
const TYPE_WORDS: Record<ItemType, readonly string[]> = {
  bedrift: ["virksomhet"],
  organisasjon: [],
  byrom: ["uterom"],
  opplevelse: ["aktivitet"],
  arrangement: ["event"],
};

// Built once per item object (fixture items don't change; created ones are
// new objects).
const placeCache = new WeakMap<MockPlace, ItemWords>();
const experienceCache = new WeakMap<MockExperience, ItemWords>();
const groupCache = new WeakMap<MockGroup, ItemWords>();

function areaWords(coord: [number, number]): string[] {
  const a = areaFor(coord);
  return wordsOf([a.name, a.municipality]);
}

function placeWords(p: MockPlace): ItemWords {
  let w = placeCache.get(p);
  if (!w) {
    w = {
      type: wordsOf([
        ITEM_TYPE_LABEL[p.kind],
        ...TYPE_WORDS[p.kind],
        p.category,
        ...p.types,
        businessForPlace(p.id)?.category,
        organizationForPlace(p.id)?.form,
      ]),
      interest: wordsOf(interestWords(p.interestId)),
      own: wordsOf([p.name, ...p.tags, ...(p.space?.facilities ?? [])]),
      area: areaWords(p.coord),
    };
    placeCache.set(p, w);
  }
  return w;
}

function experienceWords(e: MockExperience): ItemWords {
  let w = experienceCache.get(e);
  if (!w) {
    const type = experienceType(e);
    w = {
      type: wordsOf([
        ITEM_TYPE_LABEL[type],
        ...TYPE_WORDS[type],
        e.format === "event" && (e.days ?? 1) > 1 ? "Festival" : null,
        e.category,
        ...(e.types ?? []),
      ]),
      interest: wordsOf(interestWords(e.interestId)),
      own: wordsOf([e.title, e.host, ...e.tags]),
      area: areaWords(e.meetingPoint.coord),
    };
    experienceCache.set(e, w);
  }
  return w;
}

function groupWords(g: MockGroup): ItemWords {
  let w = groupCache.get(g);
  if (!w) {
    w = {
      type: wordsOf(["Gruppe"]),
      interest: wordsOf(g.interests.flatMap((i) => interestWords(i))),
      own: wordsOf([g.name, g.about]),
      area: [],
    };
    groupCache.set(g, w);
  }
  return w;
}

// ── Matching ──────────────────────────────────────────────────────────────

/** How well one form matches a list of words: `head` for a word that is the
 *  form, or (for type and interest words) ends with it ("skatepark" is a
 *  park); 2 a word that starts with it; 1 a longer form inside a word; 0 no
 *  match. Forms of up to three letters match only whole words or word
 *  starts. */
function quality(
  form: string,
  words: readonly string[],
  head: number,
  compound: boolean,
): number {
  let best = 0;
  const short = form.length <= 3;
  for (const w of words) {
    if (w === form) return head;
    if (compound && !short && w.endsWith(form)) best = Math.max(best, head);
    else if (w.startsWith(form)) best = Math.max(best, 2);
    else if (!short && w.includes(form)) best = Math.max(best, 1);
  }
  return best;
}

/** The item's own type first, then its interest, then its own words. */
function contentQuality(form: string, words: ItemWords): number {
  return Math.max(
    quality(form, words.type, 3, true),
    quality(form, words.interest, 2.5, true),
    quality(form, words.own, 2, false),
  );
}

/** 0 = no match; higher = better. Every query word must match the item; an
 *  area word counts only next to another word that matches. */
function scoreWords(words: ItemWords, tokens: readonly Token[]): number {
  if (tokens.length === 0) return 0;
  let score = 0;
  let content = false;
  for (const t of tokens) {
    let best = 0;
    for (const f of t.forms) best = Math.max(best, contentQuality(f, words));
    if (best > 0) {
      content = true;
      score += best;
      continue;
    }
    if (!t.forms.some((f) => quality(f, words.area, 2, false) > 0)) return 0;
    score += 0.5;
  }
  return content ? score : 0;
}

// Shared query matchers. Exported so the map place filter (applyFilters) and
// the discovery adapter use the SAME match logic as this overlay search — no
// divergence between what the overlay shows and what submitting the text
// narrows on the map.
export function placeMatchesQuery(p: MockPlace, q: string): boolean {
  return scoreWords(placeWords(p), prepareQuery(q).tokens) > 0;
}

export function experienceMatchesQuery(e: MockExperience, q: string): boolean {
  return scoreWords(experienceWords(e), prepareQuery(q).tokens) > 0;
}

function ranked<T>(
  list: readonly T[],
  words: (x: T) => ItemWords,
  coord: (x: T) => [number, number] | null,
  tokens: readonly Token[],
): T[] {
  const origin = getOrigin().coord;
  const hits: { x: T; score: number; d: number }[] = [];
  for (const x of list) {
    const score = scoreWords(words(x), tokens);
    if (score === 0) continue;
    const c = coord(x);
    hits.push({ x, score, d: c ? distanceMeters(origin, c) : Infinity });
  }
  hits.sort((a, b) => b.score - a.score || a.d - b.d);
  return hits.map((h) => h.x);
}

// Grouped fixture search. Empty query returns no results (the overlay shows
// recent searches instead).
export function searchFixtures(query: string): SearchGroups {
  const { tokens } = prepareQuery(query);
  if (tokens.length === 0)
    return { places: [], experiences: [], groups: [], total: 0, onMap: 0 };

  const placeHits = ranked(places, placeWords, (p) => p.coord, tokens);
  const placeResults: SearchResult[] = placeHits
    .slice(0, GROUP_LIMIT)
    .map((p) => ({
      kind: "place",
      id: p.id,
      title: p.name,
      // "Buldresenter · Sentrum · ★ 4,7" (PDF p5's search rows; the kind of
      // business or city space, "Organisasjon" for a club).
      subtitle: [
        placeTypeLabel(p),
        areaFor(p.coord).name,
        placeRating(p.id).count
          ? `★ ${formatRating(placeRating(p.id).score)}`
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
    }));

  const experienceHits = ranked(
    experiences,
    experienceWords,
    (e) => e.meetingPoint.coord,
    tokens,
  );
  const experienceResults: SearchResult[] = experienceHits
    .slice(0, GROUP_LIMIT)
    .map((e) => ({
      kind: "experience",
      id: e.id,
      title: e.title,
      subtitle: `${experienceKindLabel(e)} · ${areaFor(e.meetingPoint.coord).name} · ${e.when}`,
    }));

  const groupResults: SearchResult[] = ranked(
    groups,
    groupWords,
    () => null,
    tokens,
  )
    .slice(0, GROUP_LIMIT)
    .map((g) => ({
      kind: "group",
      id: g.id,
      title: g.name,
      subtitle: `Gruppe · ${g.memberCount} medlemmer`,
    }));

  return {
    places: placeResults,
    experiences: experienceResults,
    groups: groupResults,
    total: placeResults.length + experienceResults.length + groupResults.length,
    onMap: placeHits.length + experienceHits.length,
  };
}
