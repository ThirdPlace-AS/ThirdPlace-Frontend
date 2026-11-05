import { describe, expect, it } from "@jest/globals";

import {
  MOCK_NOTIFICATIONS,
  notificationGroup,
  notificationTimeLabel,
  visibleNotifications,
  type NotificationType,
} from "@/fixtures";

describe("notificationGroup", () => {
  it("buckets by age into the three Instagram-style sections", () => {
    expect(notificationGroup(30)).toBe("I dag"); // < 24h
    expect(notificationGroup(2880)).toBe("Denne uka"); // 2 days
    expect(notificationGroup(14400)).toBe("Tidligere"); // 10 days
  });
});

describe("notificationTimeLabel", () => {
  it("renders minutes / hours / days / weeks", () => {
    expect(notificationTimeLabel(30)).toBe("30 min");
    expect(notificationTimeLabel(120)).toBe("2 t");
    expect(notificationTimeLabel(2880)).toBe("2 d");
    expect(notificationTimeLabel(14400)).toBe("1 u");
  });
});

describe("MOCK_NOTIFICATIONS", () => {
  it("has unread demo items (drives the bell badge)", () => {
    expect(MOCK_NOTIFICATIONS.some((n) => !n.read)).toBe(true);
  });
});

describe("visibleNotifications", () => {
  const all = MOCK_NOTIFICATIONS;

  it("returns everything with no filter state", () => {
    expect(visibleNotifications(all)).toHaveLength(all.length);
  });

  it("drops dismissed ids", () => {
    const res = visibleNotifications(all, {
      dismissedIds: new Set(["n1"]),
    });
    expect(res.some((n) => n.id === "n1")).toBe(false);
    expect(res).toHaveLength(all.length - 1);
  });

  it("drops not-interested ids", () => {
    const res = visibleNotifications(all, {
      notInterestedIds: new Set(["n2"]),
    });
    expect(res.some((n) => n.id === "n2")).toBe(false);
  });

  it("hides muted types", () => {
    const muted = new Set<NotificationType>(["follow"]);
    const res = visibleNotifications(all, { mutedTypes: muted });
    expect(res.some((n) => n.type === "follow")).toBe(false);
    expect(res.every((n) => n.type !== "follow")).toBe(true);
  });

  it("onlyUnread respects the local read set over the fixture flag", () => {
    // n5 is read in the fixture; mark n1 read locally. Only truly-unread remain.
    const res = visibleNotifications(all, {
      onlyUnread: true,
      readIds: new Set(["n1", "n5"]),
    });
    expect(res.some((n) => n.id === "n1")).toBe(false); // locally read
    expect(res.some((n) => n.id === "n5")).toBe(false); // read
    expect(res.every((n) => !["n1", "n5"].includes(n.id))).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });
});
