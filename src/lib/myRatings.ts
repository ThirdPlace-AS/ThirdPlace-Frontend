import { useSyncExternalStore } from "react";

// What the viewer answered in "Hvordan var det?" (PDF p25) this session
// (Phase 18, screen benchmark: the answer stays with the plan, as on Airbnb's
// past trips). In memory like the other demo stores and cleared on logout; it
// is the viewer's own answer only and never joins an experience's public
// reviews or counts. BLOCKED_CONTRACT_GAP: no review backend.
export type MyRating = { stars: number; liked: readonly string[] };

let ratings: Readonly<Record<string, MyRating>> = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function saveMyRating(id: string, rating: MyRating) {
  ratings = { ...ratings, [id]: rating };
  emit();
}

/** Logout and tests. */
export function resetMyRatings() {
  ratings = {};
  emit();
}

export function useMyRatings(): Readonly<Record<string, MyRating>> {
  return useSyncExternalStore(
    subscribe,
    () => ratings,
    () => ratings,
  );
}

/** "★ 5 · Stemningen, Verten" */
export function myRatingLabel(r: MyRating): string {
  return [`★ ${r.stars}`, r.liked.join(", ")].filter(Boolean).join(" · ");
}
