// Honesty copy for demo-only UI (Norwegian). One source so the same promise is
// worded the same way everywhere, and so a future i18n layer has one seam.
// Strings shown next to a DEMO badge (DemoNote) do not repeat "Demo —"; the
// badge already says it. Standalone strings keep the prefix.
// BLOCKED_CONTRACT_GAP: every line here exists because no backend is wired.
export const demoCopy = {
  // Shown with a DEMO badge (DemoNote)
  editsNotSaved: "Endringer lagres ikke.",
  logoutNoSession: "Du blir ikke logget ut på ekte.",
  signInInactive: "Innlogging er ikke aktiv ennå.",
  reviewNotSent: "Anmeldelsen lagres ikke og sendes ingen steder.",
  filterLocalOnly: "Filteret sorterer bare eksemplene i appen.",
  paymentsStructureOnly:
    "Bare en visning. Du kan ikke legge inn kort, og ingenting blir trukket.",
  paymentsDemoScreen: "Kun en demo-skjerm.",
  privacyNotSaved: "Valgene lagres ikke og endrer ikke hvem som ser deg.",
  settingsNotSaved: "Innstillinger lagres ikke og nullstilles ved omstart.",
  joinedNoBackend:
    "Påmeldingen vises bare her. Ingenting er sendt, og ingen chat er åpnet.",
  waitlistedNoBackend: "Du står på venteliste i demoen. Du får ingen varsler.",
  groupJoinedNoBackend:
    "Medlemskapet vises bare her. Ingenting er sendt, og ingen gruppechat er åpnet.",

  // Standalone (no badge next to them)
} as const;

export type DemoCopyKey = keyof typeof demoCopy;
