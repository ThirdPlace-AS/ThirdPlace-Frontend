import { GuestPage } from "@/components/GuestPage";
import Screen from "@/features/settings/PrivacyCheckScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Personvernsjekk"
      message="Logg inn for å gå gjennom personvernet."
      action="gå gjennom personvernet"
    >
      <Screen />
    </GuestPage>
  );
}
