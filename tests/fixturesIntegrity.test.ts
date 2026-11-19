import { describe, expect, it } from "@jest/globals";

import {
  PLACE_CATEGORIES,
  businesses,
  chats,
  experienceById,
  experiences,
  groups,
  listings,
  messagesForChat,
  people,
  placeById,
  places,
  profile,
  CANCELLATION_OPTIONS,
  DURATION_OPTIONS,
  ENERGY_LEVELS,
  EXPERIENCE_ACCESS,
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_LANGUAGES,
  EXPERIENCE_VIBES,
  REPEAT_OPTIONS,
  attendeesForExperience,
  chatForExperience,
  chatForPlace,
  firstSessionStart,
  ratingOf,
  reviewsForExperience,
  reviewsForPlace,
  sessionsFor,
} from "@/fixtures";
import { hostPerson } from "@/components/experience/experienceMeta";
import {
  LIBRARY,
  coverForPlace,
  coverForPlaceCategory,
  libImage,
  photosForPlace,
  type LibraryKey,
} from "@/fixtures/images";
import { photosForItem } from "@/components/map/services/itemCover";

// Referential integrity for the demo fixtures. These IDs are wired by hand, so a
// rename that breaks a reference should fail here, not render an empty sheet.
describe("fixtures referential integrity", () => {
  it("every chat.pinnedExperienceId resolves to an experience", () => {
    for (const c of chats) {
      if (c.pinnedExperienceId) {
        expect(experienceById(c.pinnedExperienceId)).toBeDefined();
      }
    }
  });

  it("every profile.visited.placeId resolves to a place", () => {
    for (const v of profile.visited) {
      expect(placeById(v.placeId)).toBeDefined();
    }
  });

  it("every experience names a host who is in people (hostId)", () => {
    for (const e of experiences) {
      expect(people.some((p) => p.id === e.hostId)).toBe(true);
      expect(experienceById(e.id)).toBe(e);
    }
  });

  it("every chat has at least one message", () => {
    for (const c of chats) {
      expect(messagesForChat(c.id).length).toBeGreaterThan(0);
    }
  });

  it("profile.avatar + every person.avatar is a real library key", () => {
    expect(LIBRARY[profile.avatar]).toBeDefined();
    for (const p of people) {
      expect(libImage(p.avatar)).toBeDefined();
    }
  });
});

describe("coverForPlaceCategory", () => {
  const realCategories = PLACE_CATEGORIES.filter((c) => c !== "Alle");

  it("maps every real place category to a real library key", () => {
    for (const cat of realCategories) {
      const key = coverForPlaceCategory(cat) as LibraryKey;
      expect(LIBRARY[key]).toBeDefined();
    }
  });

  it("maps the known categories to distinct, intentional covers (no default fallback)", () => {
    const map = Object.fromEntries(
      realCategories.map((c) => [c, coverForPlaceCategory(c)]),
    );
    expect(map["Kafé"]).toBe("venue-cafe");
    expect(map["Bokcafé"]).toBe("venue-books");
    expect(map["Vinbar"]).toBe("venue-bar");
    expect(map["Verksted"]).toBe("venue-workshop");
  });
});

describe("coverForPlace", () => {
  it("gives every place a real library cover", () => {
    for (const p of places) {
      expect(LIBRARY[coverForPlace(p)]).toBeDefined();
    }
  });

  it("does not collapse same-category places onto one photo", () => {
    const covers = new Set(places.map((p) => coverForPlace(p)));
    expect(covers.size).toBeGreaterThan(places.length / 2);
  });
});

// Founder request 2026-11-06: every place, business, group, experience and
// listing shows at least two distinct photos.
describe("photo galleries", () => {
  const distinct = (xs: readonly unknown[]) => new Set(xs).size;

  it("every place has at least two distinct library photos", () => {
    for (const p of places) {
      const keys = photosForPlace(p);
      expect(distinct(keys)).toBeGreaterThanOrEqual(2);
      for (const k of keys) expect(LIBRARY[k]).toBeDefined();
    }
  });

  // A business has one profile, its place's page (user 2026-11-10), so its
  // photos are its place's (checked above).
  it("every business runs a Bedrift place", () => {
    for (const b of businesses) {
      expect(placeById(b.placeId)?.kind).toBe("bedrift");
    }
  });

  it("every group, experience and listing has at least two distinct photos", () => {
    for (const g of groups) {
      expect(distinct(g.photos)).toBeGreaterThanOrEqual(2);
      expect(g.photos[0]).toBe(g.cover);
    }
    for (const e of experiences) {
      expect(distinct(e.photos)).toBeGreaterThanOrEqual(2);
    }
    for (const l of listings) {
      expect(distinct(l.photos)).toBeGreaterThanOrEqual(2);
      expect(l.photos[0]).toBe(l.cover);
    }
  });

  it("map items of every kind carry their full gallery", () => {
    for (const p of places) {
      expect(
        photosForItem({ kind: "place", id: p.id }).length,
      ).toBeGreaterThanOrEqual(2);
    }
    for (const g of groups) {
      expect(
        photosForItem({ kind: "group", id: g.id }).length,
      ).toBeGreaterThanOrEqual(2);
    }
  });
});

// ── Phase 12 H2: every experience and place carries all its data ──────────

describe("experiences carry everything a creator enters", () => {
  it.each(experiences.map((e) => [e.id, e] as const))("%s", (_id, e) => {
    expect(EXPERIENCE_CATEGORIES).toContain(e.category);
    expect(DURATION_OPTIONS).toContain(e.duration);
    expect(e.durationMin).toBeGreaterThan(0);
    expect(e.languages.length).toBeGreaterThan(0);
    for (const l of e.languages) expect(EXPERIENCE_LANGUAGES).toContain(l);
    expect(e.included.length).toBeGreaterThan(0);
    expect(e.vibes.length).toBeGreaterThan(0);
    for (const v of e.vibes) expect(EXPERIENCE_VIBES).toContain(v);
    expect(ENERGY_LEVELS).toContain(e.energy);
    expect(EXPERIENCE_ACCESS).toContain(e.access);
    expect(CANCELLATION_OPTIONS).toContain(e.cancellation);
    expect(REPEAT_OPTIONS).toContain(e.repeat);
    expect(e.photos.length).toBeGreaterThanOrEqual(2);
    expect(e.itinerary.length).toBeGreaterThanOrEqual(3);
    for (const s of e.itinerary) {
      expect(s.title).not.toBe("");
      expect(s.text).not.toBe("");
      expect(s.photo).toBeDefined();
    }
    expect(e.meetingPoint.name).not.toBe("");
    expect(e.meetingPoint.address).not.toBe("");
    expect(reviewsForExperience(e.id).length).toBeGreaterThanOrEqual(3);
    expect(chatForExperience(e.id)).toBeDefined();
    const host = hostPerson(e);
    expect(host).toBeDefined();
    expect(LIBRARY[host!.avatar]).toBeDefined();
    // Deltakere shows exactly as many people as are going.
    expect(attendeesForExperience(e.id)).toHaveLength(e.going);
    if (e.placeId) expect(placeById(e.placeId)).toBeDefined();
  });

  it("meeting points never sit on top of a place pin", () => {
    for (const e of experiences)
      for (const p of places) expect(e.meetingPoint.coord).not.toEqual(p.coord);
  });

  it("the rating line is derived from the review list", () => {
    const list = reviewsForExperience("e1");
    const { score, count } = ratingOf(list);
    expect(count).toBe(list.length);
    expect(score).toBeCloseTo(
      list.reduce((s, r) => s + r.rating, 0) / list.length,
    );
  });
});

describe("sessions follow the experience's when and repeat", () => {
  // Friday 6 November 2026, 10:00 local time.
  const now = new Date(2026, 10, 6, 10, 0, 0);

  it("resolves weekday, today and tomorrow labels", () => {
    expect(firstSessionStart("Ons 09:00", now)).toEqual(
      new Date(2026, 10, 11, 9, 0, 0),
    );
    expect(firstSessionStart("I dag 11:00", now)).toEqual(
      new Date(2026, 10, 6, 11, 0, 0),
    );
    expect(firstSessionStart("I morgen 19:00", now)).toEqual(
      new Date(2026, 10, 7, 19, 0, 0),
    );
    // Same weekday, already passed → next week.
    expect(firstSessionStart("Fre 08:00", now)).toEqual(
      new Date(2026, 10, 13, 8, 0, 0),
    );
    expect(firstSessionStart("snart", now)).toBeNull();
  });

  it.each(
    experiences
      .filter((e) => e.format !== "event")
      .map((e) => [e.id, e] as const),
  )("%s has ≥ 4 upcoming sessions, the first one at its `when`", (_id, e) => {
    const list = sessionsFor(e, now);
    expect(list.length).toBeGreaterThanOrEqual(4);
    expect(list[0]!.start).toEqual(firstSessionStart(e.when, now));
    expect(list[0]!.spotsLeft).toBe(Math.max(0, e.capacity - e.going));
    const step = e.repeat === "Månedlig" ? 28 : 7;
    const days = (list[1]!.start.getTime() - list[0]!.start.getTime()) / 864e5;
    expect(Math.round(days)).toBe(step);
    for (const s of list) {
      expect(s.end.getTime() - s.start.getTime()).toBe(e.durationMin * 60_000);
      expect(s.spotsLeft).toBeLessThanOrEqual(e.capacity);
    }
  });
});

describe("an Arrangement runs once, one session per day", () => {
  const now = new Date(2026, 10, 6, 10, 0, 0);
  it.each(
    experiences
      .filter((e) => e.format === "event")
      .map((e) => [e.id, e] as const),
  )("%s", (_id, e) => {
    const list = sessionsFor(e, now);
    expect(e.repeat).toBe("Gjentas ikke");
    expect(list).toHaveLength(e.days ?? 1);
    expect(list[0]!.start).toEqual(firstSessionStart(e.when, now));
    list.forEach((s, i) => {
      if (i > 0)
        expect(
          Math.round(
            (s.start.getTime() - list[i - 1]!.start.getTime()) / 864e5,
          ),
        ).toBe(1);
      expect(s.end.getTime() - s.start.getTime()).toBe(e.durationMin * 60_000);
    });
    // Its organiser is a club or a business on the map.
    const org = placeById(e.organizerPlaceId);
    expect(["organisasjon", "bedrift"]).toContain(org?.kind);
    // The program covers every day.
    expect(e.itinerary.length).toBeGreaterThanOrEqual(3);
  });
});

describe("places carry everything the place page shows", () => {
  it.each(places.map((p) => [p.id, p] as const))("%s", (_id, p) => {
    expect(p.address).not.toBe("");
    expect(p.hours).not.toBe("");
    expect(p.about).not.toBe("");
    expect(p.accessibility.length).toBeGreaterThan(0);
    expect(photosForPlace(p).length).toBeGreaterThanOrEqual(2);
    expect(reviewsForPlace(p.id).length).toBeGreaterThanOrEqual(2);
    expect(chatForPlace(p.id)).toBeDefined();
  });
});
