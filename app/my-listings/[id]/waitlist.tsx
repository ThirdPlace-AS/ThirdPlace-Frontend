import { GuestPage } from "@/components/GuestPage";
import Screen from "@/features/marketplace/ListingWaitlistScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Venteliste"
      message="Logg inn for å se ventelisten."
      action="se ventelisten"
    >
      <Screen />
    </GuestPage>
  );
}
