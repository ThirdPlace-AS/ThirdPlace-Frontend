// Hosts the interest catalogue adds (Phase 19). Fictional people with
// stand-in portraits from the bundled library (assets/library/CREDITS.md);
// the person in a photo is not the host. Appended to `people` in index.ts
// before the catalogue is built, so hosts and contact persons resolve.
// MOCK content, not a contract (BLOCKED_CONTRACT_GAP).
import type { MockPerson } from "../index";

export const CATALOG_PEOPLE: MockPerson[] = [
  {
    id: "u9",
    name: "Leila Haddad",
    handle: "@leilah",
    avatar: "person-leila",
    area: "Sandvika",
    bio: "Yogalærer i Bærum. Underviser helst ute, og helst tidlig.",
    mutuals: 1,
    interests: ["Yoga", "Pilates", "Friluftsliv"],
  },
  {
    id: "u10",
    name: "Henrik Aasen",
    handle: "@henrikaa",
    avatar: "person-henrik",
    area: "Nordstrand",
    bio: "Bader i fjorden hele året og fyrer i badstua på Nesodden i helgene.",
    mutuals: 2,
    interests: ["Badstue", "Bading", "Seiling"],
  },
  {
    id: "u11",
    name: "Kari Holm",
    handle: "@kariholm",
    avatar: "person-kari",
    area: "Ås",
    bio: "Pensjonert lærer. Har drukket te og meditert i over tjue år, og deler gjerne begge deler.",
    mutuals: 0,
    interests: ["Te", "Meditasjon", "Litteratur"],
  },
  {
    id: "u12",
    name: "Jakob Nilsen",
    handle: "@jakobbaker",
    avatar: "person-jakob",
    area: "Lørenskog",
    bio: "Hjemmebaker med surdeig i kjøleskapet og sykkel i gangen.",
    mutuals: 1,
    interests: ["Bakst", "Kaffe", "Sykkel"],
  },
  {
    id: "u13",
    name: "Linh Tran",
    handle: "@linhtran",
    avatar: "person-linh",
    area: "Jessheim",
    bio: "Sykepleier på Jessheim. Går i skogen på søndager og tar pilates to kvelder i uka.",
    mutuals: 1,
    interests: ["Velvære", "Pilates", "Friluftsliv"],
  },
  {
    id: "u14",
    name: "Samuel Mensah",
    handle: "@samuelm",
    avatar: "person-samuel",
    area: "Lillestrøm",
    bio: "Brygger øl i garasjen og heier på Lillestrøm på søndager.",
    mutuals: 1,
    interests: ["Øl", "Fotball", "Mat"],
  },
  {
    id: "u15",
    name: "Nadia Khan",
    handle: "@nadiak",
    avatar: "person-nadia",
    area: "Asker",
    bio: "Lager plantemat for venner og fremmede. Tror alle kan bli glad i linser.",
    mutuals: 2,
    interests: ["Vegansk", "Matlaging", "Hage og dyrking"],
  },
  {
    id: "u16",
    name: "Kristine Haug",
    handle: "@kristineh",
    avatar: "person-kristine",
    area: "Gjerdrum",
    bio: "Driver andelslandbruk på Gjerdrum. Har jord under neglene fra april til oktober.",
    mutuals: 0,
    interests: ["Kortreist", "Hage og dyrking", "Hund"],
  },
];
