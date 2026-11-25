import { Redirect } from "expo-router";
import { useEffect } from "react";

import { openAccountSheet } from "@/components/AccountSwitcher";
import { GuestPage } from "@/components/GuestPage";

// The account switcher (PDF p27) is the sheet Profil's chip opens (review
// 2026-11-18 PR-08, 0526: «Aktiv konto i toppen»). This route stays for
// links to it: it opens that sheet over Profil. BLOCKED_CONTRACT_GAP: no
// linked-account or session model; the switch is in memory.
function OpenOnProfil() {
  useEffect(() => openAccountSheet(), []);
  return <Redirect href="/profile" />;
}

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function AccountSwitch() {
  return (
    <GuestPage
      title="Bytt konto"
      message="Logg inn for å bytte konto."
      action="bytte konto"
    >
      <OpenOnProfil />
    </GuestPage>
  );
}
