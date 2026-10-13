// STATIC MOCK FIXTURES — Phase 0 visual shell only.
//
// BLOCKED_CONTRACT_GAP: none of this is real data, a canonical entity, or an API
// shape. It exists solely to render the visual shell. No field here implies an
// approved schema/DTO. Real data arrives only with the authoritative V2.2 contract.

export type MockPlace = {
  id: string;
  name: string;
  category: string;
  distance: string;
  blurb: string;
};

export const places: MockPlace[] = [
  {
    id: "p1",
    name: "Oslo Kaffebar",
    category: "Kafé",
    distance: "120 m",
    blurb: "Lun nabolagskafé med spesialkaffe.",
  },
  {
    id: "p2",
    name: "Grünerløkka Bokcafé",
    category: "Bokcafé",
    distance: "450 m",
    blurb: "Bøker, te og stille kroker.",
  },
  {
    id: "p3",
    name: "Mathallen Vinbar",
    category: "Vinbar",
    distance: "800 m",
    blurb: "Naturvin og småretter.",
  },
  {
    id: "p4",
    name: "Sofienberg Sykkelverksted",
    category: "Verksted",
    distance: "1.1 km",
    blurb: "Fiks sykkelen mens du venter.",
  },
];

export type MockSwipeCard = {
  id: string;
  title: string;
  host: string;
  when: string;
  tag: string;
};

export const swipeCards: MockSwipeCard[] = [
  {
    id: "s1",
    title: "Jazzkveld på Løkka",
    host: "Maria M.",
    when: "I kveld 20:00",
    tag: "Live-musikk",
  },
  {
    id: "s2",
    title: "Morgenløp langs elva",
    host: "Tom T.",
    when: "Lør 09:00",
    tag: "Trening",
  },
  {
    id: "s3",
    title: "Keramikk-workshop",
    host: "Åse K.",
    when: "Søn 13:00",
    tag: "Kunst",
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
