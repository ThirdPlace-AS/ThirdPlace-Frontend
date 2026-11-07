// STATIC MOCK FIXTURES — Phase 1 visual shell only.
//
// BLOCKED_CONTRACT_GAP: none of this is real data, a canonical entity, or an API
// shape. It exists solely to render the visual shell. No field here implies an
// approved schema/DTO. Real data arrives only with the authoritative V2.2 contract.
// `coord` values are MOCK demo points near Oslo for map markers — NOT authoritative
// places or real geodata.

import type { ImageSourcePropType } from "react-native";

import { libImage, swipeImage, type LibraryKey } from "./images";

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
  { label: "Festivaler", icon: "musical-notes-outline" },
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
  { label: "Førstegangsbesøkende", icon: "hand-left-outline" },
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
  Kreativ: "color-palette-outline",
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
  "Sensoriske stimuli": "ear-outline",
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
  // No stored rating or review count: both come from the place's reviews
  // (placeRating), so every surface shows the same numbers.
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
    name: "Kork & Kanne Vinbar",
    category: "Vinbar",
    distance: "800 m",
    distanceM: 800,
    coord: [10.751, 59.9269],
    priceLevel: 3,
    priceNok: 250,
    vibes: ["Sosial", "Energisk", "Romantisk", "Livlig", "Luksuriøs"],
    blurb: "Naturvin og småretter.",
    openNow: false,
    tags: ["Naturvin", "Småretter", "Sosialt", "Uteservering", "Live musikk"],
    about: "Liten vinbar på Vulkan med skiftende glass og delbare retter.",
    address: "Vulkan 12, 0178 Oslo",
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
    distance: "1,1 km",
    distanceM: 1100,
    coord: [10.767, 59.919],
    priceLevel: 2,
    priceNok: 150,
    vibes: ["Rolig", "Kreativ"],
    blurb: "Fiks sykkelen mens du venter.",
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
    distance: "1,4 km",
    distanceM: 1400,
    coord: [10.7698, 59.9191],
    priceLevel: 1,
    priceNok: 95,
    vibes: ["Rolig", "Koselig"],
    blurb: "Guidet tur blant sjeldne planter.",
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
    distance: "2,3 km",
    distanceM: 2300,
    coord: [10.7389, 59.9044],
    priceLevel: 3,
    priceNok: 1650,
    vibes: ["Energisk", "Sosial"],
    blurb: "Halvdags seiltur på fjorden.",
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
    distance: "1,8 km",
    distanceM: 1800,
    coord: [10.7566, 59.9058],
    priceLevel: 2,
    priceNok: 320,
    vibes: ["Intim", "Koselig"],
    blurb: "Kveldsomvisning uten kø.",
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
    distance: "2,0 km",
    distanceM: 2000,
    coord: [10.7553, 59.9076],
    priceLevel: 1,
    priceNok: 120,
    vibes: ["Energisk", "Sosial"],
    blurb: "Gå i de nye høyhusene.",
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
    distance: "1,6 km",
    distanceM: 1600,
    coord: [10.7623, 59.9124],
    priceLevel: 2,
    priceNok: 260,
    vibes: ["Sosial", "Koselig"],
    blurb: "Lag din egen krydderblanding.",
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
    distance: "2,6 km",
    distanceM: 2600,
    coord: [10.7045, 59.9205],
    priceLevel: 3,
    priceNok: 540,
    vibes: ["Rolig", "Intim"],
    blurb: "Ansiktsbehandling og ro.",
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
    name: "Kork & Kanne Vinbar",
    category: "Vinbar",
    verified: true,
    about: "Naturvinbar på Vulkan.",
    address: "Vulkan 12, 0178 Oslo",
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

// ── What a creator enters for an experience (Legg til, PDF p11–p12) ─────────
// MOCK option lists, shared by the Add wizard and the experience fixtures so
// every page section has a source. Not a contract taxonomy.
export const EXPERIENCE_CATEGORIES = [
  "Kurs & smaking",
  "Musikk",
  "Tur & friluft",
  "Kunst & kultur",
  "Sport & trening",
  "Sosialt",
] as const;
export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number];
export const DURATION_OPTIONS = [
  "1 time",
  "2 timer",
  "3 timer",
  "Hele dagen",
] as const;
export type DurationOption = (typeof DURATION_OPTIONS)[number];
export const REPEAT_OPTIONS = ["Gjentas ikke", "Ukentlig", "Månedlig"] as const;
export type RepeatOption = (typeof REPEAT_OPTIONS)[number];
export const EXPERIENCE_ACCESS = [
  "Alle",
  "Godkjennes av deg",
  "Kun invitasjon",
] as const;
export type ExperienceAccess = (typeof EXPERIENCE_ACCESS)[number];
export const CANCELLATION_OPTIONS = [
  "Gratis frem til 24 t før",
  "Gratis frem til 48 t før",
  "Ingen refusjon",
] as const;
export type CancellationOption = (typeof CANCELLATION_OPTIONS)[number];
export const EXPERIENCE_VIBES = [
  "Rolig",
  "Lærerikt",
  "Sosialt",
  "Hands-on",
  "Koselig",
  "Kreativt",
] as const;
export type ExperienceVibe = (typeof EXPERIENCE_VIBES)[number];
export const ENERGY_LEVELS = ["Lavt", "Middels", "Høyt"] as const;
export type EnergyLevel = (typeof ENERGY_LEVELS)[number];
export const EXPERIENCE_LANGUAGES = ["Norsk", "Engelsk"] as const;

/** Where the group meets (MOCK). The map pin of an experience sits here. */
export type MockMeetingPoint = {
  name: string;
  address: string;
  coord: [number, number]; // [lng, lat]
};

/** One step of "Hva dere skal gjøre" (MOCK creator content). */
export type MockItineraryStep = {
  title: string;
  text: string;
  photo: ImageSourcePropType;
};

export type MockExperience = {
  id: string;
  title: string;
  host: string;
  when: string;
  // Venue the experience is held at; absent for outdoor meetups (the
  // meeting point says where).
  placeId?: string;
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
  // What the creator entered in Legg til (MOCK; PDF p11–p12).
  category: ExperienceCategory;
  duration: DurationOption;
  durationMin: number;
  languages: string[]; // EXPERIENCE_LANGUAGES labels
  included: string[];
  vibes: ExperienceVibe[];
  energy: EnergyLevel;
  access: ExperienceAccess;
  cancellation: CancellationOption;
  repeat: RepeatOption;
  types: string[]; // "Opplevelsestype" filter labels (EXPERIENCE_TYPE_LABELS)
  audiences: string[]; // "Passer for" filter labels (AUDIENCE_LABELS)
  meetingPoint: MockMeetingPoint;
  itinerary: MockItineraryStep[];
  // Published in Legg til (src/fixtures/created.ts): the first date the
  // creator picked, so its sessions start there and not on the next weekday.
  firstDate?: string; // ISO yyyy-mm-dd
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
    about: "Uformell morgenkaffe for alle. Bare å møte opp.",
    // Each card carries only its OWN two on-theme photos (MOCK demo art, no
    // canonical media contract); `scrims` is parallel to `photos`.
    photos: [swipeImage("e1-1"), swipeImage("e1-2")],
    scrims: ["#28241E", "#221F19"],
    category: "Sosialt",
    duration: "1 time",
    durationMin: 60,
    languages: ["Norsk", "Engelsk"],
    included: ["En kopp kaffe eller te", "Litt hjemmebakst"],
    vibes: ["Rolig", "Sosialt", "Koselig"],
    energy: "Lavt",
    access: "Alle",
    cancellation: "Gratis frem til 24 t før",
    repeat: "Ukentlig",
    types: ["Måltider"],
    audiences: ["Alenereisende", "Førstegangsbesøkende", "Lokalkjente"],
    meetingPoint: {
      name: "Oslo Kaffebar, langbordet innerst",
      address: "Thorvald Meyers gate 12, 0555 Oslo",
      coord: [10.7584, 59.9231],
    },
    itinerary: [
      {
        title: "Hils på de andre",
        text: "Vi samles ved langbordet innerst og tar en kort presentasjonsrunde.",
        photo: libImage("venue-cafe"),
      },
      {
        title: "Kaffe og bakst",
        text: "Bestill det du vil ha. En kopp og litt hjemmebakst er med.",
        photo: swipeImage("e1-1"),
      },
      {
        title: "Prat rundt bordet",
        text: "Vi deler oss i små grupper, så alle kommer til orde.",
        photo: swipeImage("e1-2"),
      },
      {
        title: "En tur rundt plassen",
        text: "De som vil, går en kort runde rundt Olaf Ryes plass etterpå.",
        photo: libImage("group-coffee"),
      },
    ],
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
    photos: [swipeImage("e2-1"), swipeImage("e2-2")],
    scrims: ["#422F17", "#3B2F29"],
    category: "Kunst & kultur",
    duration: "2 timer",
    durationMin: 120,
    languages: ["Norsk"],
    included: ["Te og kaffe", "Leselisten for høsten"],
    vibes: ["Rolig", "Lærerikt", "Koselig"],
    energy: "Lavt",
    access: "Godkjennes av deg",
    cancellation: "Gratis frem til 48 t før",
    repeat: "Månedlig",
    types: ["Kulturelle aktiviteter"],
    audiences: ["Lokalkjente", "Alenereisende"],
    meetingPoint: {
      name: "Grünerløkka Bokcafé, lesesalen",
      address: "Markveien 35, 0554 Oslo",
      coord: [10.7609, 59.9254],
    },
    itinerary: [
      {
        title: "Te og velkommen",
        text: "Vi finner plass i lesesalen og hører hvordan alle likte boka.",
        photo: libImage("venue-books"),
      },
      {
        title: "Samtale om månedens bok",
        text: "Åse leder samtalen med noen spørsmål vi tar en runde på.",
        photo: swipeImage("e2-1"),
      },
      {
        title: "Neste bok velges",
        text: "Alle kan foreslå en bok. Vi stemmer før vi går.",
        photo: swipeImage("e2-2"),
      },
      {
        title: "Fri prat",
        text: "De som vil, blir sittende og prater litt til.",
        photo: libImage("venue-books-2"),
      },
    ],
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
    photos: [swipeImage("e3-1"), swipeImage("e3-2")],
    scrims: ["#38312F", "#222327"],
    category: "Kurs & smaking",
    duration: "2 timer",
    durationMin: 120,
    languages: ["Norsk", "Engelsk"],
    included: ["Fem naturviner", "Småretter", "Vann"],
    vibes: ["Lærerikt", "Sosialt"],
    energy: "Lavt",
    access: "Alle",
    cancellation: "Gratis frem til 24 t før",
    repeat: "Månedlig",
    types: ["Prøvesmakinger"],
    audiences: ["Par", "Store grupper"],
    meetingPoint: {
      name: "Kork & Kanne Vinbar, baren",
      address: "Vulkan 12, 0178 Oslo",
      coord: [10.7515, 59.9273],
    },
    itinerary: [
      {
        title: "Velkommen ved baren",
        text: "Tom forteller kort om naturvin og hvordan kvelden er lagt opp.",
        photo: libImage("venue-bar"),
      },
      {
        title: "Fem viner, fem historier",
        text: "Vi smaker én vin om gangen og hører hvor den kommer fra.",
        photo: swipeImage("e3-1"),
      },
      {
        title: "Småretter som passer",
        text: "Til hver vin kommer en liten rett som får fram smaken.",
        photo: swipeImage("e3-2"),
      },
      {
        title: "Kveldens favoritt",
        text: "Vi stemmer over favoritten og deler tips om hvor den kan kjøpes.",
        photo: libImage("group-wine"),
      },
    ],
  },
  {
    id: "e4",
    title: "Kveldsjogg i Frognerparken",
    host: "Jonas B.",
    when: "Tir 18:00",
    groupId: "g1",
    status: "open",
    capacity: 15,
    going: 7,
    day: "Denne uka",
    tags: ["Trening", "Løping"],
    about: "Rolig fellesjogg på 5 km. Alle tempo velkommen.",
    photos: [swipeImage("e4-1"), swipeImage("e4-2")],
    scrims: ["#100A0A", "#302718"],
    category: "Sport & trening",
    duration: "1 time",
    durationMin: 60,
    languages: ["Norsk", "Engelsk"],
    included: ["Oppvarming og uttøyning", "Refleksvest å låne"],
    vibes: ["Sosialt"],
    energy: "Middels",
    access: "Alle",
    cancellation: "Gratis frem til 24 t før",
    repeat: "Ukentlig",
    types: ["Trening", "Friluftsliv"],
    audiences: ["Alenereisende", "Store grupper"],
    meetingPoint: {
      name: "Monolitten, Frognerparken",
      address: "Kirkeveien 21, 0268 Oslo",
      coord: [10.7006, 59.927],
    },
    itinerary: [
      {
        title: "Oppvarming ved Monolitten",
        text: "Ti minutter rolig oppvarming før vi løper.",
        photo: libImage("group-run"),
      },
      {
        title: "5 km i rolig tempo",
        text: "Vi løper samlet, og den raskeste venter på resten ved svingene.",
        photo: swipeImage("e4-1"),
      },
      {
        title: "Rundt dammene",
        text: "Andre halvdel går langs dammene og tilbake til Monolitten.",
        photo: swipeImage("e4-2"),
      },
      {
        title: "Uttøyning og prat",
        text: "Vi tøyer ut sammen og avtaler neste tur.",
        photo: libImage("river-2"),
      },
    ],
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
    photos: [swipeImage("e5-1"), swipeImage("e5-2")],
    scrims: ["#2B1B1D", "#1B1A17"],
    category: "Sosialt",
    duration: "3 timer",
    durationMin: 180,
    languages: ["Norsk", "Engelsk"],
    included: ["Spill og regler", "Snacks"],
    vibes: ["Sosialt", "Hands-on"],
    energy: "Lavt",
    access: "Alle",
    cancellation: "Gratis frem til 24 t før",
    repeat: "Ukentlig",
    types: ["Kulturelle aktiviteter"],
    audiences: ["Store grupper", "Førstegangsbesøkende"],
    meetingPoint: {
      name: "Grünerløkka Bokcafé, spillbordene",
      address: "Markveien 35, 0554 Oslo",
      coord: [10.76, 59.9246],
    },
    itinerary: [
      {
        title: "Velg et spill",
        text: "Hylla har både korte kortspill og lengre strategispill.",
        photo: swipeImage("e5-1"),
      },
      {
        title: "Vi lærer bort reglene",
        text: "Nina eller en av de faste forklarer reglene før vi starter.",
        photo: swipeImage("e5-2"),
      },
      {
        title: "Turnering for de som vil",
        text: "Siste time spiller de som vil en liten turnering.",
        photo: libImage("venue-books"),
      },
    ],
  },
  {
    id: "e6",
    title: "Fotovandring på Grünerløkka",
    host: "Per O.",
    when: "I dag 11:00",
    groupId: "g3",
    status: "waitlist",
    capacity: 10,
    going: 10,
    day: "I dag",
    tags: ["Foto", "Kultur"],
    about: "Vi går en runde og fanger gatelivet. Ta med kamera.",
    photos: [swipeImage("e6-1"), swipeImage("e6-2")],
    scrims: ["#1D201E", "#0A0A0A"],
    category: "Kunst & kultur",
    duration: "2 timer",
    durationMin: 120,
    languages: ["Norsk", "Engelsk"],
    included: ["Tips om komposisjon", "Bildegjennomgang til slutt"],
    vibes: ["Kreativt", "Lærerikt"],
    energy: "Middels",
    access: "Alle",
    cancellation: "Gratis frem til 24 t før",
    repeat: "Ukentlig",
    types: ["Fotografering", "Arkitektur"],
    audiences: ["Alenereisende", "Par"],
    meetingPoint: {
      name: "Fontenen på Olaf Ryes plass",
      address: "Olaf Ryes plass, 0552 Oslo",
      coord: [10.7589, 59.9237],
    },
    itinerary: [
      {
        title: "Oppmøte ved fontenen",
        text: "Per viser noen enkle grep for bedre bilder med det du har.",
        photo: swipeImage("e6-1"),
      },
      {
        title: "Gatelivet på Løkka",
        text: "Vi går gjennom bakgårder og gater og stopper der lyset er fint.",
        photo: swipeImage("e6-2"),
      },
      {
        title: "Langs Akerselva",
        text: "Elva gir speilinger og bruer å jobbe med.",
        photo: libImage("river-1"),
      },
      {
        title: "Vi ser på bildene",
        text: "Til slutt viser alle et par bilder og får tips.",
        photo: libImage("arch-1"),
      },
    ],
  },
];

export function placeById(id: string | undefined): MockPlace | undefined {
  return id ? places.find((p) => p.id === id) : undefined;
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
  /** Chose "Vis meg som deltaker": the face shows on cards (Phase 16). */
  shown: boolean;
};

// Who chose "Vis meg som deltaker" (MOCK). Founder 2026-11-07, after the
// section benchmark: like Airbnb, only people who opt in get a face on
// "who's going"; everyone going is counted either way.
const SHOWN_ATTENDEES = new Set([
  "Maria Movik",
  "Tom Tangen",
  "Jonas Berg",
  "Per Olsen",
  "Sofie Lind",
  "Kari Nilsen",
  "Ingrid Solberg",
  "Ali Khan",
]);

// Keyed by experience id.
export const attendeesByExperience: Record<
  string,
  Omit<MockAttendee, "shown">[]
> = {
  e1: [
    { id: "a1", name: "Maria Movik", initials: "MM", isHost: true },
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
  e4: [{ id: "a9", name: "Jonas Berg", initials: "JB", isHost: true }],
  e5: [{ id: "a10", name: "Nina Dahl", initials: "ND", isHost: true }],
  e6: [{ id: "a11", name: "Per Olsen", initials: "PO", isHost: true }],
};

// Neighbours that fill each attendee list up to the experience's `going`,
// so "Se deltakere" shows exactly as many people as the page says are going.
const ATTENDEE_POOL: [name: string, initials: string][] = [
  ["Sofie Lind", "SL"],
  ["Erik Haug", "EH"],
  ["Kari Nilsen", "KN"],
  ["Ola Hansen", "OH"],
  ["Ingrid Solberg", "IS"],
  ["Lars Eide", "LE"],
  ["Hanne Moe", "HM"],
  ["Ali Khan", "AK"],
  ["Emma Lie", "EL"],
  ["Jonas Berg", "JB"],
  ["Nina Dahl", "ND"],
  ["Tom Tangen", "TT"],
  ["Åse Kvam", "ÅK"],
  ["Maria Movik", "MM"],
  ["Per Olsen", "PO"],
  ["Mona Berg", "MB"],
];

export function attendeesForExperience(expId: string): MockAttendee[] {
  const list = [...(attendeesByExperience[expId] ?? [])];
  const going = experienceById(expId)?.going ?? list.length;
  for (const [name, initials] of ATTENDEE_POOL) {
    if (list.length >= going) break;
    if (list.some((a) => a.name === name)) continue;
    list.push({ id: `${expId}-${initials}`, name, initials, isHost: false });
  }
  return list.map((a) => ({ ...a, shown: SHOWN_ATTENDEES.has(a.name) }));
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
  {
    id: "r4",
    placeId: "p2",
    author: "Erik H.",
    rating: 5,
    when: "1 uke siden",
    text: "Rolig sted å lese. Kaffen er god og ingen maser.",
  },
  {
    id: "r5",
    placeId: "p3",
    author: "Sofie L.",
    rating: 4,
    when: "2 uker siden",
    text: "Godt utvalg av naturvin. Kan bli trangt fredag kveld.",
  },
  {
    id: "r6",
    placeId: "p3",
    author: "Jonas B.",
    rating: 5,
    when: "1 måned siden",
    text: "Kunnskapsrike folk bak baren.",
  },
  {
    id: "r7",
    placeId: "p4",
    author: "Erik H.",
    rating: 5,
    when: "1 uke siden",
    text: "Fikk fikset girene på en halvtime og lærte litt selv.",
  },
  {
    id: "r8",
    placeId: "p4",
    author: "Kari N.",
    rating: 5,
    when: "3 uker siden",
    text: "Vennlige folk. Ta med sykkelen og spør om hjelp.",
  },
  {
    id: "r9",
    placeId: "p5",
    author: "Ingrid S.",
    rating: 5,
    when: "2 uker siden",
    text: "Fin tur langs elva med mye å se.",
  },
  {
    id: "r10",
    placeId: "p5",
    author: "Per O.",
    rating: 4,
    when: "1 måned siden",
    text: "Fint, men glatt på steinene etter regn.",
  },
  {
    id: "r11",
    placeId: "p6",
    author: "Nina D.",
    rating: 5,
    when: "5 dager siden",
    text: "Rolig verksted og god hjelp ved dreieskiva.",
  },
  {
    id: "r12",
    placeId: "p6",
    author: "Maria M.",
    rating: 4,
    when: "1 måned siden",
    text: "Morsomt, men glaseringen tar tid før koppen er ferdig.",
  },
  {
    id: "r13",
    placeId: "p7",
    author: "Ola H.",
    rating: 5,
    when: "1 uke siden",
    text: "Tre stopp og mye god mat. Kom sulten.",
  },
  {
    id: "r14",
    placeId: "p7",
    author: "Ingrid S.",
    rating: 4,
    when: "2 måneder siden",
    text: "Litt venting mellom stoppene.",
  },
  {
    id: "r15",
    placeId: "p8",
    author: "Kari N.",
    rating: 5,
    when: "3 dager siden",
    text: "Guiden kunne mye om plantene i Palmehuset.",
  },
  {
    id: "r16",
    placeId: "p8",
    author: "Erik H.",
    rating: 4,
    when: "1 måned siden",
    text: "Fint, men ta med varme klær ute.",
  },
  {
    id: "r17",
    placeId: "p9",
    author: "Sofie L.",
    rating: 5,
    when: "1 uke siden",
    text: "Rolige timer og god plass på matta.",
  },
  {
    id: "r18",
    placeId: "p9",
    author: "Nina D.",
    rating: 5,
    when: "3 uker siden",
    text: "Fin start på dagen.",
  },
  {
    id: "r19",
    placeId: "p10",
    author: "Jonas B.",
    rating: 5,
    when: "2 uker siden",
    text: "Fin tur på fjorden. Mannskapet forklarte alt.",
  },
  {
    id: "r20",
    placeId: "p10",
    author: "Maria M.",
    rating: 4,
    when: "1 måned siden",
    text: "Kaldt på vannet, så ta med lue.",
  },
  {
    id: "r21",
    placeId: "p11",
    author: "Per O.",
    rating: 5,
    when: "4 dager siden",
    text: "Guiden fikk bildene til å leve. Verdt kvelden.",
  },
  {
    id: "r22",
    placeId: "p11",
    author: "Ola H.",
    rating: 4,
    when: "3 uker siden",
    text: "Mye folk, men god omvisning.",
  },
  {
    id: "r23",
    placeId: "p12",
    author: "Erik H.",
    rating: 4,
    when: "2 uker siden",
    text: "Lærerikt om hvordan Bjørvika ble bygget.",
  },
  {
    id: "r24",
    placeId: "p12",
    author: "Sofie L.",
    rating: 4,
    when: "2 måneder siden",
    text: "Interessant, men litt kort.",
  },
  {
    id: "r25",
    placeId: "p13",
    author: "Nina D.",
    rating: 5,
    when: "1 uke siden",
    text: "Lærte å blande garam masala fra bunnen.",
  },
  {
    id: "r26",
    placeId: "p13",
    author: "Kari N.",
    rating: 5,
    when: "1 måned siden",
    text: "Fikk med krydder hjem. Koselig gjeng.",
  },
  {
    id: "r27",
    placeId: "p14",
    author: "Ingrid S.",
    rating: 5,
    when: "2 uker siden",
    text: "Rolig salong og hyggelige folk.",
  },
  {
    id: "r28",
    placeId: "p14",
    author: "Maria M.",
    rating: 4,
    when: "1 måned siden",
    text: "Fornøyd, men det var vanskelig å få time.",
  },
];

export function reviewsForPlace(placeId: string): MockReview[] {
  return reviews.filter((r) => r.placeId === placeId);
}

/** A place's rating and review count, from its reviews (one source). */
export function placeRating(placeId: string): { score: number; count: number } {
  return ratingOf(reviewsForPlace(placeId));
}

// ── Experience reviews (MOCK; founder request 2026-11-06). The rating line's
// count and score are derived from this list (reviewsForExperience), never
// stored separately. Not a review contract (BLOCKED_CONTRACT_GAP).
export type MockExperienceReview = {
  id: string;
  experienceId: string;
  author: string;
  area: string;
  rating: number;
  when: string;
  text: string;
};

export const experienceReviews: MockExperienceReview[] = [
  {
    id: "er1",
    experienceId: "e1",
    author: "Kari N.",
    area: "Sagene",
    rating: 5,
    when: "1 uke siden",
    text: "Fin start på dagen. Maria får alle med i praten uten at det blir kleint.",
  },
  {
    id: "er2",
    experienceId: "e1",
    author: "Ola H.",
    area: "Grünerløkka",
    rating: 5,
    when: "2 uker siden",
    text: "Kom alene og gikk derfra med to nye bekjente. Kaffen var god også.",
  },
  {
    id: "er3",
    experienceId: "e1",
    author: "Ingrid S.",
    area: "Tøyen",
    rating: 4,
    when: "1 måned siden",
    text: "Hyggelig, men litt trangt rundt bordet da vi var mange.",
  },
  {
    id: "er4",
    experienceId: "e2",
    author: "Per O.",
    area: "Torshov",
    rating: 5,
    when: "3 dager siden",
    text: "Gode samtaler og folk som faktisk har lest boka.",
  },
  {
    id: "er5",
    experienceId: "e2",
    author: "Sofie L.",
    area: "St. Hanshaugen",
    rating: 5,
    when: "3 uker siden",
    text: "Åse leder samtalen rolig og lar alle slippe til.",
  },
  {
    id: "er6",
    experienceId: "e2",
    author: "Erik H.",
    area: "Grønland",
    rating: 4,
    when: "2 måneder siden",
    text: "Fin gjeng. Litt for kort tid til å komme gjennom alt.",
  },
  {
    id: "er7",
    experienceId: "e3",
    author: "Nina D.",
    area: "Torshov",
    rating: 5,
    when: "2 uker siden",
    text: "Tom forklarer uten å bli høytidelig. Lærte mye om hvordan vinene lages.",
  },
  {
    id: "er8",
    experienceId: "e3",
    author: "Jonas B.",
    area: "Tøyen",
    rating: 4,
    when: "1 måned siden",
    text: "Spennende viner. Smårettene var små, så spis litt før du kommer.",
  },
  {
    id: "er9",
    experienceId: "e3",
    author: "Maria M.",
    area: "Grünerløkka",
    rating: 5,
    when: "2 måneder siden",
    text: "En av de beste kveldene i høst.",
  },
  {
    id: "er10",
    experienceId: "e4",
    author: "Sofie L.",
    area: "Majorstuen",
    rating: 5,
    when: "4 dager siden",
    text: "Rolig tempo som lovet. Ingen blir hengende alene bak.",
  },
  {
    id: "er11",
    experienceId: "e4",
    author: "Erik H.",
    area: "Frogner",
    rating: 4,
    when: "2 uker siden",
    text: "Fin runde i parken. Mørkt om kvelden, så ta med refleks.",
  },
  {
    id: "er12",
    experienceId: "e4",
    author: "Kari N.",
    area: "Sagene",
    rating: 5,
    when: "1 måned siden",
    text: "Endelig en løpegruppe der det er lov å prate underveis.",
  },
  {
    id: "er13",
    experienceId: "e5",
    author: "Ola H.",
    area: "Grünerløkka",
    rating: 5,
    when: "1 uke siden",
    text: "Nina lærte oss tre nye spill på én kveld. Veldig hyggelig.",
  },
  {
    id: "er14",
    experienceId: "e5",
    author: "Ingrid S.",
    area: "Tøyen",
    rating: 4,
    when: "3 uker siden",
    text: "Bra utvalg av spill. Kan bli litt høylytt mot slutten.",
  },
  {
    id: "er15",
    experienceId: "e5",
    author: "Per O.",
    area: "Torshov",
    rating: 5,
    when: "1 måned siden",
    text: "Perfekt for oss som er nye i byen.",
  },
  {
    id: "er16",
    experienceId: "e6",
    author: "Jonas B.",
    area: "Tøyen",
    rating: 5,
    when: "5 dager siden",
    text: "Per ser motiver overalt. Jeg tok bedre bilder med mobilen enn på lenge.",
  },
  {
    id: "er17",
    experienceId: "e6",
    author: "Sofie L.",
    area: "St. Hanshaugen",
    rating: 5,
    when: "2 uker siden",
    text: "Fint tempo og gode tips underveis.",
  },
  {
    id: "er18",
    experienceId: "e6",
    author: "Kari N.",
    area: "Sagene",
    rating: 4,
    when: "1 måned siden",
    text: "Lærerikt. Skulle gjerne hatt litt mer tid på slutten.",
  },
];

export function reviewsForExperience(id: string): MockExperienceReview[] {
  return experienceReviews.filter((r) => r.experienceId === id);
}

/** Average stars and count of a review list (what the rating line shows). */
export function ratingOf(list: readonly { rating: number }[]): {
  score: number;
  count: number;
} {
  const count = list.length;
  const score = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { score, count };
}

// ── Sessions (MOCK): the upcoming times of an experience, from its `when`
// (the first session) and `repeat`, relative to `now`, so availability, the
// join card and the "Når" filter agree and never show stale dates. Places
// left: the first session uses `going`; later ones are demo values. Not a
// booking contract (BLOCKED_CONTRACT_GAP).
export type MockSession = {
  id: string;
  start: Date;
  end: Date;
  spotsLeft: number;
};

const WEEKDAY_SHORT = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
const WHEN_RE =
  /^(I dag|I morgen|Man|Tir|Ons|Tor|Fre|Lør|Søn)\s+(\d{1,2}):(\d{2})$/;

/** Start of the first session described by a `when` label ("Ons 09:00"). */
export function firstSessionStart(when: string, now: Date): Date | null {
  const m = WHEN_RE.exec(when);
  if (!m) return null;
  const d = new Date(now);
  d.setHours(Number(m[2]), Number(m[3]), 0, 0);
  if (m[1] === "I dag") return d;
  if (m[1] === "I morgen") {
    d.setDate(d.getDate() + 1);
    return d;
  }
  let diff = (WEEKDAY_SHORT.indexOf(m[1] ?? "") - now.getDay() + 7) % 7;
  if (diff === 0 && d.getTime() <= now.getTime()) diff = 7;
  d.setDate(d.getDate() + diff);
  return d;
}

/** A picked date plus the time from a `when` label ("Lør 18:00"). */
function startOnDate(iso: string, when: string): Date | null {
  const t = /(\d{1,2}):(\d{2})$/.exec(when);
  const [y, m, d] = iso.split("-").map(Number);
  if (!t || !y || !m || !d) return null;
  return new Date(y, m - 1, d, Number(t[1]), Number(t[2]));
}

const LATER_FILL = [0.5, 0.25, 0.75];

export function sessionsFor(
  exp: MockExperience,
  now: Date = new Date(),
  count = 4,
): MockSession[] {
  const first = exp.firstDate
    ? startOnDate(exp.firstDate, exp.when)
    : firstSessionStart(exp.when, now);
  if (!first) return [];
  const stepDays = exp.repeat === "Månedlig" ? 28 : 7;
  const total = exp.repeat === "Gjentas ikke" ? 1 : count;
  return Array.from({ length: total }, (_, i) => {
    const start = new Date(first);
    start.setDate(first.getDate() + i * stepDays);
    const end = new Date(start.getTime() + exp.durationMin * 60_000);
    const taken =
      i === 0
        ? exp.going
        : Math.min(
            exp.capacity - 1,
            Math.round(exp.capacity * (LATER_FILL[(i - 1) % 3] ?? 0.5)),
          );
    return {
      id: `${exp.id}-s${i + 1}`,
      start,
      end,
      spotsLeft: Math.max(0, exp.capacity - taken),
    };
  });
}

export type MockGroup = {
  id: string;
  name: string;
  about: string;
  memberCount: number;
  members: string[]; // initials
  cover: LibraryKey; // MOCK demo cover photo (bundled LIBRARY key)
  photos: LibraryKey[]; // MOCK gallery, cover first (at least two)
  // Created by the viewer in Legg til (src/fixtures/created.ts): they are in it.
  mine?: boolean;
};

export const groups: MockGroup[] = [
  {
    id: "g1",
    name: "Morgenkaffe-gjengen",
    about: "Folk som møtes til kaffe i helgene.",
    memberCount: 34,
    members: ["MM", "TT", "ÅK", "JB", "ND"],
    cover: "group-coffee",
    photos: ["group-coffee", "venue-cafe"],
  },
  {
    id: "g2",
    name: "Løkka Lesesirkel",
    about: "Månedlig lesesirkel på Grünerløkka.",
    memberCount: 18,
    members: ["ÅK", "PO", "IS"],
    cover: "group-books",
    photos: ["group-books", "venue-books"],
  },
  {
    id: "g3",
    name: "Naturvin-klubben",
    about: "Vi smaker naturvin sammen én gang i måneden.",
    memberCount: 52,
    members: ["TT", "MM", "KN"],
    cover: "group-wine",
    photos: ["group-wine", "group-wine-2"],
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
  // A place / business chat belongs to its place.
  placeId?: string;
  // A direct message: the person it is with (`people`).
  personId?: string;
  // false = the viewer is not in it yet: hidden from the chat list until they
  // join from the experience or place page (or Sveip). Absent = a member.
  member?: boolean;
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
    personId: "u1", // Maria Movik
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
    placeId: "p2",
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
    placeId: "p1",
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
  // Chats the viewer can join (H2): one per experience and one per place.
  // c23 = this autumn's naturvin evenings (c6 above is July's, archived).
  {
    id: "c23",
    name: "Naturvin-smaking",
    last: "Tom: Torsdag smaker vi fem viner fra Loire.",
    time: "Ons",
    unread: 0,
    type: "experience",
    access: "open",
    status: "active",
    pinnedExperienceId: "e3",
    member: false,
    members: 12,
    initials: "NS",
  },
  {
    id: "c7",
    name: "Lesesirkel: nordisk krim",
    last: "Per: Har noen en ekstra kopi å låne bort?",
    time: "Fre",
    unread: 0,
    type: "experience",
    access: "closed",
    status: "active",
    pinnedExperienceId: "e2",
    member: false,
    members: 10,
    initials: "LK",
  },
  {
    id: "c8",
    name: "Kveldsjogg i Frognerparken",
    last: "Sofie: Jeg er med på tirsdag.",
    time: "Man",
    unread: 0,
    type: "experience",
    access: "open",
    status: "active",
    pinnedExperienceId: "e4",
    member: false,
    members: 7,
    initials: "KF",
  },
  {
    id: "c9",
    name: "Brettspillkveld",
    last: "Nina: Klart, bare meld henne på også.",
    time: "I går",
    unread: 0,
    type: "experience",
    access: "open",
    status: "active",
    pinnedExperienceId: "e5",
    member: false,
    members: 6,
    initials: "BK",
  },
  {
    id: "c10",
    name: "Fotovandring på Grünerløkka",
    last: "Kari: Gleder meg!",
    time: "09:12",
    unread: 0,
    type: "experience",
    access: "open",
    status: "active",
    pinnedExperienceId: "e6",
    member: false,
    members: 10,
    initials: "FG",
  },
  {
    id: "c11",
    name: "Kork & Kanne Vinbar",
    last: "Noen som vil dele en flaske fredag?",
    time: "Fre",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p3",
    member: false,
    members: 41,
    initials: "KK",
  },
  {
    id: "c12",
    name: "Sofienberg Sykkelverksted",
    last: "Takk for hjelpen med girene.",
    time: "I går",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p4",
    member: false,
    members: 23,
    initials: "SS",
  },
  {
    id: "c13",
    name: "Akerselva Vandring",
    last: "Flott høstvær i dag.",
    time: "Fre",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p5",
    member: false,
    members: 18,
    initials: "AV",
  },
  {
    id: "c14",
    name: "Vulkan Keramikkstudio",
    last: "Ovnen er full til fredag.",
    time: "I går",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p6",
    member: false,
    members: 27,
    initials: "VK",
  },
  {
    id: "c15",
    name: "Grünerløkka Mattur",
    last: "Bakeriet var et høydepunkt.",
    time: "Fre",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p7",
    member: false,
    members: 35,
    initials: "GM",
  },
  {
    id: "c16",
    name: "Botanisk Hage Omvisning",
    last: "Kaktusene blomstrer nå.",
    time: "I går",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p8",
    member: false,
    members: 29,
    initials: "BH",
  },
  {
    id: "c17",
    name: "Takåsen Yogastudio",
    last: "Husk egen matte hvis du har.",
    time: "Fre",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p9",
    member: false,
    members: 22,
    initials: "TY",
  },
  {
    id: "c18",
    name: "Oslofjord Seiltur",
    last: "Varme klær anbefales.",
    time: "I går",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p10",
    member: false,
    members: 16,
    initials: "OS",
  },
  {
    id: "c19",
    name: "Munch-galleriet Kveldstur",
    last: "Utstillingen var verdt turen.",
    time: "Fre",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p11",
    member: false,
    members: 48,
    initials: "MG",
  },
  {
    id: "c20",
    name: "Barcode Arkitekturtur",
    last: "Lærerikt om byutviklingen.",
    time: "I går",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p12",
    member: false,
    members: 14,
    initials: "BA",
  },
  {
    id: "c21",
    name: "Grønland Krydderverksted",
    last: "Takk for oppskriften på garam masala.",
    time: "Fre",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p13",
    member: false,
    members: 31,
    initials: "GK",
  },
  {
    id: "c22",
    name: "Frogner Skjønnhetssalong",
    last: "Hyggelig betjening som alltid.",
    time: "I går",
    unread: 0,
    type: "place",
    access: "open",
    status: "active",
    placeId: "p14",
    member: false,
    members: 19,
    initials: "FS",
  },
];

/** The chat of an experience (pinned to it), if it has one. */
export function chatForExperience(expId: string): MockChat | undefined {
  return chats.find(
    (c) => c.pinnedExperienceId === expId && c.status === "active",
  );
}

/** The chat that belongs to a place, if it has one. */
export function chatForPlace(placeId: string): MockChat | undefined {
  return chats.find((c) => c.placeId === placeId && c.status === "active");
}

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
      text: "Jeg stikker innom brenneriet på hjørnet på veien.",
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
  c23: [
    {
      id: "m300",
      author: "Tom",
      initials: "TT",
      text: "Torsdag smaker vi fem viner fra Loire.",
      time: "Ons",
      mine: false,
    },
    {
      id: "m301",
      author: "Ingrid",
      initials: "IS",
      text: "Blir det småretter i år også?",
      time: "Ons",
      mine: false,
    },
    {
      id: "m302",
      author: "Tom",
      initials: "TT",
      text: "Ja, én til hver vin.",
      time: "Ons",
      mine: false,
    },
  ],
  c7: [
    {
      id: "m200",
      author: "Åse",
      initials: "ÅK",
      text: "Neste bok er «Snømannen». Vi tar første halvdel søndag.",
      time: "Fre",
      mine: false,
    },
    {
      id: "m201",
      author: "Per",
      initials: "PO",
      text: "Har noen en ekstra kopi å låne bort?",
      time: "Fre",
      mine: false,
    },
  ],
  c8: [
    {
      id: "m202",
      author: "Jonas",
      initials: "JB",
      text: "Vi møtes ved Monolitten 17:55. Ta med refleks.",
      time: "Man",
      mine: false,
    },
    {
      id: "m203",
      author: "Sofie",
      initials: "SL",
      text: "Jeg er med på tirsdag.",
      time: "Man",
      mine: false,
    },
  ],
  c9: [
    {
      id: "m204",
      author: "Nina",
      initials: "ND",
      text: "Denne uka spiller vi Wingspan og Codenames.",
      time: "I går",
      mine: false,
    },
    {
      id: "m205",
      author: "Ola",
      initials: "OH",
      text: "Kan jeg ta med en venn?",
      time: "I går",
      mine: false,
    },
    {
      id: "m206",
      author: "Nina",
      initials: "ND",
      text: "Klart, bare meld henne på også.",
      time: "I går",
      mine: false,
    },
  ],
  c10: [
    {
      id: "m207",
      author: "Per",
      initials: "PO",
      text: "Mobilkamera holder fint. Vi starter ved fontenen.",
      time: "09:10",
      mine: false,
    },
    {
      id: "m208",
      author: "Kari",
      initials: "KN",
      text: "Gleder meg!",
      time: "09:12",
      mine: false,
    },
  ],
  c11: [
    {
      id: "m209",
      author: "Kork & Kanne Vinbar",
      initials: "KK",
      text: "Ny naturvin fra Loire på glass denne uka.",
      time: "Fre",
      mine: false,
    },
    {
      id: "m210",
      author: "Kari",
      initials: "KN",
      text: "Noen som vil dele en flaske fredag?",
      time: "Fre",
      mine: false,
    },
  ],
  c12: [
    {
      id: "m211",
      author: "Sofienberg Sykkelverksted",
      initials: "SS",
      text: "Åpent verksted torsdag kl. 17.",
      time: "I går",
      mine: false,
    },
    {
      id: "m212",
      author: "Ola",
      initials: "OH",
      text: "Takk for hjelpen med girene.",
      time: "I går",
      mine: false,
    },
  ],
  c13: [
    {
      id: "m213",
      author: "Akerselva Vandring",
      initials: "AV",
      text: "Søndagsrunde fra Vaterland kl. 12.",
      time: "Fre",
      mine: false,
    },
    {
      id: "m214",
      author: "Sofie",
      initials: "SL",
      text: "Flott høstvær i dag.",
      time: "Fre",
      mine: false,
    },
  ],
  c14: [
    {
      id: "m215",
      author: "Vulkan Keramikkstudio",
      initials: "VK",
      text: "Glaseringskveld onsdag. Ta med egne ting.",
      time: "I går",
      mine: false,
    },
    {
      id: "m216",
      author: "Erik",
      initials: "EH",
      text: "Ovnen er full til fredag.",
      time: "I går",
      mine: false,
    },
  ],
  c15: [
    {
      id: "m217",
      author: "Grünerløkka Mattur",
      initials: "GM",
      text: "Ny rute med tre stopp på Løkka.",
      time: "Fre",
      mine: false,
    },
    {
      id: "m218",
      author: "Ingrid",
      initials: "IS",
      text: "Bakeriet var et høydepunkt.",
      time: "Fre",
      mine: false,
    },
  ],
  c16: [
    {
      id: "m219",
      author: "Botanisk Hage Omvisning",
      initials: "BH",
      text: "Omvisning i Palmehuset lørdag.",
      time: "I går",
      mine: false,
    },
    {
      id: "m220",
      author: "Nina",
      initials: "ND",
      text: "Kaktusene blomstrer nå.",
      time: "I går",
      mine: false,
    },
  ],
  c17: [
    {
      id: "m221",
      author: "Takåsen Yogastudio",
      initials: "TY",
      text: "Rolig yin-time søndag kveld.",
      time: "Fre",
      mine: false,
    },
    {
      id: "m222",
      author: "Kari",
      initials: "KN",
      text: "Husk egen matte hvis du har.",
      time: "Fre",
      mine: false,
    },
  ],
  c18: [
    {
      id: "m223",
      author: "Oslofjord Seiltur",
      initials: "OS",
      text: "Siste tur før vinteropplag 15. november.",
      time: "I går",
      mine: false,
    },
    {
      id: "m224",
      author: "Ola",
      initials: "OH",
      text: "Varme klær anbefales.",
      time: "I går",
      mine: false,
    },
  ],
  c19: [
    {
      id: "m225",
      author: "Munch-galleriet Kveldstur",
      initials: "MG",
      text: "Kveldsomvisning torsdag kl. 19.",
      time: "Fre",
      mine: false,
    },
    {
      id: "m226",
      author: "Sofie",
      initials: "SL",
      text: "Utstillingen var verdt turen.",
      time: "Fre",
      mine: false,
    },
  ],
  c20: [
    {
      id: "m227",
      author: "Barcode Arkitekturtur",
      initials: "BA",
      text: "Neste tur starter ved Operaen.",
      time: "I går",
      mine: false,
    },
    {
      id: "m228",
      author: "Erik",
      initials: "EH",
      text: "Lærerikt om byutviklingen.",
      time: "I går",
      mine: false,
    },
  ],
  c21: [
    {
      id: "m229",
      author: "Grønland Krydderverksted",
      initials: "GK",
      text: "Kurs i indisk krydderblanding lørdag.",
      time: "Fre",
      mine: false,
    },
    {
      id: "m230",
      author: "Ingrid",
      initials: "IS",
      text: "Takk for oppskriften på garam masala.",
      time: "Fre",
      mine: false,
    },
  ],
  c22: [
    {
      id: "m231",
      author: "Frogner Skjønnhetssalong",
      initials: "FS",
      text: "Ledige timer fredag ettermiddag.",
      time: "I går",
      mine: false,
    },
    {
      id: "m232",
      author: "Nina",
      initials: "ND",
      text: "Hyggelig betjening som alltid.",
      time: "I går",
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
  meta: string; // MOCK line, e.g. "★ 4,9 · 38 deltakere" — not real counts
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
    hint: "Finn steder og folk i nærheten",
    icon: "compass-outline",
  },
  {
    key: "creator",
    label: "Skaper",
    hint: "Arranger opplevelser. Åpnes senere.",
    icon: "color-palette-outline",
    locked: true,
  },
  {
    key: "business",
    label: "Bedrift",
    hint: "Vis fram stedet ditt",
    icon: "tp-business",
  },
  {
    key: "enterprise",
    label: "Enterprise",
    hint: "For bedrifter med flere steder",
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
  // MOCK follow lists (ids from `people`), not a real follow graph. Profil's
  // Følgere / Følger / Venner (PDF p12) are counted from these lists: who
  // follows you, and who you follow when the session starts (src/lib/following.ts
  // keeps follows made after that). Venner = both ways.
  followerIds: ["u1", "u2", "u3", "u5", "u6", "u7"] as string[],
  followingIds: ["u3", "u4", "u5"] as string[],
  interests: ["Kaffe", "Jazz", "Fotografi", "Brettspill"], // MOCK tags
  // "Veien til Skaper" card (PDF p12/p14). Illustrative copy only — the real
  // creator criteria are not defined (master spec §10: do not fabricate tiers).
  creatorPath: { hosted: 2, required: 3, rating: "4,8" },
  activity: [
    { experienceId: "e6", role: "Arrangert", meta: "★ 4,9 · 38 deltakere" },
    { experienceId: "e3", role: "Deltok", meta: "lørdag" },
    { experienceId: "e1", role: "Arrangert", meta: "★ 4,7 · 12 deltakere" },
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
    bio: "Kaffeentusiast og vert for morgenkaffen. Elsker å møte nye folk.",
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
    bio: "Løper, syklist og kaffedrikker. Ofte på kafeen på hjørnet.",
    mutuals: 2,
    interests: ["Løping", "Sykkel", "Kaffe"],
    hostsExperienceId: "e4",
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
    hostsExperienceId: "e5",
  },
  {
    id: "u7",
    name: "Tom Tangen",
    handle: "@tomt",
    avatar: "person-tom",
    area: "Vulkan",
    bio: "Jobber med vin og liker å forklare hvordan den lages. Vert for naturvinkveldene.",
    mutuals: 1,
    interests: ["Vin", "Mat", "Reiser"],
    hostsExperienceId: "e3",
  },
  {
    id: "u8",
    name: "Per Olsen",
    handle: "@perfoto",
    avatar: "person-per",
    area: "Grünerløkka",
    bio: "Fotograf som liker gatelivet på Løkka. Viser gjerne enkle grep for bedre bilder.",
    mutuals: 0,
    interests: ["Foto", "Byvandring", "Kaffe"],
    hostsExperienceId: "e6",
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
  photos: LibraryKey[]; // MOCK gallery, cover first (at least two)
  owner: string;
  ownerMeta: string; // MOCK, e.g. "Verifisert bedrift"
  tags: string[];
  details: { label: string; value: string }[]; // MOCK display rows
  description: string;
  // The owner's Venteliste (PDF p18): how many collaborations the listing
  // takes, how many are taken, and who waits, in the order they joined. MOCK;
  // the count shown is the list length. No auto-accept or queue rule.
  capacity?: number;
  taken?: number;
  waitlist?: MockWaitlistEntry[];
};

export type MockWaitlistEntry = {
  name: string;
  role: "Skaper" | "Bedrift" | "Venue";
  avatar: LibraryKey;
  joined: string; // MOCK display label, e.g. "Påmeldt 12. juli"
};

export const listings: MockListing[] = [
  {
    id: "m1",
    title: "Intimt jazzcafé-lokale",
    type: "Venue",
    terms: "Gratis mot eksponering",
    cover: "venue-music",
    photos: ["venue-music", "venue-bar-2"],
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
    capacity: 5,
    taken: 5,
    waitlist: [
      {
        name: "Sofie Lind",
        role: "Skaper",
        avatar: "person-sofie",
        joined: "Påmeldt 12. juli",
      },
      {
        name: "Erik Haug",
        role: "Skaper",
        avatar: "person-erik",
        joined: "Påmeldt 14. juli",
      },
      {
        name: "Sentrum Scene",
        role: "Venue",
        avatar: "venue-bar",
        joined: "Påmeldt 15. juli",
      },
      {
        name: "Per Olsen",
        role: "Skaper",
        avatar: "person-per",
        joined: "Påmeldt 18. juli",
      },
      {
        name: "Blå Stasjon",
        role: "Bedrift",
        avatar: "venue-bar-2",
        joined: "Påmeldt 20. juli",
      },
      {
        name: "Nina Dahl",
        role: "Skaper",
        avatar: "person-nina",
        joined: "Påmeldt 22. juli",
      },
    ],
  },
  {
    id: "m2",
    title: "Erfaren jazzvert",
    type: "Skaper",
    terms: "Fra 2 000 kr",
    cover: "person-maria",
    photos: ["person-maria", "venue-music"],
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
    photos: ["venue-bar", "venue-music"],
    owner: "Elvebredden Kulturfond",
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
    photos: ["venue-cafe", "venue-cafe-2"],
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
    photos: ["venue-workshop", "pottery-2"],
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

// ── Marketplace-analyse and Samarbeidshistorikk (PDF p18), MOCK ─────────────
// Only the owner sees these. Every figure on Marketplace-analyse is computed
// from the lists below (src/features/marketplace/marketplaceStats.ts): views
// and requests from the published listings' numbers, collaborations and the
// average rating from the history. BLOCKED_CONTRACT_GAP: no analytics,
// collaboration or rating backend.
export type StatsRange = "Uke" | "Måned" | "Total";
export const STATS_RANGES: readonly StatsRange[] = ["Uke", "Måned", "Total"];

export type MyListingState = "Aktive" | "Utkast" | "Avsluttede";
/** The viewer's own listings (Mine listings) and their state. */
export const myListingStates: Readonly<Record<string, MyListingState>> = {
  m1: "Aktive",
  m2: "Aktive",
  m3: "Utkast",
};

/** Views and requests per published listing and range. */
export const listingStats: Readonly<
  Record<string, Record<StatsRange, { views: number; requests: number }>>
> = {
  m1: {
    Uke: { views: 38, requests: 2 },
    Måned: { views: 124, requests: 8 },
    Total: { views: 431, requests: 26 },
  },
  m2: {
    Uke: { views: 21, requests: 1 },
    Måned: { views: 87, requests: 5 },
    Total: { views: 298, requests: 14 },
  },
};

/** Average time to answer a request, in hours. */
export const replyHours: Readonly<Record<StatsRange, number>> = {
  Uke: 3,
  Måned: 4,
  Total: 5,
};

/** Shape of "Forespørsler" over the range (relative bar heights, no values). */
export const requestBars: Readonly<Record<StatsRange, number[]>> = {
  Uke: [30, 55, 40, 70, 45, 60, 85],
  Måned: [35, 50, 42, 60, 58, 66, 52, 72, 78, 92],
  Total: [40, 46, 52, 48, 61, 58, 67, 72, 70, 79, 84, 90],
};

export type MockCollab = {
  id: string;
  title: string;
  partner: string;
  /** How long ago it ended (relative, so the list never goes stale). */
  daysAgo: number;
  status: "Fullført" | "Avsluttet";
  /** Your rating of the partner, when given. */
  rating?: number;
};

export const collabHistory: MockCollab[] = [
  {
    id: "ch1",
    title: "Jazzkveld på Blå",
    partner: "Oslo Kaffebar",
    daysAgo: 5,
    status: "Fullført",
  },
  {
    id: "ch2",
    title: "Kaffekurs: Latte art",
    partner: "Grünerløkka Bokcafé",
    daysAgo: 19,
    status: "Fullført",
    rating: 5,
  },
  {
    id: "ch3",
    title: "Vinsmaking for nybegynnere",
    partner: "Kork & Kanne Vinbar",
    daysAgo: 26,
    status: "Avsluttet",
  },
  {
    id: "ch4",
    title: "Keramikk-kveld",
    partner: "Vulkan Keramikkstudio",
    daysAgo: 48,
    status: "Fullført",
    rating: 5,
  },
  {
    id: "ch5",
    title: "Brunsj og yoga",
    partner: "Takåsen Yogastudio",
    daysAgo: 75,
    status: "Fullført",
    rating: 4,
  },
  {
    id: "ch6",
    title: "Fotowalk langs Akerselva",
    partner: "Akerselva Vandring",
    daysAgo: 110,
    status: "Fullført",
    rating: 5,
  },
  {
    id: "ch7",
    title: "Krydderkurs",
    partner: "Grønland Krydderverksted",
    daysAgo: 160,
    status: "Avsluttet",
  },
];

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
  // What a tap opens: the fixture the notification names (src/lib/entityRoutes.ts).
  target: NotificationTarget;
};

export type NotificationTarget = {
  kind: "person" | "experience" | "group" | "place" | "reviews" | "chat";
  id: string;
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
    target: { kind: "person", id: "u2" },
  },
  {
    id: "n2",
    type: "join",
    actorName: "Maria Movik",
    actorInitials: "MM",
    text: "ble med på «Morgenkaffe & prat».",
    minutesAgo: 120,
    read: false,
    target: { kind: "experience", id: "e1" },
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
    target: { kind: "group", id: "g2" },
  },
  {
    id: "n4",
    type: "invite",
    actorName: "Åse Kvam",
    actorInitials: "ÅK",
    text: "inviterte deg til «Lesesirkel: nordisk krim».",
    minutesAgo: 2880,
    read: false,
    target: { kind: "experience", id: "e2" },
    thumbnailTint: "#4A5A7A",
  },
  // n8 and n9 (Phase 18): two more followers this week (both in
  // profile.followerIds), so Varsler shows same-kind notices collapsed.
  {
    id: "n8",
    type: "follow",
    actorName: "Erik Haug",
    actorInitials: "EH",
    text: "begynte å følge deg.",
    minutesAgo: 4000,
    read: true,
    target: { kind: "person", id: "u5" },
  },
  {
    id: "n5",
    type: "review",
    actorName: "Oslo Kaffebar",
    actorInitials: "OK",
    text: "fikk en ny anmeldelse.",
    minutesAgo: 4320,
    read: true,
    target: { kind: "reviews", id: "p1" },
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
    target: { kind: "person", id: "u6" },
  },
  {
    id: "n9",
    type: "follow",
    actorName: "Tom Tangen",
    actorInitials: "TT",
    text: "begynte å følge deg.",
    minutesAgo: 7000,
    read: true,
    target: { kind: "person", id: "u7" },
  },
  {
    id: "n7",
    type: "join",
    actorName: "Tom Tangen",
    actorInitials: "TT",
    text: "ble med på «Naturvin-smaking».",
    minutesAgo: 14400,
    read: true,
    target: { kind: "experience", id: "e3" },
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
