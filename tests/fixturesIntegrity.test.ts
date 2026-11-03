import { describe, expect, it } from "@jest/globals";

import {
  PLACE_CATEGORIES,
  chats,
  experienceById,
  messagesForChat,
  people,
  placeById,
  profile,
} from "@/fixtures";
import {
  LIBRARY,
  coverForPlaceCategory,
  libImage,
  type LibraryKey,
} from "@/fixtures/images";

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
