// Phase 12 H4c: whole places, experiences and groups are pages; short
// sub-views stay sheets; a page opened cold from a deep link goes back to the
// map instead of doing nothing; following is shared between the list and the
// person page.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { routeFor } from "@/lib/entityRoutes";
import { resetFollowing, toggleFollow, useFollowing } from "@/lib/following";
import { goBackOr } from "@/lib/navigation";

const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockCanGoBack = true;
jest.mock("expo-router", () => ({
  router: {
    back: () => mockBack(),
    replace: (h: unknown) => mockReplace(h),
    canGoBack: () => mockCanGoBack,
  },
}));

describe("routeFor", () => {
  it("routes whole entities and all reviews", () => {
    expect(routeFor({ kind: "experience", id: "e1" })).toBe("/experience/e1");
    expect(routeFor({ kind: "place", id: "p1" })).toBe("/place/p1");
    expect(routeFor({ kind: "group", id: "g1" })).toBe("/group/g1");
    expect(routeFor({ kind: "reviews", id: "p1" })).toBe("/place/p1/reviews");
  });

  it("keeps short sub-views in a sheet", () => {
    for (const kind of [
      "attendees",
      "checkin",
      "host",
      "business",
      "verification",
    ] as const) {
      expect(routeFor({ kind, id: "x" })).toBeNull();
    }
  });
});

describe("goBackOr", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  it("goes back when there is history", () => {
    mockCanGoBack = true;
    goBackOr("/map");
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("goes to the fallback from a cold deep link", () => {
    mockCanGoBack = false;
    goBackOr("/map");
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/map");
  });
});

describe("following store", () => {
  it("is shared between hooks and toggles", () => {
    const a = renderHook(() => useFollowing());
    const b = renderHook(() => useFollowing());
    act(() => toggleFollow("u1"));
    expect(a.result.current.has("u1")).toBe(true);
    expect(b.result.current.has("u1")).toBe(true);
    act(() => toggleFollow("u1"));
    expect(b.result.current.has("u1")).toBe(false);
    act(() => toggleFollow("u2"));
    act(() => resetFollowing());
    expect(a.result.current.size).toBe(0);
  });
});
