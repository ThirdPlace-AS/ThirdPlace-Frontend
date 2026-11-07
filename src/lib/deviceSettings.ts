import { useSyncExternalStore } from "react";

import {
  DEFAULT_A11Y_PREFS,
  getA11yPrefs,
  onA11yPrefsChange,
  resetA11yPrefs,
  type A11yPrefs,
} from "@/lib/a11yPrefs";
import { getHints, onHintsChange, restoreHints, type Hints } from "@/lib/hints";
import {
  getMapChoice,
  onMapChoiceChange,
  restoreMapChoice,
  type MapChoice,
} from "@/lib/mapChoice";
import {
  appVersion,
  getWhatsNewSeen,
  onWhatsNewChange,
  rememberFirstVersion,
  restoreWhatsNew,
} from "@/lib/whatsNew";

// Device settings (founder 2026-11-07, Phase 15): choices that belong to this
// phone, kept across restarts — the Kartlag map type and style,
// Tilgjengelighet's switches, and which one-time hints it has shown
// (Phase 16), and the app version it last ran (Phase 18, "Nytt i ThirdPlace").
// Nothing about the account or its content is
// stored here (that needs the contract: BLOCKED_CONTRACT_GAP). One versioned
// key; read once at start-up behind the root layout's font gate, written on
// every change.
export const DEVICE_SETTINGS_KEY = "thirdplace:device-settings:v1";

// AsyncStorage is loaded lazily and guarded, like expo-haptics
// (src/lib/haptics.ts): the package throws as soon as it loads in a build
// without its native module (a dev client built before Phase 15), which would
// stop the app before its first screen. Without it, choices are simply not
// kept and the defaults apply.
type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};
let storage: Storage | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@react-native-async-storage/async-storage");
  storage = (mod?.default ?? mod) as Storage;
} catch {
  storage = null;
}

type Saved = {
  map?: Partial<MapChoice>;
  a11y?: Partial<A11yPrefs>;
  hints?: Partial<Hints>;
  whatsNew?: unknown;
};

let ready = false;
const listeners = new Set<() => void>();
let started: Promise<void> | null = null;
let unsubscribe: (() => void) | null = null;

function emitReady() {
  ready = true;
  listeners.forEach((l) => l());
}

function write() {
  const saved: Saved = {
    map: getMapChoice(),
    a11y: getA11yPrefs(),
    hints: getHints(),
    whatsNew: getWhatsNewSeen() ?? undefined,
  };
  storage?.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(saved)).catch(() => {
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
  started = (storage?.getItem(DEVICE_SETTINGS_KEY) ?? Promise.resolve(null))
    .then((raw) => {
      const saved = parse(raw);
      restoreMapChoice(saved.map);
      resetA11yPrefs({ ...DEFAULT_A11Y_PREFS, ...saved.a11y });
      restoreHints(saved.hints);
      restoreWhatsNew(saved.whatsNew);
    })
    .catch(() => {})
    .finally(() => {
      const offMap = onMapChoiceChange(write);
      const offA11y = onA11yPrefsChange(write);
      const offHints = onHintsChange(write);
      const offWhatsNew = onWhatsNewChange(write);
      unsubscribe = () => {
        offMap();
        offA11y();
        offHints();
        offWhatsNew();
      };
      // A first install records its version (saved by the write above).
      rememberFirstVersion(appVersion());
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
