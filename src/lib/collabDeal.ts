import { createStore, useStore } from "zustand";

// The Jazz-samarbeid deal this session (review 2026-11-18 #9, H-02/H-03;
// founder: deal state + typed sign). Godta / Avslå / Send mottilbud answer
// Maria Movik's incoming offer, and the answer shows on the offer and on the
// Samarbeid page; the contract is signed with a typed full name after "Jeg
// har lest avtalen". In memory like the other demo stores, cleared on logout.
// BLOCKED_CONTRACT_GAP: no offer, negotiation or signature contract (H-Q10);
// nothing reaches the partner or is stored.
export type OfferAnswer = "Godtatt" | "Avslått" | "Mottilbud sendt";

export type CollabDeal = {
  answer: OfferAnswer | null;
  /** The split you proposed in a Mottilbud ("60 / 40"), your own input. */
  counterSplit: string | null;
  /** The full name typed when signing the contract. */
  signedBy: string | null;
};

const START: CollabDeal = { answer: null, counterSplit: null, signedBy: null };
const store = createStore(() => ({ deal: START }));
const selectDeal = (s: { deal: CollabDeal }) => s.deal;

export function answerOffer(answer: OfferAnswer, counterSplit?: string) {
  store.setState(({ deal }) => ({
    deal: { ...deal, answer, counterSplit: counterSplit ?? null },
  }));
}

export function signContract(fullName: string) {
  store.setState(({ deal }) => ({
    deal: { ...deal, signedBy: fullName.trim() },
  }));
}

/** A full name: at least two words of two letters or more. */
export function isFullName(name: string): boolean {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.every((p) => p.length >= 2);
}

/** Logout and tests. */
export function resetCollabDeal() {
  store.setState({ deal: START });
}

export function getCollabDeal(): CollabDeal {
  return store.getState().deal;
}

export function useCollabDeal(): CollabDeal {
  return useStore(store, selectDeal);
}
