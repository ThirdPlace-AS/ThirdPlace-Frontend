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
} from "@/fixtures";
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

  it("every person.hostsExperienceId resolves to an experience", () => {
    for (const p of people) {
      if (p.hostsExperienceId) {
        expect(experienceById(p.hostsExperienceId)).toBeDefined();
      }
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

  it("every business shows its place's photos (at least two)", () => {
    for (const b of businesses) {
      const photos = photosForItem({ kind: "business", id: b.id });
      expect(distinct(photos)).toBeGreaterThanOrEqual(2);
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
