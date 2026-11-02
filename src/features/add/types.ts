// Local draft shape for the Add creation wizard. DEMO-ONLY: nothing here maps
// to a canonical entity, DTO, or publish/moderation/pricing/capacity rule
// (BLOCKED_NOT_V22_CERTIFIED / BLOCKED_CONTRACT_GAP). All state is in-memory and
// discarded on reload — there is no backend to persist or publish to.

export type AddKind = "place" | "experience" | "group";

export type AddDraft = {
  kind: AddKind | null;
  title: string;
  summary: string;
  category: string | null;
  area: string | null;
  // Experience-only "when" — a human label chosen from demo options.
  when: string | null;
  // Index into the demo photo pool (bundled sample art), or null for none.
  photoIndex: number | null;
};

export const EMPTY_DRAFT: AddDraft = {
  kind: null,
  title: "",
  summary: "",
  category: null,
  area: null,
  when: null,
  photoIndex: null,
};
