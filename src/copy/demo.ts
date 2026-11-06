// Honesty copy for demo-only UI (Norwegian). One source so the same promise is
// worded the same way everywhere, and so a future i18n layer has one seam.
// Strings shown next to a DEMO badge (DemoNote) do not repeat "Demo —"; the
// badge already says it. Standalone strings keep the prefix.
// BLOCKED_CONTRACT_GAP: every line here exists because no backend is wired.
export const demoCopy = {
  // Shown with a DEMO badge (DemoNote)
  editsNotSaved: "Endringer lagres ikke.",
  logoutNoSession: "Ingen reell økt avsluttes.",
  signInInactive: "Innlogging er ikke aktiv ennå.",
  reviewNotSent: "Anmeldelsen lagres ikke og sendes ingen steder.",
  filterLocalOnly: "Filtrerer kun forslagene lokalt, ingen serverforespørsel.",
  paymentsStructureOnly:
    "Kun struktur. Ingen kortdata samles inn og ingen betaling skjer.",
  paymentsDemoScreen: "Kun en demo-skjerm.",
  privacyNotSaved: "Ingen reell synlighet eller samtykke lagres eller endres.",
  settingsNotSaved: "Innstillinger lagres ikke og nullstilles ved omstart.",
  joinedNoBackend:
    "Du er med i demoen. Ingen påmelding er sendt, og ingen gruppechat er åpnet.",
  waitlistedNoBackend: "Du står på venteliste i demoen. Du får ingen varsler.",

  // Standalone (no badge next to them)
} as const;

export type DemoCopyKey = keyof typeof demoCopy;
