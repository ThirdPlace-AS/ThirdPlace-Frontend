import { useSyncExternalStore } from "react";

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

let state: DevSimulation = {
  mapOffline: false,
  checkinFar: false,
  slowLoad: false,
};
const listeners = new Set<() => void>();

export function setDevSimulation(patch: Partial<DevSimulation>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useDevSimulation(): DevSimulation {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}
