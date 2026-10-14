// STATIC MOCK FIXTURES — Phase 1 visual shell only.
//
// BLOCKED_CONTRACT_GAP: none of this is real data, a canonical entity, or an API
// shape. It exists solely to render the visual shell. No field here implies an
// approved schema/DTO. Real data arrives only with the authoritative V2.2 contract.
// `coord` values are MOCK demo points near Oslo for map markers — NOT authoritative
// places or real geodata.

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
    tags: ["Spesialkaffe", "Wifi", "Studievennlig"],
    about:
      "En rolig kafé på hjørnet med husbrent kaffe, hjemmebakst og god plass til å slå seg ned.",
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
    tags: ["Bøker", "Te", "Stille"],
    about: "Vegger av bøker, dyp sofa og en tekanne som aldri går tom.",
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
    vibes: ["Sosial", "Energisk"],
    blurb: "Naturvin og småretter.",
    rating: 4.4,
    reviews: 203,
    openNow: false,
    tags: ["Naturvin", "Småretter", "Sosialt"],
    about:
      "Liten vinbar inne i Mathallen med skiftende glass og delbare retter.",
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
    vibes: ["Rolig"],
    blurb: "Fiks sykkelen mens du venter.",
    rating: 4.9,
    reviews: 54,
    openNow: true,
    tags: ["Sykkel", "Reparasjon", "Drop-in"],
    about:
      "Lite verksted drevet av entusiaster. Kaffe mens du venter på dekkskiftet.",
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
  day: TimeWindow; // MOCK time window for the "Når" filter
  tags: string[];
  about: string;
};

export const experiences: MockExperience[] = [
  {
    id: "e1",
    title: "Morgenkaffe & prat",
    host: "Maria M.",
    when: "Lør 09:00",
    placeId: "p1",
    groupId: "g1",
    status: "open",
    capacity: 8,
    going: 5,
    day: "Helg",
    tags: ["Sosialt", "Kaffe"],
    about: "Uformell morgenkaffe for naboer. Bare å møte opp.",
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
  },
  {
    id: "e3",
    title: "Naturvin-smaking",
    host: "Tom T.",
    when: "Fre 19:00",
    placeId: "p3",
    groupId: "g3",
    status: "full",
    capacity: 12,
    going: 12,
    day: "Denne uka",
    tags: ["Vin", "Smaking"],
    about: "Guidet smaking av fem naturviner med småretter.",
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
};

export const groups: MockGroup[] = [
  {
    id: "g1",
    name: "Morgenkaffe-gjengen",
    about: "Naboer som møtes til kaffe i helgene.",
    memberCount: 34,
    members: ["MM", "TT", "ÅK", "JB", "ND"],
  },
  {
    id: "g2",
    name: "Løkka Lesesirkel",
    about: "Månedlig lesesirkel på Grünerløkka.",
    memberCount: 18,
    members: ["ÅK", "PO", "IS"],
  },
  {
    id: "g3",
    name: "Naturvin-klubben",
    about: "Vi smaker naturvin sammen én gang i måneden.",
    memberCount: 52,
    members: ["TT", "MM", "KN"],
  },
];

export function groupById(id: string): MockGroup | undefined {
  return groups.find((g) => g.id === id);
}

export type MockSwipeCard = {
  id: string;
  title: string;
  host: string;
  when: string;
  tag: string;
  spots: string;
};

export const swipeCards: MockSwipeCard[] = [
  {
    id: "s1",
    title: "Jazzkveld på Løkka",
    host: "Maria M.",
    when: "I kveld 20:00",
    tag: "Live-musikk",
    spots: "3 plasser igjen",
  },
  {
    id: "s2",
    title: "Morgenløp langs elva",
    host: "Tom T.",
    when: "Lør 09:00",
    tag: "Trening",
    spots: "6 plasser igjen",
  },
  {
    id: "s3",
    title: "Keramikk-workshop",
    host: "Åse K.",
    when: "Søn 13:00",
    tag: "Kunst",
    spots: "2 plasser igjen",
  },
];

export type MockChat = {
  id: string;
  name: string;
  last: string;
  time: string;
  unread: number;
};

export const chats: MockChat[] = [
  {
    id: "c1",
    name: "Jazzkveld på Løkka",
    last: "Vi sees kl 20!",
    time: "18:42",
    unread: 2,
  },
  {
    id: "c2",
    name: "Maria M.",
    last: "Takk for sist 😊",
    time: "I går",
    unread: 0,
  },
  {
    id: "c3",
    name: "Morgenløp-gjengen",
    last: "Noen som løper i regnet?",
    time: "Man",
    unread: 0,
  },
];

export const profile = {
  name: "Ola Nordmann",
  handle: "@ola",
  bio: "Utforsker i Oslo. Kaffe, konserter og lange turer.",
  stats: { steder: 24, opplevelser: 8, venner: 56 },
};
