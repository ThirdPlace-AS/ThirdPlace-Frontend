// The interest catalogue (Phase 19, founder 2026-11-08). MOCK taxonomy: the
// spec names interests and categories but defines no list
// (BLOCKED_CONTRACT_GAP), so this is the app's own working set. It merges
// every interest the app already named (onboarding, profiles, groups,
// experience types, the design's category tree and business tags, with
// synonyms joined) and about forty common ones. Each interest belongs to one
// of the eight pin colours and has its own pin glyph (Material Community
// Icons names; "yarn" is the one hand-drawn glyph).
//
// Every interest gets a Bedrift, an Organisasjon, a Byrom, an Opplevelse, an
// Arrangement and a Gruppe in the fixtures; tests/interestCatalog.test.ts
// checks the list itself.

/** The eight pin colours (the same keys as the map's marker categories). */
export const INTEREST_CATEGORIES = [
  "kafe",
  "mat",
  "sosialt",
  "natur",
  "trening",
  "kultur",
  "kreativt",
  "velvaere",
] as const;
export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];

export type Interest = {
  /** ASCII slug, used in fixture ids ("p-jazz-b"). */
  id: string;
  /** What people see and pick. */
  label: string;
  category: InterestCategory;
  /** Pin glyph: a Material Community Icons name, or "yarn". */
  glyph: string;
  /** Older labels used around the app that mean the same interest. */
  synonyms?: readonly string[];
};

export const INTERESTS = [
  // Kafé
  {
    id: "kaffe",
    label: "Kaffe",
    category: "kafe",
    glyph: "coffee",
    synonyms: ["Spesialkaffe", "Morgenmøter"],
  },
  { id: "bakst", label: "Bakst", category: "kafe", glyph: "bread-slice" },
  { id: "te", label: "Te", category: "kafe", glyph: "tea" },
  // Mat og drikke
  {
    id: "mat",
    label: "Mat",
    category: "mat",
    glyph: "silverware-fork-knife",
    synonyms: ["Matturer", "Måltider"],
  },
  { id: "matlaging", label: "Matlaging", category: "mat", glyph: "pot-steam" },
  {
    id: "vin",
    label: "Vin",
    category: "mat",
    glyph: "glass-wine",
    synonyms: ["Naturvin", "Prøvesmakinger", "Smaking"],
  },
  { id: "ol", label: "Øl", category: "mat", glyph: "glass-mug-variant" },
  { id: "vegansk", label: "Vegansk", category: "mat", glyph: "carrot" },
  { id: "kortreist", label: "Kortreist", category: "mat", glyph: "barn" },
  // Sosialt og spill
  {
    id: "brettspill",
    label: "Brettspill",
    category: "sosialt",
    glyph: "dice-5",
    synonyms: ["Spill"],
  },
  { id: "sjakk", label: "Sjakk", category: "sosialt", glyph: "chess-knight" },
  {
    id: "diskusjon",
    label: "Diskusjon",
    category: "sosialt",
    glyph: "forum",
    synonyms: ["Debatt"],
  },
  {
    id: "shopping",
    label: "Shopping",
    category: "sosialt",
    glyph: "shopping",
    synonyms: ["Shopping og møte"],
  },
  { id: "quiz", label: "Quiz", category: "sosialt", glyph: "head-question" },
  {
    id: "gaming",
    label: "Gaming",
    category: "sosialt",
    glyph: "gamepad-variant",
  },
  {
    id: "rollespill",
    label: "Rollespill",
    category: "sosialt",
    glyph: "sword-cross",
  },
  {
    id: "sprakkafe",
    label: "Språkkafé",
    category: "sosialt",
    glyph: "translate",
  },
  {
    id: "frivillighet",
    label: "Frivillighet",
    category: "sosialt",
    glyph: "hand-heart",
  },
  { id: "biljard", label: "Biljard", category: "sosialt", glyph: "billiards" },
  { id: "bowling", label: "Bowling", category: "sosialt", glyph: "bowling" },
  // Natur og tur
  {
    id: "friluftsliv",
    label: "Friluftsliv",
    category: "natur",
    glyph: "hiking",
    synonyms: ["Natur", "Tur & friluft"],
  },
  { id: "sopp-tur", label: "Sopp-tur", category: "natur", glyph: "mushroom" },
  { id: "dyreliv", label: "Dyreliv", category: "natur", glyph: "binoculars" },
  { id: "fiske", label: "Fiske", category: "natur", glyph: "fish" },
  {
    id: "astronomi",
    label: "Astronomi",
    category: "natur",
    glyph: "telescope",
  },
  {
    id: "baerekraft",
    label: "Bærekraft",
    category: "natur",
    glyph: "recycle",
  },
  { id: "hund", label: "Hund", category: "natur", glyph: "dog" },
  {
    id: "hage-og-dyrking",
    label: "Hage og dyrking",
    category: "natur",
    glyph: "sprout",
  },
  // Trening
  { id: "loping", label: "Løping", category: "trening", glyph: "run" },
  { id: "fotball", label: "Fotball", category: "trening", glyph: "soccer" },
  { id: "padel", label: "Padel", category: "trening", glyph: "racquetball" },
  {
    id: "klatring",
    label: "Klatring",
    category: "trening",
    glyph: "carabiner",
  },
  {
    id: "sykkel",
    label: "Sykkel",
    category: "trening",
    glyph: "bike",
    synonyms: ["Sykkelturer"],
  },
  {
    id: "vannsport",
    label: "Vannsport",
    category: "trening",
    glyph: "surfing",
  },
  { id: "dans", label: "Dans", category: "trening", glyph: "dance-ballroom" },
  { id: "kampsport", label: "Kampsport", category: "trening", glyph: "karate" },
  { id: "tennis", label: "Tennis", category: "trening", glyph: "tennis" },
  { id: "basket", label: "Basket", category: "trening", glyph: "basketball" },
  {
    id: "volleyball",
    label: "Volleyball",
    category: "trening",
    glyph: "volleyball",
  },
  {
    id: "bordtennis",
    label: "Bordtennis",
    category: "trening",
    glyph: "table-tennis",
  },
  { id: "svomming", label: "Svømming", category: "trening", glyph: "swim" },
  { id: "ski", label: "Ski", category: "trening", glyph: "ski" },
  {
    id: "langrenn",
    label: "Langrenn",
    category: "trening",
    glyph: "ski-cross-country",
  },
  { id: "skoyter", label: "Skøyter", category: "trening", glyph: "skate" },
  { id: "kajakk", label: "Kajakk", category: "trening", glyph: "kayaking" },
  { id: "seiling", label: "Seiling", category: "trening", glyph: "sail-boat" },
  {
    id: "styrketrening",
    label: "Styrketrening",
    category: "trening",
    glyph: "dumbbell",
  },
  { id: "skate", label: "Skate", category: "trening", glyph: "skateboard" },
  // Bøker og kultur
  {
    id: "litteratur",
    label: "Litteratur",
    category: "kultur",
    glyph: "book-open-page-variant",
    synonyms: ["Bøker"],
  },
  { id: "jazz", label: "Jazz", category: "kultur", glyph: "saxophone" },
  {
    id: "konserter",
    label: "Konserter",
    category: "kultur",
    glyph: "guitar-electric",
    synonyms: ["Live-musikk", "Live musikk", "Musikk"],
  },
  { id: "klassisk", label: "Klassisk", category: "kultur", glyph: "violin" },
  {
    id: "klubb-og-dj",
    label: "Klubb og DJ",
    category: "kultur",
    glyph: "headphones",
    synonyms: ["Natteliv", "Uteliv", "DJ / Klubb"],
  },
  { id: "vinyl", label: "Vinyl", category: "kultur", glyph: "record-player" },
  { id: "film", label: "Film", category: "kultur", glyph: "filmstrip" },
  {
    id: "teater",
    label: "Teater",
    category: "kultur",
    glyph: "drama-masks",
    synonyms: ["Forestillinger"],
  },
  { id: "museer", label: "Museer", category: "kultur", glyph: "bank" },
  { id: "historie", label: "Historie", category: "kultur", glyph: "castle" },
  {
    id: "arkitektur",
    label: "Arkitektur",
    category: "kultur",
    glyph: "office-building",
  },
  {
    id: "byvandring",
    label: "Byvandring",
    category: "kultur",
    glyph: "map-marker-path",
    synonyms: ["Landemerker"],
  },
  {
    id: "kor-og-sang",
    label: "Kor og sang",
    category: "kultur",
    glyph: "account-music",
  },
  {
    id: "standup",
    label: "Standup",
    category: "kultur",
    glyph: "microphone-variant",
  },
  { id: "poesi", label: "Poesi", category: "kultur", glyph: "feather" },
  {
    id: "skriving",
    label: "Skriving",
    category: "kultur",
    glyph: "fountain-pen-tip",
  },
  { id: "podcast", label: "Podcast", category: "kultur", glyph: "podcast" },
  {
    id: "filosofi",
    label: "Filosofi",
    category: "kultur",
    glyph: "head-lightbulb",
  },
  // Kreativt og verksted
  {
    id: "fotografi",
    label: "Fotografi",
    category: "kreativt",
    glyph: "camera",
    synonyms: ["Foto", "Fotografering"],
  },
  { id: "keramikk", label: "Keramikk", category: "kreativt", glyph: "bowl" },
  { id: "strikking", label: "Strikking", category: "kreativt", glyph: "yarn" },
  {
    id: "kunst",
    label: "Kunst",
    category: "kreativt",
    glyph: "palette",
    synonyms: ["Gallerier", "Kunstverksteder"],
  },
  {
    id: "design",
    label: "Design",
    category: "kreativt",
    glyph: "ruler-square-compass",
  },
  {
    id: "verksted",
    label: "Verksted",
    category: "kreativt",
    glyph: "hammer-wrench",
  },
  { id: "tech", label: "Tech", category: "kreativt", glyph: "laptop" },
  { id: "tegning", label: "Tegning", category: "kreativt", glyph: "pencil" },
  { id: "maling", label: "Maling", category: "kreativt", glyph: "brush" },
  { id: "mote", label: "Mote", category: "kreativt", glyph: "hanger" },
  { id: "interior", label: "Interiør", category: "kreativt", glyph: "sofa" },
  { id: "planter", label: "Planter", category: "kreativt", glyph: "cactus" },
  // Velvære
  { id: "yoga", label: "Yoga", category: "velvaere", glyph: "yoga" },
  {
    id: "velvaere",
    label: "Velvære",
    category: "velvaere",
    glyph: "spa",
    synonyms: ["Skjønnhet"],
  },
  { id: "badstue", label: "Badstue", category: "velvaere", glyph: "hot-tub" },
  {
    id: "meditasjon",
    label: "Meditasjon",
    category: "velvaere",
    glyph: "meditation",
  },
  { id: "bading", label: "Bading", category: "velvaere", glyph: "waves" },
  {
    id: "pilates",
    label: "Pilates",
    category: "velvaere",
    glyph: "gymnastics",
  },
] as const satisfies readonly Interest[];

export type InterestId = (typeof INTERESTS)[number]["id"];

/** The design's 22 (PDF p3, `INTEREST_OPTIONS`), in that order: shown first. */
export const DESIGN_INTEREST_IDS: readonly InterestId[] = [
  "kaffe",
  "jazz",
  "loping",
  "fotografi",
  "keramikk",
  "brettspill",
  "klatring",
  "vin",
  "bakst",
  "design",
  "litteratur",
  "yoga",
  "sjakk",
  "vinyl",
  "matlaging",
  "fotball",
  "kunst",
  "padel",
  "sopp-tur",
  "strikking",
  "film",
  "tech",
];

const BY_ID = new Map<string, Interest>(INTERESTS.map((i) => [i.id, i]));
const BY_WORD = new Map<string, Interest>();
for (const i of INTERESTS as readonly Interest[]) {
  BY_WORD.set(i.label.toLowerCase(), i);
  for (const s of i.synonyms ?? []) BY_WORD.set(s.toLowerCase(), i);
}

export function interestById(id: string | undefined): Interest | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** The interest a label (or one of its older synonyms) names. */
export function interestForLabel(label: string): Interest | undefined {
  return BY_WORD.get(label.trim().toLowerCase());
}

/** The interest's label and older synonyms, lower-cased (for search). */
export function interestWords(id: string | undefined): string[] {
  const i = interestById(id);
  return i ? [i.label, ...(i.synonyms ?? [])].map((w) => w.toLowerCase()) : [];
}

export function interestsInCategory(cat: InterestCategory): Interest[] {
  return (INTERESTS as readonly Interest[]).filter((i) => i.category === cat);
}
