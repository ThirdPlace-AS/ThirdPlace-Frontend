// Phase 12 H4a: review sorting/search on the all-reviews page.
import { describe, expect, it } from "@jest/globals";

import { ratingTitle } from "@/components/reviews/ReviewsSection";
import {
  ageInDays,
  matchesReview,
  sortReviews,
} from "@/components/reviews/reviewSort";
import { reviewsForExperience } from "@/fixtures";

describe("review age and sorting", () => {
  it("reads the relative ages the fixtures use", () => {
    expect(ageInDays("I dag")).toBe(0);
    expect(ageInDays("3 dager siden")).toBe(3);
    expect(ageInDays("1 uke siden")).toBe(7);
    expect(ageInDays("2 uker siden")).toBe(14);
    expect(ageInDays("1 måned siden")).toBe(30);
    expect(ageInDays("2 måneder siden")).toBe(60);
    expect(ageInDays("snart")).toBe(Number.POSITIVE_INFINITY);
  });

  it("sorts newest, highest and lowest", () => {
    const list = reviewsForExperience("e1");
    const newest = sortReviews(list, "newest").map((r) => ageInDays(r.when));
    expect([...newest].sort((a, b) => a - b)).toEqual(newest);
    const high = sortReviews(list, "highest").map((r) => r.rating);
    expect([...high].sort((a, b) => b - a)).toEqual(high);
    const low = sortReviews(list, "lowest").map((r) => r.rating);
    expect([...low].sort((a, b) => a - b)).toEqual(low);
  });

  it("searches text and author", () => {
    const r = { author: "Kari N.", text: "Fin start på dagen." };
    expect(matchesReview(r, "")).toBe(true);
    expect(matchesReview(r, "START")).toBe(true);
    expect(matchesReview(r, "kari")).toBe(true);
    expect(matchesReview(r, "regn")).toBe(false);
  });

  it("titles the section from the list", () => {
    expect(ratingTitle([])).toBe("Ingen vurderinger ennå");
    expect(
      ratingTitle([
        { id: "a", author: "A", rating: 5, when: "1 uke siden", text: "" },
        { id: "b", author: "B", rating: 4, when: "1 uke siden", text: "" },
      ]),
    ).toBe("★ 4,5 · 2 vurderinger");
  });
});
