import { createStore, useStore } from "zustand";

import {
  DEFAULT_MAP_TYPE,
  MAP_STYLES,
  MAP_TYPES,
  type MapStyleKey,
  type MapType,
} from "@/components/map/mapStyles";

// The Kartlag choice (Phase 15): the map type and the time-of-day style the
// user picked (null = Auto, follow the clock). A device setting, kept on the
// phone by deviceSettings.ts.
export type MapChoice = { mapType: MapType; style: MapStyleKey | null };

export const DEFAULT_MAP_CHOICE: MapChoice = {
  mapType: DEFAULT_MAP_TYPE,
  style: null,
};

const store = createStore(() => ({ choice: DEFAULT_MAP_CHOICE }));
const selectChoice = (s: { choice: MapChoice }) => s.choice;

export function onMapChoiceChange(l: () => void): () => void {
  return store.subscribe(() => l());
}

export function setMapType(mapType: MapType) {
  const { choice } = store.getState();
  if (choice.mapType === mapType) return;
  store.setState({ choice: { ...choice, mapType } });
}

/** A style key turns Auto off; null turns it back on. */
export function setMapStyle(style: MapStyleKey | null) {
  const { choice } = store.getState();
  if (choice.style === style) return;
  store.setState({ choice: { ...choice, style } });
}

export function getMapChoice(): MapChoice {
  return store.getState().choice;
}

/** Device settings on start-up, and tests. Unknown values fall back. */
export function restoreMapChoice(saved: Partial<MapChoice> | undefined) {
  const mapType = MAP_TYPES.some((t) => t.key === saved?.mapType)
    ? (saved?.mapType as MapType)
    : DEFAULT_MAP_TYPE;
  const style = MAP_STYLES.some((s) => s.key === saved?.style)
    ? (saved?.style as MapStyleKey)
    : null;
  store.setState({ choice: { mapType, style } });
}

export function useMapChoice(): MapChoice {
  return useStore(store, selectChoice);
}
