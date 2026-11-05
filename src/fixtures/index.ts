// STATIC MOCK FIXTURES — Phase 1 visual shell only.
//
// BLOCKED_CONTRACT_GAP: none of this is real data, a canonical entity, or an API
// shape. It exists solely to render the visual shell. No field here implies an
// approved schema/DTO. Real data arrives only with the authoritative V2.2 contract.
// `coord` values are MOCK demo points near Oslo for map markers — NOT authoritative
// places or real geodata.

import type { ImageSourcePropType } from "react-native";

import type { LibraryKey } from "./images";

export const PLACE_CATEGORIES = [
  "Alle",
  "Kafé",
  "Bokcafé",
  "Vinbar",
  "Verksted",
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

// Filter option constants (MOCK — not a pricing/geo contract).
export const RADIUS_OPTIONS = [500, 1000, 2000] as const; // meters
export const PRICE_LEVELS = [1, 2, 3] as const; // "kr" tiers
export type PriceLevel = (typeof PRICE_LEVELS)[number];

// Vibe tags (MOCK — not a canonical taxonomy).
export const VIBES = [
  "Rolig",
  "Koselig",
  "Energisk",
  "Intim",
  "Sosial",
  "Romantisk",
  "Livlig",
  "Kreativ",
  "Luksuriøs",
] as const;
export type Vibe = (typeof VIBES)[number];

// Time windows for the "Når" filter (MOCK — maps to experience `day`).
export const TIME_WINDOWS = ["I dag", "I morgen", "Denne uka", "Helg"] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number];

// Price bands in NOK (MOCK — not a pricing contract). Derived from priceNok.
export const PRICE_BANDS = ["Gratis", "Under 100", "100–300", "300+"] as const;
export type PriceBand = (typeof PRICE_BANDS)[number];
export function priceBandFor(nok: number): PriceBand {
  if (nok <= 0) return "Gratis";
  if (nok < 100) return "Under 100";
  if (nok <= 300) return "100–300";
  return "300+";
}

// Amenity/tag options for the filter sheet (MOCK — a curated subset of the tags
// that appear on the demo places, not a canonical amenity taxonomy).
export const PLACE_TAGS = [
  "Wifi",
  "Studievennlig",
  "Drop-in",
  "Stille",
  "Bøker",
  "Naturvin",
  "Uteservering",
  "Hundevennlig",
  "Vegansk",
  "Live musikk",
  "Barnevennlig",
  "Parkering",
] as const;
export type PlaceTag = (typeof PLACE_TAGS)[number];

// Accessibility filter options (MOCK a11y labels, not a canonical taxonomy).
// Grouped under "Tilgjengelighetsfunksjoner" in the filter sheet.
export const ACCESSIBILITY_OPTIONS = [
  "Trinnfri inngang",
  "Rullestol-WC",
  "Heis",
  "Syns- og hørselshjelpemidler",
  "Alternativer for tegnspråk",
  "Ledsager for synshemmede",
  "Sensoriske stimuli",
  "Ingen ekstreme sensoriske stimuli",
] as const;
export type AccessibilityOption = (typeof ACCESSIBILITY_OPTIONS)[number];

// Minimum-rating filter options (MOCK — rating is a display-only mock number).
export const MIN_RATING_OPTIONS = [4, 4.5] as const;

// ── Filter taxonomies for the "Filtre" sheet ─────────────────────────────────
// BLOCKED_CONTRACT_GAP: all of the below are MOCK demo taxonomies for the visual
// filter shell. None is a canonical category/age/language/duration enum. Icons
// are Ionicons glyph names chosen for the demo, not brand-approved iconography.

// "Opplevelsestype" — experience-type chips (icon + Norwegian label). MOCK.
export type MockExperienceType = {
  label: string;
  icon: string; // Ionicons glyph name
};
export const EXPERIENCE_TYPES: MockExperienceType[] = [
  { label: "Arkitektur", icon: "business-outline" },
  { label: "Dyreliv", icon: "paw-outline" },
  { label: "Flyging", icon: "airplane-outline" },
  { label: "Forestillinger", icon: "musical-notes-outline" },
  { label: "Friluftsliv", icon: "leaf-outline" },
  { label: "Gallerier", icon: "image-outline" },
  { label: "Kulturelle aktiviteter", icon: "color-palette-outline" },
  { label: "Kunstverksteder", icon: "brush-outline" },
  { label: "Landemerker", icon: "flag-outline" },
  { label: "Matlaging", icon: "restaurant-outline" },
  { label: "Matturer", icon: "fast-food-outline" },
  { label: "Museer", icon: "library-outline" },
  { label: "Måltider", icon: "wine-outline" },
  { label: "Prøvesmakinger", icon: "cafe-outline" },
  { label: "Shopping og møte", icon: "bag-outline" },
  { label: "Skjønnhet", icon: "cut-outline" },
  { label: "Trening", icon: "barbell-outline" },
  { label: "Vannsport", icon: "water-outline" },
  { label: "Velvære", icon: "flower-outline" },
  { label: "Natteliv", icon: "moon-outline" },
  { label: "Konserter", icon: "mic-outline" },
  { label: "Festivaler", icon: "sparkles-outline" },
  { label: "Historie", icon: "time-outline" },
  { label: "Fotografering", icon: "camera-outline" },
  { label: "Sykkelturer", icon: "bicycle-outline" },
];
export const EXPERIENCE_TYPE_LABELS = EXPERIENCE_TYPES.map((t) => t.label);

// "Passer for" — audience chips (MOCK age/eligibility demo, not a policy enum).
export type MockAudience = { label: string; icon: string };
export const AUDIENCES: MockAudience[] = [
  { label: "Barn", icon: "happy-outline" },
  { label: "Store grupper", icon: "people-outline" },
  { label: "Alenereisende", icon: "person-outline" },
  { label: "Par", icon: "heart-outline" },
  { label: "Førstegangsbesøkende", icon: "sparkles-outline" },
  { label: "Lokalkjente", icon: "location-outline" },
];
export const AUDIENCE_LABELS = AUDIENCES.map((a) => a.label);

// "Varighet" — duration steps in minutes (MOCK). 999 = "Over 5 t" / no upper cap.
export type MockDurationStep = { min: number; label: string };
export const DURATION_STEPS: MockDurationStep[] = [
  { min: 30, label: "30 min" },
  { min: 60, label: "1 t" },
  { min: 90, label: "1,5 t" },
  { min: 120, label: "2 t" },
  { min: 180, label: "3 t" },
  { min: 240, label: "4 t" },
  { min: 999, label: "Over 5 t" },
];

// "Tid på dagen" — part-of-day checkboxes (MOCK). Distinct from the `time`
// (TimeWindow) axis that drives experience discovery.
export type MockTimeOfDay = { key: string; label: string; hint: string };
export const TIME_OF_DAY: MockTimeOfDay[] = [
  { key: "morgen", label: "Morgen", hint: "Før kl. 12.00" },
  {
    key: "ettermiddag",
    label: "Ettermiddag",
    hint: "Mellom kl. 12.00 og 17.00",
  },
  { key: "kveld", label: "Kveld", hint: "Etter kl. 17.00" },
];
export const TIME_OF_DAY_KEYS = TIME_OF_DAY.map((t) => t.key);

// "Språk som tilbys" — language checkboxes (MOCK demo list, not a locale enum).
// The first `LANGUAGES_VISIBLE` show by default; the rest sit behind "Vis mer".
export const LANGUAGES = [
  "engelsk",
  "fransk",
  "tysk",
  "japansk",
  "italiensk",
  "russisk",
  "spansk",
  "kinesisk (forenklet)",
  "arabisk",
  "hindi",
  "portugisisk",
  "tyrkisk",
  "indonesisk",
  "nederlandsk",
  "koreansk",
  "bengali",
  "thai",
  "panjabi",
  "gresk",
  "tegnspråk",
  "polsk",
  "norsk",
] as const;
export type Language = (typeof LANGUAGES)[number];
export const LANGUAGES_VISIBLE = 3; // rows shown before the "Vis mer" expander

// Icon maps for the filter chips/rows (MOCK — Ionicons glyph names chosen for the
// demo, not brand-approved iconography). Kept as lookup maps so VIBES / PLACE_TAGS
// / ACCESSIBILITY_OPTIONS stay plain string arrays for their other consumers.
export const VIBE_ICONS: Record<Vibe, string> = {
  Rolig: "leaf-outline",
  Koselig: "flame-outline",
  Energisk: "flash-outline",
  Intim: "heart-outline",
  Sosial: "people-outline",
  Romantisk: "rose-outline",
  Livlig: "pulse-outline",
  Kreativ: "color-wand-outline",
  Luksuriøs: "diamond-outline",
};
export const TAG_ICONS: Record<string, string> = {
  Wifi: "wifi",
  Studievennlig: "book-outline",
  "Drop-in": "walk-outline",
  Stille: "volume-mute-outline",
  Bøker: "library-outline",
  Naturvin: "wine-outline",
  Uteservering: "sunny-outline",
  Hundevennlig: "paw-outline",
  Vegansk: "nutrition-outline",
  "Live musikk": "musical-notes-outline",
  Barnevennlig: "happy-outline",
  Parkering: "car-outline",
};
export const ACCESSIBILITY_ICONS: Record<string, string> = {
  "Trinnfri inngang": "enter-outline",
  "Rullestol-WC": "accessibility-outline",
  Heis: "swap-vertical-outline",
  "Syns- og hørselshjelpemidler": "eye-outline",
  "Alternativer for tegnspråk": "hand-left-outline",
  "Ledsager for synshemmede": "walk-outline",
  "Sensoriske stimuli": "sparkles-outline",
  "Ingen ekstreme sensoriske stimuli": "volume-mute-outline",
};
// Fallback glyph for any label missing from a map above.
export const DEFAULT_CHIP_ICON = "ellipse-outline";

// Rating thresholds for the "Vurdering" star row (MOCK — rating is display-only).
export const RATING_THRESHOLDS = [3, 3.5, 4, 4.5, 5] as const;

export type MockPlace = {
  id: string;
  name: string;
  category: Exclude<PlaceCategory, "Alle">;
  distance: string;
  distanceM: number;
  coord: [number, number]; // [lng, lat] — MOCK demo point
  priceLevel: PriceLevel; // MOCK price tier (1–3), not a real price
  priceNok: number; // MOCK typical spend in NOK (drives price bands), not real
  vibes: Vibe[]; // MOCK vibe tags, not a canonical taxonomy
  blurb: string;
  rating: number;
  reviews: number;
  openNow: boolean;
  tags: string[];
  about: string;
  // MOCK place-detail fields (visual shell only — NOT a canonical schema/DTO).
  address: string; // MOCK street line, not a geocoded/authoritative address
  hours: string; // MOCK opening hours string, not structured hours data
  specialHours?: string; // MOCK exception line (e.g. a holiday), optional
  accessibility: string[]; // MOCK a11y labels, not a canonical taxonomy
  source: string; // MOCK provenance line (where the listing "came from")
  placeStatus: "active" | "stale" | "unavailable"; // MOCK freshness/availability
  // MOCK filter axes for the "Filtre" sheet (visual shell only — NOT a schema).
  types: string[]; // "Opplevelsestype" labels (subset of EXPERIENCE_TYPE_LABELS)
  audiences: string[]; // "Passer for" labels (subset of AUDIENCE_LABELS)
  durationMin: number; // MOCK typical duration in minutes (drives "Varighet")
  timeOfDay: string[]; // "Tid på dagen" keys (subset of TIME_OF_DAY_KEYS)
  languages: string[]; // "Språk som tilbys" (subset of LANGUAGES)
};

export const places: MockPlace[] = [
  {
    id: "p1",
    name: "Oslo Kaffebar",
    category: "Kafé",
    distance: "120 m",
    distanceM: 120,
    coord: [10.7579, 59.9227],
    priceLevel: 1,
    priceNok: 60,
    vibes: ["Rolig", "Koselig"],
    blurb: "Lun nabolagskafé med spesialkaffe.",
    rating: 4.6,
    reviews: 128,
    openNow: true,
    tags: [
      "Spesialkaffe",
      "Wifi",
      "Studievennlig",
      "Uteservering",
      "Hundevennlig",
    ],
    about:
      "En rolig kafé på hjørnet med husbrent kaffe, hjemmebakst og god plass til å slå seg ned.",
    address: "Thorvald Meyers gate 12, 0555 Oslo",
    hours: "Man–fre 07–18 · Lør–søn 09–17",
    accessibility: ["Trinnfri inngang", "Rullestol-WC"],
    source: "Kilde: OpenStreetMap + redaksjonelt",
    placeStatus: "active",
    types: ["Prøvesmakinger", "Matlaging"],
    audiences: ["Alenereisende", "Førstegangsbesøkende"],
    durationMin: 60,
    timeOfDay: ["morgen", "ettermiddag"],
    languages: ["norsk", "engelsk"],
  },
  {
    id: "p2",
    name: "Grünerløkka Bokcafé",
    category: "Bokcafé",
    distance: "450 m",
    distanceM: 450,
    coord: [10.7605, 59.925],
    priceLevel: 1,
    priceNok: 80,
    vibes: ["Rolig", "Intim"],
    blurb: "Bøker, te og stille kroker.",
    rating: 4.8,
    reviews: 86,
    openNow: true,
    tags: ["Bøker", "Te", "Stille", "Vegansk"],
    about: "Vegger av bøker, dyp sofa og en tekanne som aldri går tom.",
    address: "Markveien 35, 0554 Oslo",
    hours: "Hver dag 10–22",
    specialHours: "Stengt 17. mai",
    accessibility: ["Trinnfri inngang"],
    source: "Kilde: eier-innsendt, ikke verifisert",
    placeStatus: "active",
    types: ["Kulturelle aktiviteter", "Forestillinger"],
    audiences: ["Alenereisende", "Lokalkjente"],
    durationMin: 90,
    timeOfDay: ["ettermiddag", "kveld"],
    languages: ["norsk", "engelsk", "fransk"],
  },
  {
    id: "p3",
    name: "Mathallen Vinbar",
    category: "Vinbar",
    distance: "800 m",
    distanceM: 800,
    coord: [10.751, 59.9269],
    priceLevel: 3,
    priceNok: 250,
    vibes: ["Sosial", "Energisk", "Romantisk", "Livlig", "Luksuriøs"],
    blurb: "Naturvin og småretter.",
    rating: 4.4,
    reviews: 203,
    openNow: false,
    tags: ["Naturvin", "Småretter", "Sosialt", "Uteservering", "Live musikk"],
    about:
      "Liten vinbar inne i Mathallen med skiftende glass og delbare retter.",
    address: "Vulkan 5, 0178 Oslo",
    hours: "Ons–søn 15–23",
    accessibility: ["Trinnfri inngang", "Heis"],
    source: "Kilde: OpenStreetMap",
    placeStatus: "stale",
    types: ["Måltider", "Prøvesmakinger", "Natteliv"],
    audiences: ["Par", "Store grupper"],
    durationMin: 120,
    timeOfDay: ["kveld"],
    languages: ["norsk", "engelsk", "italiensk"],
  },
  {
    id: "p4",
    name: "Sofienberg Sykkelverksted",
    category: "Verksted",
    distance: "1.1 km",
    distanceM: 1100,
    coord: [10.767, 59.919],
    priceLevel: 2,
    priceNok: 150,
    vibes: ["Rolig", "Kreativ"],
    blurb: "Fiks sykkelen mens du venter.",
    rating: 4.9,
    reviews: 54,
    openNow: true,
    tags: ["Sykkel", "Reparasjon", "Drop-in", "Parkering"],
    about:
      "Lite verksted drevet av entusiaster. Kaffe mens du venter på dekkskiftet.",
    address: "Sofienberggata 7, 0558 Oslo",
    hours: "Man–fre 10–18",
    accessibility: ["Trinnfri inngang"],
    source: "Kilde: eier-innsendt",
    placeStatus: "unavailable",
    types: ["Kunstverksteder", "Sykkelturer"],
    audiences: ["Alenereisende", "Lokalkjente"],
    durationMin: 45,
    timeOfDay: ["morgen", "ettermiddag"],
    languages: ["norsk", "engelsk"],
  },
  {
    id: "p5",
    name: "Akerselva Vandring",
    category: "Kafé",
    distance: "300 m",
    distanceM: 300,
    coord: [10.7558, 59.9268],
    priceLevel: 1,
    priceNok: 0,
    vibes: ["Rolig", "Koselig"],
    blurb: "Gratis guidet elvevandring.",
    rating: 4.7,
    reviews: 41,
    openNow: true,
    tags: ["Natur", "Gratis", "Drop-in", "Hundevennlig", "Barnevennlig"],
    about:
      "Uformell vandring langs Akerselva med lokale fortellinger. Ingen påmelding.",
    address: "Nedre Foss, 0555 Oslo",
    hours: "Lør–søn 11–15",
    accessibility: ["Trinnfri inngang", "Ledsager for synshemmede"],
    source: "Kilde: redaksjonelt",
    placeStatus: "active",
    types: ["Friluftsliv", "Landemerker"],
    audiences: ["Barn", "Store grupper", "Førstegangsbesøkende"],
    durationMin: 90,
    timeOfDay: ["morgen"],
    languages: ["norsk", "engelsk", "tysk"],
  },
  {
    id: "p6",
    name: "Vulkan Keramikkstudio",
    category: "Verksted",
    distance: "650 m",
    distanceM: 650,
    coord: [10.7515, 59.9261],
    priceLevel: 2,
    priceNok: 420,
    vibes: ["Koselig", "Intim", "Kreativ", "Romantisk"],
    blurb: "Dreieskive for nybegynnere.",
    rating: 4.8,
    reviews: 67,
    openNow: true,
    tags: ["Kurs", "Håndverk", "Wifi"],
    about:
      "To timer ved dreieskiva med alt utstyr inkludert. Små grupper, mye veiledning.",
    address: "Maridalsveien 17, 0178 Oslo",
    hours: "Tir–søn 12–20",
    accessibility: ["Trinnfri inngang", "Heis", "Sensoriske stimuli"],
    source: "Kilde: eier-innsendt",
    placeStatus: "active",
    types: ["Kunstverksteder", "Kulturelle aktiviteter"],
    audiences: ["Par", "Alenereisende", "Store grupper"],
    durationMin: 120,
    timeOfDay: ["ettermiddag", "kveld"],
    languages: ["norsk", "engelsk"],
  },
  {
    id: "p7",
    name: "Grünerløkka Mattur",
    category: "Vinbar",
    distance: "500 m",
    distanceM: 500,
    coord: [10.7662, 59.9238],
    priceLevel: 3,
    priceNok: 680,
    vibes: ["Sosial", "Energisk", "Livlig", "Luksuriøs"],
    blurb: "Smak deg gjennom nabolaget.",
    rating: 4.6,
    reviews: 152,
    openNow: true,
    tags: [
      "Mat",
      "Guidet",
      "Sosialt",
      "Uteservering",
      "Vegansk",
      "Live musikk",
    ],
    about:
      "Tre timers matvandring innom fem lokale serveringssteder med en vertskapsguide.",
    address: "Olaf Ryes plass 2, 0552 Oslo",
    hours: "Tor–lør 17–20",
    accessibility: ["Trinnfri inngang"],
    source: "Kilde: partner-innsendt",
    placeStatus: "active",
    types: ["Matturer", "Måltider", "Prøvesmakinger", "Natteliv", "Festivaler"],
    audiences: ["Par", "Store grupper", "Førstegangsbesøkende"],
    durationMin: 180,
    timeOfDay: ["kveld"],
    languages: ["norsk", "engelsk", "spansk", "tysk"],
  },
  {
    id: "p8",
    name: "Botanisk Hage Omvisning",
    category: "Kafé",
    distance: "1.4 km",
    distanceM: 1400,
    coord: [10.7698, 59.9191],
    priceLevel: 1,
    priceNok: 95,
    vibes: ["Rolig", "Koselig"],
    blurb: "Guidet tur blant sjeldne planter.",
    rating: 4.5,
    reviews: 98,
    openNow: false,
    tags: ["Natur", "Guidet", "Barnevennlig"],
    about:
      "Rolig omvisning gjennom veksthusene med fokus på nordiske og tropiske arter.",
    address: "Sars' gate 1, 0562 Oslo",
    hours: "Hver dag 10–17",
    accessibility: [
      "Trinnfri inngang",
      "Rullestol-WC",
      "Ingen ekstreme sensoriske stimuli",
    ],
    source: "Kilde: OpenStreetMap + redaksjonelt",
    placeStatus: "active",
    types: ["Dyreliv", "Friluftsliv", "Museer"],
    audiences: ["Barn", "Førstegangsbesøkende", "Alenereisende"],
    durationMin: 60,
    timeOfDay: ["morgen", "ettermiddag"],
    languages: ["norsk", "engelsk", "fransk", "tysk"],
  },
  {
    id: "p9",
    name: "Takåsen Yogastudio",
    category: "Verksted",
    distance: "950 m",
    distanceM: 950,
    coord: [10.7631, 59.9283],
    priceLevel: 2,
    priceNok: 210,
    vibes: ["Rolig", "Intim"],
    blurb: "Morgenyoga med utsikt.",
    rating: 4.9,
    reviews: 74,
    openNow: true,
    tags: ["Trening", "Velvære", "Drop-in", "Parkering"],
    about:
      "Myk morgenøkt på taket med matter inkludert. Passer for alle nivåer.",
    address: "Thorvald Meyers gate 59, 0552 Oslo",
    hours: "Man–fre 07–09 · Lør 09–11",
    accessibility: ["Heis", "Sensoriske stimuli"],
    source: "Kilde: eier-innsendt",
    placeStatus: "active",
    types: ["Trening", "Velvære"],
    audiences: ["Alenereisende", "Par"],
    durationMin: 60,
    timeOfDay: ["morgen"],
    languages: ["norsk", "engelsk"],
  },
  {
    id: "p10",
    name: "Oslofjord Seiltur",
    category: "Vinbar",
    distance: "2.3 km",
    distanceM: 2300,
    coord: [10.7389, 59.9044],
    priceLevel: 3,
    priceNok: 1650,
    vibes: ["Energisk", "Sosial"],
    blurb: "Halvdags seiltur på fjorden.",
    rating: 4.7,
    reviews: 39,
    openNow: true,
    tags: ["Natur", "Guidet", "Eksklusivt", "Parkering"],
    about:
      "Fire timer på fjorden med skipper, enkel servering og svømmestopp om været tillater.",
    address: "Aker brygge, 0250 Oslo",
    hours: "Lør–søn 12–16",
    accessibility: ["Ledsager for synshemmede"],
    source: "Kilde: partner-innsendt",
    placeStatus: "active",
    types: ["Vannsport", "Friluftsliv", "Flyging"],
    audiences: ["Par", "Store grupper", "Førstegangsbesøkende"],
    durationMin: 240,
    timeOfDay: ["ettermiddag"],
    languages: ["norsk", "engelsk", "nederlandsk"],
  },
  {
    id: "p11",
    name: "Munch-galleriet Kveldstur",
    category: "Bokcafé",
    distance: "1.8 km",
    distanceM: 1800,
    coord: [10.7566, 59.9058],
    priceLevel: 2,
    priceNok: 320,
    vibes: ["Intim", "Koselig"],
    blurb: "Kveldsomvisning uten kø.",
    rating: 4.6,
    reviews: 221,
    openNow: false,
    tags: ["Kunst", "Guidet", "Tilgjengelig"],
    about:
      "Liten kveldsgruppe gjennom hovedutstillingen med en kunsthistoriker.",
    address: "Edvard Munchs plass 1, 0194 Oslo",
    hours: "Tor 18–21",
    accessibility: [
      "Trinnfri inngang",
      "Heis",
      "Rullestol-WC",
      "Alternativer for tegnspråk",
    ],
    source: "Kilde: partner-innsendt",
    placeStatus: "active",
    types: [
      "Gallerier",
      "Kulturelle aktiviteter",
      "Arkitektur",
      "Historie",
      "Fotografering",
    ],
    audiences: ["Alenereisende", "Par", "Lokalkjente"],
    durationMin: 90,
    timeOfDay: ["kveld"],
    languages: ["norsk", "engelsk", "tegnspråk"],
  },
  {
    id: "p12",
    name: "Barcode Arkitekturtur",
    category: "Kafé",
    distance: "2.0 km",
    distanceM: 2000,
    coord: [10.7553, 59.9076],
    priceLevel: 1,
    priceNok: 120,
    vibes: ["Energisk", "Sosial"],
    blurb: "Gå i de nye høyhusene.",
    rating: 4.3,
    reviews: 63,
    openNow: true,
    tags: ["Arkitektur", "Guidet", "Gå"],
    about:
      "Vandring gjennom Barcode-rekka med en arkitekt som forteller om byutviklingen.",
    address: "Dronning Eufemias gate 30, 0191 Oslo",
    hours: "Lør 13–15",
    accessibility: ["Trinnfri inngang"],
    source: "Kilde: redaksjonelt",
    placeStatus: "active",
    types: ["Arkitektur", "Landemerker", "Fotografering"],
    audiences: ["Førstegangsbesøkende", "Store grupper"],
    durationMin: 120,
    timeOfDay: ["ettermiddag"],
    languages: ["norsk", "engelsk", "tysk", "fransk"],
  },
  {
    id: "p13",
    name: "Grønland Krydderverksted",
    category: "Verksted",
    distance: "1.6 km",
    distanceM: 1600,
    coord: [10.7623, 59.9124],
    priceLevel: 2,
    priceNok: 260,
    vibes: ["Sosial", "Koselig"],
    blurb: "Lag din egen krydderblanding.",
    rating: 4.8,
    reviews: 88,
    openNow: true,
    tags: ["Mat", "Kurs", "Håndverk"],
    about:
      "Praktisk verksted der du blander og tar med egne krydder, med smaksprøver underveis.",
    address: "Tøyengata 12, 0190 Oslo",
    hours: "Ons–lør 14–19",
    accessibility: ["Trinnfri inngang", "Ingen ekstreme sensoriske stimuli"],
    source: "Kilde: eier-innsendt",
    placeStatus: "active",
    types: ["Matlaging", "Prøvesmakinger", "Shopping og møte"],
    audiences: ["Par", "Store grupper", "Barn"],
    durationMin: 90,
    timeOfDay: ["ettermiddag", "kveld"],
    languages: ["norsk", "engelsk", "arabisk", "tyrkisk"],
  },
  {
    id: "p14",
    name: "Frogner Skjønnhetssalong",
    category: "Bokcafé",
    distance: "2.6 km",
    distanceM: 2600,
    coord: [10.7045, 59.9205],
    priceLevel: 3,
    priceNok: 540,
    vibes: ["Rolig", "Intim"],
    blurb: "Ansiktsbehandling og ro.",
    rating: 4.5,
    reviews: 112,
    openNow: false,
    tags: ["Velvære", "Booking", "Rolig"],
    about:
      "Klassisk ansiktsbehandling i rolige omgivelser. Forhåndsbooking anbefales.",
    address: "Frognerveien 22, 0263 Oslo",
    hours: "Tir–lør 10–18",
    accessibility: ["Trinnfri inngang", "Sensoriske stimuli"],
    source: "Kilde: partner-innsendt",
    placeStatus: "active",
    types: ["Skjønnhet", "Velvære"],
    audiences: ["Alenereisende", "Par"],
    durationMin: 60,
    timeOfDay: ["morgen", "ettermiddag"],
    languages: ["norsk", "engelsk", "russisk"],
  },
];

// Map default camera center (mock — central Oslo).
export const MAP_CENTER: [number, number] = [10.758, 59.9227];

// Manual-area fallback options when precise GPS is unavailable/denied (MOCK Oslo
// neighbourhoods — NOT authoritative geodata). Lets guests browse without GPS.
export type MockArea = { name: string; coord: [number, number] };
export const OSLO_AREAS: MockArea[] = [
  { name: "Grünerløkka", coord: [10.758, 59.9227] },
  { name: "Sentrum", coord: [10.7464, 59.9127] },
  { name: "Majorstuen", coord: [10.7146, 59.9299] },
  { name: "Frogner", coord: [10.7052, 59.9212] },
  { name: "Grønland", coord: [10.7635, 59.9127] },
];

// The demo city shown in the map peek header (MOCK — no reverse-geocode; the
// real source would be a market/city entity, not yet contract-certified).
export const MAP_CITY = "Oslo";

// Weather for the map peek header (MOCK — DEMO ONLY). BLOCKED_CONTRACT_GAP:
// weather has no certified V2.2 DTO/endpoint; the real source is the
// WeatherProvider/OpenWeather adapter. Static so it never implies a live feed.
export type WeatherCondition = "clear" | "cloudy" | "rain" | "snow";
export type MockWeather = {
  tempC: number;
  condition: WeatherCondition;
  label: string; // Norwegian condition label
  icon: string; // Ionicons glyph name
};
export const MOCK_WEATHER: MockWeather = {
  tempC: 7,
  condition: "cloudy",
  label: "Delvis skyet",
  icon: "partly-sunny-outline",
};

// ── Businesses (MOCK — not a canonical entity/DTO) ───────────────────────────
export type MockBusiness = {
  id: string;
  name: string;
  category: Exclude<PlaceCategory, "Alle">;
  verified: boolean;
  about: string;
  address: string;
  hours: string;
  placeId: string; // the place this business runs
};

export const businesses: MockBusiness[] = [
  {
    id: "b1",
    name: "Oslo Kaffebar AS",
    category: "Kafé",
    verified: true,
    about: "Familiedrevet mikrobakeri og kafé siden 2014.",
    address: "Thorvald Meyers gate 12, 0555 Oslo",
    hours: "Man–fre 07–18 · Lør–søn 09–17",
    placeId: "p1",
  },
  {
    id: "b2",
    name: "Grünerløkka Bokcafé",
    category: "Bokcafé",
    verified: false,
    about: "Uavhengig bokkafé med bruktbøker og lesesirkler.",
    address: "Markveien 35, 0554 Oslo",
    hours: "Hver dag 10–22",
    placeId: "p2",
  },
  {
    id: "b3",
    name: "Mathallen Vinbar",
    category: "Vinbar",
    verified: true,
    about: "Naturvinbar inne i Mathallen Oslo.",
    address: "Vulkan 5, 0178 Oslo",
    hours: "Ons–søn 15–23",
    placeId: "p3",
  },
  {
    id: "b4",
    name: "Sofienberg Sykkelverksted",
    category: "Verksted",
    verified: false,
    about: "Drop-in sykkelverksted drevet av entusiaster.",
    address: "Sofienberggata 7, 0558 Oslo",
    hours: "Man–fre 10–18",
    placeId: "p4",
  },
];

// ── Experiences (MOCK — lifecycle is a demo state, not a real state machine) ──
export const EXPERIENCE_STATUSES = [
  "open",
  "waitlist",
  "full",
  "joined",
  "cancelled",
] as const;
export type ExperienceStatus = (typeof EXPERIENCE_STATUSES)[number];

export type MockExperience = {
  id: string;
  title: string;
  host: string;
  when: string;
  placeId: string;
  groupId: string;
  status: ExperienceStatus;
  capacity: number;
  going: number;
  // MOCK ticket price in NOK; absent = free. Display only — no payment
  // contract exists (BLOCKED_CONTRACT_GAP).
  priceNok?: number;
  day: TimeWindow; // MOCK time window for the "Når" filter
  tags: string[];
  about: string;
  // Bundled sample photos for the swipe-card carousel (MOCK demo art — not real
  // venue media, no canonical asset contract). First is the card's cover.
  photos: ImageSourcePropType[];
  // Per-photo scrim tint (parallel to `photos`): a darkened sample of each
  // photo's lower region, so the swipe card's bottom gradient blends with the
  // image it covers. MOCK/presentational — not a contract field, no canonical
  // colour source (BLOCKED_CONTRACT_GAP).
  scrims: string[];
};

export const experiences: MockExperience[] = [
  {
    id: "e1",
    title: "Morgenkaffe & prat",
    host: "Maria M.",
    when: "Ons 09:00",
    placeId: "p1",
    groupId: "g1",
    status: "open",
    capacity: 8,
    going: 5,
    day: "Denne uka",
    tags: ["Sosialt", "Kaffe"],
    about: "Uformell morgenkaffe for naboer. Bare å møte opp.",
    // Each card carries only its OWN two on-theme photos (MOCK demo art, no
    // canonical media contract); `scrims` is parallel to `photos`.
    photos: [
      require("../../assets/swipe/e1-1.jpg"),
      require("../../assets/swipe/e1-2.jpg"),
    ],
    scrims: ["#28241E", "#221F19"],
  },
  {
    id: "e2",
    title: "Lesesirkel: nordisk krim",
    host: "Åse K.",
    when: "Søn 18:00",
    placeId: "p2",
    groupId: "g2",
    status: "waitlist",
    capacity: 10,
    going: 10,
    day: "Helg",
    tags: ["Bøker", "Diskusjon"],
    about: "Månedlig lesesirkel. Denne gang nordisk krim.",
    photos: [
      require("../../assets/swipe/e2-1.jpg"),
      require("../../assets/swipe/e2-2.jpg"),
    ],
    scrims: ["#422F17", "#3B2F29"],
  },
  {
    id: "e3",
    title: "Naturvin-smaking",
    host: "Tom T.",
    when: "Tor 19:00",
    placeId: "p3",
    groupId: "g3",
    status: "full",
    capacity: 12,
    going: 12,
    day: "Denne uka",
    tags: ["Vin", "Smaking"],
    about: "Guidet smaking av fem naturviner med småretter.",
    photos: [
      require("../../assets/swipe/e3-1.jpg"),
      require("../../assets/swipe/e3-2.jpg"),
    ],
    scrims: ["#38312F", "#222327"],
  },
  {
    id: "e4",
    title: "Kveldsjogg i Frognerparken",
    host: "Jonas B.",
    when: "Tir 18:00",
    placeId: "p1",
    groupId: "g1",
    status: "open",
    capacity: 15,
    going: 7,
    day: "Denne uka",
    tags: ["Trening", "Løping"],
    about: "Rolig fellesjogg på 5 km. Alle tempo velkommen.",
    photos: [
      require("../../assets/swipe/e4-1.jpg"),
      require("../../assets/swipe/e4-2.jpg"),
    ],
    scrims: ["#100A0A", "#302718"],
  },
  {
    id: "e5",
    title: "Brettspillkveld",
    host: "Nina D.",
    when: "I morgen 19:00",
    placeId: "p2",
    groupId: "g2",
    status: "open",
    priceNok: 150,
    capacity: 12,
    going: 6,
    day: "I morgen",
    tags: ["Spill", "Sosialt"],
    about: "Strategispill og kortspill. Nybegynnere lærer bort.",
    photos: [
      require("../../assets/swipe/e5-1.jpg"),
      require("../../assets/swipe/e5-2.jpg"),
    ],
    scrims: ["#2B1B1D", "#1B1A17"],
  },
  {
    id: "e6",
    title: "Fotovandring på Grünerløkka",
    host: "Per O.",
    when: "I dag 11:00",
    placeId: "p3",
    groupId: "g3",
    status: "waitlist",
    capacity: 10,
    going: 10,
    day: "I dag",
    tags: ["Foto", "Kultur"],
    about: "Vi går en runde og fanger gatelivet. Ta med kamera.",
    photos: [
      require("../../assets/swipe/e6-1.jpg"),
      require("../../assets/swipe/e6-2.jpg"),
    ],
    scrims: ["#1D201E", "#0A0A0A"],
  },
];

export function placeById(id: string): MockPlace | undefined {
  return places.find((p) => p.id === id);
}
export function businessForPlace(placeId: string): MockBusiness | undefined {
  return businesses.find((b) => b.placeId === placeId);
}
export function businessById(id: string): MockBusiness | undefined {
  return businesses.find((b) => b.id === id);
}
export function experiencesForPlace(placeId: string): MockExperience[] {
  return experiences.filter((e) => e.placeId === placeId);
}
export function experienceById(id: string): MockExperience | undefined {
  return experiences.find((e) => e.id === id);
}

// ── Attendees / reviews / groups (MOCK — not canonical entities) ─────────────
export type MockAttendee = {
  id: string;
  name: string;
  initials: string;
  isHost: boolean;
};

// Keyed by experience id.
export const attendeesByExperience: Record<string, MockAttendee[]> = {
  e1: [
    { id: "a1", name: "Maria Monsen", initials: "MM", isHost: true },
    { id: "a2", name: "Tom Tangen", initials: "TT", isHost: false },
    { id: "a3", name: "Åse Kvam", initials: "ÅK", isHost: false },
    { id: "a4", name: "Jonas Berg", initials: "JB", isHost: false },
    { id: "a5", name: "Nina Dahl", initials: "ND", isHost: false },
  ],
  e2: [
    { id: "a6", name: "Åse Kvam", initials: "ÅK", isHost: true },
    { id: "a7", name: "Per Olsen", initials: "PO", isHost: false },
  ],
  e3: [{ id: "a8", name: "Tom Tangen", initials: "TT", isHost: true }],
};

export function attendeesForExperience(expId: string): MockAttendee[] {
  return attendeesByExperience[expId] ?? [];
}

export type MockReview = {
  id: string;
  placeId: string;
  author: string;
  rating: number;
  when: string;
  text: string;
};

export const reviews: MockReview[] = [
  {
    id: "r1",
    placeId: "p1",
    author: "Kari N.",
    rating: 5,
    when: "2 uker siden",
    text: "Beste kaffen på Løkka. Rolig om morgenen.",
  },
  {
    id: "r2",
    placeId: "p1",
    author: "Ola H.",
    rating: 4,
    when: "1 måned siden",
    text: "God stemning, men kan bli fullt i helgene.",
  },
  {
    id: "r3",
    placeId: "p2",
    author: "Ingrid S.",
    rating: 5,
    when: "3 dager siden",
    text: "Koselig bokkafé med et godt utvalg.",
  },
];

export function reviewsForPlace(placeId: string): MockReview[] {
  return reviews.filter((r) => r.placeId === placeId);
}

export type MockGroup = {
  id: string;
  name: string;
  about: string;
  memberCount: number;
  members: string[]; // initials
  cover: LibraryKey; // MOCK demo cover photo (bundled LIBRARY key)
};

export const groups: MockGroup[] = [
  {
    id: "g1",
    name: "Morgenkaffe-gjengen",
    about: "Naboer som møtes til kaffe i helgene.",
    memberCount: 34,
    members: ["MM", "TT", "ÅK", "JB", "ND"],
    cover: "venue-cafe",
  },
  {
    id: "g2",
    name: "Løkka Lesesirkel",
    about: "Månedlig lesesirkel på Grünerløkka.",
    memberCount: 18,
    members: ["ÅK", "PO", "IS"],
    cover: "venue-books",
  },
  {
    id: "g3",
    name: "Naturvin-klubben",
    about: "Vi smaker naturvin sammen én gang i måneden.",
    memberCount: 52,
    members: ["TT", "MM", "KN"],
    cover: "group-wine",
  },
];

export function groupById(id: string): MockGroup | undefined {
  return groups.find((g) => g.id === id);
}

// MOCK chat list. BLOCKED_CONTRACT_GAP: not a real realtime/messaging backend.
// `type` uses the documented chat types (reconciled docs §4: byrom, business,
// experience, group-swipe, user-created, DM, marketplace) and `access` the
// documented access modes (Åpen / Lukket / Kun invitasjon, PDF p10). They are
// display labels only — no membership, join lifecycle, admin rule, delivery or
// read receipt is implemented. Archived chats are read-only (PDF p10).
export type MockChatType =
  | "experience"
  | "place"
  | "business"
  | "group_swipe"
  | "user_created"
  | "dm"
  | "marketplace";
export type MockChatAccess = "open" | "closed" | "invite_only";

export const CHAT_TYPE_LABEL: Record<MockChatType, string> = {
  experience: "Opplevelse-chat",
  place: "Steds-chat",
  business: "Bedrifts-chat",
  group_swipe: "Gruppe-sveip",
  user_created: "Gruppechat",
  dm: "Direktemelding",
  marketplace: "Marketplace-chat",
};
export const CHAT_ACCESS_LABEL: Record<MockChatAccess, string> = {
  open: "Åpen",
  closed: "Lukket",
  invite_only: "Kun invitasjon",
};

export type MockChat = {
  id: string;
  name: string;
  last: string;
  time: string;
  unread: number;
  type: MockChatType;
  access: MockChatAccess;
  status: "active" | "archived";
  // An experience chat is pinned to its experience.
  pinnedExperienceId?: string;
  members?: number; // MOCK count, not real social proof
  initials: string;
  archivedNote?: string; // e.g. "avsluttet 12. juli"
};

export const chats: MockChat[] = [
  {
    id: "c1",
    name: "Morgenkaffe & prat",
    last: "Sofie: Vi sees i morgen kl 09 ☕",
    time: "18:42",
    unread: 2,
    type: "experience",
    access: "open",
    status: "active",
    pinnedExperienceId: "e1", // e1 = "Morgenkaffe & prat"
    members: 7,
    initials: "MK",
  },
  {
    id: "c2",
    name: "Maria M.",
    last: "Takk for sist 😊",
    time: "I går",
    unread: 0,
    type: "dm",
    access: "invite_only",
    status: "active",
    initials: "MM",
  },
  {
    id: "c3",
    name: "Morgenløp-gjengen",
    last: "Noen som løper i regnet?",
    time: "Man",
    unread: 0,
    type: "user_created",
    access: "closed",
    status: "active",
    members: 12,
    initials: "MG",
  },
  {
    id: "c4",
    name: "Grünerløkka Bokcafé",
    last: "Ny lesesirkel starter søndag",
    time: "I går",
    unread: 1,
    type: "place",
    access: "open",
    status: "active",
    members: 34,
    initials: "GB",
  },
  {
    id: "c5",
    name: "Oslo Kaffebar",
    last: "Nye bønner fra Colombia i dag",
    time: "Søn",
    unread: 0,
    type: "business",
    access: "open",
    status: "active",
    members: 58,
    initials: "OK",
  },
  {
    id: "c6",
    name: "Naturvin-smaking",
    last: "Takk for en fantastisk kveld!",
    time: "12. juli",
    unread: 0,
    type: "experience",
    access: "open",
    status: "archived",
    pinnedExperienceId: "e3",
    members: 14,
    initials: "NS",
    archivedNote: "avsluttet 12. juli",
  },
];

// MOCK message logs per chat (DEMO ONLY — no realtime, no delivery/read state).
// BLOCKED_CONTRACT_GAP: no certified message DTO. `mine` flags the demo viewer's
// own lines; `author` is a display name only.
export type MockMessage = {
  id: string;
  author: string;
  initials: string;
  text: string;
  time: string;
  mine: boolean;
};

export const messagesByChat: Record<string, MockMessage[]> = {
  c1: [
    {
      id: "m1",
      author: "Sofie",
      initials: "SO",
      text: "Hei! Gleder meg til morgenkaffen i morgen ☕",
      time: "17:30",
      mine: false,
    },
    {
      id: "m2",
      author: "Ola",
      initials: "OL",
      text: "Samme her! Noen som vil ta en tur etterpå?",
      time: "17:34",
      mine: true,
    },
    {
      id: "m3",
      author: "Jonas",
      initials: "JO",
      text: "Jeg stikker innom Tim Wendelboe på veien.",
      time: "17:40",
      mine: false,
    },
    {
      id: "m4",
      author: "Sofie",
      initials: "SO",
      text: "Vi sees i morgen kl 09!",
      time: "18:42",
      mine: false,
    },
  ],
  c2: [
    {
      id: "m1",
      author: "Maria",
      initials: "MM",
      text: "Det var en fin kveld 🙌",
      time: "I går",
      mine: false,
    },
    {
      id: "m2",
      author: "Ola",
      initials: "OL",
      text: "Enig! Vi tar en tur igjen snart.",
      time: "I går",
      mine: true,
    },
    {
      id: "m3",
      author: "Maria",
      initials: "MM",
      text: "Takk for sist 😊",
      time: "I går",
      mine: false,
    },
  ],
  c3: [
    {
      id: "m1",
      author: "Ketil",
      initials: "KE",
      text: "Noen som løper i regnet?",
      time: "Man",
      mine: false,
    },
    {
      id: "m2",
      author: "Ola",
      initials: "OL",
      text: "Jeg er med hvis det letter litt 🌧️",
      time: "Man",
      mine: true,
    },
  ],
  c4: [
    {
      id: "m40",
      author: "Grünerløkka Bokcafé",
      initials: "GB",
      text: "Ny lesesirkel starter søndag kl 18 — nordisk krim denne gangen.",
      time: "I går",
      mine: false,
    },
  ],
  c5: [
    {
      id: "m50",
      author: "Oslo Kaffebar",
      initials: "OK",
      text: "Nye bønner fra Colombia i dag. Kom innom og smak!",
      time: "Søn",
      mine: false,
    },
  ],
  c6: [
    {
      id: "m60",
      author: "Nina",
      initials: "NI",
      text: "Takk for en fantastisk kveld!",
      time: "12. juli",
      mine: false,
    },
  ],
};

export function messagesForChat(chatId: string): MockMessage[] {
  return messagesByChat[chatId] ?? [];
}

export function chatById(id: string): MockChat | undefined {
  return chats.find((c) => c.id === id);
}

// ── Profile (MOCK — visual only, NO account/session/reputation backend) ──────
// BLOCKED_CONTRACT_GAP: there is no identity, trust, follow graph, review or
// creator-progression model in the certified contract. Every field below is
// demo art laid out per the design (PDF p12). Counts are NOT real social proof;
// `creatorPath` is illustrative copy only — no thresholds are evaluated.
// The four roles (TP-D-004): Utforsker / Skaper / Bedrift / Enterprise. Copy and
// the Skaper lock are from the onboarding role step (PDF p2).
export type MockPersonaKey = "explorer" | "creator" | "business" | "enterprise";

export type MockVisited = {
  placeId: string; // references `places`
  when: string; // MOCK human label, not a stored timestamp
};

// One row in the profile's Opplevelser tab (PDF p12): hosted or attended.
export type MockProfileActivity = {
  experienceId: string; // references `experiences`
  role: "Arrangert" | "Deltok";
  meta: string; // MOCK line, e.g. "★ 4.9 · 38 deltakere" — not real counts
};

export type MockProfileReview = {
  placeId: string; // references `places`
  stars: number; // MOCK 1–5
  text: string;
  when: string; // MOCK human label
};

// One row in "Mine planer" (REQUIRED_V1). MOCK — no attendance lifecycle.
export type MockPlanState = "upcoming" | "past" | "cancelled" | "waitlisted";
export type MockPlan = {
  experienceId: string; // references `experiences`
  state: MockPlanState;
  note: string; // MOCK line, e.g. "Du er påmeldt"
};

export const PERSONAS: {
  key: MockPersonaKey;
  label: string;
  hint: string;
  icon: string;
  locked?: boolean;
}[] = [
  {
    key: "explorer",
    label: "Utforsker",
    hint: "Oppdag steder, opplevelser og folk",
    icon: "compass-outline",
  },
  {
    key: "creator",
    label: "Skaper",
    hint: "Arranger opplevelser — låses opp etter hvert",
    icon: "color-palette-outline",
    locked: true,
  },
  {
    key: "business",
    label: "Bedrift",
    hint: "Vis frem stedet ditt og nå nye kunder",
    icon: "storefront-outline",
  },
  {
    key: "enterprise",
    label: "Enterprise",
    hint: "Flere lokasjoner og skreddersydd oppsett",
    icon: "business-outline",
  },
];

export const profile = {
  name: "Ola Nordmann",
  age: 29, // MOCK
  handle: "@ola",
  bio: "Kaffeelsker · alltid klar for en fotowalk",
  avatar: "person-ola" as const, // key into fixtures/images LIBRARY
  memberSince: "Medlem siden 2024", // MOCK label
  // MOCK counts — not a real follow graph (PDF p12: Følgere / Følger / Venner)
  stats: { followers: 48, following: 61, friends: 12 },
  interests: ["Kaffe", "Jazz", "Fotografi", "Brettspill"], // MOCK tags
  // "Veien til Skaper" card (PDF p12/p14). Illustrative copy only — the real
  // creator criteria are not defined (master spec §10: do not fabricate tiers).
  creatorPath: { hosted: 2, required: 3, rating: "4.8" },
  activity: [
    { experienceId: "e6", role: "Arrangert", meta: "★ 4.9 · 38 deltakere" },
    { experienceId: "e3", role: "Deltok", meta: "lørdag" },
    { experienceId: "e1", role: "Arrangert", meta: "★ 4.7 · 12 deltakere" },
  ] as MockProfileActivity[],
  // Places the user has "been" — MOCK history, references real place fixtures.
  visited: [
    { placeId: "p1", when: "Sist uke" },
    { placeId: "p2", when: "For 2 uker siden" },
    { placeId: "p3", when: "Forrige måned" },
    { placeId: "p4", when: "I fjor" },
  ] as MockVisited[],
  plans: [
    { experienceId: "e1", state: "upcoming", note: "Du er påmeldt" },
    { experienceId: "e5", state: "upcoming", note: "Du er påmeldt" },
    { experienceId: "e2", state: "waitlisted", note: "Nr. 4 på ventelisten" },
    { experienceId: "e3", state: "past", note: "Du deltok" },
    { experienceId: "e4", state: "cancelled", note: "Avlyst av verten" },
  ] as MockPlan[],
  reviews: [
    {
      placeId: "p1",
      stars: 5,
      text: "Beste flat white i byen.",
      when: "I går",
    },
    {
      placeId: "p3",
      stars: 4,
      text: "Rolig og fint, litt trangt på kvelden.",
      when: "Forrige uke",
    },
  ] as MockProfileReview[],
};

// ── People (MOCK — demo neighbours, NO social graph / follow backend) ────────
// BLOCKED_CONTRACT_GAP: there is no person entity, follow edge, mutual-friends
// count, or discovery ranking in the certified contract. `avatar` keys into the
// bundled image LIBRARY (fixtures/images) — stand-in portraits, not real people.
// `mutuals`/`interests`/`area` are demo art; following is local demo state only.
export type MockPerson = {
  id: string;
  name: string;
  handle: string;
  avatar: LibraryKey;
  area: string; // MOCK Oslo neighbourhood label
  bio: string;
  mutuals: number; // MOCK shared-friends count (not a real graph)
  interests: string[]; // MOCK tags, not a canonical taxonomy
  hostsExperienceId?: string; // optional link to an experience they "host"
};

export const people: MockPerson[] = [
  {
    id: "u1",
    name: "Maria Movik",
    handle: "@maria",
    avatar: "person-maria",
    area: "Grünerløkka",
    bio: "Kaffeentusiast og vert for morgenkaffen. Elsker å møte nye naboer.",
    mutuals: 4,
    interests: ["Kaffe", "Morgenmøter", "Fotografi"],
    hostsExperienceId: "e1",
  },
  {
    id: "u2",
    name: "Jonas Berg",
    handle: "@jonasb",
    avatar: "person-jonas",
    area: "Tøyen",
    bio: "Løper, syklist og kaffedrikker. Ofte på Tim Wendelboe.",
    mutuals: 2,
    interests: ["Løping", "Sykkel", "Kaffe"],
  },
  {
    id: "u3",
    name: "Åse Kvam",
    handle: "@asek",
    avatar: "person-ase",
    area: "Sofienberg",
    bio: "Bokorm. Leder lesesirkelen for nordisk krim.",
    mutuals: 1,
    interests: ["Bøker", "Diskusjon", "Vin"],
    hostsExperienceId: "e2",
  },
  {
    id: "u4",
    name: "Sofie Lind",
    handle: "@sofie",
    avatar: "person-sofie",
    area: "Grünerløkka",
    bio: "Musikkelsker og konsertgjenger. Alltid klar for en jazzkveld.",
    mutuals: 3,
    interests: ["Konserter", "Jazz", "Vin"],
  },
  {
    id: "u5",
    name: "Erik Haug",
    handle: "@erikh",
    avatar: "person-erik",
    area: "Grønland",
    bio: "Hobbykokk og krydderjeger. Driver et lite sykkelverksted på si.",
    mutuals: 0,
    interests: ["Matlaging", "Sykkel", "Verksted"],
  },
  {
    id: "u6",
    name: "Nina Dahl",
    handle: "@ninad",
    avatar: "person-nina",
    area: "Torshov",
    bio: "Naturvin, lange turer og helgeklatring.",
    mutuals: 2,
    interests: ["Vin", "Natur", "Klatring"],
  },
];

export function personById(id: string): MockPerson | undefined {
  return people.find((p) => p.id === id);
}

// ── Marketplace (MOCK — B2B collaboration listings, NO commerce backend) ──
// Per the design (PDF p15–p16) and master spec §13, Marketplace is a B2B
// collaboration space for creators, businesses and enterprises — venues,
// creators, sponsorships, co-hosting and brand deals — not a consumer goods
// market. BLOCKED_CONTRACT_GAP: there is no listing, offer, contract, pricing
// or payment model in the certified contract. `terms` is a display string only;
// nothing can be requested, signed or paid.
export type MockListingType =
  | "Venue"
  | "Skaper"
  | "Sponsing"
  | "Co-hosting"
  | "Brand";

export const LISTING_TYPES: MockListingType[] = [
  "Venue",
  "Skaper",
  "Sponsing",
  "Co-hosting",
  "Brand",
];

export type MockListing = {
  id: string;
  title: string;
  type: MockListingType;
  terms: string; // MOCK display label, e.g. "Gratis mot eksponering"
  cover: LibraryKey;
  owner: string;
  ownerMeta: string; // MOCK, e.g. "Verifisert bedrift"
  tags: string[];
  details: { label: string; value: string }[]; // MOCK display rows
  description: string;
};

export const listings: MockListing[] = [
  {
    id: "m1",
    title: "Intimt jazzcafé-lokale",
    type: "Venue",
    terms: "Gratis mot eksponering",
    cover: "venue-music",
    owner: "Oslo Kaffebar",
    ownerMeta: "Verifisert bedrift",
    tags: ["Intimt", "Jazz", "Livemusikk"],
    details: [
      { label: "Tilgjengelig", value: "Kvelder og helger" },
      { label: "Kapasitet", value: "25 personer" },
      { label: "Utstyr", value: "PA-anlegg, lys, kjøkken" },
    ],
    description:
      "Koselig lokale i hjertet av Grünerløkka. Perfekt for intime konserter, smakinger eller workshops.",
  },
  {
    id: "m2",
    title: "Erfaren jazzvert",
    type: "Skaper",
    terms: "Fra 2 000 kr",
    cover: "person-maria",
    owner: "Maria Movik",
    ownerMeta: "Skaper",
    tags: ["Co-hosting", "Jazz"],
    details: [
      { label: "Tilgjengelig", value: "Torsdag–lørdag" },
      { label: "Erfaring", value: "Arrangert 23 opplevelser" },
    ],
    description:
      "Leter etter et koselig lokale for jazzkvelder. Tar med eget publikum og musikere.",
  },
  {
    id: "m3",
    title: "Sponsoravtale: Live-jazz",
    type: "Sponsing",
    terms: "5 000 kr",
    cover: "venue-bar",
    owner: "Kulturetaten",
    ownerMeta: "Enterprise",
    tags: ["Festival", "Jazz"],
    details: [
      { label: "Periode", value: "August" },
      { label: "Krav", value: "Logo på arrangement" },
    ],
    description:
      "Støtte til gratis jazzarrangementer i bydelen gjennom sommeren.",
  },
  {
    id: "m4",
    title: "Co-hosting: Kaffekurs",
    type: "Co-hosting",
    terms: "70 % / 30 %",
    cover: "venue-cafe",
    owner: "Grünerløkka Bokcafé",
    ownerMeta: "Verifisert bedrift",
    tags: ["Kurs", "Kaffe"],
    details: [
      { label: "Rolle", value: "Primær / sekundær vert" },
      { label: "Kapasitet", value: "12 plasser" },
    ],
    description:
      "Vi har lokalet og bønnene — vi søker en vert som vil lære bort latte art.",
  },
  {
    id: "m5",
    title: "Brand-samarbeid: Keramikk",
    type: "Brand",
    terms: "Etter avtale",
    cover: "venue-workshop",
    owner: "Vulkan Keramikkstudio",
    ownerMeta: "Verifisert bedrift",
    tags: ["Keramikk", "Kreativt"],
    details: [{ label: "Format", value: "Workshop + innhold" }],
    description:
      "Ønsker å samarbeide med skapere om kveldsworkshops og innhold.",
  },
];

export function listingById(id: string): MockListing | undefined {
  return listings.find((l) => l.id === id);
}

// ── Notifications (MOCK — static demo activity, no real push/inbox) ──────────
// BLOCKED_CONTRACT_GAP: not a real notification feed. `minutesAgo` is a MOCK
// relative offset (demo), not a stored timestamp. Rendered Instagram-style.
export type NotificationType =
  | "join"
  | "message"
  | "review"
  | "follow"
  | "invite";

export type MockNotification = {
  id: string;
  type: NotificationType;
  actorName: string; // bolded actor (person or group)
  actorInitials: string; // avatar initials (no photos exist in fixtures)
  text: string; // Norwegian action text following the actor name
  minutesAgo: number; // MOCK relative time, not a real timestamp
  read: boolean;
  thumbnailTint?: string; // MOCK media placeholder tint (hex); no real images
};

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "n1",
    type: "follow",
    actorName: "Jonas Berg",
    actorInitials: "JB",
    text: "begynte å følge deg.",
    minutesAgo: 25,
    read: false,
  },
  {
    id: "n2",
    type: "join",
    actorName: "Maria Monsen",
    actorInitials: "MM",
    text: "ble med på «Morgenkaffe & prat».",
    minutesAgo: 120,
    read: false,
    thumbnailTint: "#3B5B4A",
  },
  {
    id: "n3",
    type: "message",
    actorName: "Løkka Lesesirkel",
    actorInitials: "LL",
    text: "Ny melding i gruppa.",
    minutesAgo: 480,
    read: true,
  },
  {
    id: "n4",
    type: "invite",
    actorName: "Åse Kvam",
    actorInitials: "ÅK",
    text: "inviterte deg til «Lesesirkel: nordisk krim».",
    minutesAgo: 2880,
    read: false,
    thumbnailTint: "#4A5A7A",
  },
  {
    id: "n5",
    type: "review",
    actorName: "Oslo Kaffebar",
    actorInitials: "OK",
    text: "fikk en ny anmeldelse.",
    minutesAgo: 4320,
    read: true,
    thumbnailTint: "#7A5A3B",
  },
  {
    id: "n6",
    type: "follow",
    actorName: "Nina Dahl",
    actorInitials: "ND",
    text: "begynte å følge deg.",
    minutesAgo: 6000,
    read: true,
  },
  {
    id: "n7",
    type: "join",
    actorName: "Tom Tangen",
    actorInitials: "TT",
    text: "ble med på «Naturvin-smaking».",
    minutesAgo: 14400,
    read: true,
    thumbnailTint: "#5A4A7A",
  },
];

// Relative-time label (MOCK). "5 min" / "3 t" / "2 d" / "3 u".
export function notificationTimeLabel(minutesAgo: number): string {
  if (minutesAgo < 60) return `${Math.max(1, Math.round(minutesAgo))} min`;
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) return `${hours} t`;
  const days = Math.round(minutesAgo / 1440);
  if (days < 7) return `${days} d`;
  return `${Math.round(minutesAgo / 10080)} u`;
}

export const NOTIFICATION_GROUPS = ["I dag", "Denne uka", "Tidligere"] as const;
export type NotificationGroup = (typeof NOTIFICATION_GROUPS)[number];

// Buckets a notification by age for Instagram-style section headers.
export function notificationGroup(minutesAgo: number): NotificationGroup {
  if (minutesAgo < 1440) return "I dag";
  if (minutesAgo < 10080) return "Denne uka";
  return "Tidligere";
}

// Pure filter for the notifications list (MOCK — all state is in-memory demo).
// Removes rows the user dismissed / marked "ikke interessert", hides muted
// types, and optionally keeps only unread (respecting the local read set).
export type NotificationFilterState = {
  dismissedIds?: ReadonlySet<string>;
  notInterestedIds?: ReadonlySet<string>;
  mutedTypes?: ReadonlySet<NotificationType>;
  readIds?: ReadonlySet<string>;
  onlyUnread?: boolean;
};

export function visibleNotifications(
  all: readonly MockNotification[],
  state: NotificationFilterState = {},
): MockNotification[] {
  const {
    dismissedIds,
    notInterestedIds,
    mutedTypes,
    readIds,
    onlyUnread = false,
  } = state;
  return all.filter((n) => {
    if (dismissedIds?.has(n.id)) return false;
    if (notInterestedIds?.has(n.id)) return false;
    if (mutedTypes?.has(n.type)) return false;
    if (onlyUnread) {
      const isRead = readIds ? readIds.has(n.id) : n.read;
      if (isRead) return false;
    }
    return true;
  });
}
