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

export type MockPlace = {
  id: string;
  name: string;
  category: Exclude<PlaceCategory, "Alle">;
  distance: string;
  distanceM: number;
  coord: [number, number]; // [lng, lat] — MOCK demo point
  priceLevel: PriceLevel; // MOCK price tier (1–3), not a real price
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
  status: ExperienceStatus;
  capacity: number;
  going: number;
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
    status: "open",
    capacity: 8,
    going: 5,
    tags: ["Sosialt", "Kaffe"],
    about: "Uformell morgenkaffe for naboer. Bare å møte opp.",
  },
  {
    id: "e2",
    title: "Lesesirkel: nordisk krim",
    host: "Åse K.",
    when: "Søn 18:00",
    placeId: "p2",
    status: "waitlist",
    capacity: 10,
    going: 10,
    tags: ["Bøker", "Diskusjon"],
    about: "Månedlig lesesirkel. Denne gang nordisk krim.",
  },
  {
    id: "e3",
    title: "Naturvin-smaking",
    host: "Tom T.",
    when: "Fre 19:00",
    placeId: "p3",
    status: "full",
    capacity: 12,
    going: 12,
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
