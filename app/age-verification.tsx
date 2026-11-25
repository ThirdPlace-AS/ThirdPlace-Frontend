import { GuestPage } from "@/components/GuestPage";
import Screen from "@/features/settings/AgeVerificationScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Aldersverifisering"
      message="Logg inn for å bekrefte alderen."
      action="bekrefte alderen"
    >
      <Screen />
    </GuestPage>
  );
}
