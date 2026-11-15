import { createStore, useStore } from "zustand";

// What the viewer answered in "Hvordan var det?" (PDF p25) this session
// (Phase 18, screen benchmark: the answer stays with the plan, as on Airbnb's
// past trips). In memory like the other demo stores and cleared on logout; it
// is the viewer's own answer only and never joins an experience's public
// reviews or counts. BLOCKED_CONTRACT_GAP: no review backend.
export type MyRating = { stars: number; liked: readonly string[] };

type Ratings = Readonly<Record<string, MyRating>>;
const store = createStore(() => ({ ratings: {} as Ratings }));
const selectRatings = (s: { ratings: Ratings }) => s.ratings;

export function saveMyRating(id: string, rating: MyRating) {
  store.setState(({ ratings }) => ({ ratings: { ...ratings, [id]: rating } }));
}

/** Logout and tests. */
export function resetMyRatings() {
  store.setState({ ratings: {} });
}

export function useMyRatings(): Readonly<Record<string, MyRating>> {
  return useStore(store, selectRatings);
}

/** "★ 5 · Stemningen, Verten" */
export function myRatingLabel(r: MyRating): string {
  return [`★ ${r.stars}`, r.liked.join(", ")].filter(Boolean).join(" · ");
}
