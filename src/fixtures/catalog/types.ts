// Seed types for the interest catalogue (Phase 19). A seed holds only what a
// person writes by hand (names, texts, reviews, chat lines, program, places,
// prices, photos); src/fixtures/catalog/build.ts turns it into full Mock*
// records with ids, chats, messages, reviews and defaults. MOCK content, not
// a contract (BLOCKED_CONTRACT_GAP).
import type { LibraryKey } from "../images";
import type {
  CancellationOption,
  CitySpace,
  DurationOption,
  EnergyLevel,
  ExperienceAccess,
  ExperienceCategory,
  ExperienceVibe,
  MockChatAccess,
  MockOrganization,
  Vibe,
} from "../index";
import type { InterestId } from "./interests";

/** [author, stars 1–5, "3 uker siden", text] */
export type PlaceReviewSeed = readonly [string, number, string, string];
/** [author, area, stars 1–5, "2 måneder siden", text] */
export type ExperienceReviewSeed = readonly [
  string,
  string,
  number,
  string,
  string,
];
/** [author, text, time?] — a line in the item's chat. */
export type ChatLineSeed = readonly [string, string, string?];
/** [title, text, photo] — a step of "Hva dere skal gjøre" or the Program. */
export type StepSeed = readonly [string, string, LibraryKey];

type PlaceSeedBase = {
  name: string;
  /** A short descriptor ("Klatresenter", "Park"). */
  category: string;
  coord: [number, number];
  /** The named area the coordinate belongs to (checked by the tests). */
  town: string;
  address: string;
  hours: string;
  specialHours?: string;
  openNow?: boolean;
  priceNok: number;
  vibes: Vibe[];
  blurb: string;
  about: string;
  tags: string[];
  accessibility: string[];
  /** "Opplevelsestype" labels for Filtre. */
  types: string[];
  audiences?: string[];
  durationMin?: number;
  timeOfDay?: string[];
  languages?: string[];
  photos: LibraryKey[];
  reviews: PlaceReviewSeed[];
  chat: ChatLineSeed[];
};

export type BedriftSeed = PlaceSeedBase & {
  business: { name: string; verified: boolean; about: string };
};
export type OrganisasjonSeed = PlaceSeedBase & {
  org: Omit<MockOrganization, "id" | "placeId" | "name"> & { name?: string };
};
export type ByromSeed = PlaceSeedBase & { space: CitySpace };

/** Which of the interest's own places an experience or event uses. */
export type VenueRef =
  | "bedrift"
  | "organisasjon"
  | "byrom"
  | { placeId: string };

type ExperienceSeedBase = {
  title: string;
  /** Person id in `people`. */
  hostId: string;
  /** "Tir 18:00" · "I dag 11:00" (see sessionsFor). */
  when: string;
  venue: VenueRef;
  capacity: number;
  going: number;
  priceNok?: number;
  about: string;
  category: ExperienceCategory;
  duration: DurationOption;
  durationMin: number;
  languages?: string[];
  included: string[];
  vibes: ExperienceVibe[];
  energy?: EnergyLevel;
  access?: ExperienceAccess;
  cancellation?: CancellationOption;
  types: string[];
  audiences: string[];
  tags: string[];
  photos: LibraryKey[];
  steps: StepSeed[];
  reviews: ExperienceReviewSeed[];
  chat: ChatLineSeed[];
  status?: "open" | "waitlist" | "full";
};

export type OpplevelseSeed = ExperienceSeedBase & {
  repeat?: "Ukentlig" | "Månedlig";
};

export type ArrangementSeed = ExperienceSeedBase & {
  /** 1 = a one-day event, 2–4 = a festival. */
  days: number;
  /** Who puts it on. */
  organizer: "organisasjon" | "bedrift" | { placeId: string };
};

export type GruppeSeed = {
  name: string;
  about: string;
  rules: string;
  photos: LibraryKey[];
  memberCount: number;
  /** Where the group meets. */
  home: VenueRef;
  /** More interests besides its own. */
  alsoInterests?: InterestId[];
  access: MockChatAccess;
  chat: ChatLineSeed[];
};

/** Everything one interest adds. A kind left out is covered by a legacy
 *  fixture (p1–p14, e1–e6, g1–g3); the coverage test checks that. */
export type InterestSeed = {
  interest: InterestId;
  bedrift?: BedriftSeed;
  organisasjon?: OrganisasjonSeed;
  byrom?: ByromSeed;
  opplevelse?: OpplevelseSeed;
  arrangement?: ArrangementSeed;
  gruppe?: GruppeSeed;
};
