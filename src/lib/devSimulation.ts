import { createStore, useStore } from "zustand";

// Dev-only switches for states that need a real network or GPS to appear:
// the map's offline/error state and check-in distance. Set from the sandbox
// screen (`thirdplace://_sandbox/simulate`), never from product UI. Resets on
// reload.
export type DevSimulation = {
  /** Map load fails as if offline (error overlay with "Prøv igjen"). */
  mapOffline: boolean;
  /** Check-in sees the user too far from the place. */
  checkinFar: boolean;
  /** Map content takes 3 s: skeleton for 2 s, then the loader (§4 rule). */
  slowLoad: boolean;
};

type State = { state: DevSimulation };
const store = createStore(
  (): State => ({
    state: { mapOffline: false, checkinFar: false, slowLoad: false },
  }),
);
const selectState = (s: State) => s.state;

export function setDevSimulation(patch: Partial<DevSimulation>) {
  store.setState({ state: { ...store.getState().state, ...patch } });
}

export function useDevSimulation(): DevSimulation {
  return useStore(store, selectState);
}
