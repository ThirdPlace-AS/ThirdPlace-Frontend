// Phase 19 (founder 2026-11-08): every interest gets a Bedrift, an
// Organisasjon, a Byrom, an Opplevelse, an Arrangement and a Gruppe with full
// data. Checks the seeded interests (legacy items count where they fit);
// the last content batch turns this into "all 84".
import fs from "fs";
import path from "path";

import { describe, expect, it } from "@jest/globals";

import { RESTAURANTS } from "@/fixtures/catalog/restaurants";
import { SEEDS } from "@/fixtures/catalog/seeds";
import { INTERESTS, interestById } from "@/fixtures/catalog/interests";
import { menuForPlace, servesFoodOrDrink } from "@/fixtures/menus";
import {
  areaFor,
  businessForPlace,
  chatById,
  chatForExperience,
  chatForPlace,
  chats,
  experiences,
  experiencesForGroup,
  groups,
  inCoverage,
  messagesForChat,
  placeById,
  places,
  reviewsForExperience,
  reviewsForPlace,
  sessionsFor,
} from "@/fixtures";
import { LIBRARY, photosForPlace } from "@/fixtures/images";
import { distanceMeters } from "@/lib/distance";

const seeded = SEEDS.map((s) => s.interest);
const CREDITS = fs.readFileSync(
  path.join(__dirname, "..", "assets", "library", "CREDITS.md"),
  "utf8",
);
const LAND: Record<string, string> = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "src", "fixtures", "catalog", "land-check.json"),
    "utf8",
  ),
);
const landKey = ([lng, lat]: [number, number]) =>
  `${lng.toFixed(5)},${lat.toFixed(5)}`;

const isCatalogue = (id: string) => /^[pebgoc]-/.test(id);
// Restaurants (0374, user 2026-11-10) are Bedrift places on top of each
// interest's own set of six; the set itself stays exactly one of each kind.
const isRestaurant = (id: string) => id.startsWith("p-rest-");
const catPlaces = places.filter((p) => isCatalogue(p.id));
const catExperiences = experiences.filter((e) => isCatalogue(e.id));
const catGroups = groups.filter((g) => isCatalogue(g.id));

// Real institutions an indoor place, club or event must not be named after.
const REAL_NAMES = [
  "Munch",
  "Nationaltheatret",
  "Deichman",
  "DNT",
  "Turistforening",
  "Litteraturhuset",
  "Cinemateket",
  "Rockefeller",
  "Klatreverket",
  "Operaen",
];

describe("every interest has the full set", () => {
  it("covers all 84 interests in the catalogue", () => {
    expect(INTERESTS).toHaveLength(84);
    expect([...new Set(seeded)].sort()).toEqual(
      INTERESTS.map((i) => i.id).sort(),
    );
  });

  it.each(seeded.map((i) => [i]))("%s", (interest) => {
    expect(interestById(interest)).toBeDefined();
    for (const kind of ["bedrift", "organisasjon", "byrom"] as const)
      expect(
        places.filter(
          (p) =>
            p.interestId === interest && p.kind === kind && !isRestaurant(p.id),
        ),
      ).toHaveLength(1);
    const own = experiences.filter((e) => e.interestId === interest);
    expect(own.filter((e) => e.format !== "event")).toHaveLength(1);
    expect(own.filter((e) => e.format === "event")).toHaveLength(1);
    expect(groups.filter((g) => g.interestId === interest)).toHaveLength(1);
  });
});

describe("catalogue items carry full data", () => {
  it.each(catPlaces.map((p) => [p.id, p] as const))("place %s", (_id, p) => {
    const photos = photosForPlace(p);
    expect(new Set(photos).size).toBeGreaterThanOrEqual(2);
    for (const k of photos) expect(LIBRARY[k]).toBeDefined();
    expect(reviewsForPlace(p.id).length).toBeGreaterThanOrEqual(2);
    const chat = chatForPlace(p.id);
    expect(chat?.member).toBe(false);
    expect(messagesForChat(chat!.id).length).toBeGreaterThanOrEqual(2);
    expect(p.address && p.hours && p.about && p.blurb).toBeTruthy();
    expect(p.accessibility.length).toBeGreaterThanOrEqual(1);
    expect(p.types.length).toBeGreaterThanOrEqual(1);
    if (p.kind === "byrom")
      expect(p.space!.facilities.length).toBeGreaterThanOrEqual(1);
    expect(inCoverage(p.coord)).toBe(true);
    expect(LAND[landKey(p.coord)]).toBe("land");
  });

  it.each(catExperiences.map((e) => [e.id, e] as const))(
    "experience %s",
    (_id, e) => {
      expect(new Set(e.photos).size).toBeGreaterThanOrEqual(2);
      expect(e.itinerary.length).toBeGreaterThanOrEqual(3);
      expect(reviewsForExperience(e.id).length).toBeGreaterThanOrEqual(3);
      const chat = chatForExperience(e.id);
      expect(chat?.member).toBe(false);
      expect(messagesForChat(chat!.id).length).toBeGreaterThanOrEqual(2);
      expect(placeById(e.placeId)).toBeDefined();
      expect(e.going).toBeLessThanOrEqual(Math.min(40, e.capacity));
      expect(inCoverage(e.meetingPoint.coord)).toBe(true);
      expect(LAND[landKey(e.meetingPoint.coord)]).toBe("land");
    },
  );

  it.each(catGroups.map((g) => [g.id, g] as const))("group %s", (_id, g) => {
    expect(new Set(g.photos).size).toBeGreaterThanOrEqual(2);
    expect(g.photos[0]).toBe(g.cover);
    expect(g.rules).toBeTruthy();
    expect(g.memberCount).toBeGreaterThan(g.members.length);
    expect(placeById(g.homePlaceId)).toBeDefined();
    const chat = chatById(g.chatId!);
    expect(chat?.member).toBe(false);
    expect(messagesForChat(chat!.id).length).toBeGreaterThanOrEqual(2);
    // "Neste møte" has something to show.
    expect(experiencesForGroup(g.id).length).toBeGreaterThanOrEqual(1);
  });
});

describe("restaurants (user 2026-11-10, 0374)", () => {
  it("are eight Bedrift places for food interests, each with its business and menu", () => {
    expect(RESTAURANTS).toHaveLength(8);
    for (const r of RESTAURANTS) {
      const p = placeById(`p-rest-${r.key}`);
      expect(p).toBeDefined();
      expect(p!.kind).toBe("bedrift");
      expect(interestById(p!.interestId)?.category).toBe("mat");
      expect(servesFoodOrDrink(p!)).toBe(true);
      expect(businessForPlace(p!.id)?.id).toBe(`b-rest-${r.key}`);
      expect(menuForPlace(p!.id)).toBeDefined();
    }
    // On top of each interest's own set: the full-data checks above cover
    // them like every catalogue place.
    expect(catPlaces.filter((p) => isRestaurant(p.id))).toHaveLength(8);
  });

  it("are spread over eight towns in Oslo and Akershus", () => {
    expect(new Set(RESTAURANTS.map((r) => r.town)).size).toBe(8);
  });
});

describe("the catalogue's shape", () => {
  it("has unique ASCII ids and unique names", () => {
    for (const list of [catPlaces, catExperiences, catGroups])
      for (const x of list) expect(x.id).toMatch(/^[a-z0-9-]+$/);
    const unique = (xs: string[]) => new Set(xs).size === xs.length;
    expect(unique(places.map((p) => p.id))).toBe(true);
    expect(unique(experiences.map((e) => e.id))).toBe(true);
    expect(unique(places.map((p) => p.name))).toBe(true);
    expect(unique(experiences.map((e) => e.title))).toBe(true);
    expect(unique(groups.map((g) => g.name))).toBe(true);
    expect(unique(chats.map((c) => c.id))).toBe(true);
  });

  it("names no real institution for indoor places, clubs or events", () => {
    const names = [
      ...catPlaces.filter((p) => p.kind !== "byrom").map((p) => p.name),
      ...catExperiences.map((e) => e.title),
    ];
    for (const n of names)
      for (const real of REAL_NAMES) expect(n).not.toContain(real);
  });

  it("puts each seed place in its named town and keeps pins apart", () => {
    for (const s of SEEDS)
      for (const kind of ["bedrift", "organisasjon", "byrom"] as const) {
        const p = s[kind];
        if (p) expect(areaFor(p.coord).name).toBe(p.town);
      }
    for (const r of RESTAURANTS) expect(areaFor(r.coord).name).toBe(r.town);
    const pins = [
      ...places.map((p) => p.coord),
      ...experiences.map((e) => e.meetingPoint.coord),
    ];
    for (let i = 0; i < pins.length; i++)
      for (let j = i + 1; j < pins.length; j++)
        expect(distanceMeters(pins[i]!, pins[j]!)).toBeGreaterThan(15);
  });

  it("spreads each interest over at least three towns", () => {
    // All of the interest's places, a legacy one included (Kaffe's p1,
    // Yoga's p9, Velvære's p14), so a seed with two places still counts three.
    for (const s of SEEDS) {
      const towns = new Set(
        places
          .filter((p) => p.interestId === s.interest)
          .map((p) => areaFor(p.coord).name),
      );
      expect(towns.size).toBeGreaterThanOrEqual(3);
    }
  });

  it("never books a host in two places at once", () => {
    // Every weekday as "today": legacy times like "I morgen 19:00" move with
    // the date. Weekly experiences give four sessions, events one per day.
    const clashes = new Set<string>();
    for (let d = 0; d < 7; d++) {
      const now = new Date(2026, 10, 9 + d, 8, 0);
      const byHost = new Map<string, { id: string; s: number; e: number }[]>();
      for (const x of experiences) {
        if (!x.hostId) continue;
        const list = byHost.get(x.hostId) ?? [];
        for (const s of sessionsFor(x, now))
          list.push({ id: x.id, s: s.start.getTime(), e: s.end.getTime() });
        byHost.set(x.hostId, list);
      }
      for (const [host, list] of byHost)
        for (let i = 0; i < list.length; i++)
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i]!;
            const b = list[j]!;
            if (a.id !== b.id && a.s < b.e && b.s < a.e)
              clashes.add(`${host}: ${a.id} / ${b.id}`);
          }
    }
    expect([...clashes]).toEqual([]);
  });

  it("credits every new photo", () => {
    const keys = new Set<string>();
    for (const p of catPlaces) photosForPlace(p).forEach((k) => keys.add(k));
    for (const g of catGroups) g.photos.forEach((k) => keys.add(k));
    for (const s of SEEDS) {
      for (const e of [s.opplevelse, s.arrangement])
        e?.photos.forEach((k) => keys.add(k));
    }
    for (const k of keys)
      if (seeded.some((i) => k.startsWith(`${i}-`)))
        expect(CREDITS).toContain(`${k}.webp`);
  });
});

describe("catalogue copy", () => {
  const texts: string[] = [];
  for (const s of SEEDS) {
    for (const k of ["bedrift", "organisasjon", "byrom"] as const) {
      const p = s[k];
      if (!p) continue;
      texts.push(p.about, p.blurb, ...p.reviews.map((r) => r[3]));
      texts.push(...p.chat.map((c) => c[1]));
    }
    for (const e of [s.opplevelse, s.arrangement]) {
      if (!e) continue;
      texts.push(e.about, ...e.reviews.map((r) => r[4]));
      texts.push(...e.steps.map((st) => st[1]), ...e.chat.map((c) => c[1]));
    }
    if (s.gruppe)
      texts.push(
        s.gruppe.about,
        s.gruppe.rules,
        ...s.gruppe.chat.map((c) => c[1]),
      );
  }

  it("reads like people wrote it: no dash constructions, hype or rules", () => {
    const banned = [
      / — /,
      /sømløs/i,
      /skreddersydd/i,
      /spennende reise/i,
      /magisk/i,
      /uendelige muligheter/i,
      /medlemskap koster/i,
      /refusjon/i,
      /pengene tilbake/i,
      /garantert/i,
    ];
    for (const t of texts) for (const b of banned) expect(t).not.toMatch(b);
  });

  it("never repeats a review or about text", () => {
    const reviews = texts.filter((t) => t.length > 40);
    expect(new Set(reviews).size).toBe(reviews.length);
  });
});
