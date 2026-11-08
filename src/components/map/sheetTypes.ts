// In-sheet navigation targets for the map detail sheet. Drilling in pushes a new
// target onto a stack (content swaps + back chevron) instead of pushing a route.
export type SheetKind =
  | "place"
  | "business"
  | "experience"
  | "reviews"
  | "attendees"
  // Every guest by name, for the host's own tools (Administrer); the
  // public "attendees" list names only people who opted in (Phase 16).
  | "guests"
  | "host"
  | "group"
  | "checkin"
  | "verification";

export type SheetTarget = { kind: SheetKind; id: string };

// Pushes another target onto the in-sheet stack.
export type PushFn = (t: SheetTarget) => void;
