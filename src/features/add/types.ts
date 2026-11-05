// Local draft shape for the Add flows (PDF p10–p12). DEMO-ONLY: nothing here
// maps to a canonical entity, DTO, or publish/moderation/pricing/capacity rule
// (BLOCKED_NOT_V22_CERTIFIED / BLOCKED_CONTRACT_GAP). All state is in-memory and
// discarded on reload — there is no backend to submit or publish to.

// The Add menu offers exactly two kinds (PDF p10 "Hva vil du legge til?").
export type AddKind = "place" | "experience";

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
  | "review";

// Step order per the design: place 5 steps (p10–p11), experience 7 (p11–p12).
export function stepsFor(kind: AddKind | null): StepKey[] {
  if (kind === "place")
    return ["about", "where", "photos", "details", "review"];
  if (kind === "experience")
    return ["about", "when", "where", "frame", "mood", "photos", "review"];
  return ["kind"];
}

// Minimal per-step validation, so "Neste" only enables when the step is filled.
export function canAdvance(step: StepKey, d: AddDraft): boolean {
  switch (step) {
    case "kind":
      return d.kind !== null;
    case "about":
      return d.title.trim().length >= 3 && d.category !== null;
    case "where":
      return d.area !== null;
    case "photos":
      return d.photos.length > 0;
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
