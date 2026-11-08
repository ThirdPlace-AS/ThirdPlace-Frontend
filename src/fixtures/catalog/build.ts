// Builds the interest catalogue's fixtures from hand-written seeds (Phase 19).
// Pure and deterministic: the same seeds give the same ids, chats, messages,
// reviews and defaults. src/fixtures/index.ts calls buildCatalog() at the end
// of the module (after `people` exists) and appends the result after the
// legacy items, so p1, e1 and g1 stay first. MOCK (BLOCKED_CONTRACT_GAP).
import { distanceMeters, formatDistance } from "@/lib/distance";
import { media } from "@/theme/media";

import { libImage } from "../images";
import type {
  ExperienceAccess,
  MockAttendee,
  MockBusiness,
  MockChat,
  MockChatAccess,
  MockChatType,
  MockExperience,
  MockExperienceReview,
  MockGroup,
  MockMessage,
  MockOrganization,
  MockPlace,
  MockReview,
  PlaceKind,
  PriceLevel,
  TimeWindow,
} from "../index";
import { AREAS } from "./areas";
import type { InterestId } from "./interests";
import type {
  ArrangementSeed,
  ChatLineSeed,
  InterestSeed,
  OpplevelseSeed,
  VenueRef,
} from "./types";

export type Catalog = {
  places: MockPlace[];
  businesses: MockBusiness[];
  organizations: MockOrganization[];
  experiences: MockExperience[];
  groups: MockGroup[];
  chats: MockChat[];
  messagesByChat: Record<string, MockMessage[]>;
  reviews: MockReview[];
  experienceReviews: MockExperienceReview[];
  attendees: Record<string, Omit<MockAttendee, "shown">[]>;
};

export type BuildContext = {
  /** A person's full name (hosts are people in `people`). */
  personName: (id: string) => string | undefined;
  /** A legacy group for an interest, when the seed has none (g1 for Kaffe). */
  legacyGroupFor: (interest: InterestId) => string | undefined;
  /** Made-up names (generatedNames in index.ts). */
  namesFor: (seed: string, count: number) => string[];
};

// Grünerløkka, the demo map centre: the legacy distance fields count from it.
const CENTRE = AREAS[0]!.coord;

const KIND_SUFFIX: Record<PlaceKind, string> = {
  bedrift: "b",
  organisasjon: "o",
  byrom: "r",
};

const KIND_DEFAULTS: Record<
  PlaceKind,
  {
    source: string;
    audiences: string[];
    durationMin: number;
    timeOfDay: string[];
  }
> = {
  bedrift: {
    source: "Kilde: eier-innsendt",
    audiences: ["Alenereisende", "Par", "Lokalkjente"],
    durationMin: 90,
    timeOfDay: ["ettermiddag", "kveld"],
  },
  organisasjon: {
    source: "Kilde: organisasjonen",
    audiences: ["Store grupper", "Lokalkjente"],
    durationMin: 120,
    timeOfDay: ["kveld"],
  },
  byrom: {
    source: "Kilde: OpenStreetMap + redaksjonelt",
    audiences: ["Barn", "Store grupper", "Førstegangsbesøkende"],
    durationMin: 60,
    timeOfDay: ["morgen", "ettermiddag", "kveld"],
  },
};

const ACCESS_TO_CHAT: Record<ExperienceAccess, MockChatAccess> = {
  Alle: "open",
  "Godkjennes av deg": "closed",
  "Kun invitasjon": "invite_only",
};

const CHAT_TIMES = ["08:42", "09:15", "11:03", "13:27", "16:50", "18:34"];

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** "Nina Dahl" → "Nina D." (how an experience names its host). */
const hostLabel = (name: string) => {
  const [first, last] = name.split(" ");
  return last ? `${first} ${last[0]}.` : (first ?? name);
};

const priceLevelFor = (nok: number): PriceLevel =>
  nok <= 150 ? 1 : nok <= 500 ? 2 : 3;

/** The "Når" window of a `when` label (a rolling weekday or I dag / I morgen). */
export function dayFor(when: string): TimeWindow {
  if (when.startsWith("I dag")) return "I dag";
  if (when.startsWith("I morgen")) return "I morgen";
  return /^(Lør|Søn)\b/.test(when) ? "Helg" : "Denne uka";
}

function messages(chatId: string, lines: readonly ChatLineSeed[]) {
  return lines.map(
    ([author, text, time], i): MockMessage => ({
      id: `m-${chatId}-${i + 1}`,
      author,
      initials: initialsOf(author),
      text,
      time: time ?? CHAT_TIMES[i % CHAT_TIMES.length]!,
      mine: false,
    }),
  );
}

function chatFrom(
  base: Pick<MockChat, "id" | "name" | "type" | "access"> &
    Partial<Pick<MockChat, "placeId" | "pinnedExperienceId" | "members">>,
  lines: readonly ChatLineSeed[],
  out: Catalog,
) {
  const msgs = messages(base.id, lines);
  const last = msgs[msgs.length - 1];
  out.chats.push({
    ...base,
    last: last?.text ?? "",
    time: "I går",
    unread: 0,
    status: "active",
    // Not joined: the Chat tab lists it only once the viewer joins.
    member: false,
    initials: initialsOf(base.name),
  });
  out.messagesByChat[base.id] = msgs;
}

export function buildCatalog(
  seeds: readonly InterestSeed[],
  ctx: BuildContext,
): Catalog {
  const out: Catalog = {
    places: [],
    businesses: [],
    organizations: [],
    experiences: [],
    groups: [],
    chats: [],
    messagesByChat: {},
    reviews: [],
    experienceReviews: [],
    attendees: {},
  };

  for (const seed of seeds) {
    const slug = seed.interest;
    const placeIds: Partial<Record<PlaceKind, string>> = {};
    const placeOf = new Map<string, MockPlace>();

    for (const kind of ["bedrift", "organisasjon", "byrom"] as const) {
      const p = seed[kind];
      if (!p) continue;
      const id = `p-${slug}-${KIND_SUFFIX[kind]}`;
      const d = KIND_DEFAULTS[kind];
      const distanceM = Math.round(distanceMeters(CENTRE, p.coord));
      const place: MockPlace = {
        id,
        name: p.name,
        category: p.category,
        kind,
        interestId: slug,
        ...(kind === "byrom" && "space" in p ? { space: p.space } : {}),
        photos: p.photos,
        distance: formatDistance(distanceM),
        distanceM,
        coord: p.coord,
        priceLevel: priceLevelFor(p.priceNok),
        priceNok: p.priceNok,
        vibes: p.vibes,
        blurb: p.blurb,
        openNow: p.openNow ?? true,
        tags: p.tags,
        about: p.about,
        address: p.address,
        hours: p.hours,
        ...(p.specialHours ? { specialHours: p.specialHours } : {}),
        accessibility: p.accessibility,
        source: d.source,
        placeStatus: "active",
        types: p.types,
        audiences: p.audiences ?? d.audiences,
        durationMin: p.durationMin ?? d.durationMin,
        timeOfDay: p.timeOfDay ?? d.timeOfDay,
        languages: p.languages ?? ["norsk", "engelsk"],
      };
      out.places.push(place);
      placeIds[kind] = id;
      placeOf.set(id, place);
      p.reviews.forEach(([author, rating, when, text], i) =>
        out.reviews.push({
          id: `r-${id}-${i + 1}`,
          placeId: id,
          author,
          rating,
          when,
          text,
        }),
      );
      if (kind === "bedrift" && "business" in p) {
        out.businesses.push({
          id: `b-${slug}`,
          name: p.business.name,
          category: p.category,
          verified: p.business.verified,
          about: p.business.about,
          address: p.address,
          hours: p.hours,
          placeId: id,
        });
      }
      if (kind === "organisasjon" && "org" in p) {
        out.organizations.push({
          id: `o-${slug}`,
          placeId: id,
          name: p.org.name ?? p.name,
          form: p.org.form,
          about: p.org.about,
          activities: p.org.activities,
          contactPersonId: p.org.contactPersonId,
        });
      }
      const chatType: MockChatType = kind === "bedrift" ? "business" : "place";
      chatFrom(
        {
          id: `c-${id}`,
          name: p.name,
          type: chatType,
          access: "open",
          placeId: id,
        },
        p.chat,
        out,
      );
    }

    const venueId = (ref: VenueRef): string | undefined =>
      typeof ref === "string" ? placeIds[ref] : ref.placeId;
    const groupId = seed.gruppe ? `g-${slug}` : ctx.legacyGroupFor(slug);

    const addExperience = (
      e: OpplevelseSeed | ArrangementSeed,
      id: string,
      event: boolean,
    ) => {
      const placeId = venueId(e.venue);
      const venue = placeId ? placeOf.get(placeId) : undefined;
      const hostName = ctx.personName(e.hostId) ?? e.hostId;
      const access = e.access ?? "Alle";
      const at = venue?.coord ?? AREAS[0]!.coord;
      // An event held where the interest's opplevelse also meets puts its
      // meeting point on the other side of the venue, so the pins stay apart.
      const sharesVenue =
        event &&
        seed.opplevelse !== undefined &&
        venueId(seed.opplevelse.venue) === placeId;
      const exp: MockExperience = {
        id,
        title: e.title,
        host: hostLabel(hostName),
        hostId: e.hostId,
        interestId: slug,
        when: e.when,
        ...(placeId ? { placeId } : {}),
        groupId: groupId ?? "",
        status: e.status ?? "open",
        capacity: e.capacity,
        going: e.going,
        ...(e.priceNok ? { priceNok: e.priceNok } : {}),
        day: dayFor(e.when),
        tags: e.tags,
        about: e.about,
        photos: e.photos.map(libImage),
        scrims: e.photos.map(() => media.base),
        category: e.category,
        duration: e.duration,
        durationMin: e.durationMin,
        languages: e.languages ?? ["Norsk"],
        included: e.included,
        vibes: e.vibes,
        energy: e.energy ?? "Middels",
        access,
        cancellation: e.cancellation ?? "Gratis frem til 24 t før",
        repeat: event
          ? "Gjentas ikke"
          : ((e as OpplevelseSeed).repeat ?? "Ukentlig"),
        types: e.types,
        audiences: e.audiences,
        // About 45 m north of the venue (south for an event sharing the
        // opplevelse's venue), so no two pins sit on each other.
        meetingPoint: {
          name: venue?.name ?? e.title,
          address: venue?.address ?? "",
          coord: [at[0], at[1] + (sharesVenue ? -0.0004 : 0.0004)],
        },
        itinerary: e.steps.map(([title, text, photo]) => ({
          title,
          text,
          photo: libImage(photo),
        })),
      };
      if (event) {
        const a = e as ArrangementSeed;
        exp.format = "event";
        exp.days = a.days;
        const org = venueId(a.organizer);
        if (org) exp.organizerPlaceId = org;
      }
      out.experiences.push(exp);
      out.attendees[id] = [
        {
          id: `a-${id}-host`,
          name: hostName,
          initials: initialsOf(hostName),
          isHost: true,
        },
      ];
      e.reviews.forEach(([author, area, rating, when, text], i) =>
        out.experienceReviews.push({
          id: `er-${id}-${i + 1}`,
          experienceId: id,
          author,
          area,
          rating,
          when,
          text,
        }),
      );
      chatFrom(
        {
          id: `c-${id}`,
          name: e.title,
          type: "experience",
          access: ACCESS_TO_CHAT[access],
          pinnedExperienceId: id,
        },
        e.chat,
        out,
      );
    };

    if (seed.opplevelse) addExperience(seed.opplevelse, `e-${slug}`, false);
    if (seed.arrangement)
      addExperience(seed.arrangement, `e-${slug}-arr`, true);

    if (seed.gruppe) {
      const g = seed.gruppe;
      const id = `g-${slug}`;
      const chatId = `c-${id}`;
      out.groups.push({
        id,
        name: g.name,
        about: g.about,
        memberCount: g.memberCount,
        members: ctx.namesFor(id, 5).map(initialsOf),
        cover: g.photos[0]!,
        photos: g.photos,
        rules: g.rules,
        interestId: slug,
        interests: [slug, ...(g.alsoInterests ?? [])],
        ...(venueId(g.home) ? { homePlaceId: venueId(g.home) } : {}),
        chatId,
      });
      chatFrom(
        {
          id: chatId,
          name: g.name,
          type: "user_created",
          access: g.access,
          // The group's chat: its members are the group's.
          members: g.memberCount,
        },
        g.chat,
        out,
      );
    }
  }
  return out;
}
