// Phase 14: Marketplace-analyse (PDF p18) computes every figure from the
// fixture lists; Samarbeidshistorikk shows the same list with p18's tabs.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CollabHistoryScreen } from "@/features/collab/CollabExtras";
import MarketplaceAnalyticsScreen from "@/features/marketplace/MarketplaceAnalyticsScreen";
import {
  averageCollabRating,
  collabMonth,
  marketplaceStats,
  publishedListings,
  topListings,
} from "@/features/marketplace/marketplaceStats";
import { collabHistory, listingStats } from "@/fixtures";
import { formatDecimal, formatRating } from "@/lib/format";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  },
}));

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

beforeEach(() => {
  mockPush.mockClear();
});

describe("marketplace figures come from the lists", () => {
  it("views and requests are the published listings' sums", () => {
    const published = publishedListings();
    expect(published.map((l) => l.id)).toEqual(["m1", "m2"]);
    for (const range of ["Uke", "Måned", "Total"] as const) {
      const s = marketplaceStats(range);
      const views = published.reduce(
        (n, l) => n + (listingStats[l.id]?.[range].views ?? 0),
        0,
      );
      const requests = published.reduce(
        (n, l) => n + (listingStats[l.id]?.[range].requests ?? 0),
        0,
      );
      expect(s.views).toBe(views);
      expect(s.requests).toBe(requests);
      expect(s.conversion).toBeCloseTo((requests / views) * 100);
    }
  });

  it("collaborations come from the history, by range", () => {
    expect(marketplaceStats("Total").started).toBe(collabHistory.length);
    expect(marketplaceStats("Total").completed).toBe(
      collabHistory.filter((c) => c.status === "Fullført").length,
    );
    expect(marketplaceStats("Uke").started).toBe(
      collabHistory.filter((c) => c.daysAgo <= 7).length,
    );
  });

  it("the average rating is the mean of the ratings given", () => {
    const given = collabHistory.flatMap((c) => (c.rating ? [c.rating] : []));
    const { score, count } = averageCollabRating();
    expect(count).toBe(given.length);
    expect(score).toBeCloseTo(given.reduce((a, b) => a + b, 0) / given.length);
  });

  it("top listings are the most viewed first", () => {
    const top = topListings("Måned");
    expect(top.map((t) => t.views)).toEqual(
      [...top.map((t) => t.views)].sort((a, b) => b - a),
    );
  });

  it("a collaboration month reads like the PDF", () => {
    expect(collabMonth(0, new Date(2026, 10, 7))).toBe("November 2026");
    expect(collabMonth(40, new Date(2026, 10, 7))).toBe("September 2026");
  });
});

describe("Marketplace-analyse page", () => {
  it("shows the Måned figures, the chart and top listings", () => {
    render(<MarketplaceAnalyticsScreen />, { wrapper });
    const s = marketplaceStats("Måned");
    expect(screen.getByLabelText(`Listing-visninger: ${s.views}`)).toBeTruthy();
    expect(
      screen.getByLabelText(
        `Konverteringsrate: ${formatDecimal(s.conversion)} %`,
      ),
    ).toBeTruthy();
    expect(screen.getByText("Forespørsler siste 30 dager")).toBeTruthy();
    expect(screen.getByText("Intimt jazzcafé-lokale")).toBeTruthy();
    expect(
      screen.getByText(formatRating(averageCollabRating().score)),
    ).toBeTruthy();
  });

  it("switching to Uke changes the figures", () => {
    render(<MarketplaceAnalyticsScreen />, { wrapper });
    fireEvent.press(screen.getByText("Uke"));
    const s = marketplaceStats("Uke");
    expect(screen.getByLabelText(`Listing-visninger: ${s.views}`)).toBeTruthy();
    expect(screen.getByText("Forespørsler siste 7 dager")).toBeTruthy();
  });
});

describe("Samarbeidshistorikk", () => {
  it("counts and filters the same list", () => {
    render(<CollabHistoryScreen />, { wrapper });
    const done = collabHistory.filter((c) => c.status === "Fullført").length;
    const ended = collabHistory.length - done;
    expect(
      screen.getByText(`${done} fullførte · ${ended} avsluttede`),
    ).toBeTruthy();
    fireEvent.press(screen.getByText("Avsluttede"));
    for (const c of collabHistory)
      if (c.status === "Fullført")
        expect(screen.queryByText(c.title)).toBeNull();
      else expect(screen.getByText(c.title)).toBeTruthy();
  });

  it("shows no amounts", () => {
    render(<CollabHistoryScreen />, { wrapper });
    expect(screen.queryByText(/\d\s?kr/)).toBeNull();
  });
});
