import { GuestPage } from "@/components/GuestPage";
import { LinkedAccountsScreen } from "@/features/settings/SettingsPages";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Koblede kontoer"
      message="Logg inn for å se koblede kontoer."
      action="se koblede kontoer"
    >
      <LinkedAccountsScreen />
    </GuestPage>
  );
}
