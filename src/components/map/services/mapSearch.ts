// Deterministic fixture search (MOCK — no network, no search backend, no history
// persistence; that is CONTRACT-BLOCKED CB-8). Groups matches the way the search
// overlay shows them: På kartet (places) / Opplevelser / Grupper.

import {
  experiences,
  groups,
  places,
  type MockExperience,
  type MockGroup,
  type MockPlace,
} from "@/fixtures";

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

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function placeMatch(p: MockPlace, q: string): boolean {
  return (
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function experienceMatch(e: MockExperience, q: string): boolean {
  return (
    e.title.toLowerCase().includes(q) ||
    e.host.toLowerCase().includes(q) ||
    e.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function groupMatch(g: MockGroup, q: string): boolean {
  return g.name.toLowerCase().includes(q) || g.about.toLowerCase().includes(q);
}

// Grouped fixture search. Empty query returns no results (the overlay shows
// recent searches instead).
export function searchFixtures(query: string): SearchGroups {
  const q = norm(query);
  if (q === "") return { places: [], experiences: [], groups: [], total: 0 };

  const placeResults: SearchResult[] = places
    .filter((p) => placeMatch(p, q))
    .map((p) => ({
      kind: "place",
      id: p.id,
      title: p.name,
      subtitle: `${p.category} · ${p.distance}`,
    }));

  const experienceResults: SearchResult[] = experiences
    .filter((e) => experienceMatch(e, q))
    .map((e) => ({
      kind: "experience",
      id: e.id,
      title: e.title,
      subtitle: `${e.host} · ${e.when}`,
    }));

  const groupResults: SearchResult[] = groups
    .filter((g) => groupMatch(g, q))
    .map((g) => ({
      kind: "group",
      id: g.id,
      title: g.name,
      subtitle: `${g.memberCount} medlemmer`,
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
