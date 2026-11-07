// Local draft shape for the Add flows (PDF p10–p12, Gruppe added 2026-11-06). DEMO-ONLY: nothing here
// maps to a canonical entity, DTO, or publish/moderation/pricing/capacity rule
// (BLOCKED_NOT_V22_CERTIFIED / BLOCKED_CONTRACT_GAP). All state is in-memory and
// discarded on reload — there is no backend to submit or publish to.

import type { MockChatAccess, MockExperience } from "@/fixtures";

// The Add menu (PDF p10 "Hva vil du legge til?") offers Sted and Opplevelse;
// Gruppe was added by the founder (2026-11-06).
export type AddKind = "place" | "experience" | "group";

export type AddDraft = {
  kind: AddKind | null;
  title: string;
  summary: string;
  category: string | null;
  // Place: chosen Oslo area. Experience: a place name or "Annet sted: <area>".
  area: string | null;
  meetingPoint: string;
  // Indexes into the demo photo pool (bundled sample art); first = hovedbilde.
  photos: number[];
  // Place "Detaljer" (p11).
  features: string[];
  season: string;
  // Experience "Når skjer det?" (p11).
  date: string | null; // ISO yyyy-mm-dd
  startTime: string | null;
  duration: string;
  repeat: string;
  // Experience "Rammene" (p12).
  capacity: string;
  price: string;
  access: string;
  cancellation: string;
  // Experience "Sett stemningen" (p12).
  vibes: string[];
  energy: string | null;
  languages: string[];
  // Experience "Plan" (optional; feeds the page's "Hva er inkludert" row and
  // "Hva dere skal gjøre" section).
  included: string[];
  steps: string[];
  // Group: interests and who can join.
  interests: string[];
  groupAccess: MockChatAccess;
};

export const EMPTY_DRAFT: AddDraft = {
  kind: null,
  title: "",
  summary: "",
  category: null,
  area: null,
  meetingPoint: "",
  photos: [],
  features: [],
  season: "Hele året",
  date: null,
  startTime: null,
  duration: "2 timer",
  repeat: "Gjentas ikke",
  capacity: "",
  price: "",
  access: "Alle",
  cancellation: "Gratis frem til 24 t før",
  vibes: [],
  energy: null,
  languages: ["Norsk"],
  included: [],
  steps: [],
  interests: [],
  groupAccess: "open",
};

export type StepKey =
  | "kind"
  | "about"
  | "where"
  | "photos"
  | "details"
  | "when"
  | "frame"
  | "mood"
  | "plan"
  | "access"
  | "review";

// Step order per the design: place 5 steps (p10–p11), experience 7 (p11–p12)
// plus the optional "plan" step (what's included, what you'll do), group 5.
export function stepsFor(kind: AddKind | null): StepKey[] {
  if (kind === "place")
    return ["about", "where", "photos", "details", "review"];
  if (kind === "experience")
    return [
      "about",
      "when",
      "where",
      "frame",
      "mood",
      "plan",
      "photos",
      "review",
    ];
  if (kind === "group") return ["about", "where", "photos", "access", "review"];
  return ["kind"];
}

/** Photos a kind needs: a group shows a gallery, so at least two. */
export const minPhotos = (kind: AddKind | null) => (kind === "group" ? 2 : 1);

// Kalender "Rediger" opens the experience flow pre-filled with what the
// example experience already says (title, description, capacity).
export function draftFromExperience(e: {
  title: string;
  about: string;
  capacity: number;
}): AddDraft {
  return {
    ...EMPTY_DRAFT,
    kind: "experience",
    title: e.title,
    summary: e.about,
    capacity: String(e.capacity),
  };
}

// "Start fra en tidligere opplevelse" (Phase 16, after the section benchmark:
// Meetup copies an event, Airbnb duplicates a listing): a new draft with what
// one of your experiences says, except when it happens, so the host only
// picks a new time. `photos` are indexes into the wizard's pool, `area` the
// place or area it happened in.
export function draftCopyOf(
  e: Pick<
    MockExperience,
    | "title"
    | "about"
    | "category"
    | "meetingPoint"
    | "duration"
    | "repeat"
    | "capacity"
    | "priceNok"
    | "access"
    | "cancellation"
    | "vibes"
    | "energy"
    | "languages"
    | "included"
    | "itinerary"
  >,
  extra: { area: string | null; photos: number[] },
): AddDraft {
  return {
    ...EMPTY_DRAFT,
    kind: "experience",
    title: e.title,
    summary: e.about,
    category: e.category,
    area: extra.area,
    meetingPoint: e.meetingPoint.name === extra.area ? "" : e.meetingPoint.name,
    photos: extra.photos,
    duration: e.duration,
    repeat: e.repeat,
    capacity: String(e.capacity),
    price: e.priceNok ? String(e.priceNok) : "",
    access: e.access,
    cancellation: e.cancellation,
    vibes: [...e.vibes],
    energy: e.energy,
    languages: [...e.languages],
    included: [...e.included],
    steps: e.itinerary.map((s) => s.title),
  };
}

// Minimal per-step validation, so "Neste" only enables when the step is filled.
export function canAdvance(step: StepKey, d: AddDraft): boolean {
  switch (step) {
    case "kind":
      return d.kind !== null;
    case "about":
      return (
        d.title.trim().length >= 3 &&
        (d.kind === "group" ? d.interests.length > 0 : d.category !== null)
      );
    case "where":
      return d.area !== null;
    case "photos":
      return d.photos.length >= minPhotos(d.kind);
    case "when":
      return d.date !== null && d.startTime !== null;
    case "frame":
      return /^\d+$/.test(d.capacity.trim()) && Number(d.capacity) > 0;
    case "mood":
      return d.vibes.length > 0;
    default:
      return true;
  }
}

// Why "Neste" is off, in one line (same checks as canAdvance), so a disabled
// button never leaves the user guessing. Null when the step can advance.
export function advanceHint(step: StepKey, d: AddDraft): string | null {
  if (canAdvance(step, d)) return null;
  switch (step) {
    case "kind":
      return "Velg hva du vil legge til.";
    case "about":
      return d.title.trim().length < 3
        ? "Navnet trenger minst 3 tegn."
        : d.kind === "group"
          ? "Velg minst én interesse."
          : "Velg en kategori.";
    case "where":
      return "Velg et område.";
    case "photos":
      return d.kind === "group"
        ? "Legg til minst to bilder."
        : "Legg til minst ett bilde.";
    case "when":
      return "Velg dato og starttid.";
    case "frame":
      return "Skriv antall plasser som et tall.";
    case "mood":
      return "Velg minst én stemning.";
    default:
      return null;
  }
}
