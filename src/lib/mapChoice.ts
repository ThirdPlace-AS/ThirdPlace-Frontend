import { useSyncExternalStore } from "react";

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

let choice: MapChoice = DEFAULT_MAP_CHOICE;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function onMapChoiceChange(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function setMapType(mapType: MapType) {
  if (choice.mapType === mapType) return;
  choice = { ...choice, mapType };
  emit();
}

/** A style key turns Auto off; null turns it back on. */
export function setMapStyle(style: MapStyleKey | null) {
  if (choice.style === style) return;
  choice = { ...choice, style };
  emit();
}

export function getMapChoice(): MapChoice {
  return choice;
}

/** Device settings on start-up, and tests. Unknown values fall back. */
export function restoreMapChoice(saved: Partial<MapChoice> | undefined) {
  const mapType = MAP_TYPES.some((t) => t.key === saved?.mapType)
    ? (saved?.mapType as MapType)
    : DEFAULT_MAP_TYPE;
  const style = MAP_STYLES.some((s) => s.key === saved?.style)
    ? (saved?.style as MapStyleKey)
    : null;
  choice = { mapType, style };
  emit();
}

export function useMapChoice(): MapChoice {
  return useSyncExternalStore(
    onMapChoiceChange,
    () => choice,
    () => choice,
  );
}
