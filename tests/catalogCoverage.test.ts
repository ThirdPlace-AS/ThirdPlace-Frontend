// Phase 19 (founder 2026-11-08): every interest gets a Bedrift, an
// Organisasjon, a Byrom, an Opplevelse, an Arrangement and a Gruppe with full
// data. Checks the seeded interests (legacy items count where they fit);
// the last content batch turns this into "all 84".
import fs from "fs";
import path from "path";

import { describe, expect, it } from "@jest/globals";

import { SEEDS } from "@/fixtures/catalog/seeds";
import { interestById } from "@/fixtures/catalog/interests";
import {
  areaFor,
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

describe("every seeded interest has the full set", () => {
  it.each(seeded.map((i) => [i]))("%s", (interest) => {
    expect(interestById(interest)).toBeDefined();
    for (const kind of ["bedrift", "organisasjon", "byrom"] as const)
      expect(
        places.filter((p) => p.interestId === interest && p.kind === kind),
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
    const pins = [
      ...places.map((p) => p.coord),
      ...experiences.map((e) => e.meetingPoint.coord),
    ];
    for (let i = 0; i < pins.length; i++)
      for (let j = i + 1; j < pins.length; j++)
        expect(distanceMeters(pins[i]!, pins[j]!)).toBeGreaterThan(15);
  });

  it("spreads each interest over at least three towns", () => {
    for (const s of SEEDS) {
      const towns = new Set(
        (["bedrift", "organisasjon", "byrom"] as const)
          .map((k) => s[k]?.town)
          .filter(Boolean),
      );
      expect(towns.size).toBeGreaterThanOrEqual(3);
    }
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
