import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

import {
  DEFAULT_A11Y_PREFS,
  getA11yPrefs,
  onA11yPrefsChange,
  resetA11yPrefs,
  type A11yPrefs,
} from "@/lib/a11yPrefs";
import {
  getMapChoice,
  onMapChoiceChange,
  restoreMapChoice,
  type MapChoice,
} from "@/lib/mapChoice";

// Device settings (founder 2026-11-07, Phase 15): choices that belong to this
// phone, kept across restarts — the Kartlag map type and style, and
// Tilgjengelighet's switches. Nothing about the account or its content is
// stored here (that needs the contract: BLOCKED_CONTRACT_GAP). One versioned
// key; read once at start-up behind the root layout's font gate, written on
// every change.
export const DEVICE_SETTINGS_KEY = "thirdplace:device-settings:v1";

type Saved = { map?: Partial<MapChoice>; a11y?: Partial<A11yPrefs> };

let ready = false;
const listeners = new Set<() => void>();
let started: Promise<void> | null = null;
let unsubscribe: (() => void) | null = null;

function emitReady() {
  ready = true;
  listeners.forEach((l) => l());
}

function write() {
  const saved: Saved = { map: getMapChoice(), a11y: getA11yPrefs() };
  AsyncStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(saved)).catch(() => {
    // A full or locked store only means the choice is not kept.
  });
}

function parse(raw: string | null): Saved {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" ? (v as Saved) : {};
  } catch {
    return {};
  }
}

/** Reads the saved choices into the stores, then keeps them saved. Safe to
 *  call more than once; resolves even if the phone's storage fails. */
export function hydrateDeviceSettings(): Promise<void> {
  if (started) return started;
  started = AsyncStorage.getItem(DEVICE_SETTINGS_KEY)
    .then((raw) => {
      const saved = parse(raw);
      restoreMapChoice(saved.map);
      resetA11yPrefs({ ...DEFAULT_A11Y_PREFS, ...saved.a11y });
    })
    .catch(() => {})
    .finally(() => {
      const offMap = onMapChoiceChange(write);
      const offA11y = onA11yPrefsChange(write);
      unsubscribe = () => {
        offMap();
        offA11y();
      };
      emitReady();
    });
  return started;
}

/** Tests: forget the start-up read. */
export function resetDeviceSettings() {
  unsubscribe?.();
  unsubscribe = null;
  started = null;
  ready = false;
}

export function useDeviceSettingsReady(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => ready,
    () => ready,
  );
}
