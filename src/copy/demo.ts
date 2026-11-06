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

// Toasts after a demo confirm button closes its sheet: say plainly that
// nothing happened (PHASE 10 decision: close + honest toast).
export const demoToast = {
  profileNotSaved: {
    title: "Ikke lagret",
    body: "Profilendringer lagres ikke i demoen.",
    icon: "information-circle-outline",
  },
  accountNotSaved: {
    title: "Ikke lagret",
    body: "Kontoinformasjonen endres ikke i demoen.",
    icon: "information-circle-outline",
  },
  chatNotCreated: {
    title: "Ingen chat opprettet",
    body: "Chatter kan ikke opprettes i demoen.",
    icon: "information-circle-outline",
  },
  exportNotRequested: {
    title: "Ingen eksport bestilt",
    body: "Dataeksport er ikke koblet til ennå.",
    icon: "information-circle-outline",
  },
  supportNotCreated: {
    title: "Ingen sak opprettet",
    body: "Support er ikke koblet til ennå.",
    icon: "information-circle-outline",
  },
  accountNotDeleted: {
    title: "Kontoen er ikke slettet",
    body: "Sletting er ikke koblet til i demoen.",
    icon: "information-circle-outline",
  },
  reviewNotSent: {
    title: "Ikke sendt",
    body: "Anmeldelsen lagres ikke og sendes ingen steder.",
    icon: "information-circle-outline",
  },
  ratingNotSaved: {
    title: "Ikke lagret",
    body: "Vurderingen sendes ingen steder i demoen.",
    icon: "information-circle-outline",
  },
} as const;

export type DemoCopyKey = keyof typeof demoCopy;
