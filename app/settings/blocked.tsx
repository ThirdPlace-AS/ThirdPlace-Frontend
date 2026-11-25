import { GuestPage } from "@/components/GuestPage";
import { BlockedUsersScreen } from "@/features/settings/SettingsPages";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Blokkerte brukere"
      message="Logg inn for å se hvem du har blokkert."
      action="se hvem du har blokkert"
    >
      <BlockedUsersScreen />
    </GuestPage>
  );
}
