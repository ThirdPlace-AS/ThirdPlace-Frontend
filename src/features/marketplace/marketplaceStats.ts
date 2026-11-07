// Marketplace-analyse (PDF p18): every figure computed from the fixture
// lists, so the page agrees with Mine listings and Samarbeidshistorikk.
import {
  collabHistory,
  listingById,
  listingStats,
  myListingStates,
  ratingOf,
  replyHours,
  type MockCollab,
  type MockListing,
  type StatsRange,
} from "@/fixtures";

const RANGE_DAYS: Readonly<Record<StatsRange, number>> = {
  Uke: 7,
  Måned: 30,
  Total: Number.POSITIVE_INFINITY,
};

/** Your published listings (state "Aktive" in Mine listings). */
export function publishedListings(): MockListing[] {
  return Object.entries(myListingStates)
    .filter(([, s]) => s === "Aktive")
    .map(([id]) => listingById(id))
    .filter((l): l is MockListing => !!l);
}

export function collabsInRange(range: StatsRange): MockCollab[] {
  return collabHistory.filter((c) => c.daysAgo <= RANGE_DAYS[range]);
}

export type MarketplaceStats = {
  views: number;
  requests: number;
  /** Requests per view, in percent. */
  conversion: number;
  replyHours: number;
  started: number;
  completed: number;
};

export function marketplaceStats(range: StatsRange): MarketplaceStats {
  let views = 0;
  let requests = 0;
  for (const l of publishedListings()) {
    const s = listingStats[l.id]?.[range];
    if (!s) continue;
    views += s.views;
    requests += s.requests;
  }
  const inRange = collabsInRange(range);
  return {
    views,
    requests,
    conversion: views > 0 ? (requests / views) * 100 : 0,
    replyHours: replyHours[range],
    started: inRange.length,
    completed: inRange.filter((c) => c.status === "Fullført").length,
  };
}

/** Published listings, most viewed first, with their numbers for the range. */
export function topListings(
  range: StatsRange,
): { listing: MockListing; views: number; requests: number }[] {
  return publishedListings()
    .map((listing) => ({
      listing,
      views: listingStats[listing.id]?.[range].views ?? 0,
      requests: listingStats[listing.id]?.[range].requests ?? 0,
    }))
    .sort((a, b) => b.views - a.views);
}

/** Average of the ratings you have given (score 0 when there are none). */
export function averageCollabRating(): { score: number; count: number } {
  return ratingOf(
    collabHistory.flatMap((c) => (c.rating ? [{ rating: c.rating }] : [])),
  );
}

const MONTHS = [
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** "Oktober 2026": the month a collaboration ended, from `daysAgo`. */
export function collabMonth(daysAgo: number, now: Date = new Date()): string {
  const d = new Date(now.getTime() - daysAgo * 86_400_000);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
