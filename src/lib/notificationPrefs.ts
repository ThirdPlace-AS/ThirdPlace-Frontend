import { createStore, useStore } from "zustand";

// Innstillinger → Varsler's switches (PDF p19 Push + Stille timer), kept so
// the page shows what was chosen when it is opened again and the hub row can
// say whether push is on (review 2026-11-18 IJ4: every switch came back on).
// In memory like the account's other settings: nothing about the account is
// kept on the phone, and logout brings back these defaults.
// BLOCKED_CONTRACT_GAP: no push service or preference store; the switches
// change nothing outside the app's screens.

export const NOTIFICATION_PUSH_KEYS = [
  "Opplevelser",
  "Venteliste",
  "Venner",
  "Chat",
  "Anbefalinger",
] as const;
export const QUIET_HOURS_KEY = "Ikke forstyrr 23–08";

export type NotificationPrefs = Record<string, boolean>;

/** As drawn on p19: Anbefalinger off, the rest on. */
export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  Opplevelser: true,
  Venteliste: true,
  Venner: true,
  Chat: true,
  Anbefalinger: false,
  [QUIET_HOURS_KEY]: true,
};

const store = createStore(() => ({ prefs: DEFAULT_NOTIFICATION_PREFS }));
const selectPrefs = (s: { prefs: NotificationPrefs }) => s.prefs;

export function setNotificationPref(key: string, value: boolean) {
  const { prefs } = store.getState();
  if (prefs[key] === value) return;
  store.setState({ prefs: { ...prefs, [key]: value } });
}

/** Logout and tests. */
export function resetNotificationPrefs() {
  store.setState({ prefs: DEFAULT_NOTIFICATION_PREFS });
}

export function useNotificationPrefs(): NotificationPrefs {
  return useStore(store, selectPrefs);
}

/** The hub row's value: "På" while any push category is on. */
export function pushSummary(prefs: NotificationPrefs): "På" | "Av" {
  return NOTIFICATION_PUSH_KEYS.some((k) => prefs[k]) ? "På" : "Av";
}
