// Confirmations after an action (Norwegian, product voice). Founder decision
// 2026-11-06: the app reads as a finished product, so actions confirm like
// one (no demo markers). One source so the same action is worded the same way
// everywhere. BLOCKED_CONTRACT_GAP: no backend is wired; these confirm the
// local action only. Payments stay structure-only (no card data, no charges).
import type { ToastInput } from "@/components/Toast";

const ok = "checkmark-circle-outline" as const;

export const confirmToast = {
  profileSaved: { title: "Profilen er oppdatert", icon: ok },
  preferencesSaved: { title: "Preferansene er lagret", icon: ok },
  privacyChecked: { title: "Personvernsjekken er ferdig", icon: ok },
  accountSaved: { title: "Kontoinformasjonen er oppdatert", icon: ok },
  passwordChanged: { title: "Passordet er endret", icon: ok },
  sessionSignedOut: { title: "Enheten er logget ut", icon: ok },
  otherSessionsSignedOut: { title: "Andre enheter er logget ut", icon: ok },
  chatCreated: { title: "Chatten er opprettet", icon: "chatbubbles-outline" },
  exportRequested: { title: "Eksporten er bestilt", icon: "download-outline" },
  supportCreated: {
    title: "Supportsaken er opprettet",
    body: "Vi svarer deg så snart vi kan.",
    icon: ok,
  },
  accountDeleted: { title: "Kontoen er slettet", icon: ok },
  reviewSent: { title: "Takk for anmeldelsen", icon: "star-outline" },
  ratingSent: { title: "Takk for vurderingen", icon: "star-outline" },
  reportSent: { title: "Takk, rapporten er sendt", icon: ok },
  linkCopied: { title: "Lenken er kopiert", icon: "copy-outline" },
  sharedInMessage: { title: "Delt i en melding", icon: "paper-plane-outline" },
  reminderSent: {
    title: "Påminnelsen er sendt",
    icon: "notifications-outline",
  },
  spotTaken: { title: "Plassen er din", icon: ok },
  spotPassed: { title: "Plassen er gitt videre", icon: ok },
  requestSent: { title: "Forespørselen er sendt", icon: "paper-plane-outline" },
  creatorApplied: { title: "Søknaden er sendt", icon: "paper-plane-outline" },
  counterSent: { title: "Mottilbudet er sendt", icon: "paper-plane-outline" },
  offerAccepted: { title: "Tilbudet er godtatt", icon: ok },
  offerDeclined: { title: "Tilbudet er avslått", icon: ok },
  listingPublished: { title: "Listingen er publisert", icon: ok },
  listingSaved: { title: "Endringene er lagret", icon: ok },
  complaintSent: { title: "Klagen er sendt", icon: ok },
  inviteShared: { title: "Invitasjonen er delt", icon: "paper-plane-outline" },
  imported: { title: "Importert", icon: ok },
  contactsSynced: { title: "Kontaktene er hentet", icon: "people-outline" },
  photoAdded: { title: "Profilbildet er lagt til", icon: "camera-outline" },
  muted: { title: "Chatten er dempet", icon: "notifications-off-outline" },
  joinedChat: { title: "Du er med i samtalen", icon: "chatbubbles-outline" },
  followed: { title: "Du følger nå", icon: ok },
  messageSent: { title: "Meldingen er sendt", icon: "paper-plane-outline" },
  saved: { title: "Lagret", icon: ok },
} satisfies Record<string, ToastInput>;

export function blockedToast(name: string): ToastInput {
  return { title: `${name} er blokkert`, icon: ok };
}
