// Phase 19 S1a: what every place is (Bedrift / Organisasjon / Byrom) and
// the record behind it, interests on places, experiences and groups, the
// lookup indexes (they must agree with a plain scan and follow Legg til),
// made-up names for larger crowds, and an Arrangement's sessions.
import { afterEach, describe, expect, it } from "@jest/globals";

import { interestById } from "@/fixtures/catalog/interests";
import {
  attendeesForExperience,
  businessForPlace,
  chatById,
  chatForExperience,
  chatForPlace,
  chats,
  experienceById,
  experienceReviews,
  experiences,
  experiencesForGroup,
  experiencesForPlace,
  experiencesHostedBy,
  generatedNames,
  groupById,
  groupMemberNames,
  groups,
  organizationById,
  organizationForPlace,
  organizations,
  people,
  personById,
  placeById,
  placeRating,
  places,
  ratingOf,
  reviews,
  reviewsForExperience,
  reviewsForPlace,
  sessionsFor,
  type MockExperience,
} from "@/fixtures";
import {
  createExperience,
  createGroup,
  resetCreated,
} from "@/fixtures/created";

afterEach(() => resetCreated());

describe("place kinds", () => {
  it("every place has a kind, an interest and exactly its own record", () => {
    for (const p of places) {
      expect(interestById(p.interestId)).toBeDefined();
      const business = businessForPlace(p.id);
      const org = organizationForPlace(p.id);
      expect(!!business).toBe(p.kind === "bedrift");
      expect(!!org).toBe(p.kind === "organisasjon");
      expect(!!p.space).toBe(p.kind === "byrom");
    }
  });

  it("every organisation has a place and a contact person", () => {
    for (const o of organizations) {
      expect(placeById(o.placeId)?.kind).toBe("organisasjon");
      expect(personById(o.contactPersonId)).toBeDefined();
      expect(organizationById(o.id)).toBe(o);
    }
  });

  it("names no real institution (p11 became a fictional gallery)", () => {
    for (const p of places) expect(p.name).not.toMatch(/Munch/);
    expect(placeById("p11")?.name).toBe("Galleri Kveldslys");
  });

  it("experiences and groups carry catalogue interests", () => {
    for (const e of experiences)
      expect(interestById(e.interestId)).toBeDefined();
    for (const g of groups) {
      expect(interestById(g.interestId)).toBeDefined();
      expect(g.interests[0]).toBe(g.interestId);
      expect(placeById(g.homePlaceId)).toBeDefined();
    }
  });
});

describe("lookup indexes", () => {
  it("agree with a plain scan of the lists", () => {
    for (const p of places) {
      expect(placeById(p.id)).toBe(p);
      expect(reviewsForPlace(p.id)).toEqual(
        reviews.filter((r) => r.placeId === p.id),
      );
      expect(placeRating(p.id)).toEqual(
        ratingOf(reviews.filter((r) => r.placeId === p.id)),
      );
      expect(experiencesForPlace(p.id)).toEqual(
        experiences.filter((e) => e.placeId === p.id),
      );
      expect(chatForPlace(p.id)).toBe(
        chats.find((c) => c.placeId === p.id && c.status === "active"),
      );
    }
    for (const e of experiences) {
      expect(experienceById(e.id)).toBe(e);
      expect(reviewsForExperience(e.id)).toEqual(
        experienceReviews.filter((r) => r.experienceId === e.id),
      );
      expect(chatForExperience(e.id)).toBe(
        chats.find(
          (c) => c.pinnedExperienceId === e.id && c.status === "active",
        ),
      );
    }
    for (const c of chats) expect(chatById(c.id)).toBe(c);
    for (const g of groups) {
      expect(groupById(g.id)).toBe(g);
      expect(experiencesForGroup(g.id)).toEqual(
        experiences.filter((e) => e.groupId === g.id),
      );
    }
    for (const u of people) {
      expect(personById(u.id)).toBe(u);
      expect(experiencesHostedBy(u.id)).toEqual(
        experiences.filter((e) => e.hostId === u.id),
      );
    }
  });

  it("hand out copies, so a caller can't change the next answer", () => {
    const first = reviewsForPlace("p1");
    first.pop();
    expect(reviewsForPlace("p1")).toHaveLength(first.length + 1);
  });

  it("find what Legg til creates and forget it after a reset", () => {
    const { groupId, chatId } = createGroup({
      name: "Klatregjengen",
      about: "",
      interests: ["Klatring"],
      area: "Grünerløkka",
      photos: ["group-climb", "venue-outdoor"],
      access: "open",
    });
    const expId = createExperience({
      title: "Buldring for nye",
      about: "Vi prøver oss på veggen.",
      category: "Sport & trening",
      area: places[0]!.name,
      meetingPoint: "",
      photos: experiences[0]!.photos,
      date: "2026-11-20",
      startTime: "18:00",
      duration: "2 timer",
      repeat: "Ukentlig",
      capacity: 6,
      priceNok: 0,
      access: "Alle",
      cancellation: "Gratis frem til 24 t før",
      vibes: ["Koselig"],
      energy: null,
      languages: ["Norsk"],
      included: [],
      steps: ["Vi møtes", "", "Vi klatrer"],
    });
    expect(groupById(groupId)?.name).toBe("Klatregjengen");
    expect(chatById(chatId)).toBeDefined();
    expect(experienceById(expId)?.title).toBe("Buldring for nye");
    expect(chatForExperience(expId)?.pinnedExperienceId).toBe(expId);
    resetCreated();
    expect(groupById(groupId)).toBeUndefined();
    expect(chatById(chatId)).toBeUndefined();
    expect(experienceById(expId)).toBeUndefined();
  });
});

describe("made-up names", () => {
  it("are unique, repeatable and never someone in people", () => {
    const a = generatedNames("e-test", 40);
    expect(a).toHaveLength(40);
    expect(new Set(a).size).toBe(40);
    expect(generatedNames("e-test", 40)).toEqual(a);
    expect(generatedNames("e-other", 40)).not.toEqual(a);
    const real = new Set(people.map((p) => p.name));
    for (const n of a) expect(real.has(n)).toBe(false);
    expect(generatedNames("x", 5, new Set([a[0]!]))).not.toContain(a[0]);
  });

  it("fill each attendee list to `going`, the hand-written rows first", () => {
    for (const e of experiences) {
      const list = attendeesForExperience(e.id);
      expect(list).toHaveLength(e.going);
      expect(new Set(list.map((x) => x.name)).size).toBe(list.length);
    }
    expect(attendeesForExperience("e1")[0]?.name).toBe("Maria Movik");
  });

  it("give a group as many names as it has members", () => {
    for (const g of groups) {
      const names = groupMemberNames(g);
      expect(names).toHaveLength(g.memberCount);
      expect(new Set(names).size).toBe(names.length);
    }
  });
});

describe("an Arrangement's sessions", () => {
  const base = experiences[0]!;
  const now = new Date(2026, 10, 6, 10, 0); // Fri 6 Nov 2026 10:00
  const event = (days?: number): MockExperience => ({
    ...base,
    id: "e-test-arr",
    when: "Lør 12:00",
    repeat: "Gjentas ikke",
    format: "event",
    days,
  });

  it("is one session per day, days in a row from `when`", () => {
    const list = sessionsFor(event(3), now);
    expect(list).toHaveLength(3);
    expect(list.map((s) => s.start.getDate())).toEqual([7, 8, 9]);
    for (const s of list) expect(s.start.getHours()).toBe(12);
  });

  it("is a single day when `days` is not set", () => {
    expect(sessionsFor(event(), now)).toHaveLength(1);
  });

  it("leaves recurring experiences as they were", () => {
    expect(sessionsFor(base, now)).toHaveLength(4);
  });
});
