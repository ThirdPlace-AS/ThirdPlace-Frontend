import { GuestPage } from "@/components/GuestPage";
import { DeleteAccountScreen } from "@/features/settings/SettingsPages";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Slett konto"
      message="Logg inn for å slette kontoen."
      action="slette kontoen"
    >
      <DeleteAccountScreen />
    </GuestPage>
  );
}
