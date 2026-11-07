import { blockedCount, useBlocked } from "@/lib/blocked";
import { setShowMeAsAttendee, useShowMeAsAttendee } from "@/lib/going";
import { setPrivacyPref, usePrivacyPrefs } from "@/lib/privacyPrefs";

import { NavRow, ToggleRow } from "./settingsUi";

// Personvern's rows, grouped by the question they answer (Phase 18, screen
// benchmark: Instagram's "who can see you" / "how others can reach you").
// The Personvern page and the Personvernsjekk walk render these same rows, so
// the two never differ. The hints are the ones the page already had; the
// Datadeling rows keep none, since what each changes is not specified.

/** "Hvem kan se deg" */
export function SeeYouRows() {
  const p = usePrivacyPrefs();
  // Phase 16 (founder 2026-11-07): off until you choose it.
  const showMe = useShowMeAsAttendee();
  return (
    <>
      <ToggleRow
        icon="map-outline"
        label="Synlig på kartet"
        value={p.mapVisible}
        onValueChange={(v) => setPrivacyPref("mapVisible", v)}
      />
      <ToggleRow
        icon="person-outline"
        label="Offentlig profil"
        hint="Alle kan se profilen din"
        value={p.profileVisible}
        onValueChange={(v) => setPrivacyPref("profileVisible", v)}
      />
      <ToggleRow
        icon="people-circle-outline"
        label="Vis meg som deltaker"
        hint="Bildet ditt vises på opplevelser du er med på. Alle telles uansett."
        value={showMe}
        onValueChange={setShowMeAsAttendee}
      />
    </>
  );
}

/** "Hvem kan finne og kontakte deg": the switch for Utforsk folk and the
 *  block list. No new contact rules (who may message you is not specified). */
export function FindYouRows({ onBlocked }: { onBlocked: () => void }) {
  const p = usePrivacyPrefs();
  const blocked = useBlocked();
  return (
    <>
      <ToggleRow
        icon="search-outline"
        label="Vis i Utforsk folk"
        hint="Andre kan finne deg basert på felles interesser"
        value={p.discoverable}
        onValueChange={(v) => setPrivacyPref("discoverable", v)}
      />
      <NavRow
        icon="ban-outline"
        label="Blokkerte brukere"
        value={String(blockedCount(blocked))}
        onPress={onBlocked}
      />
    </>
  );
}

/** "Datadeling" (PDF p21 "Data og personvern"). */
export function SharingRows() {
  const p = usePrivacyPrefs();
  return (
    <>
      <ToggleRow
        icon="people-outline"
        label="Del aktivitet med venner"
        value={p.shareActivity}
        onValueChange={(v) => setPrivacyPref("shareActivity", v)}
      />
      <ToggleRow
        icon="sparkles-outline"
        label="Personalisert innhold"
        value={p.personalised}
        onValueChange={(v) => setPrivacyPref("personalised", v)}
      />
      <ToggleRow
        icon="analytics-outline"
        label="Analytiske data"
        value={p.analytics}
        onValueChange={(v) => setPrivacyPref("analytics", v)}
      />
    </>
  );
}
