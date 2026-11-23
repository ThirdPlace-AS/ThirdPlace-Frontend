import { afterEach, describe, expect, it } from "@jest/globals";

import {
  forgetSignInReturn,
  rememberSignInReturn,
  returnHrefFor,
  setCurrentRoute,
  setMapTarget,
  takeSignInReturn,
} from "@/lib/signInReturn";

// Founder 2026-11-19 Q1: sign-in returns the guest to the same spot.
describe("returnHrefFor", () => {
  it("keeps a page, without repeating its dynamic segment", () => {
    expect(returnHrefFor("/experience/e1", { id: "e1" }, null)).toBe(
      "/experience/e1",
    );
  });

  it("keeps the other search params", () => {
    expect(returnHrefFor("/settings/support", { about: "e1 2" }, null)).toBe(
      "/settings/support?about=e1%202",
    );
  });

  it("reopens the map's open place or experience", () => {
    expect(
      returnHrefFor(
        "/map",
        { focus: "old", at: "1" },
        { kind: "place", id: "p1" },
        7,
      ),
    ).toBe("/map?focus=place:p1&at=7");
  });

  it("goes to the plain map for other details or none", () => {
    expect(returnHrefFor("/map", {}, { kind: "group", id: "g1" })).toBe("/map");
    expect(returnHrefFor("/map", { q: "kaffe" }, null)).toBe("/map");
  });

  it("never returns to a sign-in step or system screen", () => {
    for (const p of [
      "/login",
      "/register",
      "/verify-code",
      "/onboarding",
      "/welcome",
      "/state/offline",
    ])
      expect(returnHrefFor(p, {}, null)).toBe("/map");
  });
});

describe("remember / take", () => {
  afterEach(() => {
    forgetSignInReturn();
    setMapTarget(null);
  });

  it("returns the remembered spot once, then the map", () => {
    setCurrentRoute("/people/u1", { id: "u1" });
    rememberSignInReturn();
    expect(takeSignInReturn()).toBe("/people/u1");
    expect(takeSignInReturn()).toBe("/map");
  });

  it("takes an explicit spot over the screen in front", () => {
    setCurrentRoute("/swipe", {});
    rememberSignInReturn("/group/g1");
    expect(takeSignInReturn()).toBe("/group/g1");
  });

  it("forgets on logout or Fortsett som gjest", () => {
    setCurrentRoute("/saved", {});
    rememberSignInReturn();
    forgetSignInReturn();
    expect(takeSignInReturn()).toBe("/map");
  });
});
