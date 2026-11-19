// STATIC MOCK FIXTURES — Phase 1 visual shell only.
//
// BLOCKED_CONTRACT_GAP: none of this is real data, a canonical entity, or an API
// shape. It exists solely to render the visual shell. No field here implies an
// approved schema/DTO. Real data arrives only with the authoritative V2.2 contract.

export const PLACE_CATEGORIES = [
  "Alle",
  "Kafé",
  "Bokcafé",
  "Vinbar",
  "Verksted",
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export type MockPlace = {
  id: string;
  name: string;
  category: Exclude<PlaceCategory, "Alle">;
  distance: string;
  distanceM: number;
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
    blurb: "Fiks sykkelen mens du venter.",
    rating: 4.9,
    reviews: 54,
    openNow: true,
    tags: ["Sykkel", "Reparasjon", "Drop-in"],
    about:
      "Lite verksted drevet av entusiaster. Kaffe mens du venter på dekkskiftet.",
  },
];

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
