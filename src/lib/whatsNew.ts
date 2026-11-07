import Constants from "expo-constants";

import { claimSessionSlot, resetHintSession } from "@/lib/hints";

// "Nytt i ThirdPlace" (Phase 18, screen benchmark: Apple's What's New): one
// sheet after an update, once per app version. The phone keeps the version it
// last ran (a device setting, saved by src/lib/deviceSettings.ts with the
// hints). A first install records its version without showing anything (a
// person who just arrived has nothing "new" to catch up on); a later version
// shows the sheet once, on the map, then records itself.

/** This build's version (app.json), or null when it cannot be read. */
export function appVersion(): string | null {
  return Constants.expoConfig?.version ?? null;
}

let seen: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function onWhatsNewChange(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** The version this phone last ran, or null before the first one. */
export function getWhatsNewSeen(): string | null {
  return seen;
}

/** Device settings on start-up and tests: only a string counts. */
export function restoreWhatsNew(saved: unknown) {
  seen = typeof saved === "string" && saved.length > 0 ? saved : null;
  emit();
}

/** A phone with no version yet records this one quietly (first install). */
export function rememberFirstVersion(version: string | null) {
  if (seen !== null || !version) return;
  seen = version;
  emit();
}

export function markWhatsNewSeen(version: string | null) {
  if (!version || seen === version) return;
  seen = version;
  emit();
}

/** True when the sheet may show now: an update since the last run, and the
 *  session's one hint is free. Takes that slot. */
export function claimWhatsNew(version: string | null): boolean {
  if (!version || seen === null || seen === version) return false;
  return claimSessionSlot("whatsNew");
}

/** Dev sandbox: as if this phone last ran an older version. */
export function simulateUpdate() {
  seen = "0";
  resetHintSession();
  emit();
}
