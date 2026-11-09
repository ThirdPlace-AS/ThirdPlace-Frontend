// Deterministic fixture search (MOCK — no network, no search backend, no history
// persistence; that is CONTRACT-BLOCKED CB-8). Groups matches the way the search
// overlay shows them: På kartet (places) / Opplevelser / Grupper.

import {
  areaFor,
  experiences,
  groups,
  placeRating,
  places,
  type MockExperience,
  type MockGroup,
  type MockPlace,
} from "@/fixtures";
import { interestWords } from "@/fixtures/catalog/interests";
import { formatRating } from "@/lib/format";

import { experienceKindLabel, placeTypeLabel } from "./itemType";

import type { SheetKind } from "../sheetTypes";

export type SearchResult = {
  kind: SheetKind;
  id: string;
  title: string;
  subtitle: string;
};

export type SearchGroups = {
  places: SearchResult[];
  experiences: SearchResult[];
  groups: SearchResult[];
  total: number;
};

// Max rows shown per group in the overlay (places / experiences / groups).
const GROUP_LIMIT = 5;

function norm(s: string): string {
  return s.trim().toLowerCase();
}

// Shared query matchers (q must be pre-normalized via `norm`). Exported so the
// map place filter (applyFilters) and the discovery adapter use the SAME match
// logic as this overlay search — no divergence between what the overlay shows
// and what submitting the text narrows on the map.
// Phase 19: an item also matches its interest (label and older synonyms), so
// "jazz" finds the jazz club, the festival and the jazz group.
const interestMatches = (id: string | undefined, q: string) =>
  interestWords(id).some((w) => w.includes(q));

export function placeMatchesQuery(p: MockPlace, q: string): boolean {
  return (
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some((t) => t.toLowerCase().includes(q)) ||
    interestMatches(p.interestId, q)
  );
}

export function experienceMatchesQuery(e: MockExperience, q: string): boolean {
  return (
    e.title.toLowerCase().includes(q) ||
    e.host.toLowerCase().includes(q) ||
    e.tags.some((t) => t.toLowerCase().includes(q)) ||
    interestMatches(e.interestId, q)
  );
}

function groupMatch(g: MockGroup, q: string): boolean {
  return (
    g.name.toLowerCase().includes(q) ||
    g.about.toLowerCase().includes(q) ||
    g.interests.some((i) => interestMatches(i, q))
  );
}

// Grouped fixture search. Empty query returns no results (the overlay shows
// recent searches instead).
export function searchFixtures(query: string): SearchGroups {
  const q = norm(query);
  if (q === "") return { places: [], experiences: [], groups: [], total: 0 };

  const placeResults: SearchResult[] = places
    .filter((p) => placeMatchesQuery(p, q))
    .slice(0, GROUP_LIMIT)
    .map((p) => ({
      kind: "place",
      id: p.id,
      title: p.name,
      // "Bedrift · Sentrum · ★ 4,7" (PDF p5's search rows).
      subtitle: [
        placeTypeLabel(p),
        areaFor(p.coord).name,
        placeRating(p.id).count
          ? `★ ${formatRating(placeRating(p.id).score)}`
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
    }));

  const experienceResults: SearchResult[] = experiences
    .filter((e) => experienceMatchesQuery(e, q))
    .slice(0, GROUP_LIMIT)
    .map((e) => ({
      kind: "experience",
      id: e.id,
      title: e.title,
      subtitle: `${experienceKindLabel(e)} · ${areaFor(e.meetingPoint.coord).name} · ${e.when}`,
    }));

  const groupResults: SearchResult[] = groups
    .filter((g) => groupMatch(g, q))
    .slice(0, GROUP_LIMIT)
    .map((g) => ({
      kind: "group",
      id: g.id,
      title: g.name,
      subtitle: `Gruppe · ${g.memberCount} medlemmer`,
    }));

  return {
    places: placeResults,
    experiences: experienceResults,
    groups: groupResults,
    total: placeResults.length + experienceResults.length + groupResults.length,
  };
}

// Lightweight title suggestions across all types (for the suggestion list).
export function suggestFixtures(query: string, limit = 5): string[] {
  const g = searchFixtures(query);
  return [...g.places, ...g.experiences, ...g.groups]
    .map((r) => r.title)
    .slice(0, limit);
}
